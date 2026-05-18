# MVP Claim Guardrails

This doc defines the approved and disallowed language for website, README, demo, issue, PR, and sales copy during the AI Execution Firewall MVP phase. It exists so public-facing language stays accurate and credible as the platform is actively developed. All claim language should be verified against this doc before publication. Related sellable MVP epic: arbiter-systems/control-plane-api#133.

## Approved One-Liner

Arbiter is an AI Execution Firewall that helps companies control AI execution, reduce waste from failed calls and retries, enforce budget-aware routing, and produce audit-ready execution receipts without storing raw prompts by default.

## Approved MVP Claim Language

### Core Positioning

Arbiter is an AI Execution Firewall. It intercepts AI execution requests, applies policy and budget-aware routing, enforces execution guardrails, and records structured receipts. It is not a prompt optimizer, billing platform, or compliance suite.

### Cost-Reduction Language

Approved form:

> In waste-heavy workflows, Arbiter MVP can target up to 40% AI execution cost reduction by preventing unnecessary attempts, skipping unhealthy providers, enforcing budgets, and routing low-risk work to lower-cost execution paths.

The phrases "can target" and "waste-heavy workflows" must both be present. Dropping either qualifier makes the claim disallowed.

### Privacy / Prompt Storage Language

Approved form:

> Arbiter does not store raw prompts by default. Execution receipts record structured metadata. Payload logging is opt-in only and requires explicit configuration.

### Zero-Token-Overhead Default Language

Approved form:

> Arbiter is designed for zero token overhead by default because provider request payloads pass through unchanged unless explicit transformation modes are enabled.

This tracks arbiter-systems/control-plane-api#149, #150, and #153. Do not claim zero overhead when a transformation mode is active.

### Low-Latency Language

Approved form:

> Arbiter targets low added latency by keeping policy, routing, budget, and provider readiness checks metadata-first and local or cached in the execution hot path.

"Targets low added latency" is approved. "No added latency" and "guaranteed latency reduction" are disallowed. This tracks arbiter-systems/control-plane-api#151 and #153.

## Disallowed Claims

| Unsafe claim | Why it is disallowed | Approved substitute |
|---|---|---|
| "Guaranteed 40% savings" | Savings depend on workflow waste levels; no guarantee exists. | "Can target up to 40% AI execution cost reduction in waste-heavy workflows" |
| "40% token reduction guaranteed" | Arbiter does not compress tokens in MVP; payloads pass through unchanged. | Use the zero-token-overhead language above. |
| "70% token reduction in MVP" | Not a supported or measured MVP capability. | Omit or defer to a future transformation milestone. |
| "Full token optimization" | No prompt compression engine exists in MVP. | Omit entirely. |
| "Prompt compression engine" | Not implemented in MVP. | Omit entirely. |
| "No added latency" | Arbiter adds coordination steps; overhead is targeted low, not zero. | "Targets low added latency" |
| "Guaranteed latency reduction" | Latency is not guaranteed to decrease. | "Targets low added latency via cached, metadata-first checks" |
| "Full compliance suite" | Audit receipts are produced, but compliance automation is not in MVP scope. | "Produces audit-ready execution receipts" |
| "Replay engine" | Not implemented in MVP. | Omit; defer to roadmap. |
| "Billing platform" | No Stripe or billing integration exists in MVP. | Omit entirely. |
| "Semantic transactions are part of MVP" | Semantic execution primitives are deferred. | "Semantic execution primitives are roadmap items, not MVP." |

## Usage Examples

### Website Hero / Tagline

Use the approved one-liner verbatim.

### README Description

Use the approved one-liner followed by the conditional cost-reduction sentence, privacy sentence, and zero-token-overhead sentence as a short paragraph block.

### Demo / Pitch Deck

Use the conditional cost-reduction sentence. Follow it with the low-latency sentence. Do not add unsupported quantified claims.

### Issue / PR Bodies

When referencing overhead in issues or PRs, link this doc and use the approved token-overhead or latency language. Do not introduce new quantified claims without updating this doc first.

## Related Docs and Issues

- [MVP Backend Baseline](./mvp-backend-baseline.md)
- [MVP Cost Controls](./mvp-cost-controls.md)
- Sellable MVP epic: arbiter-systems/control-plane-api#133
- Overhead measurement: arbiter-systems/control-plane-api#149
- Provider payload pass-through: arbiter-systems/control-plane-api#150
- Cached provider readiness: arbiter-systems/control-plane-api#151
- Low-overhead execution path docs: arbiter-systems/control-plane-api#153