# Backend MVP Baseline

Control Plane API and AI Execution Service now run locally as a validated two-service Docker system. This doc defines the completed MVP foundation and the gate for the next phase.

## Scope

- This is a decision baseline, not a design doc or runbook.
- Records the current backend MVP foundation.
- Defines the gate for the next implementation phase.
- Runtime changes are out of scope.
- Docker changes are out of scope.
- Compose is out of scope.
- Cloud deployment is out of scope.
- Terraform/ECS/Kubernetes are out of scope.
- Production secrets management is out of scope.
- Semantic execution primitives are out of scope.
- Console UI is out of scope.
- Public website expansion is out of scope.

## Completed MVP Capabilities

- Control Plane API container exists and runs locally.
- AI Execution Service container exists and runs locally.
- Two-service local Docker flow has been validated end to end.
- Health and readiness checks pass when both services are running.
- Control Plane reaches AI Execution Service through the documented local path.
- `POST /v1/execute/stream` succeeds end to end.
- Streaming response behavior matches the current MVP contract.
- Fake/deterministic provider flow works without real provider keys.
- Logs provide MVP-level evidence for correlation and execution tracing.
- Local two-service stack can be cleanly torn down.

## Validation Reference

- [Local Two-Service Docker Validation - 2026-05-16](./local-two-service-validation-results.md)

## Deferred Capabilities

- Semantic execution primitives.
- Console UI implementation.
- Public website expansion beyond lightweight planning.
- Production deployment infrastructure.
- Production secrets management.
- Real provider key integration beyond placeholder flow.

## Next-Phase Gate

- Semantic execution work may begin once this baseline is recorded.
- Public site and console work should stay lightweight and planning-focused until backend semantics are stable.
- Production deployment infrastructure remains deferred until the semantic layer exists.
