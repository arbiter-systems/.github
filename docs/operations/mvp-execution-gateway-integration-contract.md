# MVP Execution Gateway Integration Contract

This document defines the integration contract for teams adopting Arbiter as an AI Execution Firewall. It covers where Arbiter sits in the execution path, what the client must send, what Arbiter returns, and how to validate the flow locally without replacing existing AI providers or workflows.

Related sellable MVP epic: arbiter-systems/control-plane-api#133

## Overview

Arbiter is an AI Execution Firewall. It intercepts AI execution requests, applies policy and budget-aware routing, enforces execution guardrails, and records structured receipts. It does not replace AI providers, change prompt structure by default, or store raw prompts by default.

A client adopting Arbiter sends the normal provider-bound payload along with Arbiter control metadata. Arbiter evaluates the control metadata outside the LLM payload, routes to the appropriate provider, and returns the provider response wrapped in Arbiter's SSE event protocol with execution receipt fields attached.

## Where Arbiter Sits

```
Client
  └─► Control Plane API  (port 8080, POST /v1/execute/stream)
        └─► AI Execution Service  (internal, port 8000)
              └─► Provider  (OpenAI, Anthropic, or fake/deterministic for demo)
```

The client interacts only with the Control Plane API. The AI Execution Service and provider are internal to the Arbiter stack. The client keeps using familiar provider/model identifiers; Arbiter handles provider routing based on control metadata and provider readiness.

## Adopting Arbiter Without Replacing Existing Workflows

Arbiter is designed so adopting teams do not need to:

- Replace their AI provider accounts or credentials.
- Rewrite prompts or change message structure.
- Change model identifiers in their existing code.
- Add token budget to prompts or modify payload structure for overhead.

The provider-bound payload (`model`, `prompt`, `maxTokens`, and supported provider-specific fields) passes through to the provider unchanged by default. See [Zero Token Overhead Default](#zero-token-overhead-default) below.

The only adoption requirement is routing execution through `POST /v1/execute/stream` on the Control Plane API and adding the Arbiter control metadata fields described in [Request Structure](#request-structure).

## Request Structure

**Endpoint:** `POST /v1/execute/stream`  
**Authentication:** `X-API-Key: <key>` request header  
**Content-Type:** `application/json`

### Required Fields

| Field | Type | Description |
|---|---|---|
| `model` | string | Provider or model identifier. Passed through to the provider unchanged. |
| `prompt` | string | The user prompt or instruction. Passed through to the provider unchanged. |

### Optional Provider-Bound Fields

| Field | Type | Description |
|---|---|---|
| `maxTokens` | integer | Output token limit. Passed through to the provider unchanged. |

Additional provider-specific fields are passed through unchanged when supported by the configured provider.

### Arbiter Control Metadata (MVP)

The following fields are accepted by Arbiter for policy evaluation and routing. They are evaluated outside the LLM payload and do not add tokens to the provider request.

| Field | Type | MVP Status | Description |
|---|---|---|---|
| `tenantId` | string | Supported via header (`X-Tenant-Id`) | Tenant identifier for routing and receipt attribution. Defaults to `dev` in local mode. |
| `correlationId` | string | Supported via header (`X-Correlation-Id`) | Client-supplied correlation ID. Propagated through receipt and logs. Arbiter generates one if not supplied. |
| `traceId` | string | Planned | Distributed trace ID for cross-system correlation. |
| `routePreference` | string | Planned | Preferred provider or routing hint. |
| `budgetHint` | object | Planned | Budget ceiling or cost constraint for this execution. |
| `riskLevel` | string | Planned | Risk classification hint for policy evaluation. |

Fields marked **Planned** define the intended stable request envelope but are not yet enforced in MVP routing logic. They are documented here to establish a stable request envelope for early adopters.

## Zero Token Overhead Default

Arbiter is designed for zero token overhead by default because provider request payloads pass through unchanged unless explicit transformation modes are enabled.

In MVP:

- The `prompt` and `model` fields are forwarded to the AI Execution Service and then to the provider as-is.
- No system prompt injection, no context prepending, no prompt compression or rewriting occurs by default.
- `maxTokens` and other provider-specific fields are forwarded unchanged.

This is the default posture. If a future transformation mode is enabled (prompt enrichment, context injection, etc.), the zero-overhead claim does not apply to that mode. Transformation modes are deferred and not in MVP scope.

This default tracks arbiter-systems/control-plane-api#149, #150, and #153.

## Response Structure

The Control Plane API returns a Server-Sent Events (SSE) stream over HTTP.

**Content-Type:** `text/event-stream`

### Response Headers

| Header | Description |
|---|---|
| `X-Tenant-Id` | Tenant identifier for this execution. |
| `X-Correlation-Id` | Correlation ID for this execution. Matches the value propagated in events and logs. |

### SSE Event Types

#### `token` event

Carries one content chunk from the provider response.

```json
{
  "protocolVersion": "1.0",
  "executionId": "<uuid>",
  "correlationId": "<uuid or client-supplied>",
  "type": "token",
  "sequence": 1,
  "content": "<token text>",
  "provider": "<provider id>",
  "model": "<model id>"
}
```

#### `final` event

Signals stream completion and carries the execution receipt fields available in MVP.

```json
{
  "protocolVersion": "1.0",
  "executionId": "<uuid>",
  "correlationId": "<uuid or client-supplied>",
  "type": "final",
  "sequence": <N>,
  "provider": "<provider id>",
  "model": "<model id>",
  "usage": {
    "inputTokens": <integer>,
    "outputTokens": <integer>,
    "totalTokens": <integer>
  }
}
```

## Execution Receipt Shape

The Execution Receipt is the structured record Arbiter attaches to every execution. In MVP, receipt fields are carried in the `final` SSE event and response headers. The full receipt concept includes additional fields that will be populated as backend capabilities are added.

| Field | Source | MVP Status | Description |
|---|---|---|---|
| `executionId` | `final` event | Available | Unique identifier for this execution across all Arbiter services. |
| `correlationId` | `final` event, `X-Correlation-Id` header | Available | Cross-service correlation identifier. Matches Control Plane and AI Execution Service logs. |
| `protocolVersion` | `final` event | Available | SSE protocol version. Currently `1.0`. |
| `provider` | `final` event | Available | Provider that fulfilled the execution. |
| `model` | `final` event | Available | Model identifier used. |
| `usage.inputTokens` | `final` event | Available | Input tokens consumed. |
| `usage.outputTokens` | `final` event | Available | Output tokens generated. |
| `usage.totalTokens` | `final` event | Available | Total tokens consumed. |
| `arbiterControlLatencyMs` | Future | Planned | Time Arbiter spent in policy, routing, and readiness checks, excluding provider/model time. |
| `providerLatencyMs` | Future | Planned | Time from first provider request byte to first provider response byte. |
| `policyReason` | Future | Planned | Human-readable string explaining the routing or control decision applied. |
| `providerAttempt` | Future | Planned | Which attempt number fulfilled the execution (for retry/fallback tracking). |
| `costAvoided` | Future | Planned | Estimated cost avoided by routing, budget enforcement, or skipping unhealthy providers. |

## Trace ID and Correlation ID Behavior

Arbiter propagates two identifiers through the execution path:

- **`executionId`** — Generated by Arbiter at execution start. Unique to this execution across Control Plane and AI Execution Service. Carried in every SSE event and in structured logs on both services.
- **`correlationId`** — If supplied by the client (via `X-Correlation-Id` request header), Arbiter propagates that value. If not supplied, Arbiter generates one. Carried in response headers, every SSE event, and structured logs.

Both identifiers appear in Control Plane logs and AI Execution Service logs with matching values, enabling cross-service trace reconstruction without a distributed tracing system.

Example log correlation from a validated local run:

- Control Plane: `ExecutionId=f91a0ee8-0374-4c08-80c3-c9f45743fe7f`
- AI Execution Service: `"execution_id":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f"`, `"correlation_id":"3a868260949d4eae8e4f89409e851e42"`

Support for client-supplied `traceId` for distributed tracing system integration is planned but deferred.

## Arbiter Control Latency vs Provider/Model Latency

Arbiter adds coordination steps between the client and the provider. These steps include:

- API key validation
- Request parsing and tenant resolution
- Policy and routing evaluation (metadata-first, not prompt-scanning)
- Provider readiness check, with cached execution-hot-path readiness tracked for MVP completion; see [Cached Provider Readiness](#cached-provider-readiness).
- SSE event wrapping and forwarding

Arbiter targets low added latency by keeping policy, routing, budget, and provider readiness checks metadata-first and local or cached in the execution hot path.

"Targets low added latency" is the approved claim. "No added latency" and "guaranteed latency reduction" are not supportable claims for MVP.

In MVP, Arbiter does not yet break down receipt timing into `arbiterControlLatencyMs` and `providerLatencyMs` as separate fields. The `usage` field in the `final` event reflects token counts from the provider; timing fields are planned.

## Policy and Control Reason Behavior

In MVP, Arbiter applies the following controls:

- API key enforcement at the Control Plane boundary.
- Provider selection via the routing layer based on the `model` field.
- Provider readiness filtering as the readiness cache and routing gates are completed.

The `policyReason` field in the receipt — a human-readable string explaining the routing or control decision — is planned but not yet returned in MVP. When implemented, it will explain decisions such as: provider skipped due to readiness failure, budget ceiling enforced, or route preference applied.

## Cost-Control and Cost-Avoided Fields

In MVP, the `usage` field in the `final` event carries token counts. These can be used by the client to calculate execution cost against provider pricing.

The `costAvoided` receipt field — representing cost avoided by routing decisions, budget enforcement, or skipping unhealthy providers — is planned but not yet returned in MVP.

In waste-heavy workflows, Arbiter MVP can target up to 40% AI execution cost reduction by preventing unnecessary attempts, skipping unhealthy providers, enforcing budgets, and routing low-risk work to lower-cost execution paths.

Budget hints, execution cost caps, and per-tenant attribution are planned capabilities. See arbiter-systems/control-plane-api#133 for the MVP epic scope.

## Prompt Privacy Default

Arbiter does not store raw prompts by default. Execution receipts record structured metadata. Payload logging is opt-in only and requires explicit configuration.

What Arbiter records by default:

- `executionId`, `correlationId`, `tenantId`
- `provider`, `model`
- Token usage counts
- Timing and status (when available)
- Structured control decisions (when available)

What Arbiter does not record by default:

- The `prompt` field value
- Message content
- Any provider-bound payload fields containing user data

Payload logging can be enabled per deployment for debugging or audit purposes. It is off by default in all environments.

## Cached Provider Readiness

Arbiter checks provider readiness before routing execution requests. The MVP design keeps provider readiness cached in the execution hot path to avoid adding a live health-check round-trip to every execution.

The AI Execution Service exposes `GET /health/ready`, which returns a providers array with per-provider status. Control Plane uses this readiness signal to gate routing decisions as cached readiness support is completed.

Example ready response:
```json
{"status":"ready","providers":[{"providerId":"fake","status":"ready"}]}
```

When a provider is not ready, Arbiter should skip it in routing rather than forwarding the request to fail at the provider. This is the mechanism behind the "skipping unhealthy providers" cost-reduction claim.

Cached provider readiness behavior is tracked in arbiter-systems/control-plane-api#151.

## Local and Demo Validation Flow

The MVP integration contract can be validated locally using the two-service Docker stack without real provider credentials. The AI Execution Service includes a fake/deterministic provider that streams one token event per prompt word and terminates with a `final` event.

**Prerequisites:** Docker Desktop running.

**Start AI Execution Service:**
```powershell
docker run --rm -d -p 8000:8000 --name ai-execution-service ai-execution-service:local
```

**Start Control Plane API:**
```powershell
docker run --rm -d -p 8080:8080 --name control-plane-api `
  -e ApiKey__Key=local-container-key `
  -e AiExecution__ApiKey=local-execution-key `
  -e AiExecution__BaseUrl=http://host.docker.internal:8000 `
  control-plane-api:local
```

**Send a test execution:**
```powershell
curl.exe --% -i -N -sS -X POST http://localhost:8080/v1/execute/stream `
  -H "X-API-Key: local-container-key" `
  -H "Content-Type: application/json" `
  --data "{\"model\":\"openai\",\"prompt\":\"hello world\",\"maxTokens\":16}"
```

**Expected response shape:**
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
X-Tenant-Id: dev
X-Correlation-Id: <uuid>

event: token
data: {"protocolVersion":"1.0","executionId":"<uuid>","correlationId":"<uuid>","type":"token","sequence":1,"content":"hello ","provider":"openai","model":"openai"}

event: token
data: {"protocolVersion":"1.0","executionId":"<uuid>","correlationId":"<uuid>","type":"token","sequence":2,"content":"world ","provider":"openai","model":"openai"}

event: final
data: {"protocolVersion":"1.0","executionId":"<uuid>","correlationId":"<uuid>","type":"final","sequence":3,"provider":"openai","model":"openai","usage":{"inputTokens":0,"outputTokens":2,"totalTokens":2}}
```

The `executionId` and `correlationId` values will match across the response and both service logs. See [Local Two-Service Docker Validation - 2026-05-16](./local-two-service-validation-results.md) for a full validated run.

## Future and Deferred Features

The following are explicitly out of scope for the MVP integration contract:

| Feature | Status |
|---|---|
| Client SDK / SDK wrapper | Deferred |
| OpenAI-compatible proxy endpoint | Deferred |
| API gateway runtime | Deferred |
| Auth and customer onboarding | Deferred |
| Billing integration | Deferred |
| Console UI | Deferred |
| Deployment automation | Deferred |
| Prompt rewriting or compression | Deferred |
| Semantic execution primitives | Deferred |
| `traceId` propagation to external tracing systems | Planned |
| `arbiterControlLatencyMs` / `providerLatencyMs` receipt fields | Planned |
| `policyReason` receipt field | Planned |
| `costAvoided` receipt field | Planned |
| Budget hint enforcement | Planned |
| Per-tenant cost attribution | Planned |
| Client-supplied `routePreference` enforcement | Planned |

## Related Docs and Issues

- [MVP Backend Baseline](./mvp-backend-baseline.md)
- [MVP Claim Guardrails](./mvp-claim-guardrails.md)
- [MVP Cost Controls](./mvp-cost-controls.md)
- [Local Two-Service Docker Validation - 2026-05-16](./local-two-service-validation-results.md)
- Sellable MVP epic: arbiter-systems/control-plane-api#133
- Overhead measurement: arbiter-systems/control-plane-api#149
- Provider payload pass-through: arbiter-systems/control-plane-api#150
- Cached provider readiness: arbiter-systems/control-plane-api#151
- Low-overhead execution path docs: arbiter-systems/control-plane-api#153
