#!/usr/bin/env node

import assert from "node:assert/strict";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

function parseTruthy(value) {
  if (value == null) {
    return false;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

function parseDryRun(value) {
  if (value == null) {
    return true;
  }
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "" || normalized === "1" || normalized === "true") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return true;
}

function sanitizeRepoSlug(repo, fallbackOrg) {
  if (!repo) {
    return null;
  }
  const trimmed = repo.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/+$/, "");
  if (!trimmed) {
    return null;
  }
  if (trimmed.includes("/")) {
    return trimmed.toLowerCase();
  }
  if (!fallbackOrg) {
    return null;
  }
  return `${fallbackOrg}/${trimmed}`.toLowerCase();
}

function parseRequiredEnv(env) {
  const token = env.GH_TOKEN ? String(env.GH_TOKEN).trim() : "";
  if (!token) {
    throw new Error("[error] GH_TOKEN is required");
  }

  const org = env.GH_ORG ? String(env.GH_ORG).trim() : "";
  if (!org) {
    throw new Error("[error] GH_ORG is required");
  }

  const projectRaw = env.GH_PROJECT_NUM ? String(env.GH_PROJECT_NUM).trim() : "";
  if (!/^\d+$/.test(projectRaw)) {
    throw new Error("[error] GH_PROJECT_NUM must be a positive integer");
  }
  const projectNumber = Number(projectRaw);
  if (!Number.isInteger(projectNumber) || projectNumber <= 0) {
    throw new Error("[error] GH_PROJECT_NUM must be a positive integer");
  }

  const dryRun = parseDryRun(env.DRY_RUN);
  const updateStatusBlocked = parseTruthy(env.UPDATE_STATUS_BLOCKED);
  const targetRepo = sanitizeRepoSlug(env.TARGET_REPO || "", org.toLowerCase());
  const defaultRepo = sanitizeRepoSlug(env.DEFAULT_REPO || "", org.toLowerCase());

  return {
    token,
    org,
    projectNumber,
    dryRun,
    updateStatusBlocked,
    targetRepo,
    defaultRepo,
  };
}

function isBlockedHeaderLine(line) {
  return (
    /^##\s+Blocked by\s*:?\s*$/i.test(line) ||
    /^###\s+Blocked by\s*:?\s*$/i.test(line) ||
    /^\*\*Blocked by:\*\*\s*$/i.test(line) ||
    /^Blocked by:\s*$/i.test(line)
  );
}

function isSectionBoundaryLine(line) {
  if (/^\s{0,3}#{1,6}\s+\S/.test(line)) {
    return true;
  }
  if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
    return true;
  }
  return false;
}

function buildBodyLineStates(body) {
  const lines = String(body || "").split(/\r?\n/);
  const states = [];
  let inFence = false;
  let fenceChar = "";
  let fenceLength = 0;
  let inHtmlComment = false;

  for (const line of lines) {
    let excluded = false;
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

    if (inFence) {
      excluded = true;
      if (fenceMatch && fenceMatch[1][0] === fenceChar && fenceMatch[1].length >= fenceLength) {
        inFence = false;
        fenceChar = "";
        fenceLength = 0;
      }
      states.push({ line, excluded });
      continue;
    }

    if (inHtmlComment) {
      excluded = true;
      if (line.includes("-->")) {
        inHtmlComment = false;
      }
      states.push({ line, excluded });
      continue;
    }

    if (/^\s{0,3}>/.test(line)) {
      excluded = true;
    }

    const commentStart = line.indexOf("<!--");
    if (commentStart >= 0) {
      excluded = true;
      const commentEnd = line.indexOf("-->", commentStart + 4);
      if (commentEnd < 0) {
        inHtmlComment = true;
      }
    }

    if (fenceMatch) {
      excluded = true;
      inFence = true;
      fenceChar = fenceMatch[1][0];
      fenceLength = fenceMatch[1].length;
    }

    states.push({ line, excluded });
  }

  return states;
}

function findBlockedBySection(body) {
  const lineStates = buildBodyLineStates(body);
  let headerIndex = -1;

  for (let i = 0; i < lineStates.length; i += 1) {
    if (!lineStates[i].excluded && isBlockedHeaderLine(lineStates[i].line)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex < 0) {
    return { found: false, sectionText: "" };
  }

  const sectionLines = [];
  for (let i = headerIndex + 1; i < lineStates.length; i += 1) {
    const { line, excluded } = lineStates[i];
    if (excluded) {
      continue;
    }
    if (isSectionBoundaryLine(line)) {
      break;
    }
    sectionLines.push(line);
  }

  return { found: true, sectionText: sectionLines.join("\n") };
}

function overlaps(range, ranges) {
  return ranges.some((existing) => range.start < existing.end && existing.start < range.end);
}

function normalizeExtractedRefs(sectionText, currentRepo, defaultRepo) {
  const text = String(sectionText || "");
  const refs = [];
  const unresolved = [];
  const consumed = [];

  function addRef(ref, start, end) {
    const normalized = ref.toLowerCase();
    if (!refs.includes(normalized)) {
      refs.push(normalized);
    }
    consumed.push({ start, end });
  }

  const urlRegex = /https:\/\/github\.com\/([a-z0-9_.-]+)\/([a-z0-9_.-]+)\/issues\/(\d+)/gi;
  for (const match of text.matchAll(urlRegex)) {
    const [full, owner, repo, num] = match;
    const start = match.index ?? 0;
    const end = start + full.length;
    if (overlaps({ start, end }, consumed)) {
      continue;
    }
    addRef(`${owner}/${repo}#${num}`, start, end);
  }

  const repoRefRegex = /(^|[^a-z0-9_.-])([a-z0-9_.-]+\/[a-z0-9_.-]+)#(\d+)\b/gi;
  for (const match of text.matchAll(repoRefRegex)) {
    const prefix = match[1] ?? "";
    const slug = match[2];
    const num = match[3];
    const start = (match.index ?? 0) + prefix.length;
    const full = `${slug}#${num}`;
    const end = start + full.length;
    if (overlaps({ start, end }, consumed)) {
      continue;
    }
    addRef(`${slug}#${num}`, start, end);
  }

  const qualifierRepo = (defaultRepo || currentRepo || "").toLowerCase();
  const bareRefRegex = /(^|[^a-z0-9_.-/])#(\d+)\b/gi;
  for (const match of text.matchAll(bareRefRegex)) {
    const prefix = match[1] ?? "";
    const num = match[2];
    const start = (match.index ?? 0) + prefix.length;
    const full = `#${num}`;
    const end = start + full.length;
    if (overlaps({ start, end }, consumed)) {
      continue;
    }
    if (qualifierRepo) {
      addRef(`${qualifierRepo}#${num}`, start, end);
    } else {
      unresolved.push(full);
      consumed.push({ start, end });
    }
  }

  const unresolvedTokenRegex =
    /https:\/\/github\.com\/[^\s),;]+|[a-z0-9_.-]+\/[a-z0-9_.-]+#[^\s),;]+|#[^\s),;]+/gi;
  for (const match of text.matchAll(unresolvedTokenRegex)) {
    const token = match[0];
    const start = match.index ?? 0;
    const end = start + token.length;
    if (overlaps({ start, end }, consumed)) {
      continue;
    }
    if (/^https:\/\/github\.com\//i.test(token) || token.includes("#")) {
      unresolved.push(token);
      consumed.push({ start, end });
    }
  }

  return { refs, unresolved };
}

function parseBlockedBy(body, currentRepo, defaultRepo) {
  const section = findBlockedBySection(body);
  if (!section.found) {
    return { found: false, refs: [], unresolved: [] };
  }
  const extracted = normalizeExtractedRefs(section.sectionText, currentRepo, defaultRepo);
  return { found: true, refs: extracted.refs, unresolved: extracted.unresolved };
}

async function githubGraphql(token, query, variables) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "arbiter-sync-blocked-by-script",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : `HTTP ${response.status}`;
    throw new Error(`[error] GitHub GraphQL request failed: ${message}`);
  }
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const message = payload.errors
      .map((err) => (typeof err?.message === "string" ? err.message : "unknown GraphQL error"))
      .join("; ");
    throw new Error(`[error] GitHub GraphQL error: ${message}`);
  }
  return payload?.data;
}

function readCurrentFieldValues(fieldValueNodes) {
  let blockedBy = "";
  let status = "";

  for (const node of fieldValueNodes || []) {
    if (node?.__typename === "ProjectV2ItemFieldTextValue" && node?.field?.name === "Blocked By") {
      blockedBy = node.text || "";
    }
    if (node?.__typename === "ProjectV2ItemFieldSingleSelectValue" && node?.field?.name === "Status") {
      status = node.name || "";
    }
  }

  return { blockedBy, status };
}

function formatBlockedByValue(refs, currentValue) {
  const delimiter = currentValue.includes("\n") ? "\n" : ", ";
  return refs.join(delimiter);
}

function shouldSetBlockedStatus(currentStatus) {
  const skip = new Set(["done", "deferred", "do not implement yet", "blocked"]);
  return !skip.has(String(currentStatus || "").trim().toLowerCase());
}

function isUnsupportedClearMutationError(error) {
  const message = String(error instanceof Error ? error.message : error || "").toLowerCase();
  if (!message.includes("clearprojectv2itemfieldvalue")) {
    return false;
  }
  return (
    message.includes("cannot query field") ||
    message.includes("is not defined by type") ||
    message.includes("unknown mutation") ||
    message.includes("schema does not support") ||
    message.includes("unknown argument") ||
    message.includes("validation")
  );
}

function runSelfTests() {
  const repo = "arbiter-systems/control-plane-api";

  let result = parseBlockedBy("## Blocked by\n- #12", repo, null);
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, ["arbiter-systems/control-plane-api#12"]);

  result = parseBlockedBy("### Blocked by\n- arbiter-systems/arbiter-console#44", repo, null);
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, ["arbiter-systems/arbiter-console#44"]);

  result = parseBlockedBy("**Blocked by:**\nhttps://github.com/arbiter-systems/arbiter-site/issues/18", repo, null);
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, ["arbiter-systems/arbiter-site#18"]);

  result = parseBlockedBy("Blocked by:\n- #9", repo, null);
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, ["arbiter-systems/control-plane-api#9"]);

  result = parseBlockedBy(" Blocked by:\n- #9", repo, null);
  assert.equal(result.found, false);

  result = parseBlockedBy("Blocked by:\n- #7", repo, "arbiter-systems/.github");
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, ["arbiter-systems/.github#7"]);

  result = parseBlockedBy("This was blocked by rate limits yesterday.", repo, null);
  assert.equal(result.found, false);
  assert.deepEqual(result.refs, []);

  result = parseBlockedBy("## Blocked by\nnone\n---\n## Notes\nextra", repo, null);
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, []);

  result = parseBlockedBy(
    "## Blocked by\n- https://github.com/arbiter-systems/control-plane-api/issues/33\n- arbiter-systems/control-plane-api#33\n- #33",
    repo,
    null,
  );
  assert.deepEqual(result.refs, ["arbiter-systems/control-plane-api#33"]);

  result = parseBlockedBy("## Blocked by\n- arbiter-systems/control-plane-api#abc\n- #abc", repo, null);
  assert.equal(result.found, true);
  assert.equal(result.unresolved.length >= 1, true);

  result = parseBlockedBy("```md\n## Blocked by\n- #12\n```\n## Notes\nnone", repo, null);
  assert.equal(result.found, false);

  result = parseBlockedBy("<!--\n## Blocked by\n- #12\n-->\n## Notes\nnone", repo, null);
  assert.equal(result.found, false);

  result = parseBlockedBy("> ## Blocked by\n> - #12\n## Notes\nnone", repo, null);
  assert.equal(result.found, false);

  result = parseBlockedBy("## Blocked by\n- #22\n---\n## Next\n- #44", repo, null);
  assert.equal(result.found, true);
  assert.deepEqual(result.refs, ["arbiter-systems/control-plane-api#22"]);

  assert.equal(parseDryRun(undefined), true);
  assert.equal(parseDryRun(""), true);
  assert.equal(parseDryRun("true"), true);
  assert.equal(parseDryRun("1"), true);
  assert.equal(parseDryRun("false"), false);
  assert.equal(parseDryRun("0"), false);

  assert.equal(parseTruthy("true"), true);
  assert.equal(parseTruthy("1"), true);
  assert.equal(parseTruthy("false"), false);
  assert.equal(parseTruthy(undefined), false);

  assert.equal(sanitizeRepoSlug("control-plane-api", "arbiter-systems"), "arbiter-systems/control-plane-api");
  assert.equal(
    sanitizeRepoSlug("arbiter-systems/control-plane-api", "arbiter-systems"),
    "arbiter-systems/control-plane-api",
  );
  assert.equal(
    sanitizeRepoSlug("https://github.com/arbiter-systems/control-plane-api", "arbiter-systems"),
    "arbiter-systems/control-plane-api",
  );
  assert.equal(sanitizeRepoSlug("", "arbiter-systems"), null);

  assert.throws(
    () => parseRequiredEnv({ GH_TOKEN: "x", GH_ORG: "arbiter-systems", GH_PROJECT_NUM: "not-a-number" }),
    /GH_PROJECT_NUM must be a positive integer/,
  );
  assert.throws(
    () => parseRequiredEnv({ GH_TOKEN: "x", GH_ORG: "arbiter-systems" }),
    /GH_PROJECT_NUM must be a positive integer/,
  );

  assert.equal(
    isUnsupportedClearMutationError(
      new Error("[error] GitHub GraphQL error: Cannot query field 'clearProjectV2ItemFieldValue' on type 'Mutation'."),
    ),
    true,
  );
  assert.equal(isUnsupportedClearMutationError(new Error("[error] GitHub GraphQL request failed: Bad credentials")), false);

  console.log("[self-test] ok");
}

async function main() {
  if (process.argv.includes("--self-test")) {
    runSelfTests();
    return;
  }

  const config = parseRequiredEnv(process.env);

  const projectMetaQuery = `
    query ProjectMeta($org: String!, $number: Int!) {
      organization(login: $org) {
        projectV2(number: $number) {
          id
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
              ... on ProjectV2IterationField {
                id
                name
              }
            }
          }
        }
      }
    }
  `;

  const meta = await githubGraphql(config.token, projectMetaQuery, {
    org: config.org,
    number: config.projectNumber,
  });

  const project = meta?.organization?.projectV2;
  if (!project?.id) {
    throw new Error("[error] Project not found for GH_ORG and GH_PROJECT_NUM");
  }

  const fields = project.fields?.nodes || [];
  const blockedByField = fields.find((field) => field?.name === "Blocked By");
  if (!blockedByField?.id) {
    throw new Error("[error] Required Project field 'Blocked By' was not found");
  }

  let statusField = null;
  const statusOptionByName = new Map();
  if (config.updateStatusBlocked) {
    statusField = fields.find((field) => field?.name === "Status" && field?.__typename === "ProjectV2SingleSelectField");
    if (!statusField?.id) {
      throw new Error("[error] UPDATE_STATUS_BLOCKED is enabled, but Status field was not found");
    }
    for (const option of statusField.options || []) {
      statusOptionByName.set(String(option.name || "").toLowerCase(), option.id);
    }
    if (!statusOptionByName.get("blocked")) {
      throw new Error("[error] UPDATE_STATUS_BLOCKED is enabled, but Status option 'Blocked' was not found");
    }
  }

  const itemsQuery = `
    query ProjectItems($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  number
                  body
                  repository {
                    nameWithOwner
                  }
                }
              }
              fieldValues(first: 50) {
                # Note: this page size currently covers this project's field count.
                # If project field count grows beyond this page size, add fieldValues pagination.
                nodes {
                  __typename
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field {
                      ... on ProjectV2FieldCommon {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
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

  const issues = [];
  let cursor = null;
  do {
    const data = await githubGraphql(config.token, itemsQuery, { projectId: project.id, after: cursor });
    const connection = data?.node?.items;
    const nodes = connection?.nodes || [];

    for (const item of nodes) {
      if (item?.content?.__typename !== "Issue") {
        continue;
      }
      const repo = String(item.content.repository?.nameWithOwner || "").toLowerCase();
      if (!repo) {
        continue;
      }
      if (config.targetRepo && repo !== config.targetRepo) {
        continue;
      }
      issues.push({
        itemId: item.id,
        number: item.content.number,
        repo,
        body: item.content.body || "",
        fieldValues: item.fieldValues?.nodes || [],
      });
    }

    cursor = connection?.pageInfo?.hasNextPage ? connection.pageInfo.endCursor : null;
  } while (cursor);

  const mutationBlockedBy = `
    mutation SetBlockedBy($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
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

  const mutationStatus = `
    mutation SetStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
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

  const mutationClearField = `
    mutation ClearField($projectId: ID!, $itemId: ID!, $fieldId: ID!) {
      clearProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  let totalIssueItems = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let warningCount = 0;

  // Project scale is currently small, so writes are one mutation per updated issue with no backoff.
  for (const issue of issues) {
    totalIssueItems += 1;
    const issueKey = `${issue.repo}#${issue.number}`;
    const current = readCurrentFieldValues(issue.fieldValues);
    const parsed = parseBlockedBy(issue.body, issue.repo, config.defaultRepo);
    let anyChange = false;

    if (!parsed.found) {
      skippedCount += 1;
      continue;
    }

    for (const unresolved of parsed.unresolved) {
      warningCount += 1;
      console.warn(`[warn] ${issueKey} unresolved blocker token: ${unresolved}`);
    }

    const shouldClearBlockedBy = parsed.refs.length === 0;
    const nextBlockedBy = shouldClearBlockedBy ? "" : formatBlockedByValue(parsed.refs, current.blockedBy);
    const blockedByChanged = nextBlockedBy !== current.blockedBy.trim().toLowerCase();
    let statusChanged = false;

    if (config.dryRun) {
      if (blockedByChanged) {
        console.log(`[dry-run] ${issueKey} Blocked By: "${current.blockedBy}" -> "${nextBlockedBy}"`);
        anyChange = true;
      }
    } else if (blockedByChanged) {
      if (shouldClearBlockedBy) {
        try {
          await githubGraphql(config.token, mutationClearField, {
            projectId: project.id,
            itemId: issue.itemId,
            fieldId: blockedByField.id,
          });
          console.log(`[write] ${issueKey} Blocked By cleared`);
          anyChange = true;
        } catch (clearError) {
          if (!isUnsupportedClearMutationError(clearError)) {
            throw clearError;
          }
          warningCount += 1;
          console.warn(`[warn] ${issueKey} clear mutation unsupported; falling back to empty text value`);
          await githubGraphql(config.token, mutationBlockedBy, {
            projectId: project.id,
            itemId: issue.itemId,
            fieldId: blockedByField.id,
            value: "",
          });
          console.log(`[write] ${issueKey} Blocked By set to empty text`);
          anyChange = true;
        }
      } else {
        await githubGraphql(config.token, mutationBlockedBy, {
          projectId: project.id,
          itemId: issue.itemId,
          fieldId: blockedByField.id,
          value: nextBlockedBy,
        });
        console.log(`[write] ${issueKey} Blocked By updated`);
        anyChange = true;
      }
    }

    if (
      config.updateStatusBlocked &&
      parsed.refs.length > 0 &&
      shouldSetBlockedStatus(current.status) &&
      statusField?.id
    ) {
      const blockedOptionId = statusOptionByName.get("blocked");
      if (config.dryRun) {
        console.log(`[dry-run] ${issueKey} Status: "${current.status}" -> "Blocked"`);
        statusChanged = true;
      } else {
        await githubGraphql(config.token, mutationStatus, {
          projectId: project.id,
          itemId: issue.itemId,
          fieldId: statusField.id,
          optionId: blockedOptionId,
        });
        console.log(`[write] ${issueKey} Status set to Blocked`);
        statusChanged = true;
      }
    }

    if (statusChanged) {
      anyChange = true;
    }

    if (anyChange) {
      updatedCount += 1;
    } else {
      skippedCount += 1;
    }
  }

  console.log(`[summary] mode=${config.dryRun ? "dry-run" : "write"}`);
  console.log(`[summary] total issue items=${totalIssueItems}`);
  console.log(`[summary] updated count=${updatedCount}`);
  console.log(`[summary] skipped count=${skippedCount}`);
  console.log(`[summary] warning count=${warningCount}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message.startsWith("[error]") ? message : `[error] ${message}`);
  process.exit(1);
});

export {
  buildBodyLineStates,
  findBlockedBySection,
  normalizeExtractedRefs,
  parseBlockedBy,
  parseDryRun,
  parseRequiredEnv,
  parseTruthy,
  sanitizeRepoSlug,
  isUnsupportedClearMutationError,
};
