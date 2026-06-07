# Public MVP Feature Language

## Purpose

This public-safe guide is the authoritative public source for Arbiter MVP feature names and claim guardrails.

It defines how shared Arbiter documentation may reference MVP feature language without exposing private product-management, roadmap, strategy, customer, or implementation-planning details.

Private product taxonomy and PRD framing belong in private planning repositories. Public `.github` docs may use only the sanitized names and claim guardrails below.

## Public-Safe MVP Terms

| Public term | Public-safe meaning | Engineering-language bridge |
|---|---|---|
| Model Route Authority | Explains and controls provider or model route decisions. | Provider route decision metadata and routing reasons. |
| Execution Evidence Bundle | A receipt-safe summary of what Arbiter decided and observed during an execution. | Execution receipt and evidence metadata. |
| AI Waste Radar | Highlights estimated avoided waste from skipped unhealthy providers, suppressed retries, budget decisions, or lower-cost route choices where available. | Cost/waste summary fields and estimated cost avoided metadata. |
| Prompt Privacy Firewall | Describes Arbiter's metadata-first prompt privacy posture and raw prompt exclusion defaults. | Prompt privacy posture and raw prompt logging/storage defaults. |
| Sensitive Context Firewall | Describes controls that identify or route sensitive-context execution differently when implemented. | Sensitivity metadata and sensitive-context routing decisions. |
| AI Spend Circuit Breaker | Describes budget guardrails that can block or constrain execution when implemented. | Budget Guard and spend-limit decisions. |
| Provider Blast Shield | Describes provider health/readiness controls and skipped-provider behavior. | Provider Health Gate, readiness status, circuit breaker state, and skipped-provider reasons. |
| Retry Waste Suppression | Describes suppression of unnecessary retry attempts. | Retry Guard and retry suppression decisions. |
| AI Decision Explainer | Describes safe reason strings and decision summaries. | Policy, route, budget, retry, fallback, and outcome explanations. |
| AI Control Simulation | Describes recommendation-only shadow-mode analysis. | Shadow Mode Lite decision-plan metadata and recommendations. |

Use these names in product-facing docs, demo copy, issue summaries, and public-safe overview material only when the surrounding claim is accurate and bounded to implemented or explicitly planned MVP behavior.

Use engineering primitive names in code, tests, API contracts, wire protocols, configuration, and architecture details.

## Claim Guardrails

Do not claim:

- guaranteed savings or guaranteed token reduction
- billing-grade cost attribution unless billing-grade pricing is implemented
- compliance certification, audit certification, or regulatory approval
- provider marketplace, provider benchmarking, or autonomous provider procurement behavior
- replay, deterministic simulation, semantic transactions, rollback, or compensation beyond explicitly implemented Shadow Mode Lite / AI Control Simulation behavior
- raw prompt storage guarantees beyond implemented defaults and documented opt-in logging behavior
- sensitive-context routing enforcement unless the specific enforcement path is implemented

Allowed public-safe wording examples:

- Arbiter targets reduced AI execution waste in retry-heavy or provider-heavy workloads.
- Cost avoided values are estimates unless a billing-grade pricing path is explicitly implemented.
- Arbiter is metadata-first and does not store raw prompts by default.
- Shadow-mode recommendations are advisory unless explicitly promoted into enforcement.

## Documentation Rules

- Public content may use buyer-facing feature names from this guide.
- Public content must avoid private roadmap, competitive strategy, customer details, implementation sequencing, and internal issue-by-issue planning.
- Product names must not create new GitHub Project fields, labels, epics, runtime scope, or acceptance criteria by themselves.
- Code and architecture docs may keep engineering primitive names when they are clearer and more precise.
- Any public claim about savings, privacy, compliance, simulation, or provider behavior must be explicitly bounded to implemented behavior or clearly labeled as planned.

## Related Documents

- [Product naming guidance](../product-naming.md)
- [Public content policy](../public-content-policy.md)
- [Public-safe demo data policy](../security/public-safe-demo-data-policy.md)
- [Public and private documentation boundary](../public-private-documentation-boundary.md)
