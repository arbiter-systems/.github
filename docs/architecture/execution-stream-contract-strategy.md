# Execution Stream Contract Strategy

Status: MVP coordination guidance  
Scope: Documentation-only strategy for shared execution stream schemas and deterministic fixtures

## Purpose

This document defines the cross-repo source-of-truth strategy for Arbiter's execution stream contract schema and deterministic fixtures. Its goal is to prevent drift between `control-plane-api` and `ai-execution-service` as the MVP adds execution receipts, outcome classification, provider adapters, policy explanations, and cost/waste metadata.

This strategy is coordination guidance only. It does not create schema files, fixture files, validation scripts, runtime behavior, or transport changes.

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

## Canonical ownership and source of truth

For the MVP, the `.github` repository is the coordination source of truth for cross-repo contract documentation and future canonical contract artifacts.

If canonical execution stream schema files are added later, they should live in one shared location under `.github`, such as:

```text
contracts/execution-stream/v1/
```

or another path selected by a dedicated follow-up implementation issue.

Consuming repositories may keep local generated copies, test snapshots, or checked-in validation fixtures only when those copies are protected by explicit drift checks. Duplicated schema files without validation are not considered source of truth.

Expected ownership model:

- `.github` owns cross-repo strategy, contract documentation, and future canonical schema/fixture definitions.
- `control-plane-api` consumes the contract for parsing, sequencing, terminal handling, SSE adaptation, receipt derivation, and outcome derivation.
- `ai-execution-service` consumes the contract for emitted NDJSON shape, provider failure normalization, sequence monotonicity, and terminal event guarantees.

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

Canonical fixtures should be deterministic, small, and safe for public repositories. This issue documents the target fixture set only; it does not implement the fixture files.

Target valid fixtures:

| Fixture | Purpose |
| --- | --- |
| `valid-token-final.ndjson` | Valid stream with one or more token events followed by a final terminal event. |
| `valid-error.ndjson` | Valid stream ending in an error terminal event. |

Target invalid fixtures:

| Fixture | Purpose |
| --- | --- |
| `invalid-missing-terminal.ndjson` | Stream ends without `final` or `error`. |
| `invalid-sequence-regression.ndjson` | Stream contains a sequence value lower than a previous sequence value. |
| `invalid-event-after-terminal.ndjson` | Stream emits another event after `final` or `error`. |
| `invalid-empty-token.ndjson` | Token event has empty token content when no heartbeat event is defined. |
| `invalid-missing-required-field.ndjson` | Event omits a required contract field. |
| `invalid-malformed-json.ndjson` | Stream contains a line that is not valid JSON. |

## Expected fixture usage by repository

### `control-plane-api`

The Control Plane should use canonical fixtures or generated local snapshots to validate:

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

The AI Execution Service should use canonical fixtures or generated local snapshots to validate:

- emitted NDJSON event shape
- provider failure normalization
- sequence monotonicity
- terminal event guarantees
- invalid provider-output rejection before emission
- deterministic fake provider scenario output
- compatibility with Control Plane expectations

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

Provider adapters should normalize provider-specific failures before those failures reach the shared execution stream contract. The shared contract should expose stable failure categories and safe metadata that the Control Plane can use for outcomes, receipts, policy explanations, and cost/waste reporting.

Cost and waste metadata should be additive unless a future issue defines a breaking contract revision. Policy explanation fields should remain structured, deterministic, and safe for logs, receipts, test snapshots, and public examples.

Future provider adapters must preserve the same internal event contract even when providers expose different SDKs, response formats, retry semantics, or error payloads.

## Follow-up implementation issues

Follow-up implementation issues are needed only when Arbiter is ready to add concrete artifacts. Possible follow-ups:

- create canonical execution stream schema files
- add deterministic valid and invalid fixture files
- add cross-repo schema or fixture drift validation
- wire canonical fixtures into `control-plane-api` tests
- wire canonical fixtures into `ai-execution-service` tests

These follow-ups should remain separate from this documentation-only strategy.

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

## Validation

Suggested validation for this documentation-only change:

```bash
git status --short
git diff -- docs
```

Manual Markdown rendering review is sufficient unless repo-local docs validation exists.
