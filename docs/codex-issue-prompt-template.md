# Codex Issue Implementation Prompt Template

Use this template when starting a Codex implementation session scoped to a single issue.
Fill in each field; remove any section that does not apply.

Repo-local `AGENTS.md` governs local implementation boundaries. Shared prompt templates supplement repo-local rules and do not expand agent authority.

---

## Prompt

```
Repo: arbiter-systems/<repo-name>
Issue: #<number> - <issue title>
Branch: <issue-number>-<type>/<short-slug> or <issue-number>-<short-slug>  (already checked out; work here only)

Goal
<One to three sentences describing what the issue asks for.>

Files to inspect
- <path/to/file> - <why it is relevant>
- <path/to/file> - <why it is relevant>

Required changes
- <Specific, bounded change #1>
- <Specific, bounded change #2>

Out of scope
- <Thing that is explicitly not part of this issue>
- <Broader cleanup, refactor, or feature that should stay deferred>

Validation
Run these commands and confirm they pass before reporting completion:
  <command 1>
  <command 2>

Expected output
<Brief description of what a passing result looks like - file created, test green, etc.>

Constraints
- Do not create branches, commits, pushes, pull requests, or issues unless I explicitly ask.
- Do not include secrets, credentials, API keys, private links, or internal data.
- Preserve existing public API contracts and SSE wire formats unless this issue requires a change.
- Inspect the smallest relevant file set first; do not perform whole-repo audits unless explicitly requested.
- Do not paste or summarize entire files unless requested.
- If you discover work that belongs in a follow-up issue, describe it in your completion report instead of expanding scope.
- Keep changes limited to files listed above unless a dependency makes another file unavoidable; explain any such addition.
- End implementation-style completion reports with `Guardrails: <pass | blocked — reason>`.
```

---

## Field reference

| Field | Guidance |
|---|---|
| **Repo** | Full org/repo slug, e.g. `arbiter-systems/control-plane` |
| **Issue** | Number and title from GitHub |
| **Branch** | Follow the pattern `<number>-<type>/<short-slug>` or `<number>-<short-slug>`; branch must already exist |
| **Goal** | Restate acceptance criteria in plain language; do not copy internal roadmap language |
| **Files to inspect** | Limit to files Codex needs to read; omit unrelated files to reduce token usage. Use the smallest relevant file set first and expand only when needed. |
| **Required changes** | One bullet per discrete change; keep each concrete and verifiable |
| **Out of scope** | Explicitly list anything Codex might plausibly attempt but should not |
| **Validation** | Use commands documented in the repo's README or AGENTS.md |
| **Expected output** | Describe a passing result so Codex can self-check before reporting |

## Usage notes

- One prompt per issue. If an issue is too large, split it before starting a session.
- Omit the **Files to inspect** section only if the change is trivial and the scope is obvious.
- Keep **Files to inspect** narrow and issue-scoped; do not use prompt templates to request broad repo audits unless the issue explicitly requires one.
- The **Constraints** block is non-negotiable; do not remove it.
- Follow-up issue creation requires an explicit user request. Otherwise, list follow-up issue candidates in the completion report.
- After Codex reports completion, verify with `git diff` and `git status` before opening a PR.
