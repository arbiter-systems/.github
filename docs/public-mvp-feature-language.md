# Public MVP Feature Language

This document keeps Arbiter Systems public MVP feature language bounded and consistent.

## Public-safe feature terms

| Public term | Public-safe meaning | Engineering-language bridge |
| --- | --- | --- |
| AI Execution Firewall | A layer for routing, observing, and governing AI execution. | Control Plane policy checks, provider routing, telemetry, and receipts. |
| Shadow Mode | Evaluates governance decisions without blocking execution. | Tenant enforcement mode and non-blocking policy outcomes. |
| Execution Receipt | Records what happened during an AI execution in a reviewable artifact. | Execution trace, terminal event, provider/model metadata, and policy result. |
| Turnstile | Keeps AI traffic on approved provider/model routes before execution. | Model route policy and route decision metadata. |

## Turnstile guardrails

Use **Turnstile** only for MVP provider/model route governance language.

Turnstile may describe:

- keeping AI traffic on approved provider/model routes
- showing route decisions in receipts, console views, or public-safe docs
- helping teams avoid unapproved production model usage

Turnstile must not imply:

- tool-call governance
- human approval workflows
- compliance certification
- guaranteed savings
- post-execution side-effect governance

## Suggested public copy

> **Turnstile** keeps AI traffic on approved provider/model routes before execution.

Alternative:

> **Turnstile** helps teams prevent unapproved models from running in production AI workflows.
