# Security Policy

## Purpose

This repository contains Arbiter Systems organization-level GitHub configuration, templates, profile content, and community health files.

It does not contain production application code, customer data, execution traces, prompts, completions, provider credentials, or runtime infrastructure.

## Supported Versions

Only the active `main` branch is supported.

Older branches, abandoned branches, forks, and local copies are not supported for security fixes.

## Reporting a Vulnerability

Do not open public GitHub issues for suspected vulnerabilities.

Report security concerns privately to:

**security@arbitersystems.ai**

Include:

- Repository: `arbiter-systems/.github`
- Affected file, workflow, template, or configuration
- Reproduction steps
- Expected security impact
- Whether the issue could affect other Arbiter Systems repositories
- Any relevant screenshots, links, logs, or commit references

## In Scope

Reports are useful when they involve:

- GitHub Actions workflow weaknesses
- Unsafe default issue or PR templates
- Exposure of private repository names, internal links, credentials, or operational details
- Misleading security instructions
- Organization-level configuration that could weaken repository security
- Community health files that cause incorrect vulnerability-reporting behavior
- Dependency or automation issues that are exploitable in this repository

## Out of Scope

The following are generally out of scope unless they show concrete security impact:

- Typographical errors
- Styling or formatting issues
- General best-practice suggestions without exploitability
- Social engineering
- Physical attacks
- Issues requiring compromised maintainer accounts or devices
- Public information that does not expose secrets, private data, credentials, internal systems, or security-sensitive details

## Security Design Priorities

This repository should help enforce safe defaults across Arbiter Systems repositories:

- Private vulnerability reporting
- Clear security contact path
- Safe contribution guidance
- Minimal public exposure of internal operational details
- Conservative GitHub Actions permissions
- No secrets committed to repository files
- No customer, tenant, prompt, completion, trace, or execution data

## Coordinated Disclosure

Please do not publicly disclose a vulnerability until Arbiter Systems has had reasonable time to investigate and address it.

Public reports containing sensitive details may be removed or converted into private follow-up work.
