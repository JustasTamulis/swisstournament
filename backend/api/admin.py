from django.contrib import admin
from .models import Team, Round, Game, Bet, Odds, Bonus

# Custom admin for Team
class TeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'identifier', 'name', 'bets_available', 'distance', 'created', 'modified')
    list_filter = ('bets_available', 'created')
    search_fields = ('identifier', 'name', 'description')
    ordering = ('name',)
    fieldsets = (
        (None, {
            'fields': ('identifier', 'name')
        }),
        ('Details', {
            'fields': ('description', 'bets_available', 'distance')
        }),
    )

# Custom admin for Round
class RoundAdmin(admin.ModelAdmin):
    list_display = ('id', 'number', 'stage', 'active', 'created', 'modified')
    list_filter = ('active', 'stage')
    search_fields = ('number', 'stage')
    ordering = ('number',)
    fieldsets = (
        (None, {
            'fields': ('number', 'stage')
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )

# Custom admin for Game
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'team1', 'team2', 'round', 'win', 'location', 'finished', 'created')
    list_filter = ('finished', 'round', 'win', 'location')
    search_fields = ('team1__name', 'team2__name', 'location')
    ordering = ('-round__number', 'team1__name')
    fieldsets = (
        ('Teams', {
            'fields': ('team1', 'team2')
        }),
        ('Game Info', {
            'fields': ('round', 'win', 'location', 'finished')
        }),
    )

# Custom admin for Bet
class BetAdmin(admin.ModelAdmin):
    list_display = ('id', 'team', 'bet_on_team', 'round', 'bet_finish', 'created')
    list_filter = ('bet_finish', 'round')
    search_fields = ('team__name', 'bet_on_team__name')
    ordering = ('-created',)
    fieldsets = (
        ('Bet Details', {
            'fields': ('team', 'bet_on_team', 'odds', 'round')
        }),
        ('Status', {
            'fields': ('bet_finish',)
        }),
    )

# Custom admin for Odds
class OddsAdmin(admin.ModelAdmin):
    list_display = ('id', 'team', 'round', 'odd1', 'odd2', 'created', 'modified')
    list_filter = ('round',)
    search_fields = ('team__name',)
    ordering = ('round', 'team__name')
    fieldsets = (
        ('Relationship', {
            'fields': ('team', 'round')
        }),
        ('Odds Values', {
            'fields': ('odd1', 'odd2')
        }),
    )

# Custom admin for Bonus
class BonusAdmin(admin.ModelAdmin):
    list_display = ('id', 'team', 'round', 'description', 'bonus_type', 'bonus_target', 'finished', 'created')
    list_filter = ('finished', 'round', 'bonus_type')
    search_fields = ('team__name', 'description', 'bonus_type', 'bonus_target')
    ordering = ('-created',)
    fieldsets = (
        ('Bonus Info', {
            'fields': ('team', 'round', 'description')
        }),
        ('Bonus Details', {
            'fields': ('bonus_type', 'bonus_target')
        }),
        ('Status', {
            'fields': ('finished',)
        }),
    )

# Register your models here.
admin.site.register(Team, TeamAdmin)
admin.site.register(Round, RoundAdmin)
admin.site.register(Game, GameAdmin)
admin.site.register(Bet, BetAdmin)
admin.site.register(Odds, OddsAdmin)
admin.site.register(Bonus, BonusAdmin)
