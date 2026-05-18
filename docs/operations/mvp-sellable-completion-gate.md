# Sellable MVP Completion Gate

This document defines when the Arbiter AI Execution Firewall MVP is demo-ready and buyer-explainable. It separates MVP completion from post-MVP platform work. Language follows [MVP Claim Guardrails](./mvp-claim-guardrails.md).

The backend MVP foundation is already validated (see [Foundation](#foundation-already-complete) below). Sellable MVP completion requires demonstrable buyer-facing control outcomes: a reproducible demo flow, a readable execution receipt, a cost or waste signal, prompt privacy posture validated in demo output, and accompanying documentation a buyer can read without source code access.

Related sellable MVP epic: arbiter-systems/control-plane-api#133

## Foundation (Already Complete)

The backend MVP foundation is validated and documented in [MVP Backend Baseline](./mvp-backend-baseline.md) and [Local Two-Service Docker Validation - 2026-05-16](./local-two-service-validation-results.md):

- Control Plane API and AI Execution Service build and run as local Docker containers.
- Two-service local Docker flow validated end to end.
- `POST /v1/execute/stream` returns SSE token and final events.
- Health and readiness checks pass on both services.
- Fake/deterministic provider flow works without real provider credentials.
- `executionId` and `correlationId` are consistent across Control Plane and AI Execution Service logs.
- Local two-service stack starts and tears down cleanly.

## Sellable MVP Completion Gate

The MVP is sellable and demo-ready when all of the following are true.

### Demo and Validation

- [ ] One deterministic end-to-end demo flow runs locally using the two-service Docker stack.
- [ ] The demo uses the fake/deterministic provider; no real provider credentials required.
- [ ] No unresolved local validation blockers remain.
- [ ] Demo is reproducible from documented steps without manual intervention beyond Docker Desktop availability.

### Execution Receipt

- [ ] The `final` SSE event carries `executionId`, `correlationId`, `provider`, `model`, and `usage` (inputTokens, outputTokens, totalTokens). — *Available; verify against current final SSE event output before marking complete.*
- [ ] `policyReason` is returned in the receipt as a plain-English string describing the control decision applied: provider skipped, budget enforced, or route selected. — *Planned; see parent epic arbiter-systems/control-plane-api#133. Needs dedicated tracking issue.*
- [ ] Receipt is readable by a non-engineer in a demo context without additional tooling.

### Cost and Waste Controls

- [ ] **Unhealthy provider skip demonstrated:** when a provider is not ready, the routing layer skips it and the receipt reflects the decision. — *Tracked in arbiter-systems/control-plane-api#151.*
- [ ] **Retry suppression demonstrated:** unnecessary re-attempts against a known-failing provider are blocked at the routing layer rather than forwarded. — *Needs tracking issue.*
- [ ] **Budget enforcement or route downgrade demonstrated:** an execution is blocked or redirected when a budget ceiling or route preference policy applies. — *Planned; see parent epic arbiter-systems/control-plane-api#133. Needs dedicated tracking issue.*
- [ ] **Cost signal in demo output:** `costAvoided` or equivalent waste-reduction signal appears in demo output, showing estimated cost avoided by a routing or enforcement decision. — *Planned; see parent epic arbiter-systems/control-plane-api#133. Needs dedicated tracking issue.*

### Privacy and Overhead Posture

- [ ] **Prompt privacy demonstrated:** raw prompts do not appear in logs or receipts by default; execution receipts show structured metadata only. — *Requires explicit validation in demo logs and documented demo output; referenced docs describe the intended default but do not include a dedicated privacy-posture demo step.*
- [ ] **Provider payload pass-through demonstrated:** `prompt`, `model`, and `maxTokens` are forwarded to the provider unchanged; receipt confirms no token overhead was added by Arbiter. — *Tracked in arbiter-systems/control-plane-api#149 and #150.*
- [ ] **Arbiter control overhead separated from provider latency:** `arbiterControlLatencyMs` and `providerLatencyMs` appear in the receipt or equivalent timing is shown in demo output, isolating Arbiter coordination cost from provider/model time. — *Planned; tracked in arbiter-systems/control-plane-api#149 and #153.*

### Docs and Site

- [ ] Integration guide exists and is accurate for the MVP contract: endpoint, request shape, response shape, receipt fields. — *[Integration Contract](./mvp-execution-gateway-integration-contract.md) covers this; verify against final receipt fields before marking complete.*
- [ ] An AI Waste Report or equivalent demo summary document exists that maps demo execution receipt output to buyer pain: waste avoided, cost signal, policy reason applied. — *Needs tracking issue.*
- [ ] Site or docs include an integration overview or ROI-framing page a buyer can read without source code access. — *Needs tracking issue.*
- [ ] All published docs follow [MVP Claim Guardrails](./mvp-claim-guardrails.md) language.

## Recommended Implementation Order

Full scope and issue tracking: arbiter-systems/control-plane-api#133.

Suggested order for remaining gate items:

1. **Cached provider readiness and unhealthy provider skip** — arbiter-systems/control-plane-api#151. Unblocks the retry suppression and unhealthy provider skip demo gates.
2. **Provider payload pass-through validation and overhead measurement** — arbiter-systems/control-plane-api#149, #150, #153. Unblocks the pass-through posture and timing demo gates.
3. **`policyReason` receipt field** — Plain-English control reason in the `final` event. Unblocks receipt readability and the demo script. *Needs dedicated tracking issue.*
4. **Budget enforcement or route downgrade** — `budgetHint` enforcement or `routePreference` application. Unblocks the budget block demo gate. *Needs dedicated tracking issue.*
5. **`costAvoided` receipt field or equivalent waste signal** — Estimated cost avoided by a routing or enforcement decision. Unblocks the cost signal demo gate. *Needs dedicated tracking issue.*
6. **AI Waste Report or demo receipt summary** — Written after the receipt fields above are available; ties demo output to buyer pain. *Needs dedicated tracking issue.*
7. **Integration overview and ROI-framing page** — Site or docs update; follows AI Waste Report and receipt field completion. *Needs dedicated tracking issue.*

## Tracking Notes

arbiter-systems/control-plane-api#133 is the parent sellable MVP epic. Each unresolved checklist item above should have a dedicated implementation or docs issue linked to that epic. Items marked *Needs dedicated tracking issue* in this document do not yet have one. Create a dedicated issue before starting implementation work on those items so scope and acceptance criteria are clear before execution begins.

## Post-MVP: Deferred Work

The following are out of MVP scope. They should not be conflated with MVP completion.

A minimal demo UI or static receipt view scoped only to demo clarity is not excluded. What is deferred is the full customer/operator console and all advanced console workflows listed below.

| Area | Examples |
|---|---|
| Semantic execution primitives | Semantic transaction model, semantic routing, semantic replay |
| Replay engine | Execution replay, replay-based deduplication |
| Billing integration | Stripe, subscription management, per-tenant billing |
| Analytics warehouse | Long-term trace storage, cost dashboards, usage analytics |
| Compliance suite | Audit automation, regulatory reporting, compliance workflow |
| Advanced policy engine | Policy-as-code, policy versioning, complex rule evaluation |
| Marketplace | Provider marketplace, policy marketplace |
| Full customer/operator console | Execution log viewer, policy editor, advanced operational screens, team and customer onboarding UI |
| Public customer onboarding | Auth flows, team management, API key provisioning |
| Client SDK | SDK wrapper, OpenAI-compatible proxy endpoint |
| Production infrastructure | ECS, Kubernetes, multi-region, IaC budget resources |

## Related Docs and Issues

- [MVP Backend Baseline](./mvp-backend-baseline.md)
- [MVP Execution Gateway Integration Contract](./mvp-execution-gateway-integration-contract.md)
- [MVP Claim Guardrails](./mvp-claim-guardrails.md)
- [MVP Cost Controls](./mvp-cost-controls.md)
- [Sample Customer AI Waste Scenarios](./sample-customer-ai-waste-scenarios.md)
- [Local Two-Service Docker Validation - 2026-05-16](./local-two-service-validation-results.md)
- [Web and Console Timing Checklist](../planning/web-console-timing.md)
- Sellable MVP epic: arbiter-systems/control-plane-api#133
- Overhead measurement: arbiter-systems/control-plane-api#149
- Provider payload pass-through: arbiter-systems/control-plane-api#150
- Cached provider readiness: arbiter-systems/control-plane-api#151
- Low-overhead execution path docs: arbiter-systems/control-plane-api#153
