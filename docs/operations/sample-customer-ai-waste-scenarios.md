# Sample Customer AI Waste Scenarios

This document defines realistic AI waste scenarios that the Arbiter AI Execution Firewall MVP can demonstrate for site, console demo, and sales/demo scripts. Scenarios are grounded in MVP capabilities. Language follows [MVP Claim Guardrails](./mvp-claim-guardrails.md).

These are demo scenarios and positioning examples, not guaranteed customer outcomes.

Related sellable MVP epic: arbiter-systems/control-plane-api#133

---

## Scenario 1: Support Workflow Retry Loop

**Buyer pain.** A customer-facing support automation retries failed AI calls without checking whether the upstream provider is healthy. Each retry burns tokens and costs against the same failing provider, adding latency to ticket resolution without producing useful output.

**Arbiter control used.** Cached provider readiness filtering. Arbiter uses provider readiness signals to gate routing as cached readiness support is completed. When readiness filtering is active, Arbiter should skip providers that are not ready rather than forwarding requests that are likely to fail.

**Expected execution receipt outcome.**
- `executionId` and `correlationId` present — each attempt is uniquely traceable.
- `provider` reflects which provider was actually used (or that the execution was not forwarded when no ready provider exists).
- `usage` reflects tokens consumed only for attempts that reached a provider.
- `policyReason` (planned): "Provider skipped — cached readiness check failed; execution not forwarded."

**Expected policy/control reason.** Unhealthy provider bypassed at routing layer. Execution either routes to an available provider or returns a structured control response — no silent retry against a known-failing endpoint.

**Estimated waste avoided concept.** In a waste-heavy retry loop, Arbiter can target meaningful cost reduction by preventing token spend on provider calls that would fail before generating output. Exact reduction depends on retry volume and provider failure rate.

**Arbiter control overhead/timing concept.** Readiness checks run against a cached readiness signal in the execution hot path. Arbiter targets low added latency by keeping the readiness gate metadata-first and local. `arbiterControlLatencyMs` (planned) will measure Arbiter-only overhead separately from provider/model latency.

**Prompt privacy posture.** Arbiter does not store raw prompts by default. The receipt records structured metadata only: `executionId`, `correlationId`, `provider`, `model`, token counts.

**Provider payload pass-through posture.** The provider-bound payload (`model`, `prompt`, `maxTokens`) is forwarded to the provider unchanged when a healthy provider is selected. No prompt modification occurs.

---

## Scenario 2: Internal Automation Calling an Unhealthy Provider

**Buyer pain.** A nightly batch job or scheduled internal automation calls an AI provider that is degraded or returning errors. The automation continues queuing requests, accumulating cost and log noise, with no awareness that the provider is not serving requests successfully.

**Arbiter control used.** Cached provider readiness filtering via the AI Execution Service `GET /health/ready` readiness signal. Control Plane uses this signal to support routing gates as cached readiness support is completed.

**Expected execution receipt outcome.**
- `executionId` and `correlationId` present — each execution attempt is traced.
- `provider` field in the `final` event reflects the provider that fulfilled the execution, or that no execution was forwarded when all providers are unhealthy.
- `policyReason` (planned): "Primary provider skipped — cached readiness status not ready; execution held at routing layer."

**Expected policy/control reason.** Provider readiness gate fires before any execution attempt reaches the unhealthy provider. The automation receives a structured response rather than a provider error, enabling the calling system to handle it predictably.

**Estimated waste avoided concept.** Prevents token spend and provider API charges for requests that would fail before producing output. In batch workflows with high failure rates, Arbiter can target meaningful cost reduction in waste-heavy workflows.

**Arbiter control overhead/timing concept.** Readiness check is cached; Arbiter does not add a live health-check round-trip to every execution. Arbiter targets low added latency via cached, metadata-first checks. `arbiterControlLatencyMs` (planned) will surface Arbiter-only overhead in the receipt.

**Prompt privacy posture.** Arbiter does not store raw prompts by default. Execution receipts record structured metadata only.

**Provider payload pass-through posture.** When a healthy provider is available, the provider-bound payload is forwarded unchanged. When no healthy provider is available and readiness gating blocks forwarding, the payload is not forwarded to the provider.

---

## Scenario 3: App Feature Overusing a Premium Model Tier

**Buyer pain.** A product feature defaults to a top-tier model (premium pricing) for all requests, including low-risk, repetitive tasks such as classifying support categories or summarizing short inputs. The marginal quality gain from the premium tier does not justify the cost differential at scale.

**Arbiter control used.** Budget-aware routing (planned). Arbiter's routing layer, when budget and route preference controls are implemented, can direct low-risk execution requests to lower-cost execution paths based on declared risk level or route preference metadata.

**Expected execution receipt outcome.**
- `provider` and `model` fields in the `final` event confirm which execution path was used.
- `usage` reflects token consumption for the actual route.
- `policyReason` (planned): "Low-risk execution routed to cost-effective path per route preference policy."
- `costAvoided` (planned): Estimated cost differential between premium tier and actual execution path.

**Expected policy/control reason.** Route preference or risk level metadata triggers lower-cost routing for eligible requests without changing the provider-bound payload or prompt content.

**Estimated waste avoided concept.** In waste-heavy workflows where premium model overuse is systematic, Arbiter can target meaningful AI execution cost reduction by routing eligible low-risk requests to lower-cost paths.

**Arbiter control overhead/timing concept.** Routing decisions are metadata-first — Arbiter evaluates declared `routePreference` or `riskLevel` control metadata, not prompt content. This keeps the routing gate fast and in the execution hot path. `arbiterControlLatencyMs` (planned) will separate Arbiter routing overhead from provider/model latency.

**Prompt privacy posture.** Arbiter does not store raw prompts by default. Routing decisions are made on control metadata, not prompt scanning.

**Provider payload pass-through posture.** The provider-bound `prompt`, `model`, and `maxTokens` fields pass through to the selected provider unchanged. No prompt modification occurs during routing.

---

## Scenario 4: CI or Developer Workflow Triggering Duplicate Executions

**Buyer pain.** CI pipelines or local developer loops trigger the same AI execution multiple times due to test reruns, duplicate webhook triggers, or missing idempotency guards. Each execution incurs provider cost and adds noise to execution logs, making it harder to attribute spend to intentional work.

**Arbiter control used.** Correlation ID propagation for execution tracing. Clients supply a `correlationId` via the `X-Correlation-Id` request header. Arbiter propagates this value through response headers, every SSE event, and structured logs, enabling downstream deduplication and spend attribution.

**Expected execution receipt outcome.**
- `correlationId` in the `final` event matches the client-supplied value and appears in all Control Plane and AI Execution Service logs.
- `executionId` is unique per execution — duplicate runs produce distinct `executionId` values with the same `correlationId`, making duplicates identifiable in logs.
- `policyReason` (planned): Future deduplication controls may surface a reason when a duplicate is detected and blocked.

**Expected policy/control reason.** In MVP, correlation ID propagation enables post-hoc identification of duplicate executions in logs. Active deduplication at the routing layer is a planned capability.

**Estimated waste avoided concept.** Identifying duplicates through structured receipts allows teams to audit and eliminate duplicate execution patterns. Active deduplication (planned) will prevent spend on redundant calls before they reach the provider.

**Arbiter control overhead/timing concept.** Correlation ID propagation adds no token overhead and negligible coordination overhead — the value is carried through existing headers and event fields. `arbiterControlLatencyMs` (planned) will separate Arbiter coordination overhead from provider/model latency.

**Prompt privacy posture.** Arbiter does not store raw prompts by default. The `correlationId` in the receipt is a client-supplied or Arbiter-generated identifier, not prompt content.

**Provider payload pass-through posture.** The provider-bound payload passes through unchanged. Correlation tracking is an Arbiter control metadata concept, not a prompt modification.

---

## Scenario 5: Workflow Exceeding an Output Token or Estimated Cost Budget

**Buyer pain.** A document generation or long-form summarization workflow runs without an output token ceiling, consuming far more tokens than expected on a single request. Without a budget guardrail, a single runaway execution can spike costs unexpectedly.

**Arbiter control used.** `maxTokens` pass-through (MVP available) and budget hint enforcement (planned). In MVP, the client supplies `maxTokens` in the provider-bound payload; Arbiter forwards it unchanged to the provider as an output cap. Planned `budgetHint` support will allow declaring a cost ceiling as Arbiter control metadata, enforced at the routing layer before the request is forwarded.

**Expected execution receipt outcome.**
- `usage.outputTokens` in the `final` event shows actual tokens generated — confirms the cap was applied.
- `usage.totalTokens` enables the client to calculate actual execution cost against provider pricing.
- `policyReason` (planned): "Output token budget enforced; execution capped at configured limit" or "Estimated cost ceiling reached; execution not forwarded."
- `costAvoided` (planned): Estimated cost difference between uncapped and capped execution.

**Expected policy/control reason.** `maxTokens` is forwarded to the provider in MVP, where the provider applies the output cap according to provider behavior. Planned `budgetHint` enforcement adds an Arbiter-layer cost ceiling that prevents the execution from being forwarded when the estimated cost would exceed the declared budget.

**Estimated waste avoided concept.** In workflows with runaway generation risk, output token caps prevent unbounded provider spend on a single execution. Planned budget hint enforcement extends this to estimated cost ceilings before execution begins.

**Arbiter control overhead/timing concept.** `maxTokens` pass-through adds zero overhead — it is forwarded as part of the provider-bound payload. Planned `budgetHint` evaluation is metadata-first and kept local in the execution hot path. Arbiter targets low added latency for these control checks.

**Prompt privacy posture.** Arbiter does not store raw prompts by default. Token counts and cost estimates in the receipt are structured metadata, not prompt content.

**Provider payload pass-through posture.** `maxTokens` is forwarded to the provider unchanged as part of the standard pass-through. No prompt modification occurs.

---

## Scenario 6: Low-Overhead Pass-Through — Provider Payload Unchanged, Arbiter Control Latency Measured Separately

**Buyer pain.** A team evaluating Arbiter adoption is concerned that adding a firewall layer will inflate their token bill or introduce unacceptable latency overhead. They need evidence that Arbiter's control layer does not modify provider-bound payloads or add token cost, and that any latency Arbiter contributes can be measured and isolated from provider/model latency.

**Arbiter control used.** Zero token overhead default (provider payload pass-through). Arbiter forwards `prompt`, `model`, `maxTokens`, and all supported provider-specific fields unchanged to the AI Execution Service and then to the provider. No system prompt injection, context prepending, or prompt modification occurs by default.

**Expected execution receipt outcome.**
- `provider` and `model` in the `final` event match the values sent in the request — confirming the intended execution path.
- `usage.inputTokens`, `usage.outputTokens`, and `usage.totalTokens` reflect provider-reported token consumption for the unchanged payload — no Arbiter-added tokens.
- `arbiterControlLatencyMs` (planned): Will surface the time Arbiter spent in API key validation, request parsing, tenant resolution, policy evaluation, and provider readiness check — isolated from `providerLatencyMs`.
- `providerLatencyMs` (planned): Will surface provider/model time separately from Arbiter control overhead.

**Expected policy/control reason.** No policy intervention in this scenario. The pass-through posture is the Arbiter default. The receipt confirms execution proceeded without transformation.

**Estimated waste avoided concept.** This scenario establishes the zero-overhead baseline. It demonstrates that Arbiter can be adopted without changing existing prompts, model identifiers, or workflow code, and that the cost of Arbiter's control layer can be measured and separated from provider cost.

**Arbiter control overhead/timing concept.** Arbiter adds coordination steps — API key validation, request parsing, tenant resolution, policy and routing evaluation, provider readiness check, SSE event wrapping and forwarding. Arbiter targets low added latency by keeping these checks metadata-first and local or cached in the execution hot path. "Targets low added latency" is the approved claim; "no added latency" and "guaranteed latency reduction" are not supportable claims for MVP.

In MVP, `arbiterControlLatencyMs` and `providerLatencyMs` are planned receipt fields and are not yet returned. The `usage` field in the `final` event reflects token counts from the provider; timing breakdown is a planned capability tracked by the overhead measurement and low-overhead execution path work: arbiter-systems/control-plane-api#149 and #153.

**Prompt privacy posture.** Arbiter does not store raw prompts by default. Execution receipts record structured metadata: `executionId`, `correlationId`, `provider`, `model`, and token counts. No prompt content is logged in default configuration.

**Provider payload pass-through posture.** The `prompt`, `model`, `maxTokens`, and all supported provider-specific fields are forwarded to the provider unchanged. This is the default behavior. Transformation modes that would modify this posture are deferred and not in MVP scope. This default tracks arbiter-systems/control-plane-api#149, #150, and #153.

---

## Claim Language Reference

All scenario language follows [MVP Claim Guardrails](./mvp-claim-guardrails.md). Key guardrails applied:

- Cost reduction claims use "can target" and "waste-heavy workflows" — both qualifiers required.
- Latency claims use "targets low added latency" — "no added latency" and "guaranteed latency reduction" are disallowed.
- Receipt fields marked **(planned)** are not yet returned in MVP. `policyReason`, `costAvoided`, `arbiterControlLatencyMs`, and `providerLatencyMs` are planned capabilities.
- No token optimization, prompt compression, replay, billing, or compliance-suite claims are made.

## Related Docs and Issues

- [MVP Execution Gateway Integration Contract](./mvp-execution-gateway-integration-contract.md)
- [MVP Claim Guardrails](./mvp-claim-guardrails.md)
- [MVP Backend Baseline](./mvp-backend-baseline.md)
- [MVP Cost Controls](./mvp-cost-controls.md)
- Sellable MVP epic: arbiter-systems/control-plane-api#133
- Overhead measurement: arbiter-systems/control-plane-api#149
- Provider payload pass-through: arbiter-systems/control-plane-api#150
- Cached provider readiness: arbiter-systems/control-plane-api#151
- Low-overhead execution path docs: arbiter-systems/control-plane-api#153
