#!/usr/bin/env node

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const USER_AGENT = "arbiter-project-field-hydration";
const DEFAULT_PROJECT_REF = "arbiter-systems/2";

const SUPPORTED_METADATA_KEYS = new Set([
  "project",
  "status",
  "lane",
  "priority",
  "project_priority",
  "phase",
  "release_gate",
  "implementation_readiness",
  "scope_risk",
  "confidence",
  "agent",
  "workstream",
  "validation_command",
  "blocked_by",
  "implementation_order",
]);

const FIELD_CONFIG = {
  status: {
    type: "single-select",
    required: true,
    candidates: ["Status"],
    values: {
      inbox: "Inbox",
      triage: "Triage",
      ready: "Ready",
      "in progress": "In Progress",
      review: "Review",
      blocked: "Blocked",
      done: "Done",
      deferred: "Deferred",
      "do not implement yet": "Do Not Implement Yet",
    },
  },
  lane: {
    type: "single-select",
    required: true,
    candidates: ["Lane"],
    values: {
      "active-mvp": "active-mvp",
      deferred: "deferred",
    },
  },
  project_priority: {
    type: "single-select",
    required: true,
    candidates: ["Project Priority", "Priority"],
    values: {
      high: "High",
      medium: "Medium",
      low: "Low",
      p1: "High",
      p2: "Medium",
      p3: "Low",
    },
  },
  phase: {
    type: "single-select",
    required: false,
    candidates: ["Phase"],
    values: {
      foundation: "foundation",
      mvp: "mvp",
      "hosted-demo": "hosted-demo",
      "customer-pilot": "customer-pilot",
      "post-mvp": "post-mvp",
    },
  },
  release_gate: {
    type: "single-select",
    required: false,
    candidates: ["Release Gate"],
    values: {
      none: "none",
      "local-mvp": "local-mvp",
      "hosted-demo": "hosted-demo",
      "customer-pilot": "customer-pilot",
      "post-mvp": "post-mvp",
    },
  },
  implementation_readiness: {
    type: "single-select",
    required: false,
    candidates: ["Implementation Readiness"],
    values: {
      "not-ready": "not-ready",
      "needs-clarification": "needs-clarification",
      ready: "ready",
    },
  },
  scope_risk: {
    type: "single-select",
    required: false,
    candidates: ["Scope Risk"],
    values: {
      low: "low",
      medium: "medium",
      high: "high",
    },
  },
  confidence: {
    type: "single-select",
    required: false,
    candidates: ["Confidence"],
    values: {
      high: "high",
      medium: "medium",
      low: "low",
    },
  },
  agent: {
    type: "single-select",
    required: false,
    candidates: ["Agent"],
    values: {
      none: "none",
      codex: "Codex",
      claude: "Claude",
      copilot: "Copilot",
      mixed: "mixed",
    },
  },
  workstream: {
    type: "single-select",
    required: false,
    candidates: ["Workstream"],
    values: {
      "github project management": "GitHub Project Management",
      "mvp execution": "MVP Execution",
      "security & compliance": "Security & Compliance",
      "documentation & site": "Documentation & Site",
      "infrastructure & ops": "Infrastructure & Ops",
    },
  },
  validation_command: { type: "text", required: false, candidates: ["Validation Command"] },
  blocked_by: { type: "text", candidates: ["Blocked By"] },
  implementation_order: { type: "number", required: false, candidates: ["Implementation Order"] },
};

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function parseBooleanToken(value) {
  if (value == null) {
    return null;
  }
  const raw = String(value);
  const normalized = normalizeName(value);
  if (normalized === "") {
    return null;
  }
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return { recognized: true, value: true, raw };
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return { recognized: true, value: false, raw };
  }
  return { recognized: false, value: false, raw };
}

function parseTruthy(value) {
  const parsed = parseBooleanToken(value);
  if (!parsed || !parsed.recognized) {
    return false;
  }
  return parsed.value;
}

function parseDryRun(value) {
  const parsed = parseBooleanToken(value);
  if (!parsed) {
    return false;
  }
  if (!parsed.recognized) {
    console.warn(`[warn] Unrecognized DRY_RUN value '${parsed.raw}', defaulting to false`);
    return false;
  }
  return parsed.value;
}

function parseArgs(argv) {
  const args = {
    dryRun: null,
    eventPath: "",
    projectRef: "",
    selfTest: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--self-test") {
      args.selfTest = true;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--event-path") {
      args.eventPath = argv[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--project") {
      args.projectRef = argv[i + 1] || "";
      i += 1;
      continue;
    }
  }

  return args;
}

function parseProjectRef(value) {
  const input = String(value || "").trim();
  const match = input.match(/^([a-z0-9_.-]+)\/(\d+)$/i);
  if (!match) {
    throw new Error("[error] Project reference must be in org/number format (example: arbiter-systems/2)");
  }
  return {
    org: match[1],
    number: Number(match[2]),
  };
}

function canonicalMetadataKey(key) {
  const normalized = normalizeName(key);
  if (normalized === "priority") {
    return "project_priority";
  }
  return normalized;
}

function parseMetadataBlock(body) {
  const text = String(body || "");
  const blockMatch = text.match(/<!--\s*arbiter-project\b([\s\S]*?)-->/i);
  if (!blockMatch) {
    return {
      found: false,
      values: {},
      explicitKeys: new Set(),
      warnings: [],
      unknownKeys: [],
    };
  }

  const values = {};
  const explicitKeys = new Set();
  const warnings = [];
  const unknownKeys = [];
  const lines = blockMatch[1].split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const pairMatch = line.match(/^([a-z_]+)\s*:\s*(.*)$/i);
    if (!pairMatch) {
      warnings.push(`ignored malformed metadata line: "${line}"`);
      continue;
    }
    const key = canonicalMetadataKey(pairMatch[1]);
    const value = String(pairMatch[2] || "").trim();
    if (!SUPPORTED_METADATA_KEYS.has(key)) {
      unknownKeys.push(key);
      continue;
    }
    values[key] = value;
    if (value !== "") {
      explicitKeys.add(key);
    }
  }

  return {
    found: true,
    values,
    explicitKeys,
    warnings,
    unknownKeys,
  };
}

function mapLabelsToFieldHints(labels) {
  const normalized = new Set(
    (labels || []).map((label) => normalizeName(typeof label === "string" ? label : label?.name)).filter(Boolean),
  );

  const warnings = [];

  const laneMatches = [];
  if (normalized.has("active-mvp") || normalized.has("lane: active-mvp")) {
    laneMatches.push("active-mvp");
  }
  if (normalized.has("deferred") || normalized.has("lane: deferred")) {
    laneMatches.push("deferred");
  }

  const priorityMatches = [];
  if (normalized.has("priority: high")) {
    priorityMatches.push("High");
  }
  if (normalized.has("priority: medium")) {
    priorityMatches.push("Medium");
  }
  if (normalized.has("priority: low")) {
    priorityMatches.push("Low");
  }

  const statusMatches = [];
  if (normalized.has("ready") || normalized.has("status: ready")) {
    statusMatches.push("Ready");
  }
  if (normalized.has("blocked") || normalized.has("status: blocked")) {
    statusMatches.push("Blocked");
  }
  if (normalized.has("triage") || normalized.has("status: triage")) {
    statusMatches.push("Triage");
  }

  let lane = null;
  if (laneMatches.length === 1) {
    lane = laneMatches[0];
  } else if (laneMatches.length > 1) {
    warnings.push(`multiple lane labels matched: ${laneMatches.join(", ")}; skipping lane inference`);
  }

  let priority = null;
  if (priorityMatches.length === 1) {
    priority = priorityMatches[0];
  } else if (priorityMatches.length > 1) {
    warnings.push(`multiple priority labels matched: ${priorityMatches.join(", ")}; skipping priority inference`);
  }

  let status = null;
  if (statusMatches.length === 1) {
    status = statusMatches[0];
  } else if (statusMatches.length > 1) {
    warnings.push(`multiple status labels matched: ${statusMatches.join(", ")}; skipping status inference`);
  }

  return { lane, priority, status, warnings };
}

function base64Url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function createAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: String(appId),
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).end().sign(privateKeyPem);
  return `${signingInput}.${base64Url(signature)}`;
}

async function httpJson({ method, url, token, body, headers }) {
  const requestHeaders = {
    accept: "application/vnd.github+json",
    "content-type": "application/json",
    "user-agent": USER_AGENT,
    ...headers,
  };
  if (token) {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body == null ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : `HTTP ${response.status}`;
    throw new Error(`[error] GitHub API request failed: ${message}`);
  }

  return payload;
}

async function githubGraphql(token, query, variables) {
  const payload = await httpJson({
    method: "POST",
    url: GITHUB_GRAPHQL_URL,
    token,
    body: { query, variables },
    headers: { "content-type": "application/json" },
  });

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const message = payload.errors
      .map((entry) => (typeof entry?.message === "string" ? entry.message : "unknown GraphQL error"))
      .join("; ");
    throw new Error(`[error] GitHub GraphQL error: ${message}`);
  }
  return payload?.data;
}

async function getInstallationToken(appId, privateKey, org) {
  const jwt = createAppJwt(appId, privateKey);
  const installation = await httpJson({
    method: "GET",
    url: `${GITHUB_API_URL}/orgs/${org}/installation`,
    token: jwt,
  });
  const installationId = installation?.id;
  if (!installationId) {
    throw new Error(`[error] Could not find GitHub App installation for org '${org}'`);
  }

  const accessToken = await httpJson({
    method: "POST",
    url: `${GITHUB_API_URL}/app/installations/${installationId}/access_tokens`,
    token: jwt,
    body: {},
  });

  if (!accessToken?.token) {
    throw new Error("[error] Failed to create installation access token");
  }

  return accessToken.token;
}

function loadIssueEvent(filePath) {
  const path = String(filePath || "").trim();
  if (!path) {
    throw new Error("[error] Event payload path is required (--event-path or GITHUB_EVENT_PATH)");
  }
  const raw = fs.readFileSync(path, "utf8");
  const event = JSON.parse(raw);

  if (!event?.issue?.node_id) {
    throw new Error("[error] Event payload is missing issue.node_id");
  }
  if (!event?.repository?.full_name) {
    throw new Error("[error] Event payload is missing repository.full_name");
  }

  return {
    action: String(event.action || ""),
    issueNodeId: event.issue.node_id,
    issueNumber: Number(event.issue.number || 0),
    issueBody: String(event.issue.body || ""),
    labels: Array.isArray(event.issue.labels) ? event.issue.labels : [],
    repoFullName: String(event.repository.full_name),
    repoOwner: String(event.repository.owner?.login || ""),
  };
}

function readCurrentFieldValues(fieldValueNodes) {
  const currentByField = new Map();
  for (const node of fieldValueNodes || []) {
    const fieldName = node?.field?.name;
    if (!fieldName) {
      continue;
    }
    const key = normalizeName(fieldName);
    if (node.__typename === "ProjectV2ItemFieldSingleSelectValue") {
      currentByField.set(key, { type: "single-select", value: String(node.name || "") });
      continue;
    }
    if (node.__typename === "ProjectV2ItemFieldTextValue") {
      currentByField.set(key, { type: "text", value: String(node.text || "") });
      continue;
    }
    if (node.__typename === "ProjectV2ItemFieldNumberValue") {
      const numberValue = typeof node.number === "number" ? node.number : Number(node.number);
      currentByField.set(key, { type: "number", value: Number.isFinite(numberValue) ? numberValue : null });
    }
  }
  return currentByField;
}

function findFieldByCandidates(fields, candidates) {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeName(candidate);
    const field = fields.find((entry) => normalizeName(entry?.name) === normalizedCandidate);
    if (field) {
      return field;
    }
  }
  return null;
}

function isEmptyCurrent(current) {
  if (!current) {
    return true;
  }
  if (current.type === "number") {
    return current.value == null;
  }
  return String(current.value || "").trim() === "";
}

function sameValue(type, current, desiredValue) {
  if (!current) {
    return false;
  }
  if (type === "number") {
    const desiredNumber = Number(desiredValue);
    return Number.isFinite(desiredNumber) && current.value === desiredNumber;
  }
  if (type === "single-select") {
    return normalizeName(current.value) === normalizeName(desiredValue);
  }
  return String(current.value || "") === String(desiredValue || "");
}

function normalizeConfiguredValue(key, rawValue) {
  const config = FIELD_CONFIG[key];
  if (!config) {
    return rawValue;
  }
  if (config.type !== "single-select") {
    return rawValue;
  }
  const normalizedInput = normalizeName(rawValue);
  const mapped = config.values?.[normalizedInput];
  if (!mapped) {
    const allowed = Object.values(config.values || {}).join(", ");
    throw new Error(`[error] Unsupported value '${rawValue}' for '${key}'. Allowed values: ${allowed}`);
  }
  return mapped;
}

function getSingleSelectOptionId(field, desiredValue) {
  const normalizedDesired = normalizeName(desiredValue);
  const option = (field?.options || []).find((entry) => normalizeName(entry?.name) === normalizedDesired);
  if (!option?.id) {
    throw new Error(`[error] Unknown option '${desiredValue}' for field '${field?.name || "unknown"}'`);
  }
  return option.id;
}

function validateRequiredProjectFields(fields) {
  const missing = [];
  for (const [key, config] of Object.entries(FIELD_CONFIG)) {
    if (!config.required) {
      continue;
    }
    const field = findFieldByCandidates(fields, config.candidates);
    if (!field?.id) {
      missing.push(`${key} (${config.candidates.join(", ")})`);
    }
  }
  if (missing.length > 0) {
    throw new Error(`[error] Missing required project fields: ${missing.join("; ")}`);
  }
}

function planHydration(metadata, labelHints, currentByField, fields) {
  const notes = [];
  const warnings = [];
  const candidates = [];

  function currentFor(key) {
    const field = findFieldByCandidates(fields, FIELD_CONFIG[key].candidates);
    if (!field) {
      return null;
    }
    return currentByField.get(normalizeName(field.name)) || null;
  }

  const statusCurrent = currentFor("status");
  if (metadata.explicitKeys.has("status")) {
    candidates.push({ key: "status", value: metadata.values.status, source: "metadata" });
  } else if (labelHints.status && isEmptyCurrent(statusCurrent)) {
    candidates.push({ key: "status", value: labelHints.status, source: "label" });
  } else if (isEmptyCurrent(statusCurrent)) {
    candidates.push({ key: "status", value: "Inbox", source: "default" });
  } else {
    notes.push("Status unchanged: existing value preserved");
  }

  const laneCurrent = currentFor("lane");
  if (metadata.explicitKeys.has("lane")) {
    candidates.push({ key: "lane", value: metadata.values.lane, source: "metadata" });
  } else if (labelHints.lane && isEmptyCurrent(laneCurrent)) {
    candidates.push({ key: "lane", value: labelHints.lane, source: "label" });
  } else if (labelHints.lane && !isEmptyCurrent(laneCurrent)) {
    notes.push("Lane unchanged: label inference skipped because value already set");
  }

  const priorityCurrent = currentFor("project_priority");
  if (metadata.explicitKeys.has("project_priority")) {
    candidates.push({ key: "project_priority", value: metadata.values.project_priority, source: "metadata" });
  } else if (labelHints.priority && isEmptyCurrent(priorityCurrent)) {
    candidates.push({ key: "project_priority", value: labelHints.priority, source: "label" });
  } else if (labelHints.priority && !isEmptyCurrent(priorityCurrent)) {
    notes.push("Priority unchanged: label inference skipped because value already set");
  }

  if (metadata.explicitKeys.has("phase")) {
    candidates.push({ key: "phase", value: metadata.values.phase, source: "metadata" });
  }
  if (metadata.explicitKeys.has("release_gate")) {
    candidates.push({ key: "release_gate", value: metadata.values.release_gate, source: "metadata" });
  }
  if (metadata.explicitKeys.has("implementation_readiness")) {
    candidates.push({
      key: "implementation_readiness",
      value: metadata.values.implementation_readiness,
      source: "metadata",
    });
  }
  if (metadata.explicitKeys.has("scope_risk")) {
    candidates.push({ key: "scope_risk", value: metadata.values.scope_risk, source: "metadata" });
  }
  if (metadata.explicitKeys.has("confidence")) {
    candidates.push({ key: "confidence", value: metadata.values.confidence, source: "metadata" });
  }
  if (metadata.explicitKeys.has("agent")) {
    candidates.push({ key: "agent", value: metadata.values.agent, source: "metadata" });
  }
  if (metadata.explicitKeys.has("workstream")) {
    candidates.push({ key: "workstream", value: metadata.values.workstream, source: "metadata" });
  }
  if (metadata.explicitKeys.has("validation_command")) {
    candidates.push({ key: "validation_command", value: metadata.values.validation_command, source: "metadata" });
  }
  if (metadata.explicitKeys.has("blocked_by")) {
    candidates.push({ key: "blocked_by", value: metadata.values.blocked_by, source: "metadata" });
  }
  if (metadata.explicitKeys.has("implementation_order")) {
    const parsed = Number(metadata.values.implementation_order);
    if (!Number.isFinite(parsed)) {
      throw new Error(
        `[error] implementation_order must be numeric when provided (received '${metadata.values.implementation_order}')`,
      );
    }
    candidates.push({ key: "implementation_order", value: parsed, source: "metadata" });
  }

  const operations = [];
  for (const candidate of candidates) {
    const config = FIELD_CONFIG[candidate.key];
    const field = findFieldByCandidates(fields, config.candidates);
    if (!field?.id) {
      if (config.required) {
        // Fail fast on missing required configured fields so project-schema drift is explicit and reviewable.
        throw new Error(
          `[error] Required project field for '${candidate.key}' was not found (looked for: ${config.candidates.join(", ")})`,
        );
      }
      warnings.push(
        `Optional project field for '${candidate.key}' was not found (looked for: ${config.candidates.join(
          ", ",
        )}); skipping`,
      );
      continue;
    }

    const normalizedValue = normalizeConfiguredValue(candidate.key, candidate.value);
    const current = currentByField.get(normalizeName(field.name)) || null;
    if (sameValue(config.type, current, normalizedValue)) {
      notes.push(`${field.name} unchanged: value already '${normalizedValue}'`);
      continue;
    }

    if (config.type === "single-select") {
      const optionId = getSingleSelectOptionId(field, normalizedValue);
      operations.push({
        key: candidate.key,
        fieldId: field.id,
        fieldName: field.name,
        type: config.type,
        value: normalizedValue,
        optionId,
        source: candidate.source,
        currentValue: current ? current.value : "",
      });
      continue;
    }

    operations.push({
      key: candidate.key,
      fieldId: field.id,
      fieldName: field.name,
      type: config.type,
      value: normalizedValue,
      source: candidate.source,
      currentValue: current ? current.value : "",
    });
  }

  return { operations, notes, warnings };
}

async function run() {
  const args = parseArgs(process.argv);
  if (args.selfTest) {
    runSelfTests();
    return;
  }

  const dryRun = parseDryRun(args.dryRun != null ? args.dryRun : process.env.DRY_RUN);
  const eventPath = args.eventPath || process.env.GITHUB_EVENT_PATH || "";
  const event = loadIssueEvent(eventPath);
  const metadata = parseMetadataBlock(event.issueBody);
  const labelHints = mapLabelsToFieldHints(event.labels);

  for (const warning of metadata.warnings) {
    console.warn(`[warn] ${warning}`);
  }
  for (const warning of labelHints.warnings) {
    console.warn(`[warn] ${warning}`);
  }
  if (metadata.unknownKeys.length > 0) {
    throw new Error(`[error] Unsupported metadata keys: ${metadata.unknownKeys.join(", ")}`);
  }

  const requestedProjectRef =
    metadata.explicitKeys.has("project") && metadata.values.project
      ? metadata.values.project
      : args.projectRef || process.env.PROJECT_AUTOMATION_PROJECT || DEFAULT_PROJECT_REF;
  const targetProject = parseProjectRef(requestedProjectRef);

  const appId = String(process.env.PROJECT_AUTOMATION_APP_ID || "").trim();
  if (!appId) {
    throw new Error("[error] PROJECT_AUTOMATION_APP_ID is required");
  }
  const privateKeyRaw = String(process.env.PROJECT_AUTOMATION_PRIVATE_KEY || "").trim();
  if (!privateKeyRaw) {
    throw new Error("[error] PROJECT_AUTOMATION_PRIVATE_KEY is required");
  }
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const token = await getInstallationToken(appId, privateKey, targetProject.org);

  const projectMetaQuery = `
    query ProjectMeta($org: String!, $number: Int!) {
      organization(login: $org) {
        projectV2(number: $number) {
          id
          title
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2Field {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const projectData = await githubGraphql(token, projectMetaQuery, {
    org: targetProject.org,
    number: targetProject.number,
  });
  const project = projectData?.organization?.projectV2;
  if (!project?.id) {
    throw new Error(`[error] Could not find project ${targetProject.org}/${targetProject.number}`);
  }

  const issueItemQuery = `
    query IssueProjectItems($issueId: ID!) {
      node(id: $issueId) {
        ... on Issue {
          projectItems(first: 100) {
            nodes {
              id
              project {
                id
              }
              fieldValues(first: 100) {
                nodes {
                  __typename
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2FieldCommon {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field {
                      ... on ProjectV2FieldCommon {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldNumberValue {
                    number
                    field {
                      ... on ProjectV2FieldCommon {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const issueData = await githubGraphql(token, issueItemQuery, { issueId: event.issueNodeId });
  const projectItems = issueData?.node?.projectItems?.nodes || [];
  const matchingItem = projectItems.find((entry) => entry?.project?.id === project.id) || null;

  const addItemMutation = `
    mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item {
          id
        }
      }
    }
  `;

  let itemId = matchingItem?.id || null;
  let currentByField = matchingItem ? readCurrentFieldValues(matchingItem.fieldValues?.nodes || []) : new Map();

  if (!itemId) {
    if (dryRun) {
      console.log(`[dry-run] ${event.repoFullName}#${event.issueNumber} would be added to project ${requestedProjectRef}`);
    } else {
      const added = await githubGraphql(token, addItemMutation, {
        projectId: project.id,
        contentId: event.issueNodeId,
      });
      itemId = added?.addProjectV2ItemById?.item?.id || null;
      if (!itemId) {
        throw new Error("[error] Failed to add issue to project");
      }
      currentByField = new Map();
      console.log(`[write] ${event.repoFullName}#${event.issueNumber} added to project ${requestedProjectRef}`);
    }
  }

  const fields = project.fields?.nodes || [];
  validateRequiredProjectFields(fields);
  const { operations, notes, warnings: planWarnings } = planHydration(metadata, labelHints, currentByField, fields);

  if (itemId) {
    console.log(`[info] project item id: ${itemId}`);
  } else {
    console.log("[info] project item id: <pending add>");
  }

  for (const note of notes) {
    console.log(`[decision] ${note}`);
  }
  for (const warning of planWarnings) {
    console.warn(`[warn] ${warning}`);
  }

  if (operations.length === 0) {
    console.log("[summary] no field updates required");
    return;
  }

  const setTextMutation = `
    mutation SetTextField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { text: $value }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  const setNumberMutation = `
    mutation SetNumberField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: Float!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { number: $value }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  const setSingleSelectMutation = `
    mutation SetSingleSelectField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  for (const op of operations) {
    const issueKey = `${event.repoFullName}#${event.issueNumber}`;
    if (dryRun) {
      console.log(
        `[dry-run] ${issueKey} ${op.fieldName}: "${op.currentValue ?? ""}" -> "${op.value}" (source=${op.source})`,
      );
      continue;
    }

    if (!itemId) {
      throw new Error("[error] Project item ID missing before mutation");
    }

    if (op.type === "text") {
      await githubGraphql(token, setTextMutation, {
        projectId: project.id,
        itemId,
        fieldId: op.fieldId,
        value: String(op.value),
      });
      console.log(`[write] ${issueKey} ${op.fieldName} updated (source=${op.source})`);
      continue;
    }

    if (op.type === "number") {
      await githubGraphql(token, setNumberMutation, {
        projectId: project.id,
        itemId,
        fieldId: op.fieldId,
        value: Number(op.value),
      });
      console.log(`[write] ${issueKey} ${op.fieldName} updated (source=${op.source})`);
      continue;
    }

    await githubGraphql(token, setSingleSelectMutation, {
      projectId: project.id,
      itemId,
      fieldId: op.fieldId,
      optionId: op.optionId,
    });
    console.log(`[write] ${issueKey} ${op.fieldName} updated (source=${op.source})`);
  }

  console.log(`[summary] mode=${dryRun ? "dry-run" : "write"}`);
  console.log(`[summary] planned updates=${operations.length}`);
}

function runSelfTests() {
  let metadata = parseMetadataBlock("No metadata");
  assert.equal(metadata.found, false);

  metadata = parseMetadataBlock(
    [
      "<!-- arbiter-project",
      "project: arbiter-systems/2",
      "status: Inbox",
      "lane: active-mvp",
      "priority: High",
      "project_priority: Low",
      "phase: mvp",
      "release_gate: local-mvp",
      "implementation_readiness: ready",
      "scope_risk: medium",
      "confidence: high",
      "agent: codex",
      "workstream: MVP Execution",
      "validation_command: npm test",
      "blocked_by:",
      "implementation_order: 7",
      "-->",
    ].join("\n"),
  );
  assert.equal(metadata.found, true);
  assert.equal(metadata.values.project, "arbiter-systems/2");
  assert.equal(metadata.values.status, "Inbox");
  assert.equal(metadata.values.lane, "active-mvp");
  assert.equal(metadata.values.project_priority, "Low");
  assert.equal(metadata.values.phase, "mvp");
  assert.equal(metadata.values.release_gate, "local-mvp");
  assert.equal(metadata.values.implementation_readiness, "ready");
  assert.equal(metadata.values.scope_risk, "medium");
  assert.equal(metadata.values.confidence, "high");
  assert.equal(metadata.values.agent, "codex");
  assert.equal(metadata.values.workstream, "MVP Execution");
  assert.equal(metadata.values.validation_command, "npm test");
  assert.equal(metadata.values.blocked_by, "");
  assert.equal(metadata.values.implementation_order, "7");
  assert.equal(metadata.explicitKeys.has("blocked_by"), false);
  assert.equal(metadata.explicitKeys.has("project_priority"), true);

  metadata = parseMetadataBlock("<!-- arbiter-project\nstatus Inbox\nlane: active-mvp\n-->");
  assert.equal(metadata.found, true);
  assert.equal(metadata.warnings.length, 1);

  metadata = parseMetadataBlock("<!-- arbiter-project\nproject_priority: High\npriority: Low\n-->");
  assert.equal(metadata.values.project_priority, "Low");

  metadata = parseMetadataBlock("<!-- arbiter-project\nunknown_field: value\n-->");
  assert.equal(metadata.unknownKeys.includes("unknown_field"), true);
  assert.throws(() => {
    if (metadata.unknownKeys.length > 0) {
      throw new Error(`[error] Unsupported metadata keys: ${metadata.unknownKeys.join(", ")}`);
    }
  }, /Unsupported metadata keys/);

  metadata = parseMetadataBlock("<!-- arbiter-project\nphase:\n-->");
  assert.equal(metadata.explicitKeys.has("phase"), false);

  let labels = mapLabelsToFieldHints(["active-mvp"]);
  assert.equal(labels.lane, "active-mvp");
  assert.equal(labels.priority, null);
  assert.equal(labels.status, null);

  labels = mapLabelsToFieldHints(["lane: deferred"]);
  assert.equal(labels.lane, "deferred");

  labels = mapLabelsToFieldHints(["blocked"]);
  assert.equal(labels.status, "Blocked");

  labels = mapLabelsToFieldHints(["ready"]);
  assert.equal(labels.status, "Ready");

  labels = mapLabelsToFieldHints(["priority: high"]);
  assert.equal(labels.priority, "High");

  labels = mapLabelsToFieldHints(["priority: medium"]);
  assert.equal(labels.priority, "Medium");

  labels = mapLabelsToFieldHints(["priority: low"]);
  assert.equal(labels.priority, "Low");

  labels = mapLabelsToFieldHints([]);
  assert.equal(labels.lane, null);
  assert.equal(labels.priority, null);
  assert.equal(labels.status, null);

  labels = mapLabelsToFieldHints(["active-mvp", "lane: deferred"]);
  assert.equal(labels.lane, null);
  assert.equal(labels.warnings.length > 0, true);

  assert.deepEqual(parseProjectRef("arbiter-systems/2"), { org: "arbiter-systems", number: 2 });
  assert.throws(() => parseProjectRef("arbiter-systems/project-two"), /org\/number format/);

  assert.equal(parseDryRun("true"), true);
  assert.equal(parseDryRun("false"), false);
  assert.equal(parseDryRun(undefined), false);
  assert.equal(parseDryRun(""), false);
  assert.equal(parseDryRun("1"), true);
  assert.equal(parseDryRun("0"), false);

  let warned = "";
  const originalWarn = console.warn;
  console.warn = (message) => {
    warned = String(message);
  };
  try {
    assert.equal(parseDryRun("not-a-bool"), false);
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(warned.includes("[warn] Unrecognized DRY_RUN value 'not-a-bool', defaulting to false"), true);

  assert.equal(isEmptyCurrent(null), true);
  assert.equal(isEmptyCurrent({ type: "text", value: "" }), true);
  assert.equal(isEmptyCurrent({ type: "single-select", value: "Inbox" }), false);
  assert.equal(isEmptyCurrent({ type: "number", value: null }), true);
  assert.equal(isEmptyCurrent({ type: "number", value: 3 }), false);

  assert.equal(sameValue("single-select", { type: "single-select", value: "Inbox" }, "inbox"), true);
  assert.equal(sameValue("text", { type: "text", value: "abc" }, "abc"), true);
  assert.equal(sameValue("number", { type: "number", value: 7 }, 7), true);
  assert.equal(sameValue("number", { type: "number", value: 7 }, 8), false);

  const fields = [
    {
      id: "f-status",
      name: "Status",
      options: [
        { id: "o-inbox", name: "Inbox" },
        { id: "o-triage", name: "Triage" },
      ],
    },
    {
      id: "f-lane",
      name: "Lane",
      options: [
        { id: "o-active", name: "active-mvp" },
        { id: "o-deferred", name: "deferred" },
      ],
    },
    {
      id: "f-priority",
      name: "Project Priority",
      options: [
        { id: "o-high", name: "High" },
        { id: "o-medium", name: "Medium" },
      ],
    },
    {
      id: "f-phase",
      name: "Phase",
      options: [
        { id: "o-mvp", name: "mvp" },
      ],
    },
    {
      id: "f-validation",
      name: "Validation Command",
    },
    {
      id: "f-workstream",
      name: "Workstream",
      options: [
        { id: "o-mvp-exec", name: "MVP Execution" },
      ],
    },
  ];

  const metadataMissing = {
    found: false,
    values: {},
    explicitKeys: new Set(),
    warnings: [],
    unknownKeys: [],
  };

  let plan = planHydration(
    metadataMissing,
    { lane: "active-mvp", priority: "High", status: "Ready", warnings: [] },
    new Map([
      ["status", { type: "single-select", value: "Triage" }],
      ["lane", { type: "single-select", value: "deferred" }],
      ["project priority", { type: "single-select", value: "Medium" }],
    ]),
    fields,
  );
  assert.equal(plan.operations.some((op) => op.key === "lane"), false);
  assert.equal(plan.operations.some((op) => op.key === "project_priority"), false);
  assert.equal(plan.operations.some((op) => op.key === "status"), false);

  plan = planHydration(metadataMissing, { lane: null, priority: null, status: null, warnings: [] }, new Map(), fields);
  assert.equal(plan.operations.some((op) => op.key === "status" && op.value === "Inbox" && op.source === "default"), true);

  plan = planHydration(
    {
      found: true,
      values: { lane: "active-mvp", project_priority: "High", workstream: "MVP Execution" },
      explicitKeys: new Set(["lane", "project_priority", "workstream"]),
      warnings: [],
      unknownKeys: [],
    },
    { lane: null, priority: null, status: null, warnings: [] },
    new Map([
      ["lane", { type: "single-select", value: "deferred" }],
      ["project priority", { type: "single-select", value: "Medium" }],
    ]),
    fields,
  );
  assert.equal(plan.operations.some((op) => op.key === "lane" && op.source === "metadata"), true);
  assert.equal(plan.operations.some((op) => op.key === "project_priority" && op.source === "metadata"), true);
  assert.equal(plan.operations.some((op) => op.key === "workstream" && op.source === "metadata"), true);

  plan = planHydration(
    {
      found: true,
      values: { phase: "mvp", validation_command: "npm test" },
      explicitKeys: new Set(["phase", "validation_command"]),
      warnings: [],
      unknownKeys: [],
    },
    { lane: null, priority: null, status: null, warnings: [] },
    new Map(),
    fields.filter((field) => field.name !== "Phase"),
  );
  assert.equal(plan.operations.some((op) => op.key === "phase"), false);
  assert.equal(
    plan.warnings.some((warning) => warning.includes("Optional project field for 'phase' was not found")),
    true,
  );

  assert.throws(
    () => validateRequiredProjectFields(fields.filter((field) => field.name !== "Lane")),
    /Missing required project fields/,
  );

  assert.throws(
    () => planHydration(
      {
        found: true,
        values: { project_priority: "Critical" },
        explicitKeys: new Set(["project_priority"]),
        warnings: [],
        unknownKeys: [],
      },
      { lane: null, priority: null, status: null, warnings: [] },
      new Map(),
      fields,
    ),
    /Unsupported value 'Critical'/,
  );

  console.log("[self-test] ok");
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message.startsWith("[error]") ? message : `[error] ${message}`);
  process.exit(1);
});

module.exports = {
  mapLabelsToFieldHints,
  parseMetadataBlock,
  parseProjectRef,
  parseDryRun,
  parseBooleanToken,
  parseTruthy,
};
