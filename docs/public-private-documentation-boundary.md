# Public and Private Documentation Boundary

## Purpose

This policy defines where Arbiter Systems documentation belongs so public repositories stay safe, useful, and supportable.

The `.github` repository is public. Treat all content in this repository as public, indexed, and permanent.

## Public `.github`

Use public `.github` for organization-level GitHub metadata and concise public-safe guidance.

Allowed content:

- organization profile content
- public-safe issue and pull request templates
- responsible disclosure and contact files
- concise public contribution and review guidance
- high-level public policy statements

Do not publish:

- service contracts
- runtime topology
- local validation logs or command output
- private project-field schemas or automation runbooks
- internal roadmap, release gates, budget ceilings, or milestone strategy
- security baselines, known gaps, vulnerability worksheets, or audit evidence plans
- internal AI-agent operating models, role matrices, or prompt templates
- private repository setup notes or owner/admin verification records
- secrets, credentials, private links, customer data, account identifiers, or legal/admin records

## Private `company`

Use private `company` for internal business, planning, and governance records.

Appropriate content:

- confidential strategy and planning
- internal governance records
- project operations and issue taxonomy records
- private release and milestone planning
- internal cost-control thresholds
- public/private boundary records
- product naming and claim-boundary records
- private documentation migration records

## Private `security`

Use private `security` for sensitive security operating material.

Appropriate content:

- security operating model
- threat model and incident response docs
- vulnerability response records
- secrets-handling procedures
- security review checklists
- sensitive security findings or known gaps
- private security readiness records

## Service repositories

Use service repositories for code-adjacent implementation records that belong with the service.

Appropriate content:

- repo-local implementation docs
- service contracts owned by that service
- local development setup
- validation commands
- code-adjacent architecture notes that are safe for the repository visibility level

When a service repository is private, internal implementation detail may live there if it is directly tied to the repo's code and validation. When a service repository is public, apply the same public-safe standard as `.github`.

## `arbiter-site`

Use `arbiter-site` for buyer-facing website content and public product explanation.

Appropriate content:

- buyer-facing public website copy
- public-safe product explanations
- public claim boundaries
- contact and demo-evaluation content
- public examples using synthetic, non-sensitive data

Do not place private roadmap, internal architecture, security gaps, local validation logs, or unsupported product claims in the public site.

## Placement rules

Use this default placement rule:

- Public explanation goes in public docs or site content.
- Internal planning goes in `company`.
- Sensitive security material goes in `security`.
- Code-adjacent implementation detail goes in the owning service repo.
- Buyer-facing product copy goes in `arbiter-site`.

When unsure, place the material in a private repo first and create a public-safe summary only after review.

## Public-safe review checklist

Before adding or updating public documentation, confirm:

- The content can be indexed permanently.
- The claims are accurate and supportable today.
- Examples are synthetic and non-sensitive.
- No private links, secrets, customer data, internal roadmap details, local logs, or owner/admin records are included.
- The document does not expose runtime contracts, security gaps, validation output, or internal execution plans.
- The document points readers to public contact paths rather than private systems.

## Related cleanup history

Internal operating records that were previously public have been preserved privately and replaced with public-safe guidance. Future documentation should follow this boundary before publication.
