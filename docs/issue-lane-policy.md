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

This policy expects these lane and status labels:

| Label | Meaning |
|---|---|
| `lane: active-mvp` | The issue is part of Active MVP scope. |
| `lane: deferred` | The issue is Deferred / Post-MVP and must not be implemented until promoted. |
| `status: ready` | The Active MVP issue is ready for implementation in the current sprint or cycle. |
| `status: blocked` | The Active MVP issue is blocked and must include a blocking reason or link. |

If these labels are not present in a repository, treat them as expected label names only. Do not create, synchronize, or modify labels as part of this policy issue.

## Promotion Process

A deferred issue becomes active only through a human decision. AI agents must not self-promote deferred work.

When a human promotes a deferred issue:

1. Update labels from `lane: deferred` to `lane: active-mvp`.
2. Update the milestone or project lane if applicable.
3. Update the issue body or add a comment with the promotion rationale.
4. Open a new branch, session, and PR for the promoted issue.

## AI Agent Instructions

These rules apply to Claude, Codex, Copilot, and other AI coding agents working across Arbiter repositories:

- Do not implement any issue labeled `lane: deferred` unless a human has explicitly promoted it and the label has changed.
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
