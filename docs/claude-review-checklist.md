# Claude Review Checklist

## Purpose

Use this checklist for Claude PR and diff reviews across Arbiter repositories.

Claude reviews should enforce issue scope, repo guardrails, validation quality, privacy and security boundaries, and accurate documentation claims.

This checklist supplements, but does not replace, `PULL_REQUEST_TEMPLATE.md` and repo-local `AGENTS.md`.

A review-only task does not authorize Claude to create branches, commits, pushes, or pull requests.

## Before You Start

- [ ] Issue link or issue number.
- [ ] PR title and branch name.
- [ ] Changed files and diff.
- [ ] Validation output.
- [ ] Relevant repo-local guardrails from `AGENTS.md`.

## Scope and Issue Linkage

- [ ] Issue number is present.
- [ ] PR maps to one issue.
- [ ] Non-goals are respected.
- [ ] No hidden refactors, broad cleanup, or unrelated files are included.
- [ ] Follow-up work is listed instead of silently added.

## Branch and PR Hygiene

- [ ] Branch name includes the issue number.
- [ ] PR title matches the issue intent.
- [ ] One issue is covered per PR.
- [ ] No unrelated commits or generated-file churn are included.

## Public API and Contract Safety

- [ ] Public API behavior is unchanged unless explicitly scoped.
- [ ] SSE or wire-format changes are intentional, documented, and tested.
- [ ] Integration contract changes are reflected in docs where needed.
- [ ] Breaking changes are clearly called out.

## Execution, Security, and Privacy Boundaries

- [ ] No raw prompts, raw responses, provider keys, secrets, credentials, private links, customer data, or sensitive payloads are introduced.
- [ ] Metadata-first prompt privacy posture is preserved.
- [ ] Logs, traces, receipts, policy reasons, docs, and examples remain secret-safe.
- [ ] Public-safe repositories do not expose private roadmap, moat, competitive strategy, or internal implementation detail.

## Tests

- [ ] Tests are deterministic and meaningful.
- [ ] Tests do not require real providers, external networks, or secrets unless explicitly scoped.
- [ ] Mocks and fakes do not hide the behavior being reviewed.
- [ ] Important success, failure, boundary, and regression cases are covered where relevant.
- [ ] Missing tests are called out as blockers or follow-up items.

## Validation

- [ ] Required validation commands were run.
- [ ] Exact command results are included, or absence is explicitly explained.
- [ ] Build, test, lint, and typecheck failures are treated as blockers unless clearly unrelated.
- [ ] Validation matches the repo and change type.

## Documentation and Claims

- [ ] Docs avoid overclaiming unbuilt features.
- [ ] MVP, post-MVP, and deferred work are clearly distinguished.
- [ ] Public docs do not expose internal roadmap or private strategy.
- [ ] Customer-facing claims match the relevant claim-guardrails documentation where one exists.
- [ ] API and contract docs match the implemented behavior where relevant.

## Follow-up Extraction

- [ ] Deferred work is captured as follow-up issue candidates.
- [ ] Follow-ups are not implemented inside the current PR unless explicitly scoped.
- [ ] Design debt is documented without expanding the PR.

## Reviewer Verdict

Claude reviews must end with one of:

- `PASS`
- `PASS with non-blocking comments`
- `FAIL - changes required`

The verdict must list required changes before merge, and must explicitly state scope creep and validation status.

## Recommended Review Output Format

Use this default five-section review format unless the repo-local `AGENTS.md` specifies a different review format:

1. Merge blockers
2. Non-blocking issues
3. Tests/validation checked
4. Scope creep check
5. Final recommendation
