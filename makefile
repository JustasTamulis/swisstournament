PROJECT=tournament
VERSION=3.12.7

VENV_DIR=$(shell pyenv root)/versions/${VENV}
VENV=${PROJECT}-${VERSION}
BACKUP_DIR=backups


help: ## Show this help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


########################################################################################
## Setup commands

clean: ## clean virtualenv
	rm -rf .state
	pyenv virtualenv-delete --force ${VENV}
	rm .python-version

venv: $(VENV_DIR) ## Setup venv
$(VENV_DIR):
	pyenv install -s ${VERSION}
	pyenv virtualenv ${VERSION} ${VENV}
	pyenv local $(VENV)


install: .state/pyvenv ## Install Python dependencies
.state/pyvenv: $(VENV_DIR) requirements.txt
	pyenv local $(VENV)
	pip install --upgrade pip
	pip install -r requirements.txt

	# Mark the state so we don't reinstall needlessly
	mkdir -p .state
	touch .state/pyvenv


########################################################################################
## Hero commands

deploy: ## Deploy to Heroku
	git push heroku master

########################################################################################
## Frontend commands

front: ## Run the frontend
	cd frontend && npm run dev

buildfront: ## Build the frontend
	cd frontend && npm run build --emptyOutDir

########################################################################################
## Django commands

collectstatic: ## Collect static files
	cd backend && python manage.py collectstatic --noinput

back: ## Run Django development server
	cd backend && python manage.py runserver

debug_back: ## Run Django development server with debug logging
	cd backend && python -v manage.py runserver --traceback

## Run the full stack
run: buildfront collectstatic back

########################################################################################
## Database related

mmig: ## Create new database migrations
	cd backend && python manage.py makemigrations

mig: ## Apply database migrations
	cd backend && python manage.py migrate

admin: ## Create a superuser
	DJANGO_SUPERUSER_PASSWORD=l DJANGO_SUPERUSER_USERNAME=l DJANGO_SUPERUSER_EMAIL="" python backend/manage.py createsuperuser --noinput

data_to_heroku: ## Load data to Heroku
	python backend/manage.py dumpdata api --indent 2 > heroku_db_data.json
	git add heroku_db_data.json
	git commit -m "Update heroku_db_data.json"
	git push heroku master
	heroku run python backend/manage.py loaddata heroku_db_data.json

view_session: ## View session data
	cd backend && python manage.py shell -c "from django.contrib.sessions.models import Session; print('Available Sessions:'); [print(f'Session {s.pk} - Expires: {s.expire_date} - Data: {s.get_decoded()}') for s in Session.objects.all()]"

clean_sessions: ## Clean all session data
	cd backend && python manage.py shell -c "from django.contrib.sessions.models import Session; count = Session.objects.all().count(); Session.objects.all().delete(); print(f'Deleted {count} sessions')"

debug_session: ## Debug session issues in detail
	@echo "=== Django Version ==="
	cd backend && python -c "import django; print(django.get_version())"
	@echo "\n=== Session Engine ==="
	cd backend && python -c "from django.conf import settings; print(settings.SESSION_ENGINE if hasattr(settings, 'SESSION_ENGINE') else 'default (django.contrib.sessions.backends.db)')"
	@echo "\n=== Current Sessions ==="
	cd backend && python manage.py shell -c "from django.contrib.sessions.models import Session; sessions = list(Session.objects.all()); print(f'{len(sessions)} sessions found'); [print(f'Session {s.pk} - Expires: {s.expire_date}') for s in sessions]"
	@echo "\n=== Secret Key Info ==="
	cd backend && python -c "from django.conf import settings; print(f'Secret key length: {len(settings.SECRET_KEY)}'); print(f'First 10 chars: {settings.SECRET_KEY[:10]}...')"

########################################################################################
## Database Tools

reset_db: ## Remove all data and migrations
	@echo "Removing database and migrations..."
	@rm -f backend/db.sqlite3
	@find backend/api/migrations -type f -name "*.py" ! -name "__init__.py" -delete
	@find backend/api/migrations -type f -name "*.pyc" -delete
	@echo "Database reset complete"

create_db: ## Create new database with migrations
	cd backend && python manage.py makemigrations api
	cd backend && python manage.py migrate
	@echo "Database created successfully"

generate_fixtures: ## Generate initial data fixtures
	cd scripts && python create_initial_data.py

populate_db: ## Load initial data from fixtures
	cd backend && python manage.py loaddata api/fixtures/initial_data.json
	@echo "Initial data loaded successfully"

init_db: reset_db create_db generate_fixtures populate_db ## Reset, create and populate database with initial data

backup_db: ## Create a database backup
	@mkdir -p $(BACKUP_DIR)
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	cd backend && python manage.py dumpdata api --indent 2 > ../$(BACKUP_DIR)/db_backup_$$timestamp.json; \
	echo "Database backed up to $(BACKUP_DIR)/db_backup_$$timestamp.json"

list_backups: ## List all database backups
	@echo "Available backups:"
	@ls -l $(BACKUP_DIR)

restore_db: ## Restore database from a backup file
	@read -p "Enter backup file path: " filepath; \
	if [ -f "$$filepath" ]; then \
		cd backend && python manage.py loaddata $$filepath; \
		echo "Database restored from $$filepath"; \
	else \
		echo "Error: Backup file not found"; \
	fi

.PHONY: help clean venv install deploy front buildfront collectstatic back debug_back run mmig mig admin data_to_heroku view_session clean_sessions debug_session reset_db create_db generate_fixtures populate_db init_db backup_db list_backups restore_db
