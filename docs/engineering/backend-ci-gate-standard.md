# Backend CI Gate Standard

## Purpose

This standard defines a lightweight backend CI quality gate for Arbiter backend repositories.

It is intended for MVP and hosted-demo readiness without creating a heavyweight release platform.

## Required principles

- CI must be deterministic and repeatable from local developer commands where practical.
- CI must not require live provider credentials, customer data, raw prompts, or external telemetry accounts.
- CI must prefer fake, stub, or contract-test fixtures over network-dependent integration tests.
- CI must separate required hosted-demo gates from recommended future gates.
- CI must keep secrets out of logs, artifacts, test fixtures, and failure messages.
- Repo-local workflows remain authoritative for exact commands.

## Required hosted-demo gates

Backend repos should define CI checks for:

- dependency restore or installation
- compile, build, or syntax validation
- unit and contract tests for changed behavior
- linting or formatting where repo tooling exists
- type checking or static analysis where repo tooling exists
- dependency vulnerability review appropriate to the language ecosystem
- container build smoke checks when a runtime Dockerfile exists

## Recommended future gates

These are useful but should not block MVP unless explicitly adopted by the repo:

- coverage thresholds
- mutation testing
- full end-to-end environment tests
- performance regression gates
- deployment smoke tests
- external telemetry validation
- paid security or quality services

## Control Plane guidance

For `control-plane-api`, repo-local CI should generally cover:

- .NET restore
- .NET build
- .NET test
- analyzer or formatting checks where configured
- container build smoke checks when Dockerfile coverage exists
- contract tests for public API, streaming, and service-boundary behavior when those areas change

## AI Execution Service guidance

For `ai-execution-service`, repo-local CI should generally cover:

- Python dependency installation
- Python compile or syntax validation
- pytest or equivalent test command
- linting where configured
- type checking where configured
- dependency audit where configured
- container build smoke checks when Dockerfile coverage exists
- contract tests for NDJSON/event behavior when those areas change

## Container smoke guidance

When a Dockerfile exists, a smoke check should verify that the image can build successfully.

Runtime smoke checks are recommended only when they can run without secrets, live providers, customer data, or network-dependent services.

## Dependency review guidance

Dependency checks should start lightweight and repo-appropriate.

Acceptable MVP approaches include language-native audit tools, GitHub-native dependency review, or documented manual review where automation is not ready.

Sensitive security findings, accepted risks, or vulnerability triage records belong in private security or repo-local private planning, not public `.github` docs.

## Completion check

Before a backend CI gate is considered complete in a repo, confirm:

- required commands are documented
- required checks run in CI
- local equivalents are documented where practical
- no live providers, secrets, customer data, raw prompts, or private fixtures are required
- failures are actionable without leaking sensitive data
