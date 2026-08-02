# Yojana Sarthi — Removal of Supabase, Docker, and Cloud Run

This plan details the steps to completely purge all references to Supabase, Docker configurations, and Google Cloud Run deployment pipelines from the project.

---

## User Review Required

> [!WARNING]
> This change will permanently delete all cloud deployment scripts (`deploy-cloudrun.sh`, `cloudbuild.yaml`) and Docker image builds (`Dockerfile`, `.dockerignore`, `docker-compose.yml`) from the local workspace. Please approve to proceed with the deletions and cleanups.

---

## Proposed Changes

---

### File Deletions

#### [DELETE] [Dockerfile](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/Dockerfile)
- Remove Docker containerization instructions.

#### [DELETE] [.dockerignore](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/.dockerignore)
- Remove Docker build ignore list.

#### [DELETE] [docker-compose.yml](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/docker-compose.yml)
- Remove multi-container docker services configuration.

#### [DELETE] [deploy-cloudrun.sh](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/deploy-cloudrun.sh)
- Remove manual Google Cloud Run deployment script.

#### [DELETE] [cloudbuild.yaml](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/cloudbuild.yaml)
- Remove continuous integration / deployment trigger pipeline definition.

---

### Dependency Updates

#### [MODIFY] [requirements.txt](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/requirements.txt)
- Remove the `supabase` package from root dependencies.

#### [MODIFY] [backend/requirements.txt](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/requirements.txt)
- Remove the `supabase` package from backend dependencies.

---

## Verification Plan

### Automated Verification
- Verify that python files build and compile successfully without `supabase` in the requirements.
- Run frontend build checks to ensure no references are broken.
