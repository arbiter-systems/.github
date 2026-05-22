# Sellable MVP Completion Gate

This document defines the completion gate for the sellable MVP. It is intended to prevent the MVP from drifting into a broad platform build while still ensuring the product can be demonstrated as a buyer-explainable AI execution control layer.

For this document, buyer-explainable means a technical buyer can understand what Arbiter controlled, why it acted, and what operational or cost impact resulted without reading source code.

The MVP foundation is not considered complete because the code exists. It is complete only when the target behaviors are demonstrated through local validation, receipt output, structured evidence, and supporting buyer-facing documentation.

## Foundation

The MVP foundation already includes the core execution-control shape:

- AI execution request path through the control plane.
- Execution service integration contract.
- Server-sent execution stream.
- Provider routing primitives.
- Execution receipt structure.
- Policy and routing metadata.
- Local fake-provider validation path.
- Integration contract documentation.

The foundation should remain focused on control, routing, observability, cost/waste signal, policy explanation, and prompt privacy posture.

The MVP should not expand into analytics storage, billing, team management, marketplace workflows, advanced policy DSL, replay, semantic transactions, or long-term telemetry warehousing.

## Gate Criteria

### 1. Execution Receipt

- [ ] Execution receipt includes `executionId`, `correlationId`, `outcome`, provider attempts, policy reason, and cost/waste fields.
  - Status: Needs demo validation.
  - Validation: Verify against the final SSE event shape documented in the integration contract.

- [ ] Receipt output can explain what happened during the execution without requiring source-code inspection.
  - Status: Needs demo validation.
  - Validation: Demo script includes a receipt walkthrough where the control decision, provider behavior, and estimated waste/cost impact can be explained from the final event output.

- [ ] Final SSE event and receipt documentation agree on field names, required fields, optional fields, and buyer-visible meaning.
  - Status: Artifact exists; verification pending.
  - Dependency: Re-check after final receipt contract fields are stable.

- [ ] Receipt includes a plain-English policy/control explanation.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Dependency: Unblocks demo script, AI Waste Report, Policy Explainer language, and ROI/integration docs.

### 2. Cost and Waste Control

- [ ] Retry suppression is demonstrated for a retry-heavy or provider-failure scenario.
  - Status: Implementation pending.
  - Tracking: Tracked by control-plane-api#309.
  - Validation: Local demo output shows a retry was suppressed and the receipt records the avoided attempt.

- [ ] Provider readiness / skip routing is demonstrated.
  - Status: Implementation pending or in progress.
  - Tracking: Tracked by #151.
  - Validation: Local demo output shows an unhealthy or unavailable provider was skipped before execution was attempted.

- [ ] Budget enforcement is demonstrated by blocking an execution that exceeds a configured ceiling.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Validation: Receipt or final event must show that the execution was blocked due to a budget policy.

- [ ] Route downgrade is demonstrated by selecting a lower-cost provider or execution path when policy allows.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Validation: Receipt or final event must show the selected lower-cost route and the reason it was selected.

- [ ] Estimated `costAvoided` is present where a retry, provider attempt, budget block, or route downgrade avoids unnecessary spend.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Validation: Receipt must include estimated avoided cost or avoided attempt signal for at least one deterministic demo scenario.

- [ ] Cost/waste evidence is represented in buyer-facing language.
  - Status: Blocked by retry suppression, provider skip routing, budget enforcement or route downgrade, and `costAvoided`.
  - Validation: Demo output can show executions controlled, retries suppressed, providers skipped, attempts avoided, estimated cost avoided, and budget blocks.

### 3. Policy and Governance Explanation

- [ ] Policy decision reason is included in receipt output.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Dependency: Unblocks Policy Explainer, demo script, AI Waste Report, and ROI/integration docs.

- [ ] Policy explanation is written in plain English.
  - Status: Implementation pending.
  - Validation: A technical buyer can understand why Arbiter allowed, blocked, skipped, retried, suppressed, or downgraded an execution path from receipt output.

- [ ] Policy explanation distinguishes between routing decisions, budget decisions, retry decisions, and privacy posture.
  - Status: Implementation pending.
  - Validation: Demo scenarios should show at least two different control reasons and avoid collapsing them into generic “policy applied” language.

### 4. Prompt Privacy

- [ ] Prompt privacy posture is demonstrated in local validation output.
  - Status: Validation gap.
  - Validation: Structured logs from a local validation run must show raw prompts are not stored by default.

- [ ] Documentation states the default prompt privacy posture.
  - Status: Artifact exists; verification pending.
  - Validation: Confirm docs describe metadata-first behavior and avoid implying full prompt capture unless explicitly enabled.

- [ ] Receipt or demo output can communicate privacy posture without exposing raw prompt content.
  - Status: Needs demo validation.
  - Validation: Demo output should show privacy posture using metadata, not raw prompt storage.

### 5. Demo and Validation

- [ ] Local fake-provider demo flow completes successfully.
  - Status: Needs demo validation.
  - Validation: Demo scenario runs locally and produces deterministic output.

- [ ] Final SSE event includes required receipt fields.
  - Status: Needs demo validation.
  - Validation: Final event includes the fields required by the integration contract and receipt documentation.

- [ ] Structured validation output includes provider skip, retry suppression, budget, and privacy evidence where applicable.
  - Status: Needs demo validation.
  - Validation: Use structured local output instead of ad hoc console interpretation.

- [ ] Demo script includes before/after behavior.
  - Status: Implementation pending.
  - Validation: Scenario should show behavior without Arbiter control versus behavior with Arbiter control.

- [ ] Demo script shows the following buyer-visible outcomes:
  - executions controlled
  - retries suppressed
  - providers skipped
  - attempts avoided
  - estimated cost avoided
  - budget blocks
  - prompt privacy posture

### 6. Docs and Site

- [ ] AI Waste Report demo summary exists.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Dependency: Blocked by provider skip routing, retry suppression, budget enforcement or route downgrade, and `costAvoided`.
  - Validation: Report includes executions controlled, retries suppressed, providers skipped, attempts avoided, estimated cost avoided, budget blocks, and prompt privacy posture.

- [ ] Integration guide reflects final receipt fields.
  - Status: Artifact exists; field verification pending.
  - Dependency: Re-check after final receipt contract fields are stable.
  - Validation: Integration guide must match the final SSE event and receipt contract.

- [ ] Site or docs include an integration overview / ROI-framing page.
  - Status: Implementation pending.
  - Tracking: No dedicated issue yet; tracked under #133 until split out.
  - Dependency: Blocked by final receipt fields and AI Waste Report content.
  - Validation: Page should explain how Arbiter controls execution waste, provider failure behavior, budget policy, and privacy posture.

- [ ] Buyer-facing language avoids overclaiming.
  - Status: Needs review.
  - Validation: Claims should use “targets,” “can reduce,” or “helps reduce” language rather than guaranteed savings.

## Recommended Implementation Order

1. Provider readiness / skip routing
   - Tracking: #151.
   - Unblocks provider skip evidence and downstream waste/cost demonstrations.

2. Retry suppression / provider guardrails
   - Tracking: control-plane-api#309.
   - Unblocks retries suppressed, attempts avoided, and retry-related cost avoided evidence.

3. `policyReason` receipt field
   - Tracking: No dedicated issue yet; tracked under #133 until split out.
   - Unblocks the demo script, Policy Explainer language, AI Waste Report, and ROI/integration docs.

4. Budget enforcement
   - Tracking: No dedicated issue yet; tracked under #133 until split out.
   - Depends on enough routing/readiness behavior to produce a meaningful demo path.
   - Should be independently demonstrated from route downgrade.

5. Route downgrade
   - Tracking: No dedicated issue yet; tracked under #133 until split out.
   - Independent from `policyReason` implementation, but should be demoed after provider readiness behavior is stable.
   - Should be independently demonstrated from budget enforcement.

6. `costAvoided` receipt field
   - Tracking: No dedicated issue yet; tracked under #133 until split out.
   - Depends on retry suppression, provider skip, budget block, or route downgrade behaviors producing measurable avoided attempts or estimated savings.

7. AI Waste Report
   - Tracking: No dedicated issue yet; tracked under #133 until split out.
   - Blocked by steps 1–6.

8. Integration overview / ROI page
   - Tracking: No dedicated issue yet; tracked under #133 until split out.
   - Blocked by final receipt fields and AI Waste Report content.

## Tracking Notes

Some gate items have dedicated implementation issues; others are still tracked under the MVP parent epic until split out.

- Provider readiness / skip routing is tracked by #151.
- Retry suppression / provider guardrails are tracked by control-plane-api#309.
- Items without dedicated issues remain tracked under #133 and should be split into focused follow-up issues before implementation begins.
- Checklist items should not use placeholder text such as “See linked tracking issue.” Each item should either reference a concrete issue or explicitly state that it is still tracked under #133.
- Checklist items should keep requirement, status, validation, and dependency information separate so the gate remains scannable.

## Post-MVP Deferred Work

The following work is intentionally deferred and should not block the sellable MVP gate:

| Deferred Area | Reason |
|---|---|
| Billing and subscriptions | Not needed to prove execution control value. |
| Team management | Not needed for deterministic MVP demo. |
| Long-term analytics storage | MVP should avoid analytics/data warehouse scope. |
| Full dashboard analytics | Demo summaries and receipts are sufficient for MVP. |
| Provider marketplace | Not needed for execution control proof. |
| Replay engine | Later-stage platform capability. |
| Semantic transactions | Later-stage architecture capability. |
| Advanced policy DSL | MVP should use simple policy/routing behavior. |
| Multi-region routing | Not required for initial buyer validation. |
| Compliance suite | Privacy posture and governance receipts are enough for MVP. |
| Full prompt capture/search | Conflicts with metadata-first privacy posture. |

## Completion Standard

The sellable MVP is complete when Arbiter can demonstrate the following in a deterministic local or controlled demo flow:

1. An AI execution is controlled through the Arbiter path.
2. An unhealthy or unavailable provider can be skipped.
3. An unnecessary retry can be suppressed.
4. A budget policy can block execution or a route policy can downgrade execution.
5. Receipt output explains the result in buyer-readable language.
6. Estimated avoided waste or cost is shown where applicable.
7. Prompt privacy posture is visible without raw prompt storage.
8. Docs explain integration, receipt fields, control behavior, and ROI framing without overclaiming.

The MVP is not complete merely because implementation exists. It is complete when the implementation, validation output, receipt evidence, and buyer-facing explanation all agree.