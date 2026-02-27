from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"workspaces", views.WorkspaceViewSet, basename="workspace")
router.register(r"items", views.WorkItemViewSet, basename="item")
router.register(r"activity", views.ActivityLogViewSet, basename="activity")

urlpatterns = [
    path("", include(router.urls)),
    path("overview/", views.overview, name="overview"),
    path("health/", views.health, name="health"),
    path("bootstrap/", views.bootstrap, name="bootstrap"),
]
