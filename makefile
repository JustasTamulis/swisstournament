PYTHON ?= python3
PIP ?= pip3
BACKEND_DIR := backend
FRONTEND_DIR := frontend

help: ## Show available commands
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Install backend and frontend dependencies
	$(PIP) install -r requirements.txt
	cd $(FRONTEND_DIR) && npm install

migrate: ## Run Django migrations
	cd $(BACKEND_DIR) && $(PYTHON) manage.py migrate

seed: ## Seed template example data
	cd $(BACKEND_DIR) && $(PYTHON) manage.py shell -c "from django.test import Client; print(Client().post('/api/seed/').status_code)"

dev-backend: ## Run Django dev server
	cd $(BACKEND_DIR) && $(PYTHON) manage.py runserver

dev-frontend: ## Run Vite dev server
	cd $(FRONTEND_DIR) && npm run dev

dev: ## Print instructions for running both services
	@echo "Run 'make dev-backend' and 'make dev-frontend' in separate terminals."

build-frontend: ## Build frontend assets
	cd $(FRONTEND_DIR) && npm run build

test: ## Run backend tests
	cd $(BACKEND_DIR) && $(PYTHON) manage.py test

lint-frontend: ## Run frontend lint
	cd $(FRONTEND_DIR) && npm run lint

heroku-setup: ## Create and configure a Heroku app
	heroku create $$APP_NAME
	heroku addons:create heroku-postgresql:mini --app $$APP_NAME
	heroku buildpacks:set heroku/python --app $$APP_NAME
	heroku buildpacks:add --index 1 heroku/nodejs --app $$APP_NAME
	heroku config:set DJANGO_SETTINGS_MODULE=backend.app.settings --app $$APP_NAME

heroku-deploy: ## Deploy current branch to Heroku
	git push heroku HEAD:main
	heroku run "cd backend && python manage.py migrate" 

.PHONY: help bootstrap migrate seed dev-backend dev-frontend dev build-frontend test lint-frontend heroku-setup heroku-deploy
