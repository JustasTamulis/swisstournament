import requests
import os
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import Greeting, Country, League, Characteristic, FootballClub
from .serializers import (
    CountrySerializer,
    LeagueSerializer,
    CharacteristicSerializer,
    FootballClubSerializer,
)


class CountryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Country.objects.all()
    serializer_class = CountrySerializer

    def list(self, request):
        queryset = Country.objects.all()
        serializer = CountrySerializer(queryset, many=True)
        return Response(serializer.data)
    

class LeagueViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = League.objects.all()
    serializer_class = LeagueSerializer

    def list(self, request):
        queryset = League.objects.all()
        serializer = LeagueSerializer(queryset, many=True)
        return Response(serializer.data)
    

class CharacteristicViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Characteristic.objects.all()
    serializer_class = CharacteristicSerializer

    def list(self, request):
        queryset = Characteristic.objects.all()
        serializer = CharacteristicSerializer(queryset, many=True)
        return Response(serializer.data)


def index(request):
    greeting = Greeting()
    greeting.save()
    greetings = Greeting.objects.all()
    return render(request, "db.html", {"greetings": greetings})


def hello(request):
    times = int(os.environ.get("TIMES", 3))
    return HttpResponse("Hello! " * times)
