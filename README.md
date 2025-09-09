
# Monitoring Dashboard Platform (Python + React, k3s)

A production-grade, containerized microservices app with CI/CD and k3s manifests.

## Architecture
- **Backend**: FastAPI serving `/metrics` and `/health`
- **Frontend**: React (Vite) + Recharts, polling every 10s
- **Proxy**: Nginx in frontend container proxies `/api/*` to `backend:8000` (works in Docker and K8s)
- **Images**: Multi-stage builds, small base images
- **Kubernetes**: Deployments, Services, probes, resource requests/limits, labels, namespace
- **CI/CD**: GitHub Actions builds & pushes to GHCR, then optionally deploys to your cluster

```mermaid
flowchart LR
  A[Browser] -->|HTTP| F[Frontend (Nginx + React)]
  F -->|/api/*| B[Backend (FastAPI)]
  subgraph Cluster (Docker/k3s)
    F
    B
  end
```

## Local (Docker Compose)
```bash
docker compose up --build
# Frontend: http://localhost:8080
# Backend:  http://localhost:8000/metrics  and  /health
```

## k3s Deployment
Assuming you have `kubectl` pointing to your local k3s:

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl -n monitor apply -f k8s/10-backend-deployment.yaml
kubectl -n monitor apply -f k8s/11-backend-service.yaml
kubectl -n monitor apply -f k8s/20-frontend-deployment.yaml
kubectl -n monitor apply -f k8s/21-frontend-service.yaml

kubectl -n monitor get svc
# Access:
#   Frontend NodePort -> http://<node-ip>:30081
#   Backend  NodePort -> http://<node-ip>:30080/metrics
```

> **Note:** Replace `ghcr.io/OWNER/REPO-*` in `k8s/*-deployment.yaml` with your actual GHCR image names or rely on the CI job which patches them automatically during deploy.

## CI/CD (GitHub Actions -> GHCR -> k3s)
1. Create a GitHub repo and push this project.
2. Enable GHCR permissions (default `GITHUB_TOKEN` works for your repo scope).
3. Optional deploy step requires a base64-encoded kubeconfig:
   - `cat ~/.kube/config | base64 -w0 | pbcopy` (Linux/macOS)
   - Add to repo *Actions Secrets* as `KUBECONFIG_BASE64`.
4. On push to `main`, images are built and pushed:
   - Backend: `ghcr.io/<owner>/<repo>-backend:<sha>`
   - Frontend: `ghcr.io/<owner>/<repo>-frontend:<sha>`
5. Deploy job patches manifests with the exact SHA tag and `kubectl apply`s them.

## Troubleshooting
- **Pods not ready**: `kubectl -n monitor describe pod <name>` then `kubectl logs`
- **Frontend cannot reach backend**: ensure nginx routes `/api/` to `backend:8000` and the `backend` Service exists.
- **Ports already in use (local)**: change the published ports in `docker-compose.yml`.
- **Image pull errors in k3s**: ensure GHCR visibility/permissions or create a pull secret if private.

## Tests & Lint
- Backend unit tests: `pytest` (inside backend container or local venv). A basic suite is included.
- Frontend: minimal for brevity. You can add ESLint/Prettier as needed.

## Sizes
- Python 3.12 slim & nginx:alpine keep images under ~200MB each.
