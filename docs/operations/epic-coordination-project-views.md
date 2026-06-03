# Epic Coordination and Project Views

## Purpose

Use this guide to route Arbiter MVP issues consistently across epics, GitHub Project fields, labels, and filtered views.

Project fields remain the execution source of truth. Labels classify work. Epics coordinate cross-repo outcomes.

## Epic Coordination Model

Use one parent MVP epic plus focused child coordination epics.

- Parent MVP epic: tracks sellable MVP completion and should only receive child epics or issues that materially affect local MVP, hosted-demo, or customer-pilot readiness.
- Contracts epic: cross-service contracts, execution stream compatibility, shared schema references, and deterministic fixtures.
- Reliability epic: runtime safety, provider readiness, retries, fallback, cancellation, timeouts, and failure handling.
- Cost-control epic: budget guardrails, cost avoided telemetry, waste reduction, and spend-control docs.
- Governance receipts epic: execution receipts, evidence bundles, policy explanations, decision records, and prompt privacy proof metadata.
- Demo surface epic: console, site, demo fixtures, and buyer-readable walkthrough support.
- Repository operations epic: GitHub Project governance, labels, issue metadata hydration, repository settings, and process docs.

Repo-scoped implementation issues should link to the most specific child coordination epic. Link directly to the parent MVP epic only when the issue materially affects sellable MVP completion or cross-epic sequencing.

Do not create new epics when an existing coordination epic can own the work. Do not use epic names as Project `Workstream` values unless the live Project field options are intentionally migrated.

## Issue Routing Rules

| Work category | Route to |
|---|---|
| Cost-control, spend guardrails, waste reduction, cost avoided telemetry | Cost-control epic |
| Governance receipts, evidence bundles, policy explanations, decision records, prompt privacy proof | Governance receipts epic |
| Runtime reliability, provider health, fallback behavior, retry suppression, cancellation, timeout safety | Reliability epic |
| Cross-service compatibility, execution stream schema, deterministic fixtures, contract snapshots | Contracts epic |
| Console/demo UX, demo fixtures, public demo walkthrough support | Demo surface epic |
| Repository hygiene, GitHub Project process, labels, issue metadata, automation governance | Repository operations epic |

Use labels for area/component classification and `Blocked By` for dependencies. Do not infer routing only from labels when a repo-qualified issue reference or child epic link is needed.

## Valid Workstream Values

Hidden `arbiter-project` metadata must use one of the live GitHub Project `Workstream` option values exactly:

- `GitHub Project Management`
- `MVP Execution`
- `Security & Compliance`
- `Documentation & Site`
- `Infrastructure & Ops`

Domain-specific categories such as cost control, governance receipts, execution contracts, execution reliability, demo surface, repository operations, and semantic execution are issue-routing concepts, labels, or child-epic categories. They are not valid `Workstream` values unless the live Project field options are intentionally migrated.

## Simplified Project Field Model

Keep the Project field model small and non-overlapping:

| Purpose | Field |
|---|---|
| Workflow state | `Status` |
| Next actor | `Agent` |
| Actionability | `Implementation Readiness` |
| Relative importance | `Project Priority` |
| Execution sequence | `Implementation Order` |
| Dependency or decision blocker | `Blocked By` |
| Repository ownership | `Repo` |
| Live cross-repo grouping | `Workstream` |
| Delivery stage | `Phase` |
| Release checkpoint | `Release Gate` |
| Scope risk | `Scope Risk` |
| Completion validation | `Validation Command` |
| Review freshness | `Last Reviewed` |

Stop active use of `Agent Status` if it exists. It duplicates `Agent`, `Status`, and `Implementation Readiness`.

Stop active use of `Lane` unless a single non-overlapping meaning is explicitly approved. Existing `Lane` values may remain as historical metadata until a human migration removes them.

## Recommended GitHub Project Views

| View | Purpose | Suggested filter |
|---|---|---|
| Command Center | Daily operating view across active non-complete work. | `Status != Done` and `Status != Deferred` and `Status != Do Not Implement Yet` |
| Epics | Parent and child coordination epics. | `type/epic` or title/body identifies an epic |
| Implementation Queue | Issues approved and ready for execution. | `Status = Ready` and `Implementation Readiness = ready` |
| Blocked / Needs Decision | Work requiring dependency resolution, approval, or clarification. | `Status = Blocked` or `Blocked By is not empty` or `Implementation Readiness = needs-clarification` |
| MVP Outcome Areas | MVP work grouped by outcome category. | `Phase = mvp` or `Release Gate = local-mvp` |
| Cross-Repo Contracts | Contract and compatibility work that spans repos. | `component/contracts` or `Blocked By is not empty` |
| Docs / Ops Hygiene | Documentation, Project, label, metadata, and repo-process work. | `Repo = .github` or `type/docs` or `component/ops` |
| Agent Queue / Ready for Codex | Work ready for Codex execution. | `Status = Ready` and `Implementation Readiness = ready` and `Agent = Codex` |
| Needs Claude | Planning, scope, architecture, prompt-refinement, and review work. | `Agent = Claude` or `Status = Review` |
| Human Decisions | Items needing human approval, scope choice, or Project field ownership. | `Status = Inbox` or `Status = Triage` or `Implementation Readiness = needs-clarification` |

Agent Queue, Ready for Codex, Needs Claude, and Human Decisions are filtered views, not new fields.

## Label Guidance

Use normal taxonomy labels for epics and issue routing. Do not create duplicate label families for concepts already represented by Project fields.

Do not create labels such as:

- `epic/*`
- `workstream/*`
- `status/*`
- `agent/*`
- `scope/*`
- `lane/*`
- `readiness/*`

Keep those concepts in GitHub Project fields or issue relationships.

## Non-Goals

- Do not perform broad label migration.
- Do not rewrite existing issue bodies.
- Do not change GitHub Project fields manually from this doc.
- Do not create labels.
- Do not create more epics.
- Do not modify product source-code repos.
- Do not create replacement fields for `Agent Status` or `Lane`.
