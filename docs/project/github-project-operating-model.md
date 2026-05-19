# GitHub Project Operating Model

## Custom Project Fields

| Field | Type | Allowed values | Managed by |
|---|---|---|---|
| Repo | Single select | `.github`, `control-plane-api`, `ai-execution-service`, `arbiter-console`, `arbiter-site`, `internal-roadmap` | human |
| Phase | Single select | `foundation`, `mvp`, `hosted-demo`, `customer-pilot`, `post-mvp` | both |
| Lane | Single select | `active-mvp`, `deferred` | human |
| Priority | Single select | `high`, `medium`, `low` | human |
| Status | Single select | `Inbox`, `Triage`, `Ready`, `In Progress`, `Review`, `Blocked`, `Done`, `Deferred`, `Do Not Implement Yet` | human for `Ready`, `Deferred`, `Do Not Implement Yet`, and scope/prioritization states; agents may move only `In Progress`, `Review`, and `Blocked` when user-scoped |
| Blocked By | Text | issue number, repo-qualified issue reference, or short blocker note | both |
| Release Gate | Single select | `none`, `local-mvp`, `hosted-demo`, `customer-pilot`, `post-mvp` | human |
| Validation Command | Text | repo-local validation command or `manual review only` | both |
| Agent | Single select | `none`, `Codex`, `Claude`, `Copilot`, `mixed` | both |
| Last Reviewed | Date | project review date | both |
| Confidence | Single select | `high`, `medium`, `low` | both |
| Implementation Readiness | Single select | `not-ready`, `needs-clarification`, `ready` | both |
| Scope Risk | Single select | `low`, `medium`, `high` | both |

## Project Views

| View | Purpose | Filter | Group by | Sort |
|---|---|---|---|---|
| Active MVP | Daily working view for approved MVP issues. | `Lane = active-mvp` and `Status != Done` and `Status != Deferred` and `Status != Do Not Implement Yet` | `Repo` | `Priority`, `Last Reviewed` |
| Ready for Codex | Implementation queue for issues that are specified and approved. | `Lane = active-mvp` and `Status = Ready` and `Implementation Readiness = ready` and `Agent != Claude` | `Repo` | `Priority`, `Confidence` |
| Claude Review Queue | Review-only queue for architecture or diff review. | `Status = Review` and (`Agent = Claude` or `Agent = mixed`) | `Repo` | `Last Reviewed` |
| Blocked | Surface blockers that need human action or dependency resolution. | `Status = Blocked` | `Blocked By` | `Last Reviewed` |
| Security / Hosted Demo Gates | Track issues that gate hosted-demo and customer-pilot readiness. | `Release Gate = hosted-demo` or `Release Gate = customer-pilot` | `Release Gate` | `Priority`, `Repo` |
| Cross-Repo Dependencies | Follow issues whose progress depends on another repo or epic. | `Blocked By is not empty` | `Repo` | `Blocked By`, `Priority` |
| Deferred Parking Lot | Keep valid deferred work visible without treating it as implementation-ready. | `Lane = deferred` or `Status = Deferred` or `Status = Do Not Implement Yet` | `Lane` | `Last Reviewed` |
| Repo Operations | Ops/docs/project work across organization metadata and process issues. | `Repo = .github` | `Status` | `Priority`, `Last Reviewed` |
| Release Checklist | Review milestone-critical issues before buyer-facing checkpoints. | `Release Gate != none` and `Status != Done` | `Release Gate` | `Status`, `Priority` |
| Recently Stale | Catch items that need re-triage or freshness review. | `Status != Done` and `Last Reviewed` is older than review cadence | `Status` | `Last Reviewed` |

## Issue Lifecycle States

| State | Entry condition | Exit condition | Who moves it |
|---|---|---|---|
| Inbox | New issue exists but has not been classified in the project. | Repo, lane, and initial status are assigned. | human |
| Triage | Issue is being classified for repo, lane, priority, and milestone fit. | Issue is routed to `Ready`, `Deferred`, `Do Not Implement Yet`, or `Blocked`. | human |
| Ready | Issue is in active MVP scope, fully specified, has acceptance criteria, has no blocking dependencies, and has current sprint or cycle approval. | Work starts, new blocker appears, scope changes, or human approval is withdrawn. | human |
| In Progress | Human or agent is actively working the issue. | Work moves to review, becomes blocked, or is explicitly paused. | both |
| Review | Implementation or doc update is ready for review. | Review completes, changes are requested, or blocker is found. | both |
| Blocked | Dependency, approval, or missing input prevents progress, and a blocking reason or link is recorded in the issue body or comments. | Blocking condition is resolved and the issue is re-triaged. | both |
| Done | Accepted work is complete for the issue scope. | Reopened only if follow-up work is clearly required. | human |
| Deferred | Issue is valid but parked outside active implementation. | Human promotion or explicit closure changes the state. | human |
| Do Not Implement Yet | Issue is intentionally visible but must not be started. | Human moves it back to triage or active work. | human |

Promotion rules for deferred work live in [issue-lane-policy.md](../issue-lane-policy.md#promotion-process) and should be applied there rather than restated here.

Ready and Blocked semantics are governed by [issue-lane-policy.md](../issue-lane-policy.md#lane-and-status-definitions). Claude and Codex may recommend that an issue be moved to `Ready`, but they must not self-promote an issue into `Ready`; human approval is required before `status: ready` or `Ready` is applied.

`Blocked By` may be maintained as project metadata for views and reporting, but it does not replace the canonical requirement to record a blocking reason or link in the issue body or comments.

## Milestone Strategy

| Milestone | Scope summary | Authority doc |
|---|---|---|
| Local MVP | Deterministic local two-service demo readiness and buyer-readable control outcomes. | [mvp-sellable-completion-gate.md](../operations/mvp-sellable-completion-gate.md) |
| Hosted Demo | Hosted buyer-facing checkpoint after local MVP proof and supporting docs/site gates. | [mvp-sellable-completion-gate.md](../operations/mvp-sellable-completion-gate.md) |
| Customer Pilot | Customer-facing readiness after hosted-demo blockers are cleared or explicitly accepted. | [mvp-dependency-map.md](mvp-dependency-map.md) |
| Post-MVP | Approved follow-on work outside the sellable MVP gate. | [issue-lane-policy.md](../issue-lane-policy.md) |
| Deferred | Parked work that remains valid but not implementation-ready. | [issue-lane-policy.md](../issue-lane-policy.md) |

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
| Phase | Claude, Codex | Read/Write | Update only when the issue clearly belongs to a new delivery phase. |
| Lane | Claude, Codex, Copilot | Read | Treat as human-controlled scope authority. |
| Priority | Claude, Codex | Read | Use for ordering context; do not self-escalate priority without human input. |
| Status | Claude, Codex | Read/Write | When scoped by the user, agents may move active work among `In Progress`, `Review`, and `Blocked`. Agents may recommend `Ready` but must not move work into `Ready`; human approval is required first. |
| Blocked By | Claude, Codex | Read/Write | Record concrete blockers with repo-qualified issue references where possible, but keep the canonical blocking reason or link in the issue body or comments as required by [issue-lane-policy.md](../issue-lane-policy.md#lane-and-status-definitions). |
| Release Gate | Claude, Codex | Read | Use to understand milestone pressure, not to broaden scope. |
| Validation Command | Codex | Read/Write | Keep aligned with repo-local validation actually run or required. |
| Agent | Claude, Codex, Copilot | Write | Record the current execution or review owner when helpful. |
| Last Reviewed | Claude, Codex | Write | Update when triage, implementation, or review materially refreshes the issue state. |
| Confidence | Claude, Codex | Read/Write | Lower confidence when acceptance criteria, dependencies, or docs are unclear. |
| Implementation Readiness | Claude, Codex | Read/Write | Use `needs-clarification` when issue scope is not safe to implement yet. |
| Scope Risk | Claude, Codex | Read/Write | Raise to `high` when cross-repo drift or scope expansion is likely. |

Deferred and `Do Not Implement Yet` states must not be self-promoted by agents. See [issue-lane-policy.md#ai-agent-instructions](../issue-lane-policy.md#ai-agent-instructions).

## Triage Cadence and Stale Issue Handling

Review the project at least weekly during MVP work, and more often when a hosted demo or customer-pilot milestone is active. Human owners should handle Inbox classification, milestone fit, lane assignment, and any state changes that would promote deferred work or change buyer-facing scope.

Inbox triage should confirm the repo, phase, lane, priority, release gate, and whether a concrete validation command or blocker is already known. If the issue is not implementation-ready, set `Implementation Readiness` to `needs-clarification` or move the issue to `Blocked`, `Deferred`, or `Do Not Implement Yet` instead of letting agents infer scope.

Treat stale issues as review debt, not silent backlog drift. If `Last Reviewed` is older than the team cadence, re-check scope, blockers, and milestone relevance. Deferred issues re-enter active work only through the promotion path documented in [issue-lane-policy.md](../issue-lane-policy.md).

## Related Documents

- [issue-lane-policy.md](../issue-lane-policy.md)
- [github-label-taxonomy.md](../operations/github-label-taxonomy.md)
- [mvp-dependency-map.md](mvp-dependency-map.md)
- [mvp-sellable-completion-gate.md](../operations/mvp-sellable-completion-gate.md)
- [agent-workflow-wrappers.md](../agent-workflow-wrappers.md)
- [branch-protection-and-merge-policy.md](../operations/branch-protection-and-merge-policy.md)
- [pr-quality-gates.md](../operations/pr-quality-gates.md)
