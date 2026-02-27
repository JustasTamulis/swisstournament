# Web App Starter Template (Django + React)

This repository is now a **starter template** for future full-stack projects.  
It provides a clean, opinionated baseline that demonstrates:

- Django REST API design with seed data and custom actions
- React pages with shared context and API integration
- Local developer workflow and Heroku deployment path

---

## High-level structure

```text
backend/
  app/                # Django project settings + root urls
  api/                # Example domain models, serializers, views, urls, tests
frontend/
  src/
    components/pages/ # Example routed pages
    context/          # Shared app state + bootstrap/refresh logic
    services/         # API client functions
```

### Backend/Frontend interaction

1. React bootstraps through `AppTemplateProvider`.
2. On startup, frontend calls `POST /api/seed/` once (safe if already seeded).
3. Frontend fetches:
   - `GET /api/summary/` (dashboard counts)
   - `GET /api/stages/`
   - `GET /api/features/`
   - `GET /api/activity/`
4. On `Features` page, clicking **Advance** calls `POST /api/features/<id>/advance/`.
5. Backend persists status updates and writes an activity log event.

This gives you an end-to-end example of read + write + refresh behavior.

---

## Template domain (example only)

The sample domain models a delivery workflow:

- `Stage`: workflow lanes (Discovery, Implementation, Release)
- `Feature`: backlog items with owners and status
- `ActivityLog`: timeline of important changes

Replace these models/endpoints with your product domain once you start a real app.

---

## Quick start

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm

### 1) Install dependencies

```bash
make bootstrap
```

### 2) Run migrations

```bash
make migrate
```

### 3) Start services (separate terminals)

```bash
make dev-backend
make dev-frontend
```

Then open the Vite URL (usually `http://localhost:5173`).

### 4) Optional checks

```bash
make test
make lint-frontend
```

---

## Starting a new web app from this template

1. **Rename the project/app** naming in `backend/app/settings.py`, `frontend/package.json`, and README title.
2. **Replace domain layer** in `backend/api/models.py`, migrations, serializers, and views.
3. **Refit API services** in `frontend/src/services/tournamentService.js` (rename file if desired).
4. **Replace example pages** under `frontend/src/components/pages/` with product screens.
5. **Keep structure**, not content: preserve separation between pages, API service, and context store.
6. Add CI/CD and environment-specific settings once your product scope is defined.

---

## Heroku setup/deploy

### One-time setup

```bash
export APP_NAME=your-app-name
make heroku-setup
```

### Deploy

```bash
make heroku-deploy
```

### Recommended env vars

Set these with `heroku config:set`:

- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=<your-app>.herokuapp.com`
- Any app-specific integration credentials

---

## Cleanup that was performed

- Removed backup dump folders and temporary data exports.
- Removed tournament-specific assets/pages/business logic.
- Replaced with concise example API + UI that you can repurpose quickly.
