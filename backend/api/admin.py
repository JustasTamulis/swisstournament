from django.contrib import admin
from .models import Greeting, Country, League, Characteristic, FootballClub

# Register your models here.
admin.site.register(Greeting)
admin.site.register(Country)
admin.site.register(League)
admin.site.register(Characteristic)
admin.site.register(FootballClub)
