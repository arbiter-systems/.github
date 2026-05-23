# Linting and Validation Policy

## Purpose

Define the Arbiter Systems baseline for formatting, linting, build, test, and repository validation across active repositories.

The goal is to reduce review noise from AI-generated and human-generated changes without adding heavyweight quality gates that slow MVP delivery.

This policy is a baseline. Repo-specific implementation issues own the actual tooling changes.

## Scope

This policy applies to active Arbiter Systems repositories:

- `.github`
- `control-plane-api`
- `ai-execution-service`
- `arbiter-console`
- `arbiter-site`

This policy does not change branch protection, repository rulesets, GitHub Project fields, labels, workflow permissions, or deployment behavior.

## Policy Principles

- Prefer fast, local, deterministic checks.
- Require validation that catches likely defects before PR review.
- Keep MVP gates lightweight.
- Do not require secrets or live provider credentials for normal validation.
- Do not introduce mandatory coverage thresholds, SonarCloud quality gates, StyleCop adoption, or broad static-analysis gates unless separately approved.
- Treat formatter output as a consistency tool, not an architecture review substitute.
- Keep advisory tools advisory until they are stable, low-noise, and documented.

## Blocking vs Advisory Checks

### Blocking Checks

Blocking checks are expected to pass before a PR is considered ready for review or merge.

A check may become blocking when all of the following are true:

- It runs consistently locally or in CI.
- It fails for real defects or clear policy violations.
- It has a stable command name.
- It has a clear remediation path.
- It does not require private secrets, live provider credentials, or manual external setup.
- It is not frequently flaky.

### Advisory Checks

Advisory checks are useful during development or review but should not block MVP delivery by default.

Examples include:

- SonarLint or IDE-only suggestions.
- Optional security scanners before their findings are triaged.
- Coverage reports without an approved threshold.
- Broad static-analysis rule sets that have not been tuned for the repo.
- Experimental lint rules or tools not documented in the repo.

Advisory findings may still justify follow-up issues when they identify real defects, maintainability problems, or security risks.

## Baseline by Repository Family

### C# Service Repositories

Applies to:

- `control-plane-api`

Minimum blocking validation baseline:

| Check | Command | Blocking |
|---|---|---:|
| Restore/build | `dotnet build` | Yes |
| Tests | `dotnet test` | Yes |
| Formatting | `dotnet format --verify-no-changes` | Yes, once configured and stable |

Recommended advisory checks:

| Check | Tooling | Advisory until separately approved |
|---|---|---:|
| IDE static analysis | SonarLint / IDE analyzers | Yes |
| Broader analyzer packs | StyleCop or equivalent | Yes |
| Coverage threshold | Coverage tooling | Yes |

Notes:

- Service validation must not require real provider credentials.
- Tests should use fixtures, stubs, mocks, or no-op provider configuration.
- Formatting rules should be kept in `.editorconfig` where possible.

### Python Service Repositories

Applies to:

- `ai-execution-service`

Minimum blocking validation baseline:

| Check | Command | Blocking |
|---|---|---:|
| Install | `pip install -r requirements.txt` or project equivalent | Yes |
| Lint | `ruff check .` or project equivalent | Yes, once configured |
| Formatting | `ruff format --check .` or `black --check .` | Yes, once configured and stable |
| Typecheck | `mypy .` or project equivalent | Yes, once configured |
| Tests | `pytest` | Yes |

Recommended advisory checks:

| Check | Tooling | Advisory until separately approved |
|---|---|---:|
| Coverage threshold | Coverage tooling | Yes |
| Dependency vulnerability scan | `pip-audit`, Dependabot, or equivalent | Yes |
| Broader static analysis | Bandit or equivalent | Yes |

Notes:

- Service validation must not require real provider credentials.
- Tests should use fixtures, stubs, mocks, or no-op provider configuration.
- Python tool choices should be documented in the repo before becoming blocking.

### Organization Metadata and Docs Automation

Applies to:

- `.github`

Minimum blocking validation baseline after `.github#140` is implemented:

| Check | Command | Blocking |
|---|---|---:|
| Markdown lint | `npm run lint:md` or equivalent | Yes |
| Taxonomy/project metadata tests | `npm test` or equivalent | Yes |
| Workflow syntax | `actionlint` or equivalent | Yes, once installed/documented |
| Formatting | Prettier check for Markdown/YAML/JSON | Yes, once installed/documented |

Current blocking validation before `.github#140`:

| Check | Command | Blocking |
|---|---|---:|
| Manual markdown review | Manual review | Yes |
| Controlled-file review disclosure | Manual review | Yes |

Recommended advisory checks:

| Check | Tooling | Advisory until separately approved |
|---|---|---:|
| New workflow validation variants | Additional GitHub Actions validators | Yes |
| Broad markdown style rules | Untuned markdownlint rules | Yes |

Notes:

- The `.github` repo is public-safe organization metadata and operations documentation.
- It must not publish secrets, private roadmap material, customer data, or internal-only strategy.
- GitHub Project single-select values must remain distinct from label taxonomy values.
- Valid Workstream Project field values are currently:
  - `GitHub Project Management`
  - `MVP Execution`
  - `Security & Compliance`
  - `Documentation & Site`
  - `Infrastructure & Ops`

Lowercase label-style values such as `security-privacy`, `architecture`, or `repo-operations` must not be used as Project Workstream values unless the Project options are intentionally migrated.

### Next.js / TypeScript Repositories

Applies to:

- `arbiter-console`
- `arbiter-site`

Minimum blocking validation baseline:

| Check | Command | Blocking |
|---|---|---:|
| Install | `npm ci` or package-manager equivalent | Yes |
| Lint | `npm run lint` | Yes, once configured |
| Typecheck | `npm run typecheck` | Yes, once configured |
| Build | `npm run build` | Yes |
| Tests | `npm test` or equivalent | Yes when tests exist or behavior changes require them |
| Formatting | Prettier check | Yes, once configured |

Recommended advisory checks:

| Check | Tooling | Advisory until separately approved |
|---|---|---:|
| Bundle-size budgets | Bundle analyzer or size-limit tooling | Yes |
| Accessibility audits | Lighthouse / axe scans | Yes |
| Coverage threshold | Coverage tooling | Yes |

Notes:

- Public site and console validation must not require production secrets.
- Build-time environment requirements should be documented per repo.
- Console and site checks should stay lightweight until the UI stabilizes.

## Security Baseline

The following security checks are recommended across repos, but enforcement should be introduced through repo-specific issues:

| Check | Default stance |
|---|---|
| Dependabot alerts | Recommended |
| Secret scanning | Recommended |
| Push protection | Recommended where available |
| `gitleaks` or equivalent | Advisory until configured and tuned |
| Dependency vulnerability gates | Advisory until severity policy is approved |

Security checks may become blocking only after false-positive handling, severity thresholds, and remediation expectations are documented.

## Heavyweight Gates Not Approved for MVP

Do not add the following as mandatory gates unless a separate issue explicitly approves them:

- Mandatory coverage thresholds.
- SonarCloud quality gates.
- Organization-wide StyleCop enforcement.
- Broad security gates without severity policy.
- Required deployment previews for every docs-only PR.
- Branch protection or ruleset changes.
- Live provider integration tests.
- Checks that require secrets for normal PR validation.

## Repo-Specific Implementation Issues

Implementation should remain repo-scoped:

- `.github#140` — add docs, workflow, and taxonomy validation checks.
- `arbiter-systems/control-plane-api#377` — enforce .NET formatting and baseline validation.
- `arbiter-systems/ai-execution-service#50` — enforce Python formatting, linting, test, and baseline validation.
- `arbiter-systems/arbiter-console#30` — add TypeScript, lint, format, and build validation baseline.
- `arbiter-systems/arbiter-site#21` — add site docs lint, format, and build validation baseline.

Recommended order:

1. `.github#140`
2. `control-plane-api#377`
3. `ai-execution-service#50`
4. `arbiter-console#30`
5. `arbiter-site#21`

## Completion Standard

A repo-specific validation issue is complete when:

- The repo documents its local validation command.
- Required checks are reproducible locally.
- CI, if added, uses stable check names.
- Secrets are not required for normal PR validation.
- Advisory checks are clearly separated from blocking checks.
- The PR summary reports validation performed and any deferred enforcement.

## Related Documents

- [PR quality gates](pr-quality-gates.md)
- [Controlled file policy](controlled-file-policy.md)
- [Branch protection and merge policy](branch-protection-and-merge-policy.md)
- [GitHub Project operating model](github-project-operating-model.md)
- [GitHub label taxonomy](github-label-taxonomy.md)
