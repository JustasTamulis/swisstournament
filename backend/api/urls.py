from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'teams', views.TeamViewSet, 'team')
router.register(r'rounds', views.RoundViewSet, 'round')
router.register(r'games', views.GameViewSet, 'game')
router.register(r'bets', views.BetViewSet, 'bet')
router.register(r'odds', views.OddsViewSet, 'odds')
router.register(r'bonuses', views.BonusViewSet, 'bonus')

urlpatterns = [
    path('', include(router.urls)),
    path('place-bet/', views.place_bet, name='place-bet'),
    path('mark-game/', views.mark_game, name='mark-game'),
    path('use-bonus/', views.use_bonus, name='use-bonus'),
    path('get-round-info/', views.get_round_info, name='get-round-info'),
    path('get-bets-available/', views.get_bets_available, name='get-bets-available'),
    path('get-next-opponent/', views.get_next_opponent, name='get-next-opponent'),
    path('get-bonus-for-team/', views.get_bonus_for_team, name='get-bonus-for-team'),
    path('get-betting-table/', views.get_betting_table, name='get-betting-table'),
]