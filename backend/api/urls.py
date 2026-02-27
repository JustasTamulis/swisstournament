from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"stages", views.StageViewSet, basename="stage")
router.register(r"features", views.FeatureViewSet, basename="feature")
router.register(r"activity", views.ActivityLogViewSet, basename="activity")

urlpatterns = [
    path("", include(router.urls)),
    path("summary/", views.template_summary, name="template-summary"),
    path("seed/", views.seed_template_data, name="seed-template-data"),
]
