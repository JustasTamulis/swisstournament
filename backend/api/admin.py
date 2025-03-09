from django.contrib import admin
from .models import Country, League, Characteristic, FootballClub, Team, Round, Game, Bet, Odds

# Register your models here.
admin.site.register(Country)
admin.site.register(League)
admin.site.register(Characteristic)
admin.site.register(FootballClub)
admin.site.register(Team)
admin.site.register(Round)
admin.site.register(Game)
admin.site.register(Bet)
admin.site.register(Odds)
