from django.contrib import admin

from .models import ActivityLog, WorkItem, Workspace


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "created_at", "updated_at")
    search_fields = ("name", "slug", "description")
    ordering = ("name",)


@admin.register(WorkItem)
class WorkItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "workspace",
        "status",
        "priority",
        "owner",
        "updated_at",
    )
    list_filter = ("status", "priority", "workspace")
    search_fields = ("title", "summary", "owner")
    ordering = ("-updated_at",)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("id", "action", "workspace", "item", "message", "created_at")
    list_filter = ("action", "workspace")
    search_fields = ("message", "item__title")
    ordering = ("-created_at",)
