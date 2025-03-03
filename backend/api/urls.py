from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CountryViewSet, LeagueViewSet, CharacteristicViewSet, FootballClubViewSet

router = DefaultRouter()
router.register("country", CountryViewSet, basename="country")
router.register("league", LeagueViewSet, basename="league")
router.register("characteristic", CharacteristicViewSet, basename="characteristic")
router.register("footballclub", FootballClubViewSet, basename="footballclub")

urlpatterns = router.urls