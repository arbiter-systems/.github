# Git Conventions

## Purpose

This document defines cross-repo branch naming, commit message, PR title, issue-linking, and scoped implementation conventions for Arbiter repositories. It supplements [`AGENTS.md`](../AGENTS.md) and [`docs/operations/branch-protection-and-merge-policy.md`](operations/branch-protection-and-merge-policy.md); merge method and branch protection policy remain in the branch-protection doc.

## Branch Naming

Use `<issue-number>-<short-description>` or `<issue-number>-<type>/<short-description>`.

- Descriptions are lowercase and hyphen-separated, with no spaces or special characters.
- When used, `type` should match a valid commit prefix such as `feat`, `fix`, `docs`, `test`, or `chore`.
- Use one issue per branch; avoid shared or long-lived feature branches.
- Branch names must include the issue number.

| Branch name | Type | Notes |
|---|---|---|
| `42-feat/provider-routing-cache` | Feature | Adds issue-scoped provider routing cache work. |
| `84-fix/sse-final-event-status` | Fix | Corrects SSE final event status handling. |
| `123-docs/git-conventions` | Docs | Adds shared Git workflow guidance. |
| `151-test/provider-readiness-contracts` | Test | Adds provider readiness contract coverage. |
| `220-chore/repo-metadata-cleanup` | Chore | Updates repository metadata within one issue. |

## Commit Messages

Use a conventional prefix, optional scope, and short imperative description.

Example: `feat(execution): add provider fallback timeout`

- Keep commits focused on one issue.
- Do not bundle unrelated cleanup or opportunistic refactors.

Valid prefixes:

- `feat`: user-facing or product behavior.
- `fix`: defect correction.
- `docs`: documentation-only change.
- `test`: test-only change or test coverage.
- `chore`: repo maintenance with no behavior change.
- `refactor`: internal restructuring with no behavior change.
- `style`: formatting-only change.
- `ci`: workflow or automation configuration.

## PR Titles

Use the same conventional prefix and optional scope pattern as commit messages. The title should match or summarize the issue title. Avoid vague titles like `updates`, `fixes`, or `cleanup`.

| Branch name | PR title |
|---|---|
| `42-feat/provider-routing-cache` | `feat(execution): add provider routing cache` |
| `84-fix/sse-final-event-status` | `fix(streaming): correct SSE final event status` |
| `123-docs/git-conventions` | `docs(repo): add Git conventions` |
| `151-test/provider-readiness-contracts` | `test(contracts): cover provider readiness contracts` |
| `220-chore/repo-metadata-cleanup` | `chore(repo): clean up repository metadata` |
| `228-refactor/provider-routing-boundary` | `refactor(routing): simplify provider routing boundary` |
| `229-style/markdown-table-formatting` | `style(docs): normalize markdown table formatting` |
| `230-ci/markdown-link-check` | `ci(docs): add markdown link check` |

## Linking PRs to Issues

- Use an auto-closing reference such as `Closes #42` in the PR body.
- The PR body must include the issue number; branch name alone is not enough.
- Do not link unrelated issues in the same PR.
- Mention dependencies as related or blocked-by, not closing.

## Scoped Implementation Rules

- Use one issue per branch, session, and PR.
- Do not include unrelated commits, cleanup, or refactors unless explicitly scoped.
- Capture follow-up work as new issue candidates.
- Do not mix docs, runtime code, tests, CI, or repo settings unless explicitly scoped.
- AI sessions must not create branches, stage, commit, push, open PRs, or merge PRs unless explicitly requested.
