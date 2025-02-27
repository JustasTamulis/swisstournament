web: gunicorn --config gunicorn.conf.py backend.app.wsgi
release: ./backend/manage.py migrate --no-input

# migrations are run as part of app deployment, using Heroku's Release Phase feature:
# https://docs.djangoproject.com/en/5.1/topics/migrations/
# https://devcenter.heroku.com/articles/release-phase