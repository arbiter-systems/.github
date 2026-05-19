# PR Quality Gates

## Purpose

This document inventories per-repo PR readiness commands, CI requirements, and required-check recommendations across Arbiter repositories. It complements [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md) and does not replace it.

## Scope

This document covers:

- `control-plane-api`
- `ai-execution-service`
- `arbiter-console`
- `arbiter-site`
- `.github`

This document does not add or enforce GitHub branch protection, CI workflows, deployment automation, or repository settings.

## Per-Repo Quality Gates

### control-plane-api

#### Stack Summary

TODO: confirm with `control-plane-api/AGENTS.md`.

#### Required Local Validation Before PR

| Check | Command | Required before PR | Notes |
|---|---|---:|---|
| Install | `TODO: confirm with control-plane-api/AGENTS.md` | Yes | Confirm dependency restore command in the service repo before use. |
| Lint | `TODO: confirm with control-plane-api/AGENTS.md` | Yes | Confirm lint or formatting command in the service repo before use. |
| Typecheck | `TODO: confirm with control-plane-api/AGENTS.md` | Yes | Confirm type or compile validation in the service repo before use. |
| Test | `TODO: confirm with control-plane-api/AGENTS.md` | Yes | Required before PR for backend service changes when documented locally. |
| Build | `TODO: confirm with control-plane-api/AGENTS.md` | Yes | Required before PR for backend service changes when documented locally. |

#### Recommended CI Check Names

- `validate`
- `lint`
- `test`
- `build`

#### Secrets Posture

Normal PR validation should not require provider credentials. CI must use fixtures, stubs, mocks, or no-op configuration for provider-dependent behavior, and logs must not expose secrets, credentials, raw customer data, or private tokens.

### ai-execution-service

#### Stack Summary

TODO: confirm with `ai-execution-service/AGENTS.md`.

#### Required Local Validation Before PR

| Check | Command | Required before PR | Notes |
|---|---|---:|---|
| Install | `TODO: confirm with ai-execution-service/AGENTS.md` | Yes | Confirm dependency install command in the service repo before use. |
| Lint | `TODO: confirm with ai-execution-service/AGENTS.md` | Yes | Confirm lint or formatting command in the service repo before use. |
| Typecheck | `TODO: confirm with ai-execution-service/AGENTS.md` | Yes | Confirm type validation command in the service repo before use. |
| Test | `TODO: confirm with ai-execution-service/AGENTS.md` | Yes | Required before PR for execution service changes when documented locally. |
| Build | `TODO: confirm with ai-execution-service/AGENTS.md` | Yes | Required before PR for execution service changes when documented locally. |

#### Recommended CI Check Names

- `validate`
- `lint`
- `typecheck`
- `test`
- `build`

#### Secrets Posture

Normal PR validation should not require provider credentials. CI must use fixtures, stubs, mocks, or no-op configuration for provider-dependent behavior, and logs must not expose secrets, credentials, raw customer data, or private tokens.

### arbiter-console

#### Stack Summary

TODO: confirm with `arbiter-console/AGENTS.md`.

#### Required Local Validation Before PR

| Check | Command | Required before PR | Notes |
|---|---|---:|---|
| Install | `TODO: confirm with arbiter-console/AGENTS.md` | Yes | Confirm dependency install command in the console repo before use. |
| Lint | `TODO: confirm with arbiter-console/AGENTS.md` | Yes | Recommended by the branch protection policy once console work exists. |
| Typecheck | `TODO: confirm with arbiter-console/AGENTS.md` | Yes | Recommended by the branch protection policy once console work exists. |
| Test | `TODO: confirm with arbiter-console/AGENTS.md` | Yes | Confirm route and component test expectations in the console repo. |
| Build | `TODO: confirm with arbiter-console/AGENTS.md` | Yes | Recommended by the branch protection policy once console work exists. |

#### Recommended CI Check Names

- `validate`
- `lint`
- `typecheck`
- `test`
- `build`

#### Secrets Posture

Normal PR validation should not require provider credentials. CI must use fixtures, stubs, mocks, or no-op configuration for provider-dependent behavior, and logs must not expose secrets, credentials, raw customer data, or private tokens.

### arbiter-site

#### Stack Summary

TODO: confirm with `arbiter-site/AGENTS.md`.

#### Required Local Validation Before PR

| Check | Command | Required before PR | Notes |
|---|---|---:|---|
| Install | `TODO: confirm with arbiter-site/AGENTS.md` | Yes | Confirm dependency install command in the site repo before use. |
| Lint | `TODO: confirm with arbiter-site/AGENTS.md` | Yes | Recommended for public site or docs site changes where available. |
| Typecheck | `TODO: confirm with arbiter-site/AGENTS.md` | Yes | Recommended for public site or docs site changes where available. |
| Test | `TODO: confirm with arbiter-site/AGENTS.md` | No | Use when documented locally or when site behavior changes require tests. |
| Build | `TODO: confirm with arbiter-site/AGENTS.md` | Yes | Recommended before PR for public site or docs site changes where available. |

#### Recommended CI Check Names

- `validate`
- `lint`
- `typecheck`
- `build`
- `docs`

#### Secrets Posture

Normal PR validation should not require provider credentials. CI must use fixtures, stubs, mocks, or no-op configuration for provider-dependent behavior, and logs must not expose secrets, credentials, raw customer data, or private tokens.

### .github

#### Stack Summary

This repository contains public-safe organization metadata, public organization profile content, shared public-facing GitHub metadata, and operations documentation. It does not own product source code, service implementation, runtime infrastructure, or internal roadmap material.

#### Required Local Validation Before PR

| Check | Command | Required before PR | Notes |
|---|---|---:|---|
| Install | N/A | N/A | Documentation-only repository; no install command is documented here. |
| Lint | N/A | N/A | Use manual markdown review unless a dedicated docs validation command is added later. |
| Typecheck | N/A | N/A | No typecheck command is documented here. |
| Test | N/A | N/A | No test command is documented here. |
| Build | N/A | N/A | No build command is documented here. |

#### Recommended CI Check Names

- `docs`

#### Secrets Posture

Normal PR validation should not require provider credentials. CI must use fixtures, stubs, mocks, or no-op configuration for provider-dependent behavior, and logs must not expose secrets, credentials, raw customer data, or private tokens.

## Required-Check Readiness Criteria

The required-check readiness criteria below are copied from [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md) so this document can be used as a PR-readiness checklist.

- [ ] The check runs consistently on pull requests.
- [ ] The check fails for real defects.
- [ ] The check is not frequently flaky.
- [ ] The check name is stable.
- [ ] The repository has a clear remediation path when the check fails.

## Failure Output Guidance

CI failures must be reproducible locally where practical. Logs must not contain secrets, credentials, customer data, or private tokens, and CI output should include an actionable remediation hint in the job summary or failure message.

## Follow-Up Items

- `control-plane-api`: add or update CI workflow in a separate `control-plane-api` issue.
- `ai-execution-service`: add or update CI workflow in a separate `ai-execution-service` issue.
- `arbiter-console`: add or update CI workflow in a separate `arbiter-console` issue.
- `arbiter-site`: add or update CI workflow in a separate `arbiter-site` issue.
- `.github`: add documentation validation only if needed in a separate `.github` issue.
