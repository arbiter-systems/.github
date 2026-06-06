#!/usr/bin/env node

const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const GITHUB_API_URL = 'https://api.github.com';
const USER_AGENT = 'arbiter-batch-project-hydration';
const DEFAULT_PROJECT_REF = 'arbiter-systems/2';
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const METADATA_BLOCK_RE = /<!--\s*arbiter-project\b/i;
const REPO_FULL_NAME_RE = /^([^/]+)\/([^/]+)$/;

const HYDRATION_LABELS = new Set([
  'active-mvp',
  'lane: deferred',
  'blocked',
  'status: blocked',
  'triage',
  'status: triage',
  'priority: high',
  'priority: medium',
  'priority: low',
]);

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function parseBooleanToken(value) {
  if (value == null) return null;
  const raw = String(value);
  const normalized = normalizeName(raw);
  if (normalized === '') return null;
  if (['1', 'true', 'yes'].includes(normalized)) return { recognized: true, value: true, raw };
  if (['0', 'false', 'no'].includes(normalized)) return { recognized: true, value: false, raw };
  return { recognized: false, value: false, raw };
}

function parseTruthy(value) {
  const parsed = parseBooleanToken(value);
  return Boolean(parsed?.recognized && parsed.value);
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parsePositiveInt(value, name, fallback) {
  if (value == null || String(value).trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`[error] ${name} must be a positive integer`);
  }
  return parsed;
}

function parseArgs(argv) {
  const args = {
    repos: [],
    limit: DEFAULT_LIMIT,
    since: '',
    projectRef: DEFAULT_PROJECT_REF,
    write: false,
    continueOnError: false,
    candidateOnly: false,
    selfTest: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--self-test') {
      args.selfTest = true;
      continue;
    }
    if (arg === '--repo') {
      args.repos.push(...parseCsv(argv[i + 1]));
      i += 1;
      continue;
    }
    if (arg === '--limit') {
      args.limit = parsePositiveInt(argv[i + 1], '--limit', DEFAULT_LIMIT);
      i += 1;
      continue;
    }
    if (arg === '--since') {
      args.since = String(argv[i + 1] || '').trim();
      i += 1;
      continue;
    }
    if (arg === '--project') {
      args.projectRef = String(argv[i + 1] || '').trim() || DEFAULT_PROJECT_REF;
      i += 1;
      continue;
    }
    if (arg === '--write') {
      args.write = true;
      continue;
    }
    if (arg === '--continue-on-error') {
      args.continueOnError = true;
      continue;
    }
    if (arg === '--candidates-only') {
      args.candidateOnly = true;
      continue;
    }
    throw new Error(`[error] Unsupported argument: ${arg}`);
  }

  args.repos = [...new Set(args.repos)];
  if (args.limit > MAX_LIMIT) {
    throw new Error(`[error] --limit must be <= ${MAX_LIMIT}`);
  }
  return args;
}

function validateRepoFullName(repo) {
  const match = REPO_FULL_NAME_RE.exec(String(repo || '').trim());
  if (!match) {
    throw new Error(`[error] Repository must be in owner/repo format: ${repo}`);
  }
  return { owner: match[1], repo: match[2], fullName: `${match[1]}/${match[2]}` };
}

function base64Url(input) {
  return Buffer.from(input).toString('base64').replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
}

function createAppJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = { iat: now - 60, exp: now + 9 * 60, iss: String(appId) };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).end().sign(privateKeyPem);
  return `${signingInput}.${base64Url(signature)}`;
}

async function httpJson({ method, url, token }) {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': USER_AGENT,
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(url, { method, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : `HTTP ${response.status}`;
    throw new Error(`[error] GitHub API request failed: ${message}`);
  }
  return payload;
}

async function getInstallationToken(appId, privateKey, org) {
  const jwt = createAppJwt(appId, privateKey);
  const installation = await httpJson({
    method: 'GET',
    url: `${GITHUB_API_URL}/orgs/${org}/installation`,
    token: jwt,
  });
  if (!installation?.id) {
    throw new Error(`[error] Could not find GitHub App installation for org '${org}'`);
  }
  const accessToken = await httpJson({
    method: 'POST',
    url: `${GITHUB_API_URL}/app/installations/${installation.id}/access_tokens`,
    token: jwt,
  });
  if (!accessToken?.token) {
    throw new Error('[error] Failed to create installation access token');
  }
  return accessToken.token;
}

async function createDiscoveryAuth(repos) {
  const appId = process.env.PROJECT_AUTOMATION_APP_ID || '';
  const privateKey = process.env.PROJECT_AUTOMATION_PRIVATE_KEY || '';
  if (!appId) throw new Error('[error] Missing PROJECT_AUTOMATION_APP_ID');
  if (!privateKey) throw new Error('[error] Missing PROJECT_AUTOMATION_PRIVATE_KEY');
  const firstRepo = validateRepoFullName(repos[0]);
  return getInstallationToken(appId, privateKey, firstRepo.owner);
}

function issueHasHydrationSignal(issue) {
  const body = String(issue?.body || '');
  if (METADATA_BLOCK_RE.test(body)) {
    return { matched: true, reason: 'metadata' };
  }
  const labels = Array.isArray(issue?.labels) ? issue.labels : [];
  const matchedLabels = labels
    .map((label) => normalizeName(typeof label === 'string' ? label : label?.name))
    .filter((label) => HYDRATION_LABELS.has(label));
  if (matchedLabels.length > 0) {
    return { matched: true, reason: `labels:${matchedLabels.join(',')}` };
  }
  return { matched: false, reason: 'no-signal' };
}

function toCandidate(repoFullName, issue, reason) {
  return {
    repo: repoFullName,
    issueNumber: Number(issue.number),
    title: String(issue.title || ''),
    reason,
  };
}

async function listRepoCandidates({ token, repoFullName, limit, since }) {
  const { owner, repo, fullName } = validateRepoFullName(repoFullName);
  const candidates = [];
  let page = 1;

  while (candidates.length < limit) {
    const url = new URL(`${GITHUB_API_URL}/repos/${owner}/${repo}/issues`);
    url.searchParams.set('state', 'open');
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('direction', 'desc');
    if (since) url.searchParams.set('since', since);

    const issues = await httpJson({ method: 'GET', url: url.toString(), token });
    if (!Array.isArray(issues) || issues.length === 0) break;

    for (const issue of issues) {
      if (issue.pull_request) continue;
      const signal = issueHasHydrationSignal(issue);
      if (!signal.matched) continue;
      candidates.push(toCandidate(fullName, issue, signal.reason));
      if (candidates.length >= limit) break;
    }
    page += 1;
  }

  return candidates;
}

async function discoverCandidates({ repos, limit, since }) {
  if (repos.length === 0) {
    throw new Error('[error] At least one --repo value is required');
  }
  const token = await createDiscoveryAuth(repos);
  const allCandidates = [];
  for (const repo of repos) {
    const remaining = limit - allCandidates.length;
    if (remaining <= 0) break;
    const repoCandidates = await listRepoCandidates({ token, repoFullName: repo, limit: remaining, since });
    allCandidates.push(...repoCandidates);
  }
  return allCandidates;
}

function formatCandidate(candidate) {
  return `${candidate.repo}#${candidate.issueNumber} reason=${candidate.reason} title=${JSON.stringify(candidate.title)}`;
}

function runHydration(candidate, { projectRef, write }) {
  const scriptPath = path.join(__dirname, 'hydrate-project-fields.cjs');
  const args = [
    scriptPath,
    '--repo',
    candidate.repo,
    '--issue-number',
    String(candidate.issueNumber),
    '--dry-run',
    write ? 'false' : 'true',
    '--project',
    projectRef,
  ];
  return spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
}

function assertWriteAllowed(args) {
  if (!args.write) return;
  if (!parseTruthy(process.env.BATCH_PROJECT_HYDRATION_WRITE_ENABLED)) {
    throw new Error('[error] Write mode requires BATCH_PROJECT_HYDRATION_WRITE_ENABLED=true');
  }
}

async function runBatch(args) {
  assertWriteAllowed(args);
  const candidates = await discoverCandidates(args);
  console.log(`[summary] candidates found=${candidates.length}`);
  for (const candidate of candidates) console.log(`[candidate] ${formatCandidate(candidate)}`);

  if (args.candidateOnly) {
    console.log('[summary] candidates-only mode; hydration not invoked');
    return { candidates, hydrated: 0, failed: 0 };
  }

  let hydrated = 0;
  let failed = 0;
  for (const candidate of candidates) {
    console.log(`[hydrate] ${candidate.repo}#${candidate.issueNumber} mode=${args.write ? 'write' : 'dry-run'}`);
    const result = runHydration(candidate, { projectRef: args.projectRef, write: args.write });
    if (result.status === 0) {
      hydrated += 1;
      continue;
    }
    failed += 1;
    if (!args.continueOnError) {
      throw new Error(`[error] Hydration failed for ${candidate.repo}#${candidate.issueNumber}`);
    }
  }
  console.log(`[summary] mode=${args.write ? 'write' : 'dry-run'}`);
  console.log(`[summary] hydrated=${hydrated}`);
  console.log(`[summary] failed=${failed}`);
  return { candidates, hydrated, failed };
}

function runSelfTests() {
  assertSelfTest(parseArgs(['node', 'script', '--repo', 'arbiter-systems/.github', '--limit', '5']));
  assertSelfTest(parseArgs(['node', 'script', '--repo', 'a/b,c/d', '--write', '--continue-on-error']).write === true);
  assertSelfTest(issueHasHydrationSignal({ body: '<!-- arbiter-project\nstatus: Inbox\n-->', labels: [] }).reason === 'metadata');
  assertSelfTest(issueHasHydrationSignal({ body: '', labels: [{ name: 'priority: high' }] }).matched === true);
  assertSelfTest(issueHasHydrationSignal({ body: '', labels: [{ name: 'enhancement' }] }).matched === false);
  assertSelfTest(formatCandidate({ repo: 'a/b', issueNumber: 1, reason: 'metadata', title: 'T' }).includes('a/b#1'));
  assertThrows(() => parseArgs(['node', 'script', '--limit', '0']), /positive integer/);
  assertThrows(() => parseArgs(['node', 'script', '--limit', String(MAX_LIMIT + 1)]), /must be <=/);
  assertThrows(() => validateRepoFullName('not-a-repo'), /owner\/repo/);
  console.log('[self-test] ok');
}

function assertSelfTest(value) {
  if (!value) throw new Error('[self-test] assertion failed');
}

function assertThrows(fn, pattern) {
  let thrown = null;
  try {
    fn();
  } catch (error) {
    thrown = error;
  }
  if (!thrown || !pattern.test(String(thrown.message))) {
    throw new Error(`[self-test] expected error matching ${pattern}`);
  }
}

async function main() {
  try {
    const args = parseArgs(process.argv);
    if (args.selfTest) {
      runSelfTests();
      return;
    }
    await runBatch(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message.startsWith('[error]') ? message : `[error] ${message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  HYDRATION_LABELS,
  parseArgs,
  parseBooleanToken,
  parseTruthy,
  issueHasHydrationSignal,
  formatCandidate,
  validateRepoFullName,
};
