# GitHub Project Operating Model

## Purpose

Arbiter GitHub Project fields are the operational source of truth for execution management. They define active scope, implementation readiness, sequencing, blockers, buyer-facing release pressure, and the current state of work across active repositories.

Labels remain useful, but they serve a different role. Labels are taxonomy, routing, filtering, and lightweight automation metadata rather than the primary execution state model.

## Custom Project Fields

| Field name | Type | Allowed values | Who manages it | Agent read/write permission |
|---|---|---|---|---|
| Repo | Single select | `.github`, `control-plane-api`, `ai-execution-service`, `arbiter-console`, `arbiter-site`, `internal-roadmap` | Human | Read only |
| Phase | Single select | `foundation`, `mvp`, `hosted-demo`, `customer-pilot`, `post-mvp` | Human with triage support | Read; write only when explicitly directed or during approved triage work |
| Lane | Single select | `active-mvp`, `deferred` | Human | Read only |
| Project Priority | Single select | `High`, `Medium`, `Low` | Human | Read only |
| Status | Single select | `Inbox`, `Triage`, `Ready`, `In Progress`, `Review`, `Blocked`, `Done`, `Deferred`, `Do Not Implement Yet` | Human for approval and scope states; shared for active execution states | Read; write only for `In Progress`, `Review`, and `Blocked` when user-scoped and human-approved |
| Implementation Order | Number | Numeric ordering within a lane or milestone; blank when unordered | Human | Read only |
| Blocked By | Text | Repo-qualified issue reference, issue number, or short blocker note | Human with implementation support | Read/write |
| Release Gate | Single select | `none`, `local-mvp`, `hosted-demo`, `customer-pilot`, `post-mvp` | Human | Read only |
| Validation Command | Text | Repo-local validation command or `manual review only` | Human with implementation support | Read/write |
| Agent | Single select | `none`, `Codex`, `Claude`, `Copilot`, `mixed` | Human with workflow support | Read/write |
| Last Reviewed | Date | Project review date in `YYYY-MM-DD` format | Human with triage support | Read/write |
| Confidence | Single select | `high`, `medium`, `low` | Human with triage support | Read/write |
| Implementation Readiness | Single select | `not-ready`, `needs-clarification`, `ready` | Human with triage support | Read/write |
| Scope Risk | Single select | `low`, `medium`, `high` | Human with triage support | Read/write |
| Workstream | Single select | `GitHub Project Management`, `MVP Execution`, `Security & Compliance`, `Documentation & Site`, `Infrastructure & Ops` | Human | Read only |

Field naming note: legacy references to a plain `Priority` field should be interpreted as `Project Priority`.

## Issue Lifecycle States

| State | Entry condition | Exit condition | Who moves it |
|---|---|---|---|
| Inbox | New issue exists but has not been classified in the project. | Repo, lane, and initial status are assigned. | Human |
| Triage | Issue is being classified for repo, lane, priority, and milestone fit. | Issue is routed to `Ready`, `Deferred`, `Do Not Implement Yet`, or `Blocked`. | Human |
| Ready | Issue is in active MVP scope, fully specified, has acceptance criteria, has no blocking dependencies, and has current sprint or cycle approval. | Work starts, new blocker appears, scope changes, or human approval is withdrawn. | Human |
| In Progress | Human or Agent is actively working the issue. | Work moves to review, becomes blocked, or is explicitly paused. | Both |
| Review | Implementation or doc update is ready for review. | Review completes, changes are requested, or blocker is found. | Both |
| Blocked | Dependency, approval, or missing input prevents progress, and a blocking reason or link is recorded in the issue body or comments. | Blocking condition is resolved and the issue is re-triaged. | Both |
| Done | Accepted work is complete for the issue scope. | Reopened only if follow-up work is clearly required. | Human |
| Deferred | Issue is valid but parked outside active implementation. | Human promotion or explicit closure changes the state. | Human |
| Do Not Implement Yet | Issue is intentionally visible but must not be started. | Human moves it back to triage or active work. | Human |

Promotion rules for deferred work live in [issue-lane-policy.md](../issue-lane-policy.md#promotion-process) and should be applied there rather than restated here.

Ready and Blocked semantics are governed by [issue-lane-policy.md](../issue-lane-policy.md#lane-and-status-definitions). Agents may recommend that an issue be moved to `Ready`, but they must not self-promote an issue into `Ready`; human approval is required before `status: ready` or `Ready` is applied.

`Blocked By` may be maintained as project metadata for views and reporting, but it does not replace the canonical requirement to record a blocking reason or link in the issue body or comments.

## Phase and Label Relationship

The `Phase` project field is the authoritative delivery phase for execution planning and issue placement inside the project. It determines which buyer-facing checkpoint, MVP stage, or follow-on phase the work is currently aligned to.

`phase/*` labels remain useful as routing and filtering complements, especially in repository-level issue lists and ad hoc searches. They should reflect the same general maturity stage as the Project field, but they do not override it.

When the `Phase` field and a `phase/*` label disagree, the Project field wins. Update the stale label during the next triage pass.

## Workstream Values

Use `Workstream` to group related issues across repositories when the execution context is broader than a single repo or component:

- `GitHub Project Management`: GitHub Project setup, triage operations, policy docs, label and workflow governance.
- `MVP Execution`: Direct MVP delivery work across implementation repos needed for near-term demo or customer-pilot outcomes.
- `Security & Compliance`: Security posture, dependency vulnerability handling, branch protections, provenance, and audit-related process work.
- `Documentation & Site`: Public docs, project documentation, shared templates, and buyer-facing site or documentation support work.
- `Infrastructure & Ops`: Cross-repo automation, repo operations, workflow wrappers, CI-facing policy support, and non-runtime operational scaffolding.

`Workstream` is human-assigned. Agents should read `Workstream` for scope context only and should not autonomously change it.

## Label vs. Project Field Conflict Resolution

When a label and a Project field disagree on status, phase, or priority, the Project field is authoritative for execution decisions. Label cleanup is handled separately and does not block implementation, triage, or review once the Project field is correct.

## Milestone to Project Field Mapping

Milestones set buyer-facing checkpoints. Release Gate and Phase fields control per-issue sequencing inside the project.

| Milestone | Scope summary | Authority doc |
|---|---|---|
| Local MVP | Deterministic local two-service demo readiness and buyer-readable control outcomes. | [mvp-sellable-completion-gate.md](mvp-sellable-completion-gate.md) |
| Hosted Demo | Hosted buyer-facing checkpoint after local MVP proof and supporting docs/site gates. | [mvp-sellable-completion-gate.md](mvp-sellable-completion-gate.md) |
| Customer Pilot | Customer-facing readiness after hosted-demo blockers are cleared or explicitly accepted. | [mvp-dependency-map.md](../project/mvp-dependency-map.md) |
| Post-MVP | Approved follow-on work outside the sellable MVP gate. | [issue-lane-policy.md](../issue-lane-policy.md) |
| Deferred | Parked work that remains valid but not implementation-ready. | [issue-lane-policy.md](../issue-lane-policy.md) |

Milestones set buyer-facing checkpoints, while `Release Gate` and `Phase` fields control per-issue sequencing inside the project.

## UI Workflows

- Inbox triage
- Lane assignment
- Status transitions requiring human approval, including Ready, Deferred, and Do Not Implement Yet
- Project Priority and Workstream assignment
- Last Reviewed updates on stale issues

## Automation Boundary

- Adding new issues to the project
- Bulk field audits
- Staleness reports
- Label-sync dry runs

Automation must not mutate Status, Lane, or Project Priority without human review.

## Recommended Field Posture

### Project fields that are the operational source of truth

- Status
- Implementation Order
- Lane
- Blocked By
- Release Gate
- Validation Command
- Agent
- Last Reviewed
- Confidence
- Implementation Readiness
- Scope Risk
- Project Priority
- Phase
- Workstream

### Labels that classify work for routing/filtering

- Work type
- Area
- Component
- Broad phase
- Relative priority
- Search/filter helpers
- Lightweight automation triggers

## Related Documents

- [issue-lane-policy.md](../issue-lane-policy.md)
- [github-label-taxonomy.md](github-label-taxonomy.md)
- [mvp-dependency-map.md](../project/mvp-dependency-map.md)
- [mvp-sellable-completion-gate.md](mvp-sellable-completion-gate.md)
- [agent-workflow-wrappers.md](../agent-workflow-wrappers.md)
- [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md)
- [pr-quality-gates.md](pr-quality-gates.md)
