# AGENTS.md

## Repository Role

This public repository contains Arbiter Systems organization-level GitHub metadata, including the public organization profile and shared community files when needed.

Keep all content public-safe.

## Owns

- Public organization profile content under `profile/`
- Shared public-facing GitHub metadata
- Issue and pull request templates when explicitly scoped
- Public-safe contribution or security policy files when explicitly scoped

## Does Not Own

- Product source code
- Control Plane API implementation
- AI Execution Service implementation
- Arbiter Console implementation
- Public website implementation
- Internal roadmap, moat thesis, competitive strategy, or private architecture planning
- Customer data, secrets, legal records, or internal admin material

## Non-Negotiables

- Do not include secrets, credentials, API keys, private links, customer data, or internal admin material.
- Do not publish private roadmap, moat, execution intelligence, semantic rollback, replay/simulation, governance strategy, or competitive analysis details.
- Keep public claims accurate, concise, and supportable.
- Do not add product code or runtime infrastructure here.
- Keep each change scoped to one issue.
- Do not modify unrelated files unless required.

## Documentation Style

- Keep copy clear, public-facing, and high-level.
- Prefer concise markdown.
- Avoid implementation promises that are not already true or explicitly approved.
- Keep organization profile content aligned with Arbiter Systems as AI infrastructure for controlled, observable, reliable model execution.

## Usage and Review Discipline

Keep responses concise and task-scoped.

Current tool roles:
- Codex: implementation, tests, build/test iteration, PR-ready changes.
- Claude: architecture, issue refinement, scope control, diff review.
- Copilot: inline autocomplete and small local edits.

Default behavior:
- Inspect only files relevant to the current issue, branch, or diff.
- Do not perform whole-repo audits unless explicitly requested.
- Do not re-architect existing systems unless the issue requires it.
- Prefer small, issue-focused changes over broad cleanup.
- Avoid repeating repository context unless it directly affects the change.

Review format:
1. Merge blockers
2. Non-blocking issues
3. Tests/validation checked
4. Scope creep check
5. Final recommendation

Review depth:
- Docs-only changes: light review.
- Test-only changes: light review.
- Small implementation changes: standard review.
- Security, policy, routing, tenant isolation, execution tracing, provider fallback, quota, or public API changes: full review.

Implementation rules:
- Stay within the GitHub issue acceptance criteria.
- Do not introduce persistence, billing, dashboards, replay, marketplaces, advanced policy DSLs, multi-region routing, or background workers unless explicitly requested.
- Preserve existing public contracts unless the issue requires a contract change.
- Add or update tests when behavior changes.
- Run the repo's documented validation commands before reporting completion.

## Validation

For documentation-only changes, inspect rendered markdown where practical. If templates or automation files are added later, validate them with the repository-appropriate tooling.

## Git and Completion

- Work only on the issue branch unless instructed otherwise.
- Check `git status` before and after changes.
- Keep commits focused.
- Do not overwrite unrelated local changes.

Before reporting completion, include changed files, content changed, validation performed, deferred work, known limitations, and confirmation that no unrelated files changed.
