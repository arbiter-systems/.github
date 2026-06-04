# GitHub Project Operating Model

## Purpose

Arbiter GitHub Project fields are the operational source of truth for execution management. They define active scope, implementation readiness, sequencing, blockers, buyer-facing release pressure, and the current state of work across active repositories.

Labels remain useful, but they serve a different role. Labels are taxonomy, routing, filtering, and lightweight automation metadata rather than the primary execution state model.

## Custom Project Fields

| Field name | Type | Allowed values | Who manages it | Agent read/write permission |
|---|---|---|---|---|
| Repo | Single select | `.github`, `control-plane-api`, `ai-execution-service`, `arbiter-console`, `arbiter-site`, `company` | Human | Read only |
| Phase | Single select | `foundation`, `mvp`, `hosted-demo`, `customer-pilot`, `post-mvp` | Human with triage support | Read; recommend changes; write only when explicitly directed by a Human owner |
| Lane | Single select | `active-mvp`, `deferred` | Human | Read only; active use should stop unless a single non-overlapping meaning is explicitly retained |
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

Repo field note: the `Repo` allowed values list is Human-maintained and must be updated when repositories are added to or removed from organization project scope.

`Agent Status` should not be used as an active Project field. `Agent`, `Status`, and `Implementation Readiness` already cover next actor, workflow state, and actionability.

## Simplified Field Semantics

Use the smallest field set that keeps execution decisions clear:

- `Status` = workflow state.
- `Agent` = next actor, such as `Claude`, `Codex`, `Copilot`, or `Human`/`none` where the Project allows it.
- `Implementation Readiness` = whether the issue is actionable.
- `Project Priority` = relative importance.
- `Implementation Order` = execution sequence.
- `Blocked By` = dependency or decision blocker.
- `Repo`, `Workstream`, `Phase`, `Release Gate`, `Scope Risk`, `Validation Command`, and `Last Reviewed` = project context and triage metadata.

Do not create replacement fields for `Agent Status` or `Lane`. If `Lane` remains visible in older views, treat it as legacy scope context only. Prefer `Status`, `Phase`, `Release Gate`, and `Implementation Readiness` for active planning.

## Issue Lifecycle States

| State | Entry condition | Exit condition | Who moves it |
|---|---|---|---|
| Inbox | New issue exists but has not been classified in the project. | Repo, workstream, phase, and initial status are assigned. | Human |
| Triage | Issue is being classified for repo, priority, readiness, and milestone fit. | Issue is routed to `Ready`, `Deferred`, `Do Not Implement Yet`, or `Blocked`. | Human |
| Ready | Issue is active-scope, fully specified, has acceptance criteria, has no blocking dependencies, and has current sprint or cycle approval. | Work starts, new blocker appears, scope changes, or human approval is withdrawn. | Human |
| In Progress | Human or Agent is actively working the issue. | Work moves to review, becomes blocked, or is explicitly paused. | Both |
| Review | Implementation or doc update is ready for review. | Review completes, changes are requested, or blocker is found. | Both |
| Blocked | Dependency, approval, or missing input prevents progress, and a blocking reason or link is recorded in the issue body or comments. | Blocking condition is resolved and the issue is re-triaged. | Both |
| Done | Accepted work is complete for the issue scope. | Reopened only if follow-up work is clearly required. | Human |
| Deferred | Issue is valid but parked outside active implementation. | Human promotion or explicit closure changes the state. | Human |
| Do Not Implement Yet | Issue is intentionally visible but must not be started. | Human moves it back to triage or active work. | Human |

Promotion rules for deferred work live in [issue-lane-policy.md](../issue-lane-policy.md#promotion-process) and should be applied there rather than restated here.

Ready and Blocked semantics are governed by [issue-lane-policy.md](../issue-lane-policy.md#lane-and-status-definitions). Agents may recommend that an issue be moved to `Ready`, but they must not self-promote an issue into `Ready`; human approval is required before `Ready` is applied.

`Blocked By` may be maintained as project metadata for views and reporting, but it does not replace the canonical requirement to record a blocking reason or link in the issue body or comments.

## Parent and Child Epic Coordination Model

Use one parent MVP epic to represent sellable MVP completion and child coordination epics to organize execution areas. Repo-scoped issues should attach to the most specific coordination epic that owns their outcome.

Recommended epic structure:

- Parent MVP epic: sellable AI Execution Firewall MVP completion.
- Contracts epic: Control Plane and AI Execution Service compatibility, request/stream schemas, snapshots, and fixtures.
- Reliability epic: runtime safety, retries, fallback behavior, provider health, and execution outcomes.
- Cost-control epic: budget guardrails, waste detection, retry suppression, calls avoided, and cost summaries.
- Governance receipts epic: execution receipts, explainability, policy reasons, evidence bundles, and privacy proof.
- Demo surface epic: console, site demo flow, fixtures, deterministic proof scenarios, and demo readiness.
- Repository operations epic: GitHub Project operations, metadata hydration, labels, workflow governance, and process docs.

Do not create duplicate epics when an existing parent or child epic already owns the outcome. Add repo-scoped implementation issues under the relevant child epic instead.

Link directly to the parent MVP epic only when the issue materially affects sellable MVP completion across multiple coordination areas. Narrow implementation issues should normally route to a child epic.

## Phase and Label Relationship

The `Phase` project field is the authoritative delivery phase for execution planning and issue placement inside the project. It determines which buyer-facing checkpoint, MVP stage, or follow-on phase the work is currently aligned to.

`phase/*` labels remain useful as routing and filtering complements, especially in repository-level issue lists and ad hoc searches. They should reflect the same general maturity stage as the Project field, but they do not override it.

When the `Phase` field and a `phase/*` label disagree, the Project field wins. Update the stale label during the next triage pass.

## Workstream Values

Use `Workstream` to group related issues across repositories when the execution context is broader than a single repo or component.

Current live Project Workstream values are:

- `GitHub Project Management`: Cross-repo automation, GitHub Project setup, issue metadata hydration, triage operations, label governance, workflow governance, and organization-level process docs.
- `MVP Execution`: Core MVP implementation work across `control-plane-api`, `ai-execution-service`, and `arbiter-console`, including execution behavior, routing, receipts, cost-control primitives, demo fixtures, and console MVP features.
- `Security & Compliance`: Security posture, privacy posture, secret hygiene, dependency vulnerability handling, provenance, error/log leakage prevention, hosted-demo security gates, and customer-pilot security readiness.
- `Documentation & Site`: Public docs, buyer-facing site, documentation support work, content guardrails, integration docs, limitations pages, and site validation.
- `Infrastructure & Ops`: Deployment, runtime operations, environment configuration, cloud/hosting setup, CI/CD infrastructure, Docker/runtime validation, and operational readiness.

`Workstream` is human-assigned. Agents should read `Workstream` for scope context only and should not autonomously change it.

Domain-specific categories such as cost control, governance receipts, execution contracts, execution reliability, demo surface, repository operations, and semantic execution are routing concepts, labels, or epic categories. They are not valid hidden `arbiter-project` Workstream metadata values unless the live GitHub Project Workstream field options are intentionally migrated.

Historical or proposed lowercase values such as `execution`, `observability`, `resilience`, `policy-governance`, `security-privacy`, `cost-control`, `demo-readiness`, `console`, `site-docs`, `repo-operations`, and `architecture` are not valid Workstream values unless the live GitHub Project field options are migrated to those values.

## Issue Routing Rules

Route issues by owned outcome, not by whichever repo happens to receive the first work item:

- Cost-control and waste-reduction work routes to the cost-control epic.
- Governance receipt, explainability, policy reason, evidence bundle, and prompt privacy proof work routes to the governance receipts epic.
- Reliability, retry, fallback, provider health, runtime safety, and execution outcome work routes to the reliability epic.
- Cross-service compatibility, execution stream schema, fixtures, snapshots, and contract drift work routes to the contracts epic.
- Console, demo fixtures, site demo copy, proof scenarios, and controlled walkthrough work routes to the demo surface epic.
- Repository hygiene, metadata hydration, label taxonomy, GitHub Project fields, workflow governance, and process documentation work routes to the repository operations epic.

When an issue spans multiple areas, pick the epic that owns the primary acceptance criteria and list the secondary references in the issue body.

## Label vs. Project Field Conflict Resolution

When a label and a Project field disagree on status, phase, priority, workstream, readiness, or ownership, the Project field is authoritative for execution decisions. Label cleanup is handled separately and does not block implementation, triage, or review once the Project field is correct.

## Milestone to Project Field Mapping

Milestones set buyer-facing checkpoints, while Release Gate and Phase fields control per-issue sequencing inside the project.

Milestone naming and release-tag conventions are defined in [Milestone and release tag strategy](milestone-and-release-tag-strategy.md).

| Milestone | Scope summary | Authority doc |
|---|---|---|
| Local MVP | Deterministic local two-service demo readiness and buyer-readable control outcomes. | [milestone-and-release-tag-strategy.md](milestone-and-release-tag-strategy.md) |
| Hosted Demo | Hosted buyer-facing checkpoint after local MVP proof and supporting docs/site gates. | [milestone-and-release-tag-strategy.md](milestone-and-release-tag-strategy.md) |
| Customer Pilot | Customer-facing readiness after hosted-demo blockers are cleared or explicitly accepted. | Human-owned project fields |
| Post-MVP | Approved follow-on work outside the sellable MVP gate. | [issue-lane-policy.md](../issue-lane-policy.md) |
| Deferred | Parked work that remains valid but not implementation-ready. | [issue-lane-policy.md](../issue-lane-policy.md) |

## Project Views

Recommended project views should be configured as views or saved filters, not as new fields:

| View | Purpose | Filter | Group by | Sort |
|---|---|---|---|---|
| Command Center | Daily working view for approved active work. | `Status != Done` and `Status != Deferred` and `Status != Do Not Implement Yet` | `Repo` | `Project Priority`, `Implementation Order` |
| Epics | Parent and child coordination epics. | `type/epic` or title starts with `epic(` | `Workstream` | `Project Priority`, `Implementation Order` |
| Implementation Queue | Issues ready for implementation. | `Status = Ready` and `Implementation Readiness = ready` | `Repo` | `Project Priority`, `Implementation Order` |
| Blocked / Needs Decision | Work blocked by dependency, approval, or missing decision. | `Status = Blocked` or `Blocked By is not empty` | `Blocked By` | `Project Priority`, `Last Reviewed` |
| MVP Outcome Areas | Active MVP work grouped by outcome. | `Phase = mvp` and `Status != Done` | `Workstream` or labels | `Project Priority`, `Implementation Order` |
| Cross-Repo Contracts | Contract, fixture, schema, and compatibility work. | `component/contracts` or `area/execution` plus cross-repo dependency references | `Repo` | `Blocked By`, `Project Priority` |
| Docs / Ops Hygiene | Documentation, taxonomy, workflow, and metadata hygiene work. | `area/docs` or `component/ops` | `Repo` | `Project Priority`, `Last Reviewed` |
| Agent Queue / Ready for Codex | Codex-ready work. | `Status = Ready` and `Implementation Readiness = ready` and (`Agent = Codex` or `Agent = mixed` or `Agent = none`) | `Repo` | `Project Priority`, `Confidence` |
| Needs Claude | Architecture, planning, review, or scope-control queue. | `Agent = Claude` or `Agent = mixed` or `Status = Review` | `Repo` | `Last Reviewed` |
| Human Decisions | Work requiring approval or triage. | `Status = Inbox` or `Status = Triage` or `Status = Blocked` | `Status` | `Project Priority`, `Last Reviewed` |
| Security / Hosted Demo Gates | Security, privacy, hosted-demo, and customer-pilot gates. | `Release Gate = hosted-demo` or `Release Gate = customer-pilot` or `Workstream = Security & Compliance` | `Release Gate` | `Project Priority`, `Repo` |
| Deferred Parking Lot | Valid deferred work not ready for implementation. | `Status = Deferred` or `Status = Do Not Implement Yet` | `Status` | `Last Reviewed` |
| Recently Stale | Items that need re-triage or freshness review. | `Status != Done` and `Last Reviewed` is older than review cadence | `Status` | `Last Reviewed` |

## Dependency Mapping Convention

> Model cross-repo work as one coordination issue or epic plus repo-scoped implementation issues, and record blockers explicitly instead of inferring dependency state from labels alone.

| Mechanism | When to use | Example |
|---|---|---|
| parent epic/sub-issue | A cross-repo outcome needs a top-level coordinator and repo-local execution issues. | `control-plane-api#133` as parent epic with repo-specific follow-up issues. |
| dependency link | One issue cannot proceed until another issue is complete. | `.github` issue depends on a `control-plane-api` receipt-field issue. |
| issue text reference | A lightweight reference is enough and no formal dependency object exists. | Issue body says "Blocked by `arbiter-console#12`." |
| project field | A blocker or coordination hint should stay visible in project views. | `Blocked By = control-plane-api#151`. |
| label | A label improves routing or reporting but should not carry dependency truth by itself. | `area/security` plus `phase/mvp` for a hosted-demo gate item. |
| milestone | Multiple issues roll up to the same buyer-facing checkpoint. | `Hosted Demo` milestone across docs and backend issues. |

## AI-Agent Workflow Fields

| Field | Agent type | Read/Write | Guidance |
|---|---|---|---|
| Repo | Claude, Codex, Copilot | Read | Use for scope confirmation before any implementation or review work. |
| Phase | Claude, Codex, Copilot | Read | Treat as the authoritative delivery phase. Agents may recommend Phase changes, but they must not autonomously mutate Phase unless explicitly directed by a Human owner. |
| Lane | Claude, Codex, Copilot | Read | Treat as legacy scope context only unless a Human owner retains a single non-overlapping meaning. Do not use it to override `Status`, `Phase`, or `Implementation Readiness`. |
| Project Priority | Claude, Codex, Copilot | Read | Use for ordering context; do not self-escalate Project Priority without Human input. |
| Status | Claude, Codex, Copilot | Read/Write | Agents may write Status only for user-scoped, human-approved active work. Permitted write transitions: `In Progress`, `Review`, and `Blocked`. Agents may recommend `Ready` but must not apply it; Human owners approve all `Ready` transitions. |
| Implementation Order | Claude, Codex, Copilot | Read | Use for sequencing context only; do not autonomously reorder work. |
| Blocked By | Claude, Codex, Copilot | Read/Write | Record concrete blockers with repo-qualified issue references where possible, but keep the canonical blocking reason or link in the issue body or comments as required by [issue-lane-policy.md](../issue-lane-policy.md#lane-and-status-definitions). |
| Release Gate | Claude, Codex, Copilot | Read | Use to understand milestone pressure, not to broaden scope. |
| Validation Command | Codex | Read/Write | Keep aligned with repo-local validation actually run or required. |
| Agent | Claude, Codex, Copilot | Write | Record the current execution or review owner when helpful. |
| Last Reviewed | Claude, Codex, Copilot | Write | Update only when the agent has performed triage, implementation, or review work on the issue in the current session. Do not update as a side effect of reading or scope evaluation. |
| Confidence | Claude, Codex, Copilot | Read/Write | Lower confidence when acceptance criteria, dependencies, or docs are unclear. |
| Implementation Readiness | Claude, Codex, Copilot | Read/Write | Use `needs-clarification` when issue scope is not safe to implement yet. |
| Scope Risk | Claude, Codex, Copilot | Read/Write | Raise to `high` when cross-repo drift or scope expansion is likely. |
| Workstream | Claude, Codex, Copilot | Read | Use for scope context only; do not autonomously change it. |

Deferred and `Do Not Implement Yet` states must not be self-promoted by agents. See [issue-lane-policy.md#ai-agent-instructions](../issue-lane-policy.md#ai-agent-instructions).

## Triage Cadence and Stale Issue Handling

Review the project at least weekly during MVP work, and more often when a hosted demo or customer-pilot milestone is active. Human owners should handle Inbox classification, milestone fit, status assignment, and any state changes that would promote deferred work or change buyer-facing scope.

Inbox triage should confirm the repo, Phase, Project Priority, Release Gate, Workstream, and whether a concrete validation command or blocker is already known. If the issue is not implementation-ready, set `Implementation Readiness` to `needs-clarification` or move the issue to `Blocked`, `Deferred`, or `Do Not Implement Yet` instead of letting agents infer scope.

Treat stale issues as review debt, not silent backlog drift. If `Last Reviewed` is older than the team cadence, re-check scope, blockers, and milestone relevance. Deferred issues re-enter active work only through the promotion path documented in [issue-lane-policy.md](../issue-lane-policy.md).

## UI Workflows

These workflows stay in the GitHub Project UI because they require human ownership, judgment, or approval.

- Inbox triage
- Status transitions requiring human approval, including Ready, Deferred, and Do Not Implement Yet
- Project Priority and Workstream assignment
- Last Reviewed updates on stale issues
- Any decision to retain or remove legacy `Lane` field usage

## Automation Boundary

Automation may support repeatable audits, reports, and dry runs, but it must not silently mutate execution-governing Project fields.

- Adding new and reopened issues and pull requests to the project through the repository-level `add-to-project.yml` workflow
- Bulk field audits
- Staleness reports
- Label-sync dry runs

Automation must not mutate Status, Lane, or Project Priority without human review.

## Recommended Field Posture

### Keep as active Project fields

- Status
- Agent
- Implementation Readiness
- Project Priority
- Implementation Order
- Blocked By
- Repo
- Workstream
- Phase
- Release Gate
- Scope Risk
- Validation Command
- Last Reviewed
- Confidence

### Stop using or remove from active planning

- Agent Status: duplicates `Agent`, `Status`, and `Implementation Readiness`.
- Lane: duplicates active/deferred workflow concepts already represented by `Status`, `Phase`, `Release Gate`, and readiness unless a single non-overlapping meaning is explicitly defined.

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
- [Milestone and release tag strategy](milestone-and-release-tag-strategy.md)
- [agent-workflow-wrappers.md](../agent-workflow-wrappers.md)
- [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md)
- [pr-quality-gates.md](pr-quality-gates.md)
