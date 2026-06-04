# Role-based AI engineering workflow

Use this workflow to keep AI-assisted Arbiter work issue-scoped, reviewable, and aligned with modern engineering practice. It complements `agent-workflow-wrappers.md`, `codex-issue-prompt-template.md`, `claude-review-checklist.md`, and repo-local `AGENTS.md` files.

Repo-local guardrails remain authoritative for implementation boundaries. This document defines role sequencing and review gates; it does not authorize broader repository access, hidden refactors, or autonomous mutation of Project fields, labels, workflows, branch protection, rulesets, repository settings, or permissions.

## Default loop

1. Principal engineer planning refines the issue into a small implementation scope.
2. Claude produces or tightens the Codex prompt when prompt generation is needed.
3. Codex implements the scoped change and runs requested validation.
4. Principal engineer review checks architecture, maintainability, SOLID design, clean code, clean architecture, test quality, and scope control.
5. Security review is added when auth, secrets, tenant isolation, prompt privacy, logging, public errors, customer data, or sensitive boundaries are touched.
6. SRE/reliability review is added when routing, retries, circuit breakers, provider health, observability, startup, CI/CD, runtime operations, or deployment behavior is touched.
7. Technical writing review is added when public docs, buyer-facing language, claims, onboarding docs, or integration guides are touched.
8. Codex receives a targeted fix prompt if review finds actionable issues.
9. Human owner performs the final merge decision.

## Role responsibilities

| Role | Primary responsibility | Must not do by default |
| --- | --- | --- |
| Principal engineer | Scope refinement, architecture review, implementation plan, final technical recommendation. | Authorize broad refactors or architecture expansion outside the issue. |
| Claude | Prompt reduction, issue refinement, review, scope control, and compact follow-up recommendations. | Implement fixes, create branches, push commits, or open PRs unless explicitly requested. |
| Codex | Implement the scoped issue, run validation, and return exact changed files and results. | Expand scope, perform whole-repo cleanup, or create unrelated follow-up work silently. |
| Security engineer | Review auth, secrets, tenant isolation, privacy, logging, public errors, and sensitive-data boundaries. | Convert review findings into unscoped implementation changes. |
| SRE/reliability engineer | Review resilience, startup, health, CI/CD, deployment, observability, and operational failure modes. | Add infrastructure or operational behavior outside the issue. |
| Technical writer | Review public-safe wording, onboarding clarity, issue/PR summaries, and claims boundaries. | Create marketing, compliance, production-readiness, or customer promises beyond implemented scope. |
| Secondary reviewer | Optional second pass for prompt compression, edge cases, and low-risk cleanup review. | Override principal/security/SRE decisions. |

## Planning gate

Before implementation starts, confirm:

- The issue number and repository are explicit.
- The branch name includes the issue number.
- The requested files or areas are narrow enough to inspect first.
- Non-goals are listed or inferable from the issue.
- Validation commands are known or marked manual review only.
- Cross-repo dependencies are understood.
- Any blocked/deferred status has been explicitly promoted by a human owner.

When the issue is too broad, split it or create follow-up issue candidates instead of writing an implementation prompt that permits hidden cleanup.

## Implementation gate

Codex implementation prompts should require:

- inspection of the smallest relevant file set before editing;
- one issue per branch and PR;
- no unrelated files or generated churn;
- no runtime, CI, workflow, settings, label, milestone, Project field, branch protection, ruleset, or permission changes unless explicitly scoped;
- exact validation commands and results;
- completion output ending with `Guardrails: <pass | blocked — reason>` for implementation-style work.

## Review gates

Use review roles based on the files and behavior touched.

### Principal engineer review

Required for most implementation PRs. Check:

- SOLID design and clean code;
- clean architecture and existing boundary preservation;
- whether existing abstractions were reused before new ones were added;
- maintainability and simplicity;
- deterministic tests for meaningful behavior changes;
- whether docs and code tell the same story;
- scope creep and hidden refactors.

### Security review

Required when a change touches:

- authentication or authorization;
- API keys, secrets, credentials, or headers;
- tenant isolation;
- prompt privacy or metadata boundaries;
- logging, traces, receipts, policy reasons, or public error bodies;
- customer data or sensitive payloads.

Security review should block raw prompt/response storage, secret leakage, public error detail leakage, tenant/correlation confusion, and unreviewed sensitive-data retention.

### SRE/reliability review

Required when a change touches:

- routing, retries, fallbacks, circuit breakers, or provider health;
- startup validation or environment configuration;
- readiness/liveness behavior;
- telemetry, observability, or trace finalization;
- CI/CD, deployment, Docker, hosting, or runtime operations.

SRE review should block unbounded retries, hidden background behavior, unreliable startup behavior, unsafe health signals, and operational changes without validation.

### Technical writing review

Required when a change touches:

- public site copy;
- onboarding or integration docs;
- buyer-facing feature names;
- claims about cost savings, production readiness, privacy, compliance, replay, simulation, marketplace, billing, analytics, or enterprise features.

Writing review should ensure public-safe wording, metadata-first prompt privacy language, and clear MVP versus deferred boundaries.

## Targeted fix loop

When review finds issues, produce a targeted Codex fix prompt that includes:

- PR number and issue number;
- exact files or findings to inspect;
- required fixes only;
- explicit non-goals;
- validation commands to rerun;
- expected concise output.

Do not let fix prompts become broad cleanup prompts. Broader cleanup, design debt, and adjacent improvements become follow-up issue candidates.

## Final human merge checklist

Before merge, confirm:

- PR maps to one issue.
- Branch name includes the issue number.
- Validation is present or absence is explained for docs-only changes.
- Review blockers are resolved.
- Non-goals remain respected.
- Public claims are safe and bounded.
- No secrets, private roadmap material, customer data, or sensitive implementation details were added.
- PR summary uses `Refs #123` for non-default integration PRs and `Closes #123` only where the merge should close the issue.

## Follow-up rule

Do not implement broader cleanup discovered during review inside the current PR. List it as a follow-up issue candidate with the repo, affected files, problem, suggested acceptance criteria, and validation command.

## Non-goals

This workflow does not implement linting, formatting, CI gates, Project field automation, branch protection, repository rulesets, issue migration, mass relabeling, or repo-wide `AGENTS.md` audits.
