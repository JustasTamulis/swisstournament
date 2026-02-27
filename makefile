PYTHON ?= python3
VENV_DIR ?= .venv
VENV_PYTHON := $(VENV_DIR)/bin/python
VENV_PIP := $(VENV_DIR)/bin/pip
FRONTEND_DIR ?= frontend
HEROKU_APP ?= your-heroku-app

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_\-]+:.*##/ {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

venv: ## Create local Python virtual environment
	$(PYTHON) -m venv $(VENV_DIR)

install-backend: venv ## Install backend dependencies
	$(VENV_PIP) install --upgrade pip
	$(VENV_PIP) install -r requirements.txt

install-frontend: ## Install frontend dependencies
	npm --prefix $(FRONTEND_DIR) install

install: install-backend install-frontend ## Install all dependencies

run-backend: ## Run Django API server (localhost:8000)
	$(VENV_PYTHON) backend/manage.py migrate
	$(VENV_PYTHON) backend/manage.py runserver

run-frontend: ## Run Vite frontend (localhost:5173)
	npm --prefix $(FRONTEND_DIR) run dev

makemigrations: ## Generate Django migrations
	$(VENV_PYTHON) backend/manage.py makemigrations

migrate: ## Apply Django migrations
	$(VENV_PYTHON) backend/manage.py migrate

bootstrap: ## Seed sample data via API (requires running backend)
	curl -s -X POST http://127.0.0.1:8000/api/bootstrap/ | python3 -m json.tool

test: ## Run backend tests
	$(VENV_PYTHON) backend/manage.py test

lint-frontend: ## Run frontend linter
	npm --prefix $(FRONTEND_DIR) run lint

build-frontend: ## Build frontend into ./static for Django
	npm --prefix $(FRONTEND_DIR) run build -- --emptyOutDir

collectstatic: ## Collect static files for production
	$(VENV_PYTHON) backend/manage.py collectstatic --noinput

build: build-frontend collectstatic ## Build production assets

clean: ## Remove generated local artifacts
	rm -rf $(VENV_DIR) .state backend/db.sqlite3 backend/staticfiles static

heroku-config: ## Example: set required Heroku config vars
	heroku config:set \
		DJANGO_DEBUG=0 \
		DJANGO_SECRET_KEY='<set-a-secret-value>' \
		DJANGO_ALLOWED_HOSTS='$(HEROKU_APP).herokuapp.com' \
		DJANGO_CORS_ALLOWED_ORIGINS='https://$(HEROKU_APP).herokuapp.com' \
		--app $(HEROKU_APP)

heroku-deploy: ## Deploy current branch to Heroku
	git push heroku main

heroku-logs: ## Tail Heroku logs
	heroku logs --tail --app $(HEROKU_APP)

.PHONY: help venv install-backend install-frontend install run-backend run-frontend makemigrations migrate bootstrap test lint-frontend build-frontend collectstatic build clean heroku-config heroku-deploy heroku-logs
