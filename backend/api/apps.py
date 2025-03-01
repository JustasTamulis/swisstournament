from django.apps import AppConfig


class HelloConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "hello"

class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"
