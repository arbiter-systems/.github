#!/usr/bin/env node

import crypto from 'node:crypto';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const USER_AGENT = 'arbiter-blocked-by-alignment-audit';
const DEFAULT_PROJECT_REF = 'arbiter-systems/2';
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const REPO_FULL_NAME_RE = /^([^/]+)\/([^/]+)$/;
const PROJECT_REF_RE = /^([a-z0-9_.-]+)\/(\d+)$/i;
const MANAGED_BLOCK_RE = /<!--\s*arbiter-blocked-by:start\s*-->([\s\S]*?)<!--\s*arbiter-blocked-by:end\s*-->/i;
const METADATA_BLOCK_RE = /<!--\s*arbiter-project\b([\s\S]*?)-->/i;
const METADATA_BLOCKED_BY_RE = /^blocked_by\s*:\s*(.*)$/im;

function normalizeText(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function normalizeBlockerToken(value) {
  return String(value || '').trim().replace(/^[-*]\s*/, '').trim();
}

function parseProjectRef(value) {
  const input = String(value || '').trim();
  const match = PROJECT_REF_RE.exec(input);
  if (!match) throw new Error('[error] Project reference must be in org/number format');
  return { org: match[1], number: Number(match[2]), ref: `${match[1]}/${match[2]}` };
}

function validateRepoFullName(repo) {
  const input = String(repo || '').trim();
  const match = REPO_FULL_NAME_RE.exec(input);
  if (!match) throw new Error(`[error] Repository must be in owner/repo format: ${repo}`);
  return `${match[1]}/${match[2]}`;
}

function parseCsv(value) {
  return String(value || '').split(',').map((entry) => entry.trim()).filter(Boolean);
}

function parsePositiveInt(value, name, fallback) {
  if (value == null || String(value).trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`[error] ${name} must be a positive integer`);
  if (parsed > MAX_LIMIT) throw new Error(`[error] ${name} must be <= ${MAX_LIMIT}`);
  return parsed;
}

function parseArgs(argv) {
  const args = { projectRef: DEFAULT_PROJECT_REF, targetRepos: [], limit: DEFAULT_LIMIT, selfTest: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self-test') args.selfTest = true;
    else if (arg === '--project') args.projectRef = String(argv[++i] || '').trim() || DEFAULT_PROJECT_REF;
    else if (arg === '--target-repo') args.targetRepos.push(...parseCsv(argv[++i]));
    else if (arg === '--limit') args.limit = parsePositiveInt(argv[++i], '--limit', DEFAULT_LIMIT);
    else throw new Error(`[error] Unsupported argument: ${arg}`);
  }
  args.targetRepos = [...new Set(args.targetRepos.map(validateRepoFullName))];
  return args;
}

function parseManagedBodyBlockers(body) {
  const match = MANAGED_BLOCK_RE.exec(String(body || ''));
  if (!match) return { found: false, blockers: [] };
  const blockers = match[1]
    .split(/\r?\n|,/)
    .map(normalizeBlockerToken)
    .filter(Boolean);
  return { found: true, blockers };
}

function parseMetadataBlockedBy(body) {
  const blockMatch = METADATA_BLOCK_RE.exec(String(body || ''));
  if (!blockMatch) return { found: false, blockers: [] };
  const blockedByMatch = METADATA_BLOCKED_BY_RE.exec(blockMatch[1]);
  if (!blockedByMatch) return { found: false, blockers: [] };
  const blockers = String(blockedByMatch[1] || '')
    .split(/,|\s+/)
    .map(normalizeBlockerToken)
    .filter(Boolean);
  return { found: true, blockers };
}

function parseBodyBlockers(body) {
  const managed = parseManagedBodyBlockers(body);
  if (managed.found) return { source: 'managed-block', ...managed };
  const metadata = parseMetadataBlockedBy(body);
  if (metadata.found) return { source: 'metadata', ...metadata };
  return { found: false, source: 'none', blockers: [] };
}

function normalizeBlockerSet(value) {
  return String(value || '')
    .split(/,|\s+/)
    .map(normalizeBlockerToken)
    .filter(Boolean)
    .sort();
}

function compareBlockers(projectBlockedBy, bodyBlockers) {
  const project = normalizeBlockerSet(projectBlockedBy);
  const body = [...bodyBlockers].map(normalizeBlockerToken).filter(Boolean).sort();
  const projectKey = project.join('\n');
  const bodyKey = body.join('\n');
  if (project.length === 0 && body.length === 0) return 'aligned-empty';
  if (projectKey === bodyKey) return 'aligned';
  if (project.length > 0 && body.length === 0) return 'missing-body-section';
  if (project.length === 0 && body.length > 0) return 'project-empty-body-nonempty';
  return 'mismatch';
}

function base64Url(input) {
  return Buffer.from(input).toString('base64').replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
}

function createAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const encodedHeader = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const encodedPayload = base64Url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: String(appId) }));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).end().sign(privateKeyPem);
  return `${signingInput}.${base64Url(signature)}`;
}

async function httpJson({ method, url, token, body }) {
  const headers = { accept: 'application/vnd.github+json', 'content-type': 'application/json', 'user-agent': USER_AGENT };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(url, { method, headers, body: body == null ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : `HTTP ${response.status}`;
    throw new Error(`[error] GitHub API request failed: ${message}`);
  }
  return payload;
}

async function githubGraphql(token, query, variables) {
  const payload = await httpJson({ method: 'POST', url: GITHUB_GRAPHQL_URL, token, body: { query, variables } });
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const message = payload.errors.map((entry) => entry?.message || 'unknown GraphQL error').join('; ');
    throw new Error(`[error] GitHub GraphQL error: ${message}`);
  }
  return payload?.data;
}

async function getInstallationToken(org) {
  const appId = String(process.env.PROJECT_AUTOMATION_APP_ID || '').trim();
  const privateKey = String(process.env.PROJECT_AUTOMATION_PRIVATE_KEY || '').trim().replaceAll(String.raw`\n`, '\n');
  if (!appId) throw new Error('[error] Missing PROJECT_AUTOMATION_APP_ID');
  if (!privateKey) throw new Error('[error] Missing PROJECT_AUTOMATION_PRIVATE_KEY');
  const jwt = createAppJwt(appId, privateKey);
  const installation = await httpJson({ method: 'GET', url: `${GITHUB_API_URL}/orgs/${org}/installation`, token: jwt });
  if (!installation?.id) throw new Error(`[error] Could not find GitHub App installation for org '${org}'`);
  const accessToken = await httpJson({ method: 'POST', url: `${GITHUB_API_URL}/app/installations/${installation.id}/access_tokens`, token: jwt, body: {} });
  if (!accessToken?.token) throw new Error('[error] Failed to create installation access token');
  return accessToken.token;
}

const PROJECT_AUDIT_QUERY = `
  query ProjectBlockedByAudit($org: String!, $number: Int!, $after: String) {
    organization(login: $org) {
      projectV2(number: $number) {
        id
        items(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            content {
              __typename
              ... on Issue { number title body url repository { nameWithOwner } }
            }
            fieldValues(first: 50) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } }
              }
            }
          }
        }
      }
    }
  }
`;

function getBlockedByField(fieldValues) {
  for (const node of fieldValues?.nodes || []) {
    if (node?.__typename !== 'ProjectV2ItemFieldTextValue') continue;
    if (String(node?.field?.name || '').trim().toLowerCase() === 'blocked by') return normalizeText(node.text);
  }
  return '';
}

function shouldIncludeIssue(issue, targetRepos) {
  if (!issue || issue.__typename !== 'Issue') return false;
  if (targetRepos.length === 0) return true;
  return targetRepos.includes(issue.repository?.nameWithOwner || '');
}

function summarizeFindings(findings) {
  const summary = { scanned: findings.length, aligned: 0, alignedEmpty: 0, mismatch: 0, missingBodySection: 0, projectEmptyBodyNonempty: 0, warnings: 0 };
  for (const finding of findings) {
    if (finding.status === 'aligned') summary.aligned += 1;
    else if (finding.status === 'aligned-empty') summary.alignedEmpty += 1;
    else if (finding.status === 'mismatch') summary.mismatch += 1;
    else if (finding.status === 'missing-body-section') summary.missingBodySection += 1;
    else if (finding.status === 'project-empty-body-nonempty') summary.projectEmptyBodyNonempty += 1;
  }
  summary.warnings = summary.mismatch + summary.missingBodySection + summary.projectEmptyBodyNonempty;
  return summary;
}

function printSummary(summary) {
  console.log(`[summary] project issue items scanned=${summary.scanned}`);
  console.log(`[summary] aligned=${summary.aligned}`);
  console.log(`[summary] aligned_empty=${summary.alignedEmpty}`);
  console.log(`[summary] mismatch=${summary.mismatch}`);
  console.log(`[summary] missing_body_section=${summary.missingBodySection}`);
  console.log(`[summary] project_empty_body_nonempty=${summary.projectEmptyBodyNonempty}`);
  console.log(`[summary] warning_count=${summary.warnings}`);
}

function printFindings(findings) {
  for (const finding of findings) {
    if (finding.status === 'aligned' || finding.status === 'aligned-empty') continue;
    console.log(`[finding] ${finding.issueKey} status=${finding.status} body_source=${finding.bodySource}`);
  }
}

async function auditBlockedByAlignment(args) {
  const project = parseProjectRef(args.projectRef);
  const token = await getInstallationToken(project.org);
  const findings = [];
  let after = null;

  while (findings.length < args.limit) {
    const data = await githubGraphql(token, PROJECT_AUDIT_QUERY, { org: project.org, number: project.number, after });
    const projectV2 = data?.organization?.projectV2;
    if (!projectV2?.id) throw new Error(`[error] Could not find project ${project.ref}`);
    const items = projectV2.items?.nodes || [];
    for (const item of items) {
      const issue = item?.content;
      if (!shouldIncludeIssue(issue, args.targetRepos)) continue;
      const projectBlockedBy = getBlockedByField(item.fieldValues);
      const bodyBlockers = parseBodyBlockers(issue.body);
      const status = compareBlockers(projectBlockedBy, bodyBlockers.blockers);
      findings.push({ issueKey: `${issue.repository.nameWithOwner}#${issue.number}`, status, bodySource: bodyBlockers.source });
      if (findings.length >= args.limit) break;
    }
    if (!projectV2.items?.pageInfo?.hasNextPage || findings.length >= args.limit) break;
    after = projectV2.items.pageInfo.endCursor;
  }

  const summary = summarizeFindings(findings);
  printSummary(summary);
  printFindings(findings);
  return { findings, summary };
}

function runSelfTests() {
  let parsed = parseBodyBlockers('before\n<!-- arbiter-blocked-by:start -->\n- arbiter-systems/.github#105\n- arbiter-systems/company#15\n<!-- arbiter-blocked-by:end -->\nafter');
  assert(parsed.found === true, 'managed block should be found');
  assert(parsed.source === 'managed-block', 'managed block should win');
  assert(parsed.blockers.length === 2, 'managed block should parse two blockers');

  parsed = parseBodyBlockers('<!-- arbiter-project\nblocked_by: arbiter-systems/.github#105, arbiter-systems/company#15\n-->');
  assert(parsed.found === true, 'metadata blocked_by should be found');
  assert(parsed.source === 'metadata', 'metadata source should be used without managed block');
  assert(parsed.blockers.length === 2, 'metadata should parse two blockers');

  assert(compareBlockers('arbiter-systems/.github#105', ['arbiter-systems/.github#105']) === 'aligned', 'same blockers should align');
  assert(compareBlockers('arbiter-systems/.github#105', []) === 'missing-body-section', 'project-only blocker should warn');
  assert(compareBlockers('', ['arbiter-systems/.github#105']) === 'project-empty-body-nonempty', 'body-only blocker should warn');
  assert(compareBlockers('a#1', ['a#2']) === 'mismatch', 'different blockers should mismatch');
  assert(compareBlockers('', []) === 'aligned-empty', 'both empty should align empty');

  const args = parseArgs(['node', 'script', '--project', 'arbiter-systems/2', '--target-repo', 'arbiter-systems/.github,arbiter-systems/company', '--limit', '5']);
  assert(args.targetRepos.length === 2, 'target repo parsing should support csv');
  assert(args.limit === 5, 'limit should parse');
  assertThrows(() => parseArgs(['node', 'script', '--target-repo', 'not-a-repo']), /owner\/repo/);
  assertThrows(() => parseArgs(['node', 'script', '--limit', '0']), /positive integer/);
  assertThrows(() => parseProjectRef('arbiter-systems/project-two'), /org\/number/);

  const summary = summarizeFindings([
    { status: 'aligned' },
    { status: 'aligned-empty' },
    { status: 'mismatch' },
    { status: 'missing-body-section' },
    { status: 'project-empty-body-nonempty' },
  ]);
  assert(summary.scanned === 5, 'summary scanned count');
  assert(summary.warnings === 3, 'summary warning count');

  console.log('[self-test] ok');
}

function assert(value, message) {
  if (!value) throw new Error(`[self-test] ${message}`);
}

function assertThrows(fn, pattern) {
  let thrown = null;
  try { fn(); } catch (error) { thrown = error; }
  if (!thrown || !pattern.test(String(thrown.message))) throw new Error(`[self-test] expected error matching ${pattern}`);
}

async function main() {
  try {
    const args = parseArgs(process.argv);
    if (args.selfTest) {
      runSelfTests();
      return;
    }
    await auditBlockedByAlignment(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message.startsWith('[error]') ? message : `[error] ${message}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export {
  parseArgs,
  parseProjectRef,
  parseBodyBlockers,
  parseManagedBodyBlockers,
  parseMetadataBlockedBy,
  compareBlockers,
  summarizeFindings,
  validateRepoFullName,
};
