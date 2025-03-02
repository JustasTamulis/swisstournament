PROJECT=tournament
VERSION=3.12.7

VENV_DIR=$(shell pyenv root)/versions/${VENV}
VENV=${PROJECT}-${VERSION}

help: ## Show this help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

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

front: ## Run the frontend
	cd frontend && npm run dev

run: ## Run Django development server
	python backend/manage.py runserver

migrate: ## Apply database migrations
    python backend/manage.py migrate

makemigrations: ## Create new database migrations
    python backend/manage.py makemigrations

shell: ## Open Django shell
    python backend/manage.py shell

admin: ## Create a superuser
    python backend/manage.py createsuperuser

test: ## Run Django tests
    python backend/manage.py test