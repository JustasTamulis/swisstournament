from rest_framework import serializers
from .models import Country, League, Characteristic, FootballClub, Team, Round, Game, Odds, Bet, Bonus


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('id', 'name')

class LeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = ('id', 'name')

class CharacteristicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Characteristic
        fields = ('id', 'name')

class FootballClubSerializer(serializers.ModelSerializer):
    league_details = LeagueSerializer(source='league', read_only=True)
    country_details = CountrySerializer(source='country', read_only=True)
    characteristic_names = serializers.SerializerMethodField()
    class Meta:
        model = FootballClub
        fields = "__all__"

    def get_characteristic_names(self, obj):
        return [c.name for c in obj.characteristic.all()]

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
    team_details = TeamSerializer(source='team', read_only=True)
    round_details = RoundSerializer(source='round', read_only=True)
    
    class Meta:
        model = Bonus
        fields = '__all__'