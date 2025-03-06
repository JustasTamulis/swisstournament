release: ./backend/manage.py migrate --no-input
web: npm run build && python backend/manage.py collectstatic --noinput && gunicorn --config gunicorn.conf.py backend.app.wsgi

# migrations are run as part of app deployment, using Heroku's Release Phase feature:
# https://docs.djangoproject.com/en/5.1/topics/migrations/
# https://devcenter.heroku.com/articles/release-phase