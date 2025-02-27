import requests
import os
from django.http import HttpResponse

from django.shortcuts import render

from .models import Greeting

# Create your views here.


# def index(request):
#     r = requests.get('https://httpbin.org/status/418', timeout=10)
#     return HttpResponse('<pre>' + r.text + '</pre>')


def index(request):
    # When running the app locally:
    #   1. You have run `./manage.py migrate` to create the database table.

    greeting = Greeting()
    greeting.save()

    greetings = Greeting.objects.all()

    return render(request, "db.html", {"greetings": greetings})

def hello(request):
    times = int(os.environ.get('TIMES', 3))
    return HttpResponse('Hello! ' * times)
