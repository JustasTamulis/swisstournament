from rest_framework import serializers
from .models import Country, League, Characteristic, FootballClub


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