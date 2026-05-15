# MVP Cost Controls

## Overview

MVP infrastructure and provider usage are intentionally bounded while the platform is in active development. The internal MVP target is $150-$300/month, and the private beta ceiling is $1,000/month. These thresholds should be adjusted as real usage data comes in.

## Budget Alert Thresholds

| Category | Warning | Review | Hard Review / Cap |
|---|---:|---:|---:|
| AWS | $100 | $200 | $300 |
| AI providers: OpenAI, Anthropic, etc. | $50 | $100 | $150 hard cap |
| Vercel | — | $20–$40 | — |
| GitHub Actions | — | $10–$25 | — |

## What to Monitor Monthly

| Area | Check |
|---|---|
| AWS | Review Cost Explorer and Budgets console. |
| AI providers | Review usage dashboards per provider. |
| Vercel | Review project usage page. |
| GitHub Actions | Review Actions minutes and billable usage. |
| CloudWatch / logs | Review log volume and retention. |
| Payload logging | Confirm payload logging volume remains expected and intentional. |

## Cost-Control Checklist

- [ ] AWS Budget alerts configured at $100 / $200 / $300.
- [ ] AI provider spend alerts configured per provider at $50 / $100 / $150.
- [ ] Vercel project spend alert or limit configured at $20–$40.
- [ ] GitHub Actions usage reviewed or alerted at $10–$25.
- [ ] CloudWatch log retention set to short defaults, such as 7-14 days for non-audit logs.
- [ ] Payload logging disabled by default in production and opt-in only where explicitly required.
- [ ] Provider attempt limits enforced, including max retries and max attempts per request.
- [ ] Token and output limits configured on all LLM calls.
- [ ] No continuously hosted dev or staging environments left running overnight.
- [ ] Private beta total spend reviewed against the $1,000/month ceiling.

## Intentionally Deferred

Deferred / out of MVP scope:

- Runtime quota enforcement.
- Billing integration / Stripe.
- Infrastructure-as-code budget resources, unless already available.
- Cost dashboard.
- Analytics warehouse.
- Long-term trace storage.
- Multi-region planning.

## Related Service-Level Issues

Runtime work belongs in service repositories:

- Usage attribution per execution / per tenant: arbiter-systems/control-plane-api#TODO
- Provider guardrails: attempt limits, retry caps, token caps: arbiter-systems/control-plane-api#TODO
- Logging controls: payload redaction, payload logging defaults, retention: arbiter-systems/control-plane-api#TODO
- Provider-side usage and error normalization support: arbiter-systems/ai-execution-service#TODO
