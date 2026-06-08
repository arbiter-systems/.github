#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const USER_AGENT = "arbiter-project-field-hydration";
const DEFAULT_PROJECT_REF = "arbiter-systems/2";

const PROJECT_REF_RE = /^([a-z0-9_.-]+)\/(\d+)$/i;
const METADATA_BLOCK_RE = /<!--\s*arbiter-project\b([\s\S]*?)-->/i;
const METADATA_LINE_RE = /^([a-z_]+)\s*:\s*(.*)$/i;
const REPO_FULL_NAME_RE = /^([^/]+)\/([^/]+)$/;

const SUPPORTED_METADATA_KEYS = new Set([
  "project",
  "repo",
  "status",
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

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function buildSingleSelectValueMap(entries) {
  const values = {};
  for (const [displayValue, aliases = []] of entries) {
    values[normalizeName(displayValue)] = displayValue;
    for (const alias of aliases) values[normalizeName(alias)] = displayValue;
  }
  return values;
}

const FIELD_CONFIG = {
  repo: {
    type: "single-select",
    required: false,
    candidates: ["Repo"],
    values: buildSingleSelectValueMap([
      [".github", ["arbiter-systems/.github", "github"]],
      ["control-plane-api", ["arbiter-systems/control-plane-api"]],
      ["ai-execution-service", ["arbiter-systems/ai-execution-service"]],
      ["arbiter-console", ["arbiter-systems/arbiter-console"]],
      ["arbiter-site", ["arbiter-systems/arbiter-site"]],
      ["company", ["arbiter-systems/company"]],
      ["security", ["arbiter-systems/security"]],
    ]),
  },
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
  project_priority: {
    type: "single-select",
    required: true,
    candidates: ["Project Priority"],
    values: { high: "High", medium: "Medium", low: "Low" },
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
    values: { "not-ready": "not-ready", "needs-clarification": "needs-clarification", ready: "ready" },
  },
  scope_risk: {
    type: "single-select",
    required: false,
    candidates: ["Scope Risk"],
    values: { low: "low", medium: "medium", high: "high" },
  },
  confidence: {
    type: "single-select",
    required: false,
    candidates: ["Confidence"],
    values: { high: "high", medium: "medium", low: "low" },
  },
  agent: {
    type: "single-select",
    required: false,
    candidates: ["Agent"],
    values: { none: "none", codex: "Codex", claude: "Claude", copilot: "Copilot", mixed: "mixed" },
  },
  workstream: {
    type: "single-select",
    required: false,
    candidates: ["Workstream"],
    values: buildSingleSelectValueMap([
      ["GitHub Project Management", ["github-project-management"]],
      ["MVP Execution", ["mvp-execution"]],
      ["Security & Compliance", ["security-privacy"]],
      ["Documentation & Site", ["documentation-site"]],
      ["Infrastructure & Ops", ["infrastructure-ops"]],
    ]),
  },
  validation_command: { type: "text", required: false, candidates: ["Validation Command"] },
  blocked_by: { type: "text", required: false, candidates: ["Blocked By"] },
  implementation_order: { type: "number", required: false, candidates: ["Implementation Order"] },
};

function parseBooleanToken(value) {
  if (value == null) return null;
  const raw = String(value);
  const normalized = normalizeName(value);
  if (normalized === "") return null;
  if (["1", "true", "yes"].includes(normalized)) return { recognized: true, value: true, raw };
  if (["0", "false", "no"].includes(normalized)) return { recognized: true, value: false, raw };
  return { recognized: false, value: false, raw };
}

function parseTruthy(value) {
  const parsed = parseBooleanToken(value);
  return Boolean(parsed?.recognized && parsed.value);
}

function parseDryRun(value) {
  const parsed = parseBooleanToken(value);
  if (!parsed) return false;
  if (!parsed.recognized) {
    console.warn(`[warn] Unrecognized DRY_RUN value '${parsed.raw}', defaulting to false`);
    return false;
  }
  return parsed.value;
}

function parseArgs(argv) {
  const args = { dryRun: null, eventPath: "", projectRef: "", issueNumber: null, repoFullName: "", selfTest: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--self-test") args.selfTest = true;
    else if (arg === "--dry-run") args.dryRun = argv[++i];
    else if (arg === "--event-path") args.eventPath = argv[++i] || "";
    else if (arg === "--project") args.projectRef = argv[++i] || "";
    else if (arg === "--issue-number") args.issueNumber = argv[++i] || "";
    else if (arg === "--repo") args.repoFullName = argv[++i] || "";
  }
  return args;
}

function parseProjectRef(value) {
  const input = String(value || "").trim();
  const match = PROJECT_REF_RE.exec(input);
  if (!match) throw new Error("[error] Project reference must be in org/number format (example: arbiter-systems/2)");
  return { org: match[1], number: Number(match[2]) };
}

function parseMetadataBlock(body) {
  const text = String(body || "");
  const blockMatch = METADATA_BLOCK_RE.exec(text);
  if (!blockMatch) return { found: false, values: {}, explicitKeys: new Set(), warnings: [], unknownKeys: [] };
  const values = {};
  const explicitKeys = new Set();
  const warnings = [];
  const unknownKeys = [];
  for (const rawLine of blockMatch[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const pairMatch = METADATA_LINE_RE.exec(line);
    if (!pairMatch) {
      warnings.push(`ignored malformed metadata line: "${line}"`);
      continue;
    }
    const key = normalizeName(pairMatch[1]);
    const value = String(pairMatch[2] || "").trim();
    if (!SUPPORTED_METADATA_KEYS.has(key)) {
      unknownKeys.push(key);
      continue;
    }
    values[key] = value;
    if (value !== "") explicitKeys.add(key);
  }
  return { found: true, values, explicitKeys, warnings, unknownKeys };
}

function mapLabelsToFieldHints(labels) {
  const normalized = new Set((labels || []).map((label) => normalizeName(typeof label === "string" ? label : label?.name)).filter(Boolean));
  const warnings = [];
  const priorityMatches = [];
  if (normalized.has("priority: high")) priorityMatches.push("High");
  if (normalized.has("priority: medium")) priorityMatches.push("Medium");
  if (normalized.has("priority: low")) priorityMatches.push("Low");
  const statusMatches = [];
  if (normalized.has("blocked") || normalized.has("status: blocked")) statusMatches.push("Blocked");
  if (normalized.has("triage") || normalized.has("status: triage")) statusMatches.push("Triage");
  const priority = priorityMatches.length === 1 ? priorityMatches[0] : null;
  const status = statusMatches.length === 1 ? statusMatches[0] : null;
  if (priorityMatches.length > 1) warnings.push(`multiple priority labels matched: ${priorityMatches.join(", ")}; skipping priority inference`);
  if (statusMatches.length > 1) warnings.push(`multiple status labels matched: ${statusMatches.join(", ")}; skipping status inference`);
  return { priority, status, warnings };
}

function base64Url(input) {
  return Buffer.from(input).toString("base64").replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");
}

function createAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const encodedHeader = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const encodedPayload = base64Url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: String(appId) }));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).end().sign(privateKeyPem);
  return `${signingInput}.${base64Url(signature)}`;
}

async function httpJson({ method, url, token, body, headers }) {
  const requestHeaders = { accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": USER_AGENT, ...headers };
  if (token) requestHeaders.authorization = `Bearer ${token}`;
  const response = await fetch(url, { method, headers: requestHeaders, body: body == null ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : `HTTP ${response.status}`;
    throw new Error(`[error] GitHub API request failed: ${message}`);
  }
  return payload;
}

async function githubGraphql(token, query, variables) {
  const payload = await httpJson({ method: "POST", url: GITHUB_GRAPHQL_URL, token, body: { query, variables }, headers: { "content-type": "application/json" } });
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const message = payload.errors.map((entry) => (typeof entry?.message === "string" ? entry.message : "unknown GraphQL error")).join("; ");
    throw new Error(`[error] GitHub GraphQL error: ${message}`);
  }
  return payload?.data;
}

async function getInstallationToken(appId, privateKey, org) {
  const jwt = createAppJwt(appId, privateKey);
  const installation = await httpJson({ method: "GET", url: `${GITHUB_API_URL}/orgs/${org}/installation`, token: jwt });
  const installationId = installation?.id;
  if (!installationId) throw new Error(`[error] Could not find GitHub App installation for org '${org}'`);
  const accessToken = await httpJson({ method: "POST", url: `${GITHUB_API_URL}/app/installations/${installationId}/access_tokens`, token: jwt, body: {} });
  if (!accessToken?.token) throw new Error("[error] Failed to create installation access token");
  return accessToken.token;
}

async function fetchIssueByNumber(token, repoFullName, issueNumber) {
  const match = REPO_FULL_NAME_RE.exec(String(repoFullName || "").trim());
  if (!match) throw new Error("[error] --repo must be in owner/repo format");
  if (!/^\d+$/.test(String(issueNumber || "").trim())) throw new Error("[error] --issue-number must be a positive integer");
  const owner = match[1];
  const repo = match[2];
  const number = Number(issueNumber);
  const issue = await httpJson({ method: "GET", url: `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${number}`, token });
  if (!issue?.node_id) throw new Error("[error] Issue lookup failed: missing node_id");
  return { action: "workflow_dispatch", issueNodeId: issue.node_id, issueNumber: Number(issue.number || number), issueBody: String(issue.body || ""), labels: Array.isArray(issue.labels) ? issue.labels : [], repoFullName: `${owner}/${repo}`, repoOwner: owner };
}

function loadIssueEvent(filePath) {
  const path = String(filePath || "").trim();
  if (!path) throw new Error("[error] Event payload path is required (--event-path or GITHUB_EVENT_PATH)");
  const event = JSON.parse(fs.readFileSync(path, "utf8"));
  if (!event?.issue?.node_id) throw new Error("[error] Event payload is missing issue.node_id");
  if (!event?.repository?.full_name) throw new Error("[error] Event payload is missing repository.full_name");
  return { action: String(event.action || ""), issueNodeId: event.issue.node_id, issueNumber: Number(event.issue.number || 0), issueBody: String(event.issue.body || ""), labels: Array.isArray(event.issue.labels) ? event.issue.labels : [], repoFullName: String(event.repository.full_name), repoOwner: String(event.repository.owner?.login || "") };
}

function readCurrentFieldValues(fieldValueNodes) {
  const currentByField = new Map();
  for (const node of fieldValueNodes || []) {
    const fieldName = node?.field?.name;
    if (!fieldName) continue;
    const key = normalizeName(fieldName);
    if (node.__typename === "ProjectV2ItemFieldSingleSelectValue") currentByField.set(key, { type: "single-select", value: String(node.name || "") });
    else if (node.__typename === "ProjectV2ItemFieldTextValue") currentByField.set(key, { type: "text", value: String(node.text || "") });
    else if (node.__typename === "ProjectV2ItemFieldNumberValue") {
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
    if (field) return field;
  }
  return null;
}

function isEmptyCurrent(current) {
  if (!current) return true;
  if (current.type === "number") return current.value == null;
  return String(current.value || "").trim() === "";
}

function sameValue(type, current, desiredValue) {
  if (!current) return false;
  if (type === "number") {
    const desiredNumber = Number(desiredValue);
    return Number.isFinite(desiredNumber) && current.value === desiredNumber;
  }
  if (type === "single-select") return normalizeName(current.value) === normalizeName(desiredValue);
  return String(current.value || "") === String(desiredValue || "");
}

function normalizeConfiguredValue(key, rawValue) {
  const config = FIELD_CONFIG[key];
  if (!config || config.type !== "single-select") return rawValue;
  return config.values?.[normalizeName(rawValue)] || null;
}

function getSingleSelectOptionId(field, desiredValue) {
  const option = (field?.options || []).find((entry) => normalizeName(entry?.name) === normalizeName(desiredValue));
  return option?.id || null;
}

function formatOptionList(values) {
  return [...new Set(values)].filter((value) => String(value || "").trim() !== "").join(", ") || "(none)";
}

function formatConfiguredValues(config) {
  return formatOptionList(Object.values(config.values || {}));
}

function formatLiveOptions(field) {
  return formatOptionList((field?.options || []).map((option) => option?.name));
}

function validateRequiredProjectFields(fields) {
  const missing = [];
  for (const [key, config] of Object.entries(FIELD_CONFIG)) {
    if (!config.required) continue;
    const field = findFieldByCandidates(fields, config.candidates);
    if (!field?.id) missing.push(`${key} (${config.candidates.join(", ")})`);
  }
  if (missing.length > 0) throw new Error(`[error] Missing required project fields: ${missing.join("; ")}`);
}

const EXPLICIT_METADATA_FIELD_KEYS = [
  "repo",
  "phase",
  "release_gate",
  "implementation_readiness",
  "scope_risk",
  "confidence",
  "agent",
  "workstream",
  "validation_command",
  "blocked_by",
];

function getCurrentFieldValue(key, currentByField, fields) {
  const field = findFieldByCandidates(fields, FIELD_CONFIG[key].candidates);
  return field ? currentByField.get(normalizeName(field.name)) || null : null;
}

function getConfiguredFieldName(key, fields) {
  const field = findFieldByCandidates(fields, FIELD_CONFIG[key].candidates);
  return field?.name || FIELD_CONFIG[key].candidates[0] || key;
}

function formatUnchangedNote(fieldName, current) {
  return `${fieldName}: unchanged (current='${current?.value ?? ""}')`;
}

function addFieldCandidate(key, candidates, notes, metadata, currentByField, fields, { labelHintValue = null, defaultValue = null, noteIfOccupied = false } = {}) {
  const current = getCurrentFieldValue(key, currentByField, fields);
  if (metadata.explicitKeys.has(key)) {
    candidates.push({ key, value: metadata.values[key], source: "metadata" });
    return;
  }
  if (labelHintValue && isEmptyCurrent(current)) {
    candidates.push({ key, value: labelHintValue, source: "label" });
    return;
  }
  if (labelHintValue && !isEmptyCurrent(current)) {
    notes.push(formatUnchangedNote(getConfiguredFieldName(key, fields), current));
    return;
  }
  if (defaultValue !== null && isEmptyCurrent(current)) candidates.push({ key, value: defaultValue, source: "default" });
  else if (noteIfOccupied && !isEmptyCurrent(current)) notes.push(formatUnchangedNote(getConfiguredFieldName(key, fields), current));
}

function addExplicitMetadataCandidates(candidates, metadata) {
  for (const key of EXPLICIT_METADATA_FIELD_KEYS) {
    if (metadata.explicitKeys.has(key)) candidates.push({ key, value: metadata.values[key], source: "metadata" });
  }
  if (metadata.explicitKeys.has("implementation_order")) {
    const parsed = Number(metadata.values.implementation_order);
    if (!Number.isFinite(parsed)) throw new TypeError(`[error] implementation_order must be numeric when provided (received '${metadata.values.implementation_order}')`);
    candidates.push({ key: "implementation_order", value: parsed, source: "metadata" });
  }
}

function buildHydrationCandidates(metadata, labelHints, currentByField, fields) {
  const notes = [];
  const candidates = [];
  addFieldCandidate("status", candidates, notes, metadata, currentByField, fields, { labelHintValue: labelHints.status, defaultValue: "Inbox", noteIfOccupied: true });
  addFieldCandidate("project_priority", candidates, notes, metadata, currentByField, fields, { labelHintValue: labelHints.priority });
  addExplicitMetadataCandidates(candidates, metadata);
  return { candidates, notes };
}

function planMissingField(candidate, config) {
  if (config.required) throw new Error(`[error] Required project field for '${candidate.key}' was not found (looked for: ${config.candidates.join(", ")})`);
  return { warning: `Optional project field for '${candidate.key}' was not found (looked for: ${config.candidates.join(", ")}); skipping` };
}

function buildFieldOperation(candidate, config, field, normalizedValue, current) {
  return { key: candidate.key, fieldId: field.id, fieldName: field.name, type: config.type, value: normalizedValue, source: candidate.source, currentValue: current ? current.value : "" };
}

function planCandidateOperation(candidate, currentByField, fields) {
  const config = FIELD_CONFIG[candidate.key];
  const field = findFieldByCandidates(fields, config.candidates);
  if (!field?.id) return planMissingField(candidate, config);
  const normalizedValue = normalizeConfiguredValue(candidate.key, candidate.value);
  if (normalizedValue == null) return { error: `Unknown single-select option '${candidate.value}' for field '${field.name}'.\n  Configured taxonomy: ${formatConfiguredValues(config)}\n  Live project options: ${formatLiveOptions(field)}` };
  const current = currentByField.get(normalizeName(field.name)) || null;
  if (sameValue(config.type, current, normalizedValue)) return { note: `${field.name} unchanged: value already '${normalizedValue}'` };
  if (config.type === "single-select") {
    const optionId = getSingleSelectOptionId(field, normalizedValue);
    if (!optionId) return { error: `Single-select option '${normalizedValue}' is not present in the live project field '${field.name}'.\n  Live project options: ${formatLiveOptions(field)}` };
    return { operation: { ...buildFieldOperation(candidate, config, field, normalizedValue, current), optionId } };
  }
  return { operation: buildFieldOperation(candidate, config, field, normalizedValue, current) };
}

function planHydration(metadata, labelHints, currentByField, fields) {
  const candidatePlan = buildHydrationCandidates(metadata, labelHints, currentByField, fields);
  const operations = [];
  const notes = [...candidatePlan.notes];
  const warnings = [];
  const errors = [];
  for (const candidate of candidatePlan.candidates) {
    const result = planCandidateOperation(candidate, currentByField, fields);
    if (result.operation) operations.push(result.operation);
    if (result.note) notes.push(result.note);
    if (result.warning) warnings.push(result.warning);
    if (result.error) errors.push(result.error);
  }
  return { operations, notes, warnings, errors };
}

function buildRunContext(args) {
  const dryRun = parseDryRun(args.dryRun == null ? process.env.DRY_RUN : args.dryRun);
  const fallbackProjectRef = args.projectRef || process.env.PROJECT_AUTOMATION_PROJECT || DEFAULT_PROJECT_REF;
  const fallbackProject = parseProjectRef(fallbackProjectRef);
  const appId = String(process.env.PROJECT_AUTOMATION_APP_ID || "").trim();
  if (!appId) throw new Error("[error] PROJECT_AUTOMATION_APP_ID is required");
  const privateKeyRaw = String(process.env.PROJECT_AUTOMATION_PRIVATE_KEY || "").trim();
  if (!privateKeyRaw) throw new Error("[error] PROJECT_AUTOMATION_PRIVATE_KEY is required");
  return { dryRun, fallbackProjectRef, fallbackProject, appId, privateKey: privateKeyRaw.replaceAll(String.raw`\n`, "\n") };
}

async function createHydrationAuth(context) {
  return { token: await getInstallationToken(context.appId, context.privateKey, context.fallbackProject.org) };
}

async function loadHydrationEvent(args, token) {
  if (args.issueNumber) return fetchIssueByNumber(token, args.repoFullName || process.env.GITHUB_REPOSITORY || "", args.issueNumber);
  return loadIssueEvent(args.eventPath || process.env.GITHUB_EVENT_PATH || "");
}

function parseHydrationInputs(event) {
  return { metadata: parseMetadataBlock(event.issueBody), labelHints: mapLabelsToFieldHints(event.labels) };
}

function emitInputWarnings(metadata, labelHints) {
  for (const warning of metadata.warnings) console.warn(`[warn] ${warning}`);
  for (const warning of labelHints.warnings) console.warn(`[warn] ${warning}`);
  for (const key of metadata.unknownKeys) {
    const hint = key === "priority" ? "use project_priority instead of priority" : "remove unrecognized keys";
    console.warn(`[warn] Unsupported metadata key ignored: '${key}' -- ${hint}`);
  }
}

const PROJECT_META_QUERY = `
  query ProjectMeta($org: String!, $number: Int!) {
    organization(login: $org) {
      projectV2(number: $number) {
        id
        title
        fields(first: 100) {
          nodes {
            __typename
            ... on ProjectV2Field { id name }
            ... on ProjectV2SingleSelectField { id name options { id name } }
          }
        }
      }
    }
  }
`;

const ISSUE_ITEMS_QUERY = `
  query IssueProjectItems($issueId: ID!) {
    node(id: $issueId) {
      ... on Issue {
        projectItems(first: 100) {
          nodes {
            id
            project { id }
            fieldValues(first: 100) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
                ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } }
                ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2FieldCommon { name } } }
              }
            }
          }
        }
      }
    }
  }
`;

const ADD_ITEM_MUTATION = `
  mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } }
  }
`;

async function fetchProjectMetadata(token, targetProject) {
  const projectData = await githubGraphql(token, PROJECT_META_QUERY, { org: targetProject.org, number: targetProject.number });
  const project = projectData?.organization?.projectV2;
  if (!project?.id) throw new Error(`[error] Could not find project ${targetProject.org}/${targetProject.number}`);
  return project;
}

async function loadTargetProjectContext({ auth, context, metadata }) {
  const requestedProjectRef = metadata.explicitKeys.has("project") && metadata.values.project ? metadata.values.project : context.fallbackProjectRef;
  const targetProject = parseProjectRef(requestedProjectRef);
  const token = normalizeName(targetProject.org) === normalizeName(context.fallbackProject.org) ? auth.token : await getInstallationToken(context.appId, context.privateKey, targetProject.org);
  return { token, project: await fetchProjectMetadata(token, targetProject), requestedProjectRef };
}

async function fetchIssueProjectItems(token, issueNodeId) {
  return githubGraphql(token, ISSUE_ITEMS_QUERY, { issueId: issueNodeId });
}

async function loadProjectItemContext({ token, event, project }) {
  const issueData = await fetchIssueProjectItems(token, event.issueNodeId);
  const projectItems = issueData?.node?.projectItems?.nodes || [];
  const matchingItem = projectItems.find((entry) => entry?.project?.id === project.id) || null;
  return { itemId: matchingItem?.id || null, currentByField: matchingItem ? readCurrentFieldValues(matchingItem.fieldValues?.nodes || []) : new Map() };
}

async function addProjectItemIfNeeded({ token, event, project, requestedProjectRef, dryRun }) {
  if (dryRun) {
    console.log(`[dry-run] ${event.repoFullName}#${event.issueNumber} would be added to project ${requestedProjectRef}`);
    return { itemId: null, currentByField: new Map() };
  }
  const added = await githubGraphql(token, ADD_ITEM_MUTATION, { projectId: project.id, contentId: event.issueNodeId });
  const itemId = added?.addProjectV2ItemById?.item?.id || null;
  if (!itemId) throw new Error("[error] Failed to add issue to project");
  console.log(`[write] ${event.repoFullName}#${event.issueNumber} added to project ${requestedProjectRef}`);
  return { itemId, currentByField: new Map() };
}

async function ensureProjectItem({ token, event, project, requestedProjectRef, dryRun, itemContext = null }) {
  const context = itemContext || (await loadProjectItemContext({ token, event, project }));
  if (context.itemId) return context;
  return addProjectItemIfNeeded({ token, event, project, requestedProjectRef, dryRun });
}

function createHydrationPlan({ project, metadata, labelHints, currentByField }) {
  const fields = project.fields?.nodes || [];
  validateRequiredProjectFields(fields);
  return planHydration(metadata, labelHints, currentByField, fields);
}

function emitHydrationPlan(itemId, plan, { dryRun, repoFullName, issueNumber }) {
  console.log(`[${dryRun ? "dry-run" : "info"}] issue=${repoFullName}#${issueNumber}`);
  console.log(itemId ? `[info] project item id: ${itemId}` : "[info] project item id: <pending add>");
  for (const note of plan.notes) console.log(`[decision] ${note}`);
  for (const warning of plan.warnings) console.warn(`[warn] ${warning}`);
  for (const error of plan.errors) console.error(`[error] ${error}`);
}

function markFailedIfPlanHasErrors(plan) {
  if (plan.errors.length > 0) process.exitCode = 1;
}

const FIELD_UPDATE_MUTATIONS = {
  text: `mutation SetTextField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) { updateProjectV2ItemFieldValue(input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { text: $value } }) { projectV2Item { id } } }`,
  number: `mutation SetNumberField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: Float!) { updateProjectV2ItemFieldValue(input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { number: $value } }) { projectV2Item { id } } }`,
  singleSelect: `mutation SetSingleSelectField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) { updateProjectV2ItemFieldValue(input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { singleSelectOptionId: $optionId } }) { projectV2Item { id } } }`,
};

async function applyHydrationOperation({ token, project, itemId, event, dryRun, op, mutations }) {
  const issueKey = `${event.repoFullName}#${event.issueNumber}`;
  if (dryRun) {
    console.log(`[dry-run] ${issueKey} ${op.fieldName}: "${op.currentValue ?? ""}" -> "${op.value}" (source=${op.source})`);
    return;
  }
  if (!itemId) throw new Error("[error] Project item ID missing before mutation");
  if (op.type === "text") await githubGraphql(token, mutations.text, { projectId: project.id, itemId, fieldId: op.fieldId, value: String(op.value) });
  else if (op.type === "number") await githubGraphql(token, mutations.number, { projectId: project.id, itemId, fieldId: op.fieldId, value: Number(op.value) });
  else await githubGraphql(token, mutations.singleSelect, { projectId: project.id, itemId, fieldId: op.fieldId, optionId: op.optionId });
  console.log(`[write] ${issueKey} ${op.fieldName} updated (source=${op.source})`);
}

async function applyHydrationOperations({ token, project, itemId, event, dryRun, operations }) {
  for (const op of operations) await applyHydrationOperation({ token, project, itemId, event, dryRun, op, mutations: FIELD_UPDATE_MUTATIONS });
}

async function run() {
  const args = parseArgs(process.argv);
  if (args.selfTest) {
    runSelfTests();
    return;
  }
  const context = buildRunContext(args);
  const auth = await createHydrationAuth(context);
  const event = await loadHydrationEvent(args, auth.token);
  const planningInput = parseHydrationInputs(event);
  emitInputWarnings(planningInput.metadata, planningInput.labelHints);
  const projectContext = await loadTargetProjectContext({ auth, context, metadata: planningInput.metadata });
  let itemContext = await loadProjectItemContext({ token: projectContext.token, event, project: projectContext.project });
  const plan = createHydrationPlan({ project: projectContext.project, metadata: planningInput.metadata, labelHints: planningInput.labelHints, currentByField: itemContext.currentByField });
  emitHydrationPlan(itemContext.itemId, plan, { dryRun: context.dryRun, repoFullName: event.repoFullName, issueNumber: event.issueNumber });
  if (!context.dryRun && plan.errors.length > 0) throw new Error(`[error] Validation failed:\n${plan.errors.map((error) => `- ${error}`).join("\n")}`);
  itemContext = await ensureProjectItem({ token: projectContext.token, event, project: projectContext.project, requestedProjectRef: projectContext.requestedProjectRef, dryRun: context.dryRun, itemContext });
  if (plan.operations.length === 0) {
    console.log("[summary] no field updates required");
    markFailedIfPlanHasErrors(plan);
    return;
  }
  await applyHydrationOperations({ token: projectContext.token, project: projectContext.project, itemId: itemContext.itemId, event, dryRun: context.dryRun, operations: plan.operations });
  console.log(`[summary] mode=${context.dryRun ? "dry-run" : "write"}`);
  console.log(`[summary] planned updates=${plan.operations.length}`);
  if (context.dryRun && plan.errors.length > 0) markFailedIfPlanHasErrors(plan);
}

function runSelfTests() {
  require("node:child_process").execFileSync(process.execPath, [require.resolve("./hydrate-project-fields.test.cjs")], { stdio: "inherit" });
}

async function main() {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message.startsWith("[error]") ? message : `[error] ${message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  mapLabelsToFieldHints,
  parseMetadataBlock,
  parseProjectRef,
  parseDryRun,
  parseBooleanToken,
  parseTruthy,
  isEmptyCurrent,
  sameValue,
  planHydration,
  validateRequiredProjectFields,
};
