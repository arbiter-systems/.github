# Issue Lane Policy

## Purpose

This policy separates active AI Execution Firewall MVP work from deferred strategic work so contributors and AI coding agents can avoid scope creep, reduce backlog noise, and keep implementation sessions focused on approved near-term outcomes.

## Lane and Status Definitions

### Active MVP

Active MVP issues are required for AI Execution Firewall demo or customer-pilot readiness.

Canonical Active MVP areas:

- Execution request validation.
- Contract stability.
- Security and privacy guardrails.
- Tenant and context propagation.
- Provider readiness and routing.
- Retry guard.
- Budget guard.
- Execution receipts.
- Policy explanations.
- Cost/calls-avoided telemetry.
- Deterministic demo validation.

### Ready for Implementation

Ready for Implementation is a status overlay for an Active MVP issue. It means the issue:

- Has no blocking dependencies.
- Is fully specified.
- Has acceptance criteria.
- Has been approved for the current sprint or cycle.

### Blocked

Blocked is a status overlay for an Active MVP issue that cannot proceed because of an unresolved dependency, open design/product/security question, missing prerequisite, or required prior issue that has not been completed.

Blocked issues must include a blocking reason in the issue body or a blocking link.

### Deferred / Post-MVP

Deferred / Post-MVP issues are valid long-term investments, but they must not be implemented until explicitly promoted.

Deferred areas include:

- Semantic execution primitives.
- Tool Execution Firewall.
- Semantic transactions.
- Replay and simulation.
- Analytics warehouse.
- Durable storage implementation.
- Governance intelligence.
- Enterprise audit, export, and compliance suite.
- Token compression and rewriting.
- Marketplace, billing, and team management.

Ready and Blocked are status labels applied within a lane. They are not independent implementation priorities and do not override the Active MVP or Deferred / Post-MVP lane.

## Label Taxonomy

Arbiter repositories use the shared label taxonomy described in [`docs/operations/github-label-taxonomy.md`](operations/github-label-taxonomy.md). If an org-level `.github/labels.yml` file is present in a repository, it is also a source of shared label definitions.

When an issue is tracked in the Arbiter GitHub Project, Project fields are the operational source of truth for execution management. GitHub Project field semantics are defined in the [GitHub Project operating model](operations/github-project-operating-model.md).

For tracked issues, Project `Lane` and `Status` fields are authoritative for lane, status, readiness, blockers, and priority. Repository labels such as `lane: active-mvp`, `lane: deferred`, `status: ready`, and `status: blocked` are optional search and filter helpers for issue lists and views that do not have access to Project field data.

Labels complement Project fields but do not override them, and labels and Project fields must not intentionally conflict.

The following colon-form helper labels are legacy lane/status signals. They are optional for issues tracked in the GitHub Project, where the Project `Lane` and `Status` fields are authoritative. See [`docs/operations/github-label-taxonomy.md`](operations/github-label-taxonomy.md) for the canonical label taxonomy.

| Label | Meaning |
|---|---|
| `lane: active-mvp` | The issue is part of Active MVP scope. |
| `lane: deferred` | The issue is Deferred / Post-MVP and must not be implemented until promoted. |
| `status: ready` | The Active MVP issue is ready for implementation in the current sprint or cycle. |
| `status: blocked` | The Active MVP issue is blocked and must include a blocking reason or link. |

These labels are legacy helpers for search, routing, filtering, and compatibility; they are not required execution-state fields.

If these labels are not present in a repository, treat the names below as compatibility references. Do not create, synchronize, or modify labels as part of this policy issue.

This policy uses the legacy helper-label format `lane: value` and `status: value`. Canonical taxonomy labels use slash-form families such as `type/*`.

### Label vs. Project Field Conflict Resolution

- If a label and the corresponding GitHub Project field disagree, treat the Project field as authoritative.
- Update the stale label during triage or label-cleanup work.
- A human or agent should leave an issue comment when label cleanup affects implementation eligibility, such as moving work from deferred to active scope or from not-ready to ready.
- Label cleanup does not by itself authorize implementation if the Project field still says the issue is deferred, blocked, not ready, or otherwise not eligible.

## Promotion Process

A deferred issue becomes active only through a human decision. AI agents must not self-promote deferred work.

When a human promotes a deferred issue:

1. Update the GitHub Project `Lane` field from `Deferred` to `Active MVP`.
2. Optionally update the `lane: deferred` helper label to `lane: active-mvp` if the repository uses these legacy labels.
3. Update the issue body or add a comment with the promotion rationale.
4. Open a new branch, session, and PR for the promoted issue.

## AI Agent Instructions

These rules apply to Claude, Codex, Copilot, and other AI coding agents working across Arbiter repositories:

- Do not implement any issue whose GitHub Project `Lane` field is `Deferred`, or that carries a `lane: deferred` label and has no corresponding Project field record, unless a human has explicitly promoted it through the Promotion Process defined in this document.
- AI agents must not self-promote deferred work through either labels or GitHub Project fields.
- A conflicting label does not by itself authorize or block implementation; agents must follow the authoritative Project field and apply the Promotion Process when escalation or human approval is needed.
- AI agents may recommend that stale lane/status labels be updated to match the GitHub Project field state, but they must not mutate GitHub Project fields unless explicitly directed by a human owner.
- If label state and GitHub Project field state conflict, agents must follow the Project field as authoritative and surface the conflict in their completion report.
- Do not treat roadmap epics, post-MVP issues, old issue numbers, or strategic architecture issues as implementation signals.
- One issue maps to one branch, one session, and one PR.
- Multi-issue work requires explicit human approval documented in the issue or PR body.
- When uncertain whether work is in scope, check the Active MVP criteria in this document before proceeding.
- If uncertainty remains, stop and ask for human clarification rather than expanding scope.

## Examples

| Example | Lane / Status | Guidance |
|---|---|---|
| Execution request validation for the AI Execution Firewall request path. | `lane: active-mvp`, optionally `status: ready` when fully specified and approved. | Implement when acceptance criteria are present and no blockers remain. |
| `control-plane-api#249` durable execution storage. | `lane: deferred` | Do not implement until a human promotes the issue, changes labels, records rationale, and starts fresh implementation work. |
| `control-plane-api#160` Tool Execution Firewall. | `lane: deferred` | Treat as post-MVP strategic work unless explicitly promoted by a human. |
| A human relabels a deferred durable storage issue from `lane: deferred` to `lane: active-mvp`, adds a comment explaining customer-pilot need, updates the milestone, and opens a new branch/session/PR. | Promotion from deferred to active. | Implementation may proceed only in the fresh branch/session/PR created for the promoted issue. |

## Non-Goals

This policy does not govern:

- Runtime behavior.
- GitHub Project automation.
- Branch protection rules.
- CI workflow changes.
- issue migration or mass relabeling.
- broad repo restructuring.
- Label creation or label synchronization.
