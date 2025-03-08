from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CountryViewSet,
    LeagueViewSet,
    CharacteristicViewSet,
    FootballClubViewSet,
    TeamViewSet,
    RoundViewSet,
    GameViewSet,
    BetViewSet,
)

router = DefaultRouter()
router.register("country", CountryViewSet, basename="country")
router.register("league", LeagueViewSet, basename="league")
router.register("characteristic", CharacteristicViewSet, basename="characteristic")
router.register("footballclub", FootballClubViewSet, basename="footballclub")
router.register("team", TeamViewSet, basename="team")
router.register("round", RoundViewSet, basename="round")
router.register("game", GameViewSet, basename="game")
router.register("bet", BetViewSet, basename="bet")

urlpatterns = router.urls