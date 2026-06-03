# Public-Safe Demo Data Policy

## Purpose

This policy defines how Arbiter demo data, fixtures, screenshots, documentation examples, site examples, and console demo-mode content must be prepared so public artifacts remain clearly synthetic and cannot expose customer, production, or real provider-derived data.

## Scope

This policy applies to public and demo artifacts, including:

- demo receipts
- Execution Evidence Bundle examples
- execution examples
- AI Waste Radar examples
- Provider Blast Shield / Model Route Authority examples
- Prompt Privacy Firewall proof examples
- AI Control Simulation / Shadow Mode Lite recommendations
- provider readiness examples
- screenshots
- documentation pages
- public site pages
- console demo-mode content/configuration

## Policy Statement

All public and demo data must be safe by default, clearly synthetic, and not derived from customer, production, or real provider data.

## Product-Language Demo Safety

Public demos may use sanitized terms from [Public MVP Feature Language](../product/public-mvp-feature-language.md) when the examples are clearly synthetic and the claims are bounded.

Demo examples must not imply:

- guaranteed savings or billing-grade cost attribution from AI Waste Radar examples
- compliance certification from Execution Evidence Bundle examples
- provider marketplace or benchmarking behavior from Model Route Authority examples
- prompt storage guarantees beyond implemented defaults from Prompt Privacy Firewall examples
- sensitive-context enforcement unless the specific enforcement path is implemented
- enforcement behavior from AI Control Simulation / Shadow Mode Lite recommendations unless enforcement is explicitly enabled

## Prohibited Demo Content

Do not publish demo artifacts containing:

| Prohibited content | Rule |
|---|---|
| Real customer names | Use synthetic organization, user, and account names only. |
| Real provider API keys or tokens | Never include real keys, tokens, auth headers, or credential fragments. |
| Real user prompts | Use fabricated prompts written for demo use only. |
| Raw provider payloads from real requests | Do not publish raw request or response bodies from real provider traffic. |
| Realistic-looking secrets or credentials | Avoid examples that could be mistaken for live secrets. Use clearly fake placeholders. |
| Real execution IDs or correlation IDs that map to live requests | Use IDs with obvious demo prefixes, not live request identifiers. |
| Unblurred or unredacted PII in screenshots | Redact or blur personal data before publishing screenshots. |
| Sensitive internal roadmap details | Keep private sequencing, moat, strategy, customer, sales, and implementation-planning details out of public demo artifacts. |

## Required Demo Data Properties

Safe fixture and demo data must:

- Use clearly synthetic names and IDs.
- Use fake or example-only provider names.
- Use plausible but fabricated cost figures.
- Mark cost avoided or waste values as estimated unless billing-grade pricing is explicitly implemented.
- Use execution IDs and correlation IDs that are obviously fake, such as `demo-...` or `example-...`.
- Mark fixture files with a header comment or metadata field indicating synthetic/demo origin.
- Avoid values that resemble real credentials, customer identifiers, production account IDs, or live request IDs.
- Be reviewable without access to customer data, production systems, private links, or internal-only records.
- Keep AI Control Simulation recommendations visibly advisory unless the demo explicitly shows an implemented enforcement path.

## Demo vs. Production Data Distinction

Demo data must have no relationship to customer data.

Demo data may not be derived from, sampled from, transformed from, reconstructed from, or reverse-engineered from real requests or real provider responses.

Production logs, provider payloads, execution receipts, screenshots, prompts, traces, and cost records must not be converted into public demo fixtures.

## Pre-Publication Review Checklist

Before committing or publishing any demo artifact:

1. Confirm there are no real secrets, tokens, API keys, auth headers, or credential fragments.
2. Confirm there are no real execution IDs, correlation IDs, account IDs, tenant IDs, or request IDs.
3. Confirm there are no real user prompts.
4. Confirm there are no real provider request or response payloads.
5. Confirm screenshots are redacted or blurred when needed.
6. Confirm fixture files include a synthetic/demo marker.
7. Confirm cost/waste examples are labeled as estimated when not billing-grade.
8. Confirm shadow-mode / AI Control Simulation examples are labeled recommendation-only unless enforcement is implemented.
9. Confirm there are no internal-only roadmap details, private architecture planning, competitive strategy, private links, customer data, or internal admin material.

## Non-Goals

This policy does not define:

- production data retention policy
- customer data processing agreement
- legal policy page
- runtime enforcement
- CI checks
- full compliance program

## Related Documents

- [Public MVP Feature Language](../product/public-mvp-feature-language.md)
- [Controlled file policy](../operations/controlled-file-policy.md)
- [GitHub security baseline matrix](../operations/github-security-baseline-matrix.md)
