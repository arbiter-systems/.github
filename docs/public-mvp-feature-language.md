# Public MVP Feature Language

This document keeps Arbiter Systems public MVP feature language bounded, consistent, and separate from internal implementation details.

It is a product-language guide, not an implementation specification, compliance claim, or release guarantee.

## Public-safe feature terms

| Public term | Public-safe meaning | Engineering-language bridge |
| --- | --- | --- |
| AI Execution Firewall | A layer for routing, observing, and governing AI execution before or during execution, depending on the control. | Control Plane policy checks, provider routing, telemetry, and receipts. |
| Shadow Mode | Evaluates governance decisions without blocking execution. | Tenant enforcement mode and non-blocking policy outcomes. |
| Execution Receipt | Records what happened during an AI execution in a reviewable artifact. | Execution trace, terminal event, provider/model metadata, and policy result. |
| Turnstile | Keeps AI traffic on approved provider/model routes before execution. | Provider/model route policy, allow/deny decisions, and route decision metadata. |

## Turnstile

### Definition

**Turnstile** is the public MVP name for provider/model route governance before execution.

Use Turnstile when describing whether an AI execution is evaluated against approved provider/model routes before provider work begins.

### Approved route meaning

An **approved route** means a provider/model route allowed by configured route policy. It does not mean manual approval by a human workflow, legal approval, compliance certification, procurement approval, or security accreditation.

### Shadow Mode and enforcement language

Use mode-aware language:

- In **Shadow Mode**, Turnstile can evaluate route decisions without blocking execution.
- In enforcement mode, Turnstile can deny unapproved provider/model routes before execution.

Avoid implying that every Turnstile use always blocks execution.

### Evidence language

Public-safe Turnstile evidence may mention these fields when available:

- requested provider/model
- selected provider/model
- allowed or denied route outcome
- stable route reason code
- evaluated route candidates
- fallback, skipped-provider, or no-approved-route evidence

Do not describe this evidence as complete compliance coverage, legal audit coverage, or billing-grade savings proof.

## Allowed public claims

Turnstile may describe:

- keeping AI traffic on approved provider/model routes
- evaluating provider/model route decisions before execution
- showing route decisions in receipts, console views, or public-safe docs
- helping teams keep production AI workflows aligned with configured model/provider route policy

## Conditional claims

Use these only when the surrounding copy makes the mode clear:

- Turnstile can deny unapproved provider/model routes before execution.
- Turnstile can flag unapproved provider/model routes in Shadow Mode without blocking execution.
- Turnstile can show why a route was allowed, denied, skipped, or redirected when that evidence is available.

## Claims to avoid

Turnstile must not imply:

- tool-call governance
- human approval workflows
- compliance certification
- guaranteed savings
- post-execution side-effect governance
- full agent permission management
- identity and access management
- procurement approval or vendor-risk approval
- legal or regulatory approval

Turnstile is not a policy editor, identity system, compliance approval system, tool-call firewall, or full agent permission framework.

## Suggested copy

### Conservative

> **Turnstile** evaluates whether AI executions use approved provider/model routes.

### MVP-safe

> **Turnstile** keeps AI traffic on approved provider/model routes before execution.

### Enforcement-specific

Use only when enforcement mode is clearly in scope:

> **Turnstile** can deny unapproved provider/model routes before execution.

### Avoid

> Turnstile guarantees only compliant AI models run.

> Turnstile approves every AI action before it happens.

> Turnstile certifies production AI workflows.

## Placement guidance

Good public-site placements:

- homepage feature card
- AI Execution Firewall section
- MVP capabilities list
- public roadmap capability list

Avoid for MVP:

- standalone Turnstile product page
- security or compliance certification page
- guaranteed savings claim page
- broad agent-safety platform framing

## Downstream use

Use this guide as the source of truth for bounded public Turnstile copy in `arbiter-systems/arbiter-site#322`.

Future console or receipt copy should align with this guide while preserving precise engineering language in implementation docs.

## Related issues

- `arbiter-systems/.github#224` — shared Turnstile public MVP feature language
- `arbiter-systems/control-plane-api#671` — related Turnstile epic
- `arbiter-systems/arbiter-site#322` — downstream public-site copy
- `arbiter-systems/arbiter-console#253` — downstream console decision visibility
