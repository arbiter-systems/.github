# Demo Scenario Contract

This document defines the shared JSON contract for Arbiter executable demo scenarios.

The contract lives in the public `.github` repository so service repositories, the Console, site copy, and validation scripts can reference the same public-safe shape. Runtime services may mirror these examples locally when they need repo-local tests or packaged fixtures.

## Files

- Schema: `contracts/demo-scenarios/demo-scenario.schema.json`
- Examples: `examples/demo-scenarios/*.json`

## Contract goal

A demo scenario describes a public-safe, deterministic execution story that can be used by the Control Plane, AI Execution Service, Console, and public walkthrough material without exposing private payloads.

A scenario should answer:

- What execution case is being shown?
- What synthetic request should be run?
- What terminal behavior is expected?
- What evidence claim and highlights can be shown safely?
- What card/result copy should the Console or docs use?

## Lifecycle

1. Define or update the shared example in `.github`.
2. Validate the fixture shape against `demo-scenario.schema.json`.
3. Mirror or copy the fixture into a service repo only when that repo needs local tests or runtime packaging.
4. Keep service-specific runtime behavior in service repos.
5. Keep Console display behavior in `arbiter-console`.

The shared contract is the source of truth for public-safe shape and terminology. It is not a runtime dependency by itself.

## Required fields

Every scenario must include:

- `schemaVersion`: currently `demo-scenario/v1`.
- `id`: stable lowercase kebab-case id.
- `title`: short human-readable scenario title.
- `description`: one-sentence public-safe explanation.
- `publicSafe`: must be `true`.
- `model`: model or provider route alias consumed by downstream services.
- `prompt`: synthetic prompt text.
- `maxTokens`: execution request max token limit.
- `temperature`: execution request temperature.
- `expectedTerminal`: expected final or error terminal behavior.
- `evidence`: receipt/demo evidence claim and highlights.
- `ui`: card/result copy for demo surfaces.

Optional fields:

- `tags`: public-safe categorization.
- `metadata`: public-safe scalar metadata.
- `fakeProvider`: deterministic local-provider behavior hints.

## Public safety rules

Demo scenarios must not contain:

- Secrets or credentials.
- Authorization headers.
- Real customer data.
- Real employee data.
- Proprietary prompt payloads.
- Raw provider responses.
- Provider request/response bodies.
- Live account, tenant, payment, contract, or production identifiers.
- Internal roadmap, security finding, incident, payroll, legal, or admin records.

Use synthetic examples only. Scenario text should be safe for screenshots, hosted demo walkthroughs, public docs, and sales conversations.

## Prompt rules

The `prompt` field is allowed because executable demos need a synthetic request body. It must be generic and public-safe.

Good prompt examples:

- `Summarize how Arbiter keeps an AI execution governed without exposing private prompt text.`
- `Return a short public-safe response after a synthetic first-token delay.`

Bad prompt examples:

- Real customer support tickets.
- Real employee or contractor notes.
- Real company strategy, private roadmap, or investor material.
- Prompt text copied from production requests.

## Metadata rules

`metadata` is limited to scalar values: strings, numbers, integers, and booleans. Nested objects and arrays are intentionally excluded from the shared contract.

Allowed examples:

```json
{
  "scenario": "successful-stream",
  "demoMode": true,
  "riskLevel": "low"
}
```

Restricted examples:

```json
{
  "authorizationHeader": "Bearer ...",
  "providerResponsePayload": "...",
  "rawPrompt": "..."
}
```

Downstream validators should reject metadata keys that attempt to include raw provider payloads, receipt internals, authorization values, secrets, prompts, or customer data.

## Fake-provider behavior allowlist

The optional `fakeProvider.behavior` field supports the first deterministic demo set:

- `successful-stream`
- `provider-timeout`
- `provider-error`
- `slow-first-token`
- `prompt-privacy`
- `unsupported-provider-metadata`

Allowed fake-provider controls:

- `behavior`
- `tokenChunks`
- `delayFirstTokenMs`
- `terminalErrorCode`

Do not add fake-provider fields that contain raw provider requests, raw provider responses, headers, auth material, chain-of-thought, private prompts, or real user data.

## Terminal behavior

`expectedTerminal.type` must be one of:

- `final`
- `error`

Use `expectedTerminal.errorCode` only when the terminal type is `error`.

The expected terminal is a demo contract, not a production SLA. It helps Console and validation tooling assert that a scenario reaches the intended final/error path.

## Evidence copy

The `evidence` object is for receipt/demo panels. It must describe public-safe claims only.

Evidence copy should:

- Explain what the demo proves.
- Avoid guaranteed savings or compliance claims.
- Avoid exposing raw prompt, provider, tenant, or customer payloads.
- Use estimated or advisory wording when appropriate.

Good evidence claim:

> Arbiter surfaces the timeout as a controlled terminal event instead of leaking provider internals.

Bad evidence claim:

> Arbiter guarantees 40% savings and certified compliance for all provider failures.

## UI copy

The `ui` object gives Console/site/docs consumers safe default display text:

- `cardTitle`
- `cardSummary`
- `resultHeadline`

UI copy should be short, non-sensitive, and understandable outside engineering context.

## Canonical examples

The first shared examples are:

- `successful-stream.json`
- `provider-timeout.json`
- `provider-error.json`
- `slow-first-token.json`
- `prompt-privacy.json`
- `unsupported-provider-metadata.json`

`unsupported-provider-metadata.json` is intentionally a negative validation fixture. It is public-safe, but it contains a metadata key that downstream validators should reject before public-demo execution.

## Versioning

Current version: `demo-scenario/v1`.

Breaking changes require a new schema version. Additive fields may be introduced only when they remain public-safe and downstream consumers can ignore them safely.

## Validation

Manual validation is acceptable for the first pass.

Future validation should use:

```bash
node scripts/validate-demo-scenarios.mjs
```

The validation script should verify:

- Every example conforms to the JSON schema.
- `publicSafe` is always true.
- Scenario IDs match file names.
- Required evidence and UI copy is present.
- Restricted metadata keys are rejected or explicitly treated as negative fixtures.
- No obvious secret placeholders, auth headers, or raw provider payload fields are present.
