# MVP Demo Smoke Test Checklist

Status: manual demo-readiness checklist  
Scope: recorded demos, hosted demos, and customer-facing walkthroughs

## Purpose

Use this checklist before any Arbiter MVP demo to catch obvious blockers across backend behavior, public site copy, console/demo fixtures, prompt privacy language, claims, secrets, and accessibility.

This checklist is not a production readiness gate. Passing it means the demo path is suitable for a controlled walkthrough, not that Arbiter is production-ready, compliant, or fully audited.

## When to run

Run this checklist before:

- recorded product demos
- hosted-demo walkthroughs
- customer discovery walkthroughs
- design partner demos
- investor or grant demo recordings
- public screenshots that show receipts, reports, provider readiness, or policy explanations

## Result levels

Use these result levels:

- **Blocker:** must pass before the demo is shown externally.
- **Recommended:** should pass when practical, but may be deferred with a note for internal-only demos.
- **Not applicable:** explicitly note why the check does not apply to the current demo path.

## Demo context

Record this before starting:

| Field | Value |
| --- | --- |
| Date |  |
| Reviewer |  |
| Demo type | recorded / hosted / customer / internal |
| Repositories/branches |  |
| Environment | local / staging / hosted demo |
| Live providers enabled? | yes / no |
| Demo fixtures used |  |
| Known deferrals |  |

## Blocker checks

### Backend behavior

- [ ] Backend validation commands for the demo branch pass.
- [ ] Control Plane starts without local configuration errors.
- [ ] AI Execution Service starts without local configuration errors.
- [ ] Health/readiness endpoints used by the demo return expected states.
- [ ] Demo execution path completes deterministically with fake/demo data.
- [ ] Error or denial scenario produces a safe, understandable failure response.
- [ ] No live provider dependency is required unless the demo plan explicitly says so.

### Public site

- [ ] Public site build passes for the branch or deployed version being shown.
- [ ] Public site navigation links used in the demo resolve.
- [ ] Visible copy does not claim production readiness.
- [ ] Visible copy does not claim formal compliance certification.
- [ ] Visible copy does not guarantee cost savings.
- [ ] Prompt privacy wording is present where raw prompt handling is discussed.

### Console and demo fixtures

- [ ] Console build passes for the branch or deployed version being shown.
- [ ] Demo mode or fixture mode is clearly distinguishable from live production behavior.
- [ ] Demo fixtures render without missing data, broken formatting, or placeholder leaks.
- [ ] Scenario selector or equivalent demo control shows the expected scenario set.
- [ ] Demo fixtures use synthetic values only.
- [ ] No customer data, real prompts, provider secrets, or production identifiers appear.

### Core MVP surfaces

- [ ] Execution Receipt example renders and communicates what happened.
- [ ] AI Waste Report example renders and distinguishes estimated/projected values from actual avoided cost.
- [ ] Provider Readiness example renders expected provider state and reason text.
- [ ] Budget Guard example shows an understandable allowed/denied or would-deny result.
- [ ] Policy explanation text is plain English and safe for screenshots.
- [ ] Correlation or execution identifiers shown in the demo are synthetic.

### Secrets and sensitive output

- [ ] No API keys, bearer tokens, auth headers, secrets, or credentials appear in UI, logs, docs, screenshots, fixtures, or terminal output.
- [ ] No raw provider payloads appear in public demo material.
- [ ] No stack traces appear in caller-facing output.
- [ ] No raw prompts appear unless the demo explicitly uses a short synthetic prompt and explains why it is safe.
- [ ] Terminal windows, browser devtools, and log output are checked before recording or screen sharing.

### Claims and positioning

- [ ] Demo describes Arbiter as an AI Execution Firewall or execution control layer.
- [ ] Cost-control language uses guarded wording such as `targets`, `estimates`, or `can reduce waste in retry-heavy workflows`.
- [ ] Demo does not claim guaranteed savings.
- [ ] Demo does not claim SOC 2, HIPAA, FedRAMP, Section 508, WCAG conformance, or other certification unless separately verified.
- [ ] Shadow/simulation language, if shown, states that shadow mode does not block, skip, reroute, suppress, or mutate execution.
- [ ] Prompt privacy language states raw prompts are not stored by default, not that Arbiter can never receive prompts.

### Accessibility spot check

- [ ] Demo path can be completed with keyboard navigation for the visible interactions being shown.
- [ ] Focus states are visible during keyboard navigation.
- [ ] Main headings appear in a logical order.
- [ ] Status indicators do not rely on color alone.
- [ ] Charts or report visuals have text summaries or data tables where practical.
- [ ] Receipt/report copy is readable when copied or exported.

## Recommended checks

### Browser and display readiness

- [ ] Browser zoom level is appropriate for recording or screen sharing.
- [ ] Browser extensions and personal bookmarks are hidden if needed.
- [ ] Notifications are disabled.
- [ ] Demo accounts and labels use synthetic names.
- [ ] Window size matches the target recording/demo format.

### Narrative readiness

- [ ] Demo script has a before/after path: without Arbiter vs with Arbiter.
- [ ] Demo shows a cost, reliability, governance, or privacy problem before showing the Arbiter control.
- [ ] Demo ends with an Execution Receipt or equivalent evidence surface.
- [ ] Known limitations are documented for internal reference.

### Cross-surface consistency

- [ ] Public site terminology matches console terminology.
- [ ] Console terminology matches GitHub issue/product taxonomy where visible.
- [ ] Docs linked during the demo use current MVP positioning.
- [ ] Screenshots and examples match the current scenario pack.

### Recovery plan

- [ ] A fallback static screenshot or local recording exists for high-risk demos.
- [ ] A known-good branch or deployment is identified.
- [ ] The reviewer knows which scenarios to avoid if a known deferral exists.

## Live provider exception

The default demo path should use fake or deterministic providers.

Live providers may be used only when all of the following are true:

- [ ] The demo plan explicitly requires live provider behavior.
- [ ] Provider credentials are loaded through approved local or hosted-demo secret handling.
- [ ] No provider credentials are shown in the UI, logs, terminal, screenshots, or recording.
- [ ] The prompt is synthetic and non-sensitive.
- [ ] A fallback deterministic demo path is available.

## Demo signoff

| Check | Result | Notes |
| --- | --- | --- |
| Blocker checks complete | pass / fail |  |
| Recommended checks reviewed | pass / partial / skipped |  |
| Known deferrals acceptable | yes / no |  |
| Demo approved for audience | yes / no |  |

## Follow-up handling

If a blocker fails, do not proceed with an external demo. Create or update a focused issue in the relevant repo and include:

- failed checklist item
- affected demo surface
- branch or deployment
- expected behavior
- observed behavior
- screenshots or logs with secrets removed
- whether the failure blocks local demo, hosted demo, or customer-facing demo
