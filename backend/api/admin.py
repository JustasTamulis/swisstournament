from django.contrib import admin

from .models import ActivityLog, Feature, Stage

admin.site.register(Stage)
admin.site.register(Feature)
admin.site.register(ActivityLog)
