PROJECT=tournament
VERSION=3.12.7

VENV_DIR=$(shell pyenv root)/versions/${VENV}
VENV=${PROJECT}-${VERSION}



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
	cd frontend && npm run build

########################################################################################
## Django commands

collectstatic: ## Collect static files
	cd backend && python manage.py collectstatic --noinput

back: ## Run Django development server
	cd backend && python manage.py runserver


########################################################################################
## Database related

makemigrations: ## Create new database migrations
	python backend/manage.py makemigrations

migrate: ## Apply database migrations
	python backend/manage.py migrate

admin: ## Create a superuser
	python backend/manage.py createsuperuser

data_to_heroku: ## Load data to Heroku
	python backend/manage.py dumpdata api --indent 2 > heroku_db_data.json
	git add heroku_db_data.json
	git commit -m "Update heroku_db_data.json"
	git push heroku master
	heroku run python backend/manage.py loaddata heroku_db_data.json

########################################################################################
## 

run: buildfront collectstatic back ## Run the full stack

