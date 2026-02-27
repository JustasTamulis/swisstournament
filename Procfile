release: python backend/manage.py migrate --no-input
web: npm run build && python backend/manage.py collectstatic --noinput && gunicorn --config gunicorn.conf.py backend.app.wsgi
