# Public Content Policy

## Purpose

This repository is public and fully indexed/searchable by search engines, AI crawlers, and the general public.

Every committed file should be treated as permanently public-accessible, even if later deleted from the default branch.

## Allowed Content

| Category | Examples |
|---|---|
| Organization profile content | `profile/README.md`, public organization description |
| Security reporting instructions | `SECURITY.md`, responsible disclosure guidance |
| Contribution and PR templates | `CONTRIBUTING.md`, PR template, issue templates |
| Public-safe product descriptions | High-level capability summaries already approved for public release |
| Governance and operations docs | `AGENTS.md`, label taxonomy, controlled-file policy, PR quality gates, branch protection docs |
| High-level integration or public docs | Only content reviewed and confirmed public-safe before commit |

> When in doubt, keep the material private until a human reviewer confirms it is public-safe.

## Disallowed Content

| Category | Examples |
|---|---|
| Internal roadmap or sequencing | Implementation order, sprint plans, MVP execution plans, issue-by-issue milestone breakdowns |
| Security audit worksheets or known gaps | Vulnerability baselines, audit findings, exception logs, plan-gated security gaps |
| Private architecture strategy | Internal system design, moat thesis, semantic rollback, replay/simulation design |
| Competitive positioning strategy | Competitive analysis, differentiation playbooks, win/loss details |
| Customer or prospect information | Customer names, engagement details, pilot plans, sales scripts |
| Secrets and credentials | API keys, tokens, passwords, private links, environment-specific config |
| Patent-sensitive invention details | Novel techniques not yet intentionally filed or published |
| Internal demo or sales readiness material | Demo scripts, readiness gates, go-to-market internal notes |
| Legal or admin records | Contracts, NDAs, compliance filings, company formation docs |

## Routing Guidance

| Material | Destination |
|---|---|
| Private roadmap, product strategy, execution sequencing | `arbiter-systems/internal-roadmap` |
| Private architecture strategy, system design, moat thesis, replay/simulation design | `arbiter-systems/internal-roadmap` |
| Security audits, vulnerability baselines, known gaps | `arbiter-systems/internal-roadmap` until a dedicated private security repo exists |
| Legal records, company admin, compliance filings | A future private `arbiter-systems/company-admin` repo, if created |
| Customer data, prospect information | No repository; handle through appropriate secure channels |

## Review Guidance

- When unsure whether material is public-safe, keep it private until a human reviewer confirms.
- Security posture documents and governance docs require controlled-file review per [controlled-file policy](operations/controlled-file-policy.md).
- Agent instruction files such as `AGENTS.md`, and any future repo-specific agent instruction files, require explicit human instruction before edits that change agent behavior.
- Apply the review requirements in [controlled-file policy](operations/controlled-file-policy.md) before committing governance, security, or automation files.

## Relationship to Other Policies

- [AGENTS.md](../AGENTS.md) - Repo role, ownership boundaries, and non-negotiables.
- [Controlled file policy](operations/controlled-file-policy.md) - Controlled-file review and disclosure requirements.
- [GitHub label taxonomy](operations/github-label-taxonomy.md) - Label routing for `.github` issues, including `area/docs`, `area/governance`, and `component/ops`.
