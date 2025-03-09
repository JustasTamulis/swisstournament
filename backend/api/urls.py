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
    OddsViewSet,
    BonusViewSet,
    place_bet,
    mark_game,
    use_bonus
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
router.register("odds", OddsViewSet, basename='odds')
router.register("bonus", BonusViewSet, basename='bonus')

urlpatterns = router.urls + [
    path('place-bet/', place_bet, name='place-bet'),
    path('mark-game/', mark_game, name='mark-game'),
    path('use-bonus/', use_bonus, name='use-bonus'),
]