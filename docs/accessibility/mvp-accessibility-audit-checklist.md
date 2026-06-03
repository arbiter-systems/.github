# MVP Accessibility Audit Checklist

Status: manual MVP accessibility checklist  
Scope: Arbiter public site, console, docs, tables, charts, timelines, receipts, and reports

## Purpose

Use this checklist before hosted demos, customer pilots, and public screenshots to catch accessibility issues in MVP surfaces that explain AI execution control, cost control, governance receipts, provider readiness, and policy decisions.

This checklist is not a certification, VPAT, accessibility conformance report, or legal compliance claim. It is a practical readiness checklist for MVP review.

## Result levels

Use these result levels:

- **Blocker:** must pass before a hosted demo or customer-facing walkthrough.
- **Recommended:** should pass before public demo material, but may be deferred with an issue.
- **Future automated check:** should eventually be covered by tooling, but remains manual until automation exists.
- **Not applicable:** explicitly note why the check does not apply to the reviewed surface.

## Audit context

| Field | Value |
| --- | --- |
| Date |  |
| Reviewer |  |
| Surface reviewed | public site / console / docs / report / receipt / chart / table |
| Branch or deployment |  |
| Browser and OS |  |
| Assistive technology used, if any |  |
| Known deferrals |  |

## Blocker checks

### Keyboard navigation

- [ ] All interactive controls in the reviewed path are reachable by keyboard.
- [ ] Keyboard focus follows a logical visual order.
- [ ] No keyboard trap exists in menus, dialogs, filters, tables, or scenario selectors.
- [ ] Modals or overlays can be dismissed with keyboard controls.
- [ ] Primary demo path can be completed without a mouse.

### Focus states

- [ ] Focus indicators are visible on links, buttons, form fields, table controls, tabs, menus, and cards with actions.
- [ ] Focus indicators are not hidden by custom styling.
- [ ] Focus remains visible against the surrounding background.
- [ ] Disabled controls do not receive focus unless intentionally explained.

### Headings and page structure

- [ ] Each page or view has a clear main heading.
- [ ] Heading levels are nested logically.
- [ ] Repeated cards or panels use headings or labels that make sense out of visual context.
- [ ] Docs pages use predictable heading order.
- [ ] Receipt and report sections have descriptive headings.

### Landmarks and semantic structure

- [ ] Main content, navigation, and footer regions are identifiable through semantic markup or landmarks.
- [ ] Repeated navigation is consistent across pages.
- [ ] Interactive elements use buttons or links according to behavior.
- [ ] Clickable cards have accessible names and expected keyboard behavior.
- [ ] Status regions that update during execution are understandable without relying only on visual layout.

### Color and contrast

- [ ] Text has sufficient contrast against its background.
- [ ] Small text, muted labels, badges, and helper text remain readable.
- [ ] Focus outlines have sufficient contrast.
- [ ] Error, warning, success, provider-readiness, and policy-decision states do not rely on color alone.
- [ ] Charts and status badges use text labels, icons, patterns, or nearby explanations in addition to color.

### Labels, descriptions, and forms

- [ ] Every form field has a visible label or accessible name.
- [ ] Required fields are identified without relying only on color.
- [ ] Field descriptions and constraints are associated with the related input.
- [ ] Error messages identify the field and how to fix the issue.
- [ ] Filters and scenario selectors have descriptive names.

### Error message association

- [ ] Error text is placed near the related field or control.
- [ ] Error messages are announced or discoverable by assistive technology.
- [ ] Error copy is specific and actionable.
- [ ] Generic failure messages avoid exposing secrets, stack traces, provider payloads, or raw prompts.
- [ ] Policy denial or budget denial messages explain the reason in plain language.

## Surface-specific checks

### Sortable and filterable tables

- [ ] Tables use column headers that describe the data.
- [ ] Sortable columns expose current sort state in text or accessible metadata.
- [ ] Table filters have clear labels.
- [ ] Empty table states explain what is missing and what to do next.
- [ ] Long values such as trace IDs, provider IDs, or policy codes can be copied or inspected without breaking layout.

### Charts and AI Waste Report visuals

- [ ] Each chart has a text summary of its main point.
- [ ] Data shown in charts is also available in a table, list, tooltip with keyboard access, or adjacent text summary.
- [ ] Cost savings language distinguishes estimated/projected values from actual avoided cost.
- [ ] Chart legends do not rely on color alone.
- [ ] Units such as dollars, tokens, attempts, or percentages are visible in text.

### Timelines and execution flows

- [ ] Timeline steps are presented in chronological order in the DOM or text alternative.
- [ ] Current, completed, skipped, failed, and denied states are represented by text, not color alone.
- [ ] Provider fallback or retry suppression steps can be understood without animation.
- [ ] Timeline details are reachable by keyboard.
- [ ] Long execution-step labels wrap or truncate without losing essential meaning.

### Execution Receipts

- [ ] Receipt sections have clear labels such as decision, provider, cost, policy, privacy, and outcome.
- [ ] Receipt copy can be copied/exported in a readable order.
- [ ] Prompt privacy proof is stated in plain language.
- [ ] Sensitive values are redacted or omitted.
- [ ] Correlation IDs and execution IDs are labeled as identifiers and are not confused with secrets.

### Provider Readiness and status indicators

- [ ] Provider readiness states include text labels such as ready, degraded, skipped, or unavailable.
- [ ] Provider health reasons are readable without hovering.
- [ ] Circuit/budget/policy states do not rely on color alone.
- [ ] State transitions are understandable if animation is disabled.
- [ ] Provider names and model names are readable at the target demo viewport.

### Documentation pages

- [ ] Markdown headings are ordered logically.
- [ ] Links have descriptive text.
- [ ] Tables have headers.
- [ ] Code blocks are not the only place where important guidance appears.
- [ ] Images or diagrams have adjacent text summaries.

## Recommended checks

### Reduced motion

- [ ] Motion-heavy transitions are not required to understand state changes.
- [ ] Animations respect reduced-motion preferences where implemented.
- [ ] Progress indicators have text alternatives.
- [ ] Loading states do not flash rapidly.

### Loading and empty states

- [ ] Loading states include text, not only spinners.
- [ ] Empty states explain whether no data exists, filters removed results, or data failed to load.
- [ ] Error states provide a next step.
- [ ] Skeleton states do not permanently obscure content.

### Copy and readability

- [ ] Sentences are concise and understandable without deep implementation knowledge.
- [ ] Acronyms such as SSE, NDJSON, SDK, or CI are expanded or avoided in buyer-facing surfaces.
- [ ] Receipt/report copy is readable when pasted into plain text.
- [ ] Demo copy avoids ambiguous claims about compliance, production readiness, or guaranteed savings.

## Future automated checks

Consider adding automation later for:

- [ ] HTML validation.
- [ ] Basic axe or equivalent accessibility scans for public pages.
- [ ] Link checks for documentation.
- [ ] Contrast checks for design tokens.
- [ ] Keyboard smoke tests for primary demo paths.
- [ ] Snapshot checks for missing accessible names on critical controls.

Automation should complement this checklist, not replace manual review of charts, timelines, receipts, reports, and plain-language explanations.

## Signoff

| Check | Result | Notes |
| --- | --- | --- |
| Blocker checks complete | pass / fail |  |
| Public site reviewed | yes / no / n/a |  |
| Console reviewed | yes / no / n/a |  |
| Docs reviewed | yes / no / n/a |  |
| Receipts/reports reviewed | yes / no / n/a |  |
| Deferrals captured as issues | yes / no / n/a |  |
| Approved for hosted demo/customer pilot | yes / no |  |

## Follow-up handling

For each failed blocker or important recommended check, create or update a focused issue in the affected repo. Include:

- affected surface
- branch or deployment
- failed checklist item
- expected accessible behavior
- observed behavior
- screenshots or short screen recording if safe
- whether the issue blocks hosted demo, customer pilot, or public screenshot use
