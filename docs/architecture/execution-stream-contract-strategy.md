# Execution Stream Contract Strategy

Status: MVP coordination guidance  
Scope: Documentation-only coordination strategy for execution stream contract alignment

## Purpose

This document defines cross-repo coordination guidance for Arbiter's execution stream contract schema expectations and deterministic fixture categories. Its goal is to prevent drift between `control-plane-api` and `ai-execution-service` as the MVP adds execution receipts, outcome classification, provider adapters, policy explanations, and cost/waste metadata.

This strategy is coordination guidance only. It does not create schema files, fixture files, validation scripts, runtime behavior, transport changes, or a new ownership model for service contract artifacts.

Per [cross-repo-authority-map.md](../cross-repo-authority-map.md), `.github` owns shared operating guidance, label taxonomy, GitHub Project field hydration docs, and issue lane policy. It does not own service contracts. Implemented API contracts, executable schemas, fixtures, and contract tests belong in the implementation repositories that own the relevant runtime behavior.

## Related issues

- [arbiter-systems/control-plane-api#240](https://github.com/arbiter-systems/control-plane-api/issues/240) — execution API and SSE contract snapshots
- [arbiter-systems/control-plane-api#310](https://github.com/arbiter-systems/control-plane-api/issues/310) — minimal execution API schema reference
- [arbiter-systems/control-plane-api#433](https://github.com/arbiter-systems/control-plane-api/issues/433) — application event envelope for lifecycle events
- [arbiter-systems/ai-execution-service#78](https://github.com/arbiter-systems/ai-execution-service/issues/78) — provider failure normalization contract
- [arbiter-systems/.github#161](https://github.com/arbiter-systems/.github/issues/161) — this coordination issue

## Transport boundary

Arbiter has two separate stream boundaries:

1. **Internal service-to-service stream:** `application/x-ndjson` from `ai-execution-service` to `control-plane-api`.
2. **External caller-facing stream:** `text/event-stream` emitted by `control-plane-api` to callers.

The internal NDJSON contract is the shared execution event contract between services. The external SSE stream is an API transport owned by the Control Plane.

The AI Execution Service must not own caller-facing SSE semantics. It emits normalized NDJSON events only. The Control Plane adapts those internal events into external SSE events, applies caller-facing error mapping, and owns any API-specific stream presentation rules.

## Ownership and source-of-truth boundaries

For the MVP, `.github` is the coordination home for cross-repo contract strategy only. It is not the canonical owner of executable schema files, deterministic fixture files, implemented service contracts, runtime validators, or contract tests.

Expected ownership model:

- `.github` owns coordination guidance, cross-repo naming/versioning expectations, fixture category expectations, privacy constraints, and issue-linking guidance.
- `control-plane-api` owns caller-facing SSE behavior, Control Plane validation and translation behavior, receipt/outcome derivation from normalized events, and its own contract tests or fixtures for those behaviors.
- `ai-execution-service` owns internal NDJSON emission behavior, provider-normalized event shape, sequence monotonicity, terminal event guarantees, and its own contract tests or fixtures for those behaviors.

If concrete schema files, fixture files, or validation scripts are added later, the follow-up implementation issue must place them in the repo that owns the implemented behavior unless a separate authority-map change is intentionally reviewed and approved.

Cross-repo reuse is still allowed. A service repo may consume generated snapshots, copied fixtures, or shared examples from another repo when an explicit drift check or review workflow protects the copy. Duplicated schema or fixture files without validation are not considered authoritative.

## Protocol versioning

Execution stream events should include a stable `protocolVersion` field where a stream contract version is required.

MVP guidance:

- Use a string value, such as `"1.0"`.
- Treat the first component as the major compatibility version.
- Treat the second component as the minor additive version.
- Do not introduce patch-level protocol semantics unless a future issue explicitly defines them.
- Keep field names camelCase and transport-neutral.
- Do not encode transport names such as `sse` or `ndjson` into event field names unless the field specifically describes a transport boundary.

Compatible additive changes may keep the same major version. Breaking changes require either a new major version or an explicit migration issue that defines rollout, compatibility, and validation behavior.

## Additive and breaking change rules

Additive changes include:

- optional fields that old consumers can ignore
- new metadata fields under existing metadata objects
- new safe policy explanation fields
- new cost/waste metadata fields
- new event types only when older consumers have an explicit ignore strategy
- additional provider-normalized metadata that does not change existing event meaning

Breaking changes include:

- removing a required field
- renaming an existing field
- changing the meaning of `token`, `final`, or `error` events
- changing terminal event guarantees
- changing event ordering requirements
- changing sequence monotonicity rules
- allowing events after a terminal event
- making an optional field required without a migration plan
- changing error normalization in a way that breaks outcome classification or receipt derivation

## Event and terminal rules

Valid streams must have explicit terminal behavior.

MVP target rules:

- Every valid stream ends with exactly one terminal event.
- Terminal events are `final` or `error`.
- No event may appear after a terminal event.
- Token events must not be empty unless a future issue defines a separate heartbeat or keepalive event.
- Sequence values, when present, must be monotonic and must not regress.
- Missing required fields are invalid.
- Malformed JSON lines are invalid.

The Control Plane may map invalid internal streams into safe external failures, but that mapping must not redefine the internal contract.

## Fixture strategy

Fixtures should be deterministic, small, and safe for public repositories. This document defines expected fixture categories only; it does not implement fixture files or assign `.github` ownership over executable fixtures.

Target valid fixture categories:

| Fixture category | Purpose |
| --- | --- |
| `valid-token-final.ndjson` | Valid stream with one or more token events followed by a final terminal event. |
| `valid-error.ndjson` | Valid stream ending in an error terminal event. |

Target invalid fixture categories:

| Fixture category | Purpose |
| --- | --- |
| `invalid-missing-terminal.ndjson` | Stream ends without `final` or `error`. |
| `invalid-sequence-regression.ndjson` | Stream contains a sequence value lower than a previous sequence value. |
| `invalid-event-after-terminal.ndjson` | Stream emits another event after `final` or `error`. |
| `invalid-empty-token.ndjson` | Token event has empty token content when no heartbeat event is defined. |
| `invalid-missing-required-field.ndjson` | Event omits a required contract field. |
| `invalid-malformed-json.ndjson` | Stream contains a line that is not valid JSON. |

## Expected fixture usage by repository

### `control-plane-api`

The Control Plane should use service-owned fixtures, generated local snapshots, or repo-local contract test inputs to validate:

- NDJSON parsing
- event sequence handling
- terminal event behavior
- invalid stream handling
- internal error normalization at the Control Plane boundary
- SSE adaptation from internal NDJSON events
- receipt derivation
- outcome classification
- safe failure summaries
- cost/waste metadata handling when present

### `ai-execution-service`

The AI Execution Service should use service-owned fixtures, generated local snapshots, or repo-local contract test inputs to validate:

- emitted NDJSON event shape
- provider failure normalization
- sequence monotonicity
- terminal event guarantees
- invalid provider-output rejection before emission
- deterministic fake provider scenario output
- compatibility with Control Plane expectations

## Drift-prevention guidance

Follow-up implementation issues that add concrete schema or fixture artifacts should define how drift is detected. Acceptable approaches include:

- contract tests in both service repos that assert the same event shape and terminal rules
- generated snapshots with explicit regeneration instructions
- copied fixtures protected by checksum, golden-file, or CI comparison checks
- PR evidence showing both service repos were reviewed for contract-impacting changes
- issue links between producer-side and consumer-side contract changes

Drift prevention should not depend on `.github` becoming the artifact owner unless the authority map is intentionally changed.

## Privacy and public fixture constraints

Public fixtures, examples, schema samples, and documentation snippets must not contain:

- raw prompts
- raw provider payloads
- auth headers
- bearer tokens
- API keys
- secrets
- stack traces
- tenant secrets
- sensitive customer data
- real customer identifiers
- real provider responses

Use synthetic values only. When example prompt-like text is unavoidable, use short non-sensitive placeholders such as `"example request"`. Prefer metadata-only examples where possible.

Fixtures should demonstrate contract behavior, not real AI content.

## Relationship to receipts, outcomes, and provider adapters

Execution receipts and outcome classification consume normalized execution events. They should not depend on provider-specific payloads or transport-specific SSE formatting.

Provider adapters should normalize provider-specific failures before those failures reach the internal execution stream contract. The contract should expose stable failure categories and safe metadata that the Control Plane can use for outcomes, receipts, policy explanations, and cost/waste reporting.

Cost and waste metadata should be additive unless a future issue defines a breaking contract revision. Policy explanation fields should remain structured, deterministic, and safe for logs, receipts, test snapshots, and public examples.

Future provider adapters must preserve the same internal event contract even when providers expose different SDKs, response formats, retry semantics, or error payloads.

## Follow-up implementation issues

Follow-up implementation issues are needed only when Arbiter is ready to add concrete artifacts. Possible follow-ups:

- add execution stream schema files to the service repo that owns the implemented behavior
- add deterministic valid and invalid fixture files to the relevant service repo
- add cross-repo schema or fixture drift validation
- wire service-owned fixtures into `control-plane-api` tests
- wire service-owned fixtures into `ai-execution-service` tests

These follow-ups should remain separate from this documentation-only strategy and must respect the ownership boundaries in [cross-repo-authority-map.md](../cross-repo-authority-map.md).

## Non-goals

This document does not implement:

- runtime protocol redesign
- gRPC migration
- WebSocket migration
- live provider SDK integration
- distributed event bus
- database persistence
- public SDK
- broad issue relabeling
- schema files
- fixture files
- validation scripts
- test changes
- service contract artifact ownership in `.github`

## Validation

Suggested validation for this documentation-only change:

```bash
git status --short
git diff -- docs
```

Manual Markdown rendering review is sufficient unless repo-local docs validation exists.
