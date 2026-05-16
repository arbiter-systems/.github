# Local Two-Service Docker Flow

## Purpose

This guide documents a local two-container flow for development and cross-service compatibility verification between the Control Plane API and AI Execution Service. It is not production deployment guidance.

## Services and Ports

| Service | Repo | Container port | Host port (suggested) |
|---|---|---:|---:|
| Control Plane API | `arbiter-systems/control-plane-api` | `8080` suggested; verify in the service Dockerfile or README | `8080` |
| AI Execution Service | `arbiter-systems/ai-execution-service` | `8000` | `8081` |

## Startup Order

1. Start the AI Execution Service container.
2. Verify its health endpoint responds.
3. Start the Control Plane API container with `AI_EXECUTION_SERVICE_URL` pointing at the AI Execution Service.
4. Verify the Control Plane health endpoint.

## Run Commands

AI Execution Service:

```powershell
docker network create arbiter-local
docker run --rm --name ai-execution-service --network arbiter-local -p 8081:8000 -e INTERNAL_SERVICE_API_KEY=replace-me-local-only arbiter/ai-execution-service:local
```

Control Plane API:

```powershell
docker run --rm --name control-plane-api --network arbiter-local -p 8080:8080 -e AI_EXECUTION_SERVICE_URL=http://ai-execution-service:8000 -e INTERNAL_SERVICE_API_KEY=replace-me-local-only arbiter/control-plane-api:local
```

## Environment Variables

| Variable | Service | Purpose | Example (placeholder) |
|---|---|---|---|
| `AI_EXECUTION_SERVICE_URL` | Control Plane API | Downstream base URL used by the Control Plane to reach the AI Execution Service on the shared Docker network. | `http://ai-execution-service:8000` |
| `INTERNAL_SERVICE_API_KEY` | Control Plane API | Local-only internal service key sent to the AI Execution Service. | `replace-me-local-only` |
| `INTERNAL_SERVICE_API_KEY` | AI Execution Service | Local-only internal service key expected from the Control Plane. The value must match the Control Plane value. | `replace-me-local-only` |

The local key value is only a fake placeholder for local use and must never be a real secret.

## Health Checks

Check the AI Execution Service from the host:

```powershell
curl.exe http://localhost:8081/health/live
```

Expect HTTP `200`.

Check the Control Plane API from the host:

```powershell
curl.exe http://localhost:8080/health/live
```

Expect HTTP `200`.

## Basic Compatibility Check

1. Send a minimal request to the Control Plane endpoint that is intended to dispatch work to the AI Execution Service.
2. Confirm the Control Plane logs show the inbound request and downstream call.
3. Confirm the AI Execution Service logs show the received request.
4. Confirm the response shape matches what the Control Plane returns to clients.

## Known MVP Limitations

- No Docker Compose file is provided in this repo.
- No production deployment automation, secrets manager, Kubernetes, ECS, or Terraform.
- No CI image publishing.
- No live provider credentials; local runs use placeholder keys.
- Ports, image tags, and env var names are suggested defaults; the authoritative values live in each service repo's own Dockerfile and README.

## Related Docs

- `docs/operations/mvp-cost-controls.md`
- `control-plane-api/README.md`
- `control-plane-api/docs/ops/runbook.md`
- `ai-execution-service/README.md`
- `ai-execution-service/docs/ops/local-container-runbook.md`
