from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CountryViewSet, LeagueViewSet, CharacteristicViewSet

router = DefaultRouter()
router.register("country", CountryViewSet, basename="country")
router.register("league", LeagueViewSet, basename="league")
router.register("characteristic", CharacteristicViewSet, basename="characteristic")

urlpatterns = router.urls