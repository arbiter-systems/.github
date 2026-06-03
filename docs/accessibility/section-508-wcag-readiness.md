# Section 508 and WCAG Readiness Guide

Status: lightweight accessibility readiness guidance  
Scope: public site, console, documentation, receipts, reports, charts, tables, timelines, forms, and exported content

## Current posture

Arbiter Systems is **not claiming formal Section 508 compliance, WCAG conformance, VPAT coverage, ACR publication, or full accessibility certification**.

This guide defines practical accessibility defaults for MVP work so public pages, console views, docs, and demo surfaces are easier to review and improve before hosted demos and customer pilots.

## Target baseline

Use **WCAG 2.2 AA where practical** as the working design and review baseline.

This target is an internal engineering and review baseline, not a public compliance claim. Any public claim about conformance requires a real audit and explicit approval.

## Section 508 readiness posture

Section 508 readiness means Arbiter should:

- build with accessible defaults early
- avoid obvious barriers in site and console surfaces
- keep docs readable and navigable
- ensure reports and receipts can be copied/exported in a logical text order
- avoid relying only on color, animation, or visual layout to communicate execution state
- maintain a checklist of gaps before government, enterprise, or accessibility-sensitive customer discussions

It does not mean Arbiter has completed a formal Section 508 assessment.

## Approved public wording

Allowed wording:

- Arbiter is building accessibility into MVP design and review.
- Arbiter uses WCAG 2.2 AA as a practical design target where feasible.
- Arbiter tracks accessibility readiness for site, console, docs, receipts, and reports.
- Arbiter has not completed a formal accessibility audit yet.

## Wording to avoid

Do not say:

- Arbiter is Section 508 compliant.
- Arbiter is WCAG certified.
- Arbiter is fully accessible.
- Arbiter has a published VPAT or ACR unless one exists.
- Arbiter meets all accessibility requirements.
- Arbiter is legally compliant for accessibility without review.

## Public site requirements

Public site pages should:

- use one clear `h1` per page
- maintain logical heading order
- use descriptive link text
- keep buttons and links semantically correct
- provide sufficient text contrast
- support keyboard navigation for interactive elements
- keep focus states visible
- avoid motion that is required to understand content
- include text summaries for diagrams or screenshots
- avoid tables for layout-only content
- use plain language for claims and disclaimers

## Console page requirements

Console pages should:

- expose primary navigation through keyboard controls
- keep focus order aligned with visual order
- label filters, selectors, toggles, tabs, and buttons
- make disabled, loading, empty, error, and success states understandable in text
- avoid color-only state labels
- make policy, budget, provider, and execution outcomes readable without hover-only interactions
- keep execution IDs, trace IDs, provider names, and policy codes copyable where useful
- avoid hidden critical details in tooltips that keyboard users cannot access

## Sortable table requirements

Tables should:

- use headers for columns and rows where appropriate
- expose sort state in visible text or accessible metadata
- label filters and search inputs
- preserve readable order when copied
- avoid truncating critical values without a way to inspect or copy them
- make empty states explicit
- make error states actionable

Examples of tables likely to need this treatment:

- Provider Readiness tables
- execution history tables
- policy decision tables
- AI Waste Report breakdown tables
- cost or budget summary tables

## Charts and visual metrics

Charts and visual metrics should:

- include a text summary of the main insight
- provide data in a table, list, or adjacent text summary where practical
- identify units such as dollars, tokens, attempts, latency, or percentages
- avoid color-only legends
- explain projected vs actual values in text
- keep metric cards readable at demo viewport sizes

AI Waste Report examples must distinguish estimated/projected avoidable cost from actual avoided cost.

## Timelines and status indicators

Timelines should:

- present events in logical chronological order
- label each step in text
- describe skipped, denied, failed, routed, retried, suppressed, and completed states without relying only on color
- remain understandable if animation is disabled
- avoid requiring hover to discover critical details

Status indicators should combine color with text, icons, labels, or adjacent explanations.

## Forms, inputs, errors, empty states, and loading states

Forms should:

- use visible labels or clear accessible names
- identify required fields in text
- associate helper text and error messages with fields
- make validation messages specific and actionable
- avoid exposing secrets, stack traces, raw prompts, or provider payloads in errors

Empty states should explain:

- whether no data exists
- whether filters removed results
- whether data failed to load
- what the user can do next

Loading states should include text, not only spinners or skeletons.

## Receipts and reports

Execution Receipts, AI Waste Reports, and exported/copied report content should:

- use clear section labels
- preserve a readable order outside the visual UI
- identify mode, decision, provider, policy, budget, outcome, cost, and privacy fields in text
- keep projected values distinct from actual values
- avoid raw prompts, provider payloads, secrets, auth headers, bearer tokens, and stack traces
- make identifiers copyable without implying they are secrets

## Documentation requirements

Docs should:

- use clear heading structure
- use descriptive link text
- include table headers
- avoid relying only on images or diagrams
- keep important warnings outside code blocks as normal text too
- avoid public overclaims about production readiness, compliance, privacy, or cost savings

## Review checklist for agents and humans

Before approving public or console-facing changes, reviewers should ask:

- Can the primary path be completed with keyboard navigation?
- Are focus states visible?
- Are status and policy outcomes understandable without color alone?
- Are charts summarized in text?
- Are tables readable and labeled?
- Are forms and errors associated with the right fields?
- Can receipts and reports be copied/exported in a readable way?
- Does the copy avoid formal accessibility claims?

## Non-goals

This guide does not implement:

- formal accessibility certification
- VPAT or ACR publication
- legal compliance claim
- full audit
- runtime UI changes
- automated accessibility CI
- remediation work

## Relationship to the MVP accessibility checklist

Use this guide as the baseline policy. Use `docs/accessibility/mvp-accessibility-audit-checklist.md` as the repeatable manual review checklist before hosted demos, customer pilots, and public screenshots.
