# Local Two-Service Docker Validation - 2026-05-16

Tracking issue: arbiter-systems/.github#20

## Environment

| Item | Value |
|---|---|
| OS | Microsoft Windows NT 10.0.26200.0 |
| Docker client | 29.4.3, API 1.54, windows/amd64 |
| Docker server | Docker Desktop 4.73.0, Engine 29.4.3, API 1.54, linux/amd64 |
| AI Execution Service commit SHA | `9d2787b2c64ee7ecb179b3ec873d2325d93b2f31` |
| Control Plane API commit SHA | `974425357f0c9e8d48934a580295bba46c85f288` |
| `.github` commit SHA | `3dc51559f687e2a333a2006214bad5d738234a78` |

## Commands and Output

### Docker availability

```powershell
docker version
```

Exit status: `0`

```text
Client:
 Version:           29.4.3
 API version:       1.54
 OS/Arch:           windows/amd64
 Context:           desktop-linux

Server: Docker Desktop 4.73.0 (226246)
 Engine:
  Version:          29.4.3
  API version:      1.54 (minimum version 1.40)
  OS/Arch:          linux/amd64
  Experimental:     false
```

### Port preflight

```powershell
Test-NetConnection -ComputerName localhost -Port 8000
```

Exit status: `0`

```text
WARNING: TCP connect to (::1 : 8000) failed
WARNING: TCP connect to (127.0.0.1 : 8000) failed
TcpTestSucceeded : False
```

```powershell
Test-NetConnection -ComputerName localhost -Port 8080
```

Exit status: `0`

```text
WARNING: TCP connect to (::1 : 8080) failed
WARNING: TCP connect to (127.0.0.1 : 8080) failed
TcpTestSucceeded : False
```

### Service repo working trees

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\ai-execution-service
git status --short --branch
```

Exit status: `0`

```text
## dev...origin/dev
```

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\control-plane-api
git status --short --branch
```

Exit status: `0`

```text
## dev...origin/dev
```

### Existing named containers

```powershell
docker ps -a --filter "name=ai-execution-service"
```

Exit status: `0`

```text
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

```powershell
docker ps -a --filter "name=control-plane-api"
```

Exit status: `0`

```text
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### Commit SHAs

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\ai-execution-service
git rev-parse HEAD
```

Exit status: `0`

```text
9d2787b2c64ee7ecb179b3ec873d2325d93b2f31
```

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\control-plane-api
git rev-parse HEAD
```

Exit status: `0`

```text
974425357f0c9e8d48934a580295bba46c85f288
```

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\.github
git rev-parse HEAD
```

Exit status: `0`

```text
3dc51559f687e2a333a2006214bad5d738234a78
```

### Step 1 - AI Execution Service

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\ai-execution-service
docker build -t ai-execution-service:local .
```

Exit status: `0`

```text
#0 building with "desktop-linux" instance using docker driver
#1 [internal] load build definition from Dockerfile
#2 [internal] load metadata for docker.io/library/python:3.12-slim
#4 [internal] load .dockerignore
#5 [internal] load build context
#6 [1/6] FROM docker.io/library/python:3.12-slim@sha256:401f6e1a67dad31a1bd78e9ad22d0ee0a3b52154e6bd30e90be696bb6a3d7461
#7 [4/6] COPY requirements.txt ./
#8 [2/6] WORKDIR /app
#9 [3/6] RUN addgroup --system app && adduser --system --ingroup app app
#10 [5/6] RUN pip install --no-cache-dir -r requirements.txt
#11 [6/6] COPY app ./app
#12 naming to docker.io/library/ai-execution-service:local done
#12 DONE 0.1s
```

```powershell
docker run --rm -d -p 8000:8000 --name ai-execution-service ai-execution-service:local
```

Exit status: `0`

```text
d36ae3286da52e7f854a19c51ac74810f5e0de9c64882e6850940a017608ce9f
```

Container ID: `d36ae3286da5`

```powershell
docker ps --filter "name=ai-execution-service"
```

Exit status: `0`

```text
CONTAINER ID   IMAGE                        COMMAND                  CREATED         STATUS                            PORTS                                         NAMES
d36ae3286da5   ai-execution-service:local   "python -m uvicorn a..."   5 seconds ago   Up 5 seconds (health: starting)   0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp   ai-execution-service
```

```powershell
curl.exe -fsS http://localhost:8000/health/live
```

Exit status: `0`

```json
{"status":"alive"}
```

```powershell
curl.exe -fsS http://localhost:8000/health/ready
```

Exit status: `0`

```json
{"status":"ready","providers":[{"providerId":"fake","status":"ready"}]}
```

### Step 2 - Control Plane API

```powershell
Set-Location C:\Users\Patrick\arbiter-systems\control-plane-api
docker build -t control-plane-api:local .
```

Exit status: `0`

```text
#0 building with "desktop-linux" instance using docker driver
#1 [internal] load build definition from Dockerfile
#2 [internal] load metadata for mcr.microsoft.com/dotnet/sdk:9.0
#3 [internal] load metadata for mcr.microsoft.com/dotnet/aspnet:9.0
#4 [internal] load .dockerignore
#5 [internal] load build context
#13 [build 7/7] RUN dotnet publish services/control-plane-api/control-plane-api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false
#17 naming to docker.io/library/control-plane-api:local done
#17 DONE 0.2s
```

```powershell
docker run --rm -d -p 8080:8080 --name control-plane-api -e ApiKey__Key=local-container-key -e AiExecution__ApiKey=local-execution-key -e AiExecution__BaseUrl=http://host.docker.internal:8000 control-plane-api:local
```

Exit status: `0`

```text
5017fb24662dc8adc8c8ebbbf20c1a0a041c314de6c64281c6afe5eebda3f97d
```

Container ID: `5017fb24662d`

```powershell
docker ps --filter "name=control-plane-api"
```

Exit status: `0`

```text
CONTAINER ID   IMAGE                     COMMAND                  CREATED         STATUS         PORTS                                         NAMES
5017fb24662d   control-plane-api:local   "dotnet control-plan..."   6 seconds ago   Up 5 seconds   0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp   control-plane-api
```

```powershell
curl.exe -fsS http://localhost:8080/health/live
```

Exit status: `0`

```text
Healthy
```

```powershell
curl.exe -i http://localhost:8080/health/ready
```

Exit status: `0`

```text
HTTP/1.1 200 OK
Content-Type: text/plain
X-Correlation-Id: 5a6747bd22e440e59a135370cd643833

Healthy
```

### Step 3 - Execution compatibility check

Documented Control Plane endpoint and request shape were found in `control-plane-api/README.md`, `control-plane-api/docs/PROJECT_FILE_MAP.md`, `control-plane-api/services/control-plane-api/Api/Controllers/ExecutionController.cs`, and `control-plane-api/services/control-plane-api/Application/Execution/Requests/ExecutionRequest.cs`:

- Endpoint: `POST /v1/execute/stream`
- Required public request fields: `model`, `prompt`
- API key header: `X-API-Key`

Documented AI Execution Service deterministic behavior was found in `ai-execution-service/TESTING.md`:

- Local fake provider streams one token event per prompt word.
- A successful stream ends with one `final` event.
- Events carry `protocolVersion`, `executionId`, `correlationId`, `type`, `sequence`, `provider`, and `model`.

Initial PowerShell quoting attempts produced HTTP `400` before execution. The successful PowerShell-compatible command used `--%` to pass JSON to `curl.exe` without shell rewriting:

```powershell
curl.exe --% -i -N -sS -X POST http://localhost:8080/v1/execute/stream -H "X-API-Key: local-container-key" -H "Content-Type: application/json" --data "{\"model\":\"openai\",\"prompt\":\"hello world\",\"maxTokens\":16}"
```

Exit status: `0`

```text
HTTP/1.1 200 OK
Content-Type: text/event-stream
X-Tenant-Id: dev
X-Correlation-Id: 3a868260949d4eae8e4f89409e851e42

event: token
data: {"protocolVersion":"1.0","executionId":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f","correlationId":"3a868260949d4eae8e4f89409e851e42","type":"token","sequence":1,"content":"hello ","provider":"openai","model":"openai"}

event: token
data: {"protocolVersion":"1.0","executionId":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f","correlationId":"3a868260949d4eae8e4f89409e851e42","type":"token","sequence":2,"content":"world ","provider":"openai","model":"openai"}

event: final
data: {"protocolVersion":"1.0","executionId":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f","correlationId":"3a868260949d4eae8e4f89409e851e42","type":"final","sequence":3,"provider":"openai","model":"openai","usage":{"inputTokens":0,"outputTokens":2,"totalTokens":2}}
```

```powershell
docker logs ai-execution-service --tail 50
```

Exit status: `0`

```text
INFO:     172.17.0.1:46368 - "POST /v1/executions/stream HTTP/1.1" 200 OK
{"message":"stream_request_received","execution_id":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f","tenant_id":"dev","correlation_id":"3a868260949d4eae8e4f89409e851e42","provider":"openai","model":"openai"}
{"message":"stream_started","execution_id":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f","tenant_id":"dev","correlation_id":"3a868260949d4eae8e4f89409e851e42","provider":"openai","model":"openai"}
{"message":"stream_terminal","execution_id":"f91a0ee8-0374-4c08-80c3-c9f45743fe7f","event_type":"final","sequence":3,"provider":"openai","model":"openai"}
```

```powershell
docker logs control-plane-api --tail 50
```

Exit status: `0`

```text
info: Api.Middleware.RequestLoggingMiddleware[0]
      Incoming request POST /v1/execute/stream
info: Application.Execution.Streaming.SseExecutionEventWriter[0]
      Terminal execution event written. ExecutionId=f91a0ee8-0374-4c08-80c3-c9f45743fe7f, Type=final, Sequence=3
info: Api.Middleware.RequestLoggingMiddleware[0]
      Completed request POST /v1/execute/stream with status 200
```

The response and AI Execution Service logs show the same correlation ID, `3a868260949d4eae8e4f89409e851e42`, and execution ID, `f91a0ee8-0374-4c08-80c3-c9f45743fe7f`.

### Step 4 - Cleanup

```powershell
docker stop control-plane-api
```

Exit status: `0`

```text
control-plane-api
```

```powershell
docker stop ai-execution-service
```

Exit status: `0`

```text
ai-execution-service
```

```powershell
docker ps --filter "name=ai-execution-service"
docker ps --filter "name=control-plane-api"
docker ps -a --filter "name=ai-execution-service"
docker ps -a --filter "name=control-plane-api"
```

Exit status: `0` for each command.

```text
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

Both named containers were removed after `docker stop` because they were started with `--rm`.

## Results Checklist

| Result | Item | Note |
|---|---|---|
| ✅ | AI Execution Service image builds. | `docker build -t ai-execution-service:local .` completed successfully. |
| ✅ | AI Execution Service container starts on port 8000. | Container `d36ae3286da5` mapped `0.0.0.0:8000->8000/tcp`. |
| ✅ | AI Execution Service `/health/live` returns 200. | Response body: `{"status":"alive"}`. |
| ✅ | AI Execution Service `/health/ready` returns 200. | Response body reported fake provider ready. |
| ✅ | Control Plane API image builds. | `docker build -t control-plane-api:local .` completed successfully. |
| ✅ | Control Plane API container starts on port 8080. | Container `5017fb24662d` mapped `0.0.0.0:8080->8080/tcp`. |
| ✅ | Control Plane API reaches AI Execution Service via `host.docker.internal:8000`. | Control Plane `/health/ready` returned 200 and end-to-end execution reached AI Execution Service. |
| ✅ | Control Plane `/health/live` returns 200. | Response body: `Healthy`. |
| ✅ | Control Plane `/health/ready` returns 200. | Response body: `Healthy`. |
| ✅ | Basic execution compatibility request succeeds end to end. | `POST /v1/execute/stream` returned HTTP 200 with token and final SSE events. |
| ✅ | Streaming/response behavior matches currently documented MVP contract. | Control Plane returned SSE wrapping v1 token/final event payloads; AI service logs show v1 stream request and terminal final event. |
| ✅ | No real provider keys were used; placeholders only. | Used `local-container-key` and `local-execution-key`; no live provider credentials supplied. |
| ✅ | Cleanup removed the named containers. | `docker ps` and `docker ps -a` for both names returned no containers. |

## Failures and Follow-ups

No acceptance checklist failures or warnings.

## Notes

- Docker Desktop was available through the `desktop-linux` context.
- AI Execution Service Docker health was still `starting` immediately after container start, but host `/health/live` and `/health/ready` were already responding with HTTP 200.
- Control Plane logged `Hosting environment: Production` because the validation used the container default environment with local placeholder settings supplied at runtime.
- PowerShell command parsing rewrote two initial JSON request attempts, causing HTTP 400 validation errors before execution. The successful `curl.exe --%` command avoided shell JSON rewriting.
- `host.docker.internal:8000` worked from the Control Plane container to the AI Execution Service container published on host port 8000.
