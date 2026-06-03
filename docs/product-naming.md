# Arbiter Product Naming Guidance

## Purpose

This document gives contributors a shared, public-safe reference for Arbiter product vocabulary. It keeps issue titles, PR summaries, docs, public copy, demos, and console labels aligned without forcing premature implementation renames.

The private source of truth is tracked in `arbiter-systems/company`:

- `product/ARBITER_PRODUCT_NAMING.md`
- `arbiter-systems/company#39`

Use this `.github` document for day-to-day contributor guidance. Update the private register first when product vocabulary changes.

## Naming policy

- Use product names in public copy, UI labels, demos, documentation, and issue titles.
- Keep internal code names stable unless they are customer-facing or actively confusing.
- Do not rename API fields, schemas, telemetry fields, or domain classes only for branding.
- Keep **Execution Receipt** as the only public `Receipt` term.
- Use **Black Box** for the evidence capture system.
- Use **Decision Record** for what Arbiter decided and why.
- Use **Surge** as an event or alert state handled by **Floodgate**, not as a standalone product feature.
- Use roadmap/future names only in roadmap sections unless already implemented.

## Category and positioning

**Category:** AI Execution Firewall

**Core promise:** Control AI before it gets expensive, risky, or out of hand.

**MVP positioning:**

> Arbiter gives development teams hard controls for AI execution: shadow mode, tripwires, redlines, floodgates, circuit breakers, black-box evidence, execution receipts, decision records, and damage reports.

**Roadmap positioning:**

> Arbiter controls AI before it gets expensive, risky, or out of hand with blast-radius previews, deadbolts, airlocks, clean rooms, kill switches, break-glass overrides, and evidence lockers.

## Official vocabulary

| Product name | Meaning | Stage | Internal equivalent |
|---|---|---|---|
| Shadow Mode | Observe what Arbiter would allow, block, route, hold, or stop before enforcing it. | MVP | shadow evaluation / simulation |
| Blast Radius | Preview what systems, data, users, tools, providers, workflows, or budgets could be affected. | Beta | impact estimator |
| Tripwire | Alert, block, hold, or escalate when a risk, cost, data, provider, or permission threshold is crossed. | MVP | policy trigger / threshold rule |
| Redline | A hard limit AI cannot cross. | MVP | budget limit / policy limit / hard deny rule |
| Deadbolt | A locked permission boundary AI cannot bypass. | Beta | restricted tool/data/action policy |
| Airlock | Hold risky actions for human review before release. | Beta | approval hold / review queue |
| Floodgate | Control surges of retries, calls, failures, tool use, tenant activity, or spend before they flood the system. | MVP | retry guard / admission control / rate-cost protection |
| Surge | Spike or alert state for retries, failures, cost, tool calls, provider calls, or tenant activity. | Supporting term | retry spike / cost spike / provider spike |
| Circuit Breaker | Stop unhealthy repeated provider or execution failures. | MVP | provider health gate / resilience breaker |
| Kill Switch | Emergency shutoff for risky AI activity. | Enterprise | manual disable / emergency stop |
| Break Glass | Controlled emergency override with reason, approver, expiration, scope, and evidence. | Enterprise | override workflow |
| Clean Room | Sensitive/private execution mode for prompts, context, files, or customer data. | Beta | prompt privacy / sensitive context handling |
| Black Box | Evidence capture system for AI execution. | MVP | traces / execution evidence |
| Execution Receipt | Proof artifact for one AI execution. | MVP | `ExecutionReceipt` |
| Decision Record | What Arbiter decided and why. | MVP | policy decision record / reason summary |
| Evidence Locker | Stored and searchable execution receipts, evidence, and damage reports. | Beta/Enterprise | receipt repository / evidence store |
| Damage Report | Plain-English incident, block, failure, or impact summary. | MVP/Beta | safe failure summary / incident summary |

## MVP vocabulary

Use these names in MVP copy, demos, console labels, and issue titles when they match the scope:

- **Shadow Mode**
- **Tripwire**
- **Redline**
- **Floodgate**
- **Circuit Breaker**
- **Black Box**
- **Execution Receipt**
- **Decision Record**
- **Damage Report**

## Beta vocabulary

Use these in roadmap or clearly marked upcoming sections unless implemented:

- **Blast Radius**
- **Deadbolt**
- **Airlock**
- **Clean Room**
- **Evidence Locker**

## Enterprise vocabulary

Use these in long-term roadmap or enterprise-control sections unless implemented:

- **Kill Switch**
- **Break Glass**
- advanced **Surge** controls
- org-wide **Evidence Locker**

## Execution Receipt section names

Use these sections inside the Execution Receipt:

| Section | Purpose |
|---|---|
| Run Summary | What happened: outcome, provider, model, route, latency, cost. |
| Final Call | Short decision headline: allowed, blocked, routed, held, stopped, or failed. |
| Decision Record | What Arbiter decided and why. |
| Controls Fired | Tripwires, redlines, floodgates, circuit breakers, deadbolts, airlocks, break-glass events. |
| Cost Impact | Estimated cost, avoided cost, surge/floodgate activity. |
| Timeline | Attempts, fallbacks, failures, stops, and final outcome. |
| Data Handling | Prompt privacy, Clean Room status, sensitive context handling. |
| Evidence | IDs, timestamps, policy version, route metadata, correlation metadata. |

## Replacement guidance

| Avoid / old term | Use |
|---|---|
| Retry Guard | Floodgate |
| Retry Circuit Breaker | Floodgate |
| Budget Guard | Redline |
| Provider Health Gate | Circuit Breaker |
| Prompt Privacy Mode | Clean Room |
| Sensitive Context Routing | Clean Room / Deadbolt depending on meaning |
| Policy Explainer | Decision Record |
| Policy Decision Viewer | Decision Record |
| Execution Trace Detail | Black Box |
| Governance Receipts | Execution Receipt / Black Box evidence |
| No-Fly Zone | Deadbolt |
| Off Limits | Deadbolt |
| After-Action Report | Damage Report |
| Evidence Bundle | Evidence Locker / export package |
| Execution Provenance Graph | Evidence Locker / future provenance view |

## Usage by surface

### Website

Use buyer-readable language and avoid overloading homepage copy with every future feature.

Good:

> Arbiter gives development teams hard controls for AI execution: shadow mode, tripwires, redlines, floodgates, circuit breakers, black-box evidence, execution receipts, decision records, and damage reports.

### Console

Use product labels for visible UI areas, but keep clarity. Recommended mappings:

| Console area | Product label |
|---|---|
| Execution Playground | Shadow Mode Playground or Execution Playground with Shadow Mode copy |
| Policy Decision Viewer | Decision Record |
| Execution Trace Detail | Black Box |
| Execution Receipt panel | Execution Receipt |
| Provider Readiness | Provider Health or Circuit Breaker Status |
| Budget Guard preview | Redlines |
| Retry/cost waste controls | Floodgate |
| Safe failure summary | Damage Report |
| Correlation/trace search | Black Box Search |

### GitHub issues

Use product names in issue titles when the issue affects product behavior, docs, demos, or UI.

Examples:

- `docs(site): explain Floodgate surge controls in public copy`
- `feat(console): add Decision Record panel to Execution Receipt view`
- `docs(product): document Black Box evidence and Execution Receipt structure`
- `feat(api): add Damage Report fields to execution summary`

### Code and APIs

Do not rename implementation symbols just for product language.

Keep stable names such as:

- `ExecutionReceipt`
- policy decision records
- provider health
- correlation IDs
- trace IDs
- middleware names
- API request/response contracts

Rename only when the existing name leaks into customer-facing output or causes confusion.

## PR summary guidance

For PRs that update product vocabulary, include:

```md
## Summary
- Added/updated Arbiter product naming guidance.
- Documented MVP, beta, and enterprise vocabulary.
- Mapped public product names to internal implementation terms.
- Clarified that code/API renames are out of scope unless customer-facing.

Refs #172
```
