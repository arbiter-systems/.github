# Product Content Style Guide

## Purpose and Scope

Use this guide for public site copy, console copy, README/docs, GitHub issues and PRs, pitch materials, and demo materials. Treat it as a language and style reference, not a legal policy and not a runtime enforcement mechanism.

## Product Framing

Approved one-liner:

Arbiter is an AI Execution Firewall that helps companies control AI execution, reduce waste from failed calls and retries, enforce budget-aware routing, and produce audit-ready execution receipts without storing raw prompts by default.

Use these core anchors consistently:

- AI Execution Firewall
- Cost Control
- Governance Receipts
- Prompt Privacy

Use a metadata-first privacy posture in copy. Do not imply a full compliance platform, replay engine, billing system, marketplace, or advanced analytics if those capabilities are not implemented.

## Preferred Terms

| Preferred term | Discouraged variant | Why |
|---|---|---|
| AI Execution Firewall | AI gateway | Preserves Arbiter's execution-control positioning. |
| execution receipt / governance receipt | audit log dump | Emphasizes structured governance records over raw logs. |
| cost avoided | guaranteed savings | Avoids overclaiming and keeps outcomes conditional. |
| metadata-first privacy | complete data isolation | Describes the actual default posture without absolute claims. |
| provider health gate | provider failover magic | States concrete control behavior. |
| budget guard | spend elimination | Conveys bounded controls, not guaranteed outcomes. |
| retry guard | unlimited retry safety | Reflects enforced attempt controls. |
| route control | automatic best route always | Avoids deterministic performance claims. |
| AI waste / AI Waste Report | guaranteed customer savings report | Keeps framing on synthetic or verified examples and avoids unverified outcome claims. |

## Terms and Claims to Avoid

For canonical claim constraints, defer to [MVP claim guardrails](../operations/mvp-claim-guardrails.md).

| Avoid | Reason | Approved substitute |
|---|---|---|
| Guaranteed 40% savings | MVP guidance requires qualified savings language. | Can target up to 40% AI execution cost reduction in waste-heavy workflows. |
| Guaranteed 40% token reduction | Arbiter MVP is not a token compression engine. | Zero token overhead by default language from guardrails. |
| No added latency | Absolute latency claims are not supported. | Targets low added latency. |
| Full compliance suite | Not MVP scope. | Audit-ready execution receipts for governance workflows. |
| SOC 2 compliant/certified | Certification claims require formal legal/compliance basis. | Supports audit-readiness and execution record review. |
| HIPAA/PCI/ISO certified | Same certification overclaim risk. | Governance support and explainability wording only. |

## Cost-Reduction Wording

Use conditional framing. Approved pattern:

In waste-heavy workflows, Arbiter MVP can target up to 40% AI execution cost reduction by preventing unnecessary attempts, skipping unhealthy providers, enforcing budgets, and routing low-risk work to lower-cost execution paths.

Always include both qualifiers: `can target` and `waste-heavy workflows`. Do not claim guaranteed savings. Do not claim guaranteed 40% token reduction. Frame outcomes as workload-dependent, especially in retry-heavy, provider-heavy, or poorly routed execution paths.

If the numeric claim changes, treat [MVP claim guardrails](../operations/mvp-claim-guardrails.md) as the canonical source and update this guide to match.

## Zero-Token-Overhead Wording

Approved form:

Arbiter is designed for zero token overhead by default because provider request payloads pass through unchanged unless explicit transformation modes are enabled.

Do not claim guaranteed token reduction. Do not claim zero overhead when a transformation mode is active.

## Low-Latency Wording

Approved form:

Arbiter targets low added latency by keeping policy, routing, budget, and provider readiness checks metadata-first and local or cached in the execution hot path.

Use "targets low added latency via cached, metadata-first checks" as the short safe variant. Do not claim no added latency or guaranteed latency reduction.

## Prompt Privacy Wording

Use metadata-first privacy language. State that raw prompts are not stored by default. State that payload logging is opt-in only and requires explicit configuration. Do not imply absolute privacy, legal privilege, compliance certification, or universal data-loss prevention.

## Governance Receipt Wording

Use language that execution receipts are audit-ready records supporting explainability, review, and governance workflows. Do not position receipts as a compliance suite. Do not claim SOC 2, HIPAA, PCI, ISO, or other certification support.

"Governance Receipts" is the positioning anchor. "Execution receipt" is acceptable when referring to the concrete artifact or record.

## Demo-Safe Phrasing

Use demo language that is clearly synthetic, public-safe, and non-customer-specific. Align all examples and screenshots with [Public-safe demo data policy](../security/public-safe-demo-data-policy.md). Do not claim demo outputs represent real customer results unless separately verified and explicitly approved.

## Compliance Claim Restrictions

Do not claim SOC 2, HIPAA, PCI, ISO, audit certification, or compliance-certified status in product copy, docs, issues, PRs, or demos.

Use approved substitutes:

- audit-ready execution receipts
- governance support for review workflows
- explainability through structured execution records

## Usage Examples

Website hero/tagline:
AI Execution Firewall for cost control, governance receipts, and metadata-first prompt privacy.

README description:
Arbiter is an AI Execution Firewall for controlled, budget-aware AI execution, with audit-ready receipts and metadata-first privacy defaults.

Console empty-state copy:
No executions yet. Start an execution to generate your first receipt.

Demo disclaimer copy:
Demo content is synthetic, public-safe, and non-customer-specific.

Issue/PR body reference:
Claim wording follows MVP guardrails; use qualified language for savings and avoid compliance-certification claims.

Pitch deck bullet:
In waste-heavy workflows, Arbiter can target lower AI execution waste through retry guards, provider health gates, and route control.

## Non-Goals

- legal policy
- compliance certification
- runtime enforcement
- CI/linting
- branding overhaul
- visual identity changes

## Related Documents

- [MVP claim guardrails](../operations/mvp-claim-guardrails.md)
- [Public-safe demo data policy](../security/public-safe-demo-data-policy.md)
- [MVP cost controls](../operations/mvp-cost-controls.md)
