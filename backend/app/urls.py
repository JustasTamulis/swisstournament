from django.contrib import admin
from django.urls import include, path, re_path

from backend.api.views import React

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("backend.api.urls")),
    re_path(r"^.*", React.as_view(), name="frontend"),
]
