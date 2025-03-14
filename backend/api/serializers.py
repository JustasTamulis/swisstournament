from rest_framework import serializers
from .models import Team, Round, Game, Odds, Bet, Bonus


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = '__all__'

class GameSerializer(serializers.ModelSerializer):
    team1_details = TeamSerializer(source='team1', read_only=True)
    team2_details = TeamSerializer(source='team2', read_only=True)
    round_details = RoundSerializer(source='round', read_only=True)
    
    class Meta:
        model = Game
        fields = '__all__'

class OddsSerializer(serializers.ModelSerializer):
    round_details = RoundSerializer(source='round', read_only=True)
    team_details = TeamSerializer(source='team', read_only=True)
    
    class Meta:
        model = Odds
        fields = '__all__'

class BetSerializer(serializers.ModelSerializer):
    team_details = TeamSerializer(source='team', read_only=True)
    bet_on_team_details = TeamSerializer(source='bet_on_team', read_only=True)
    odds_details = OddsSerializer(source='odds', read_only=True)
    round_details = RoundSerializer(source='round', read_only=True)
    
    class Meta:
        model = Bet
        fields = '__all__'

class BonusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bonus
        fields = ('id', 'team', 'round', 'finished', 'description', 'bonus_type', 'bonus_target', 'created')