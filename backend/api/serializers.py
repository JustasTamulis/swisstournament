from rest_framework import serializers

from .models import ActivityLog, WorkItem, Workspace


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")


class WorkItemSerializer(serializers.ModelSerializer):
    workspace_slug = serializers.CharField(source="workspace.slug", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    priority_label = serializers.CharField(source="get_priority_display", read_only=True)

    class Meta:
        model = WorkItem
        fields = (
            "id",
            "workspace",
            "workspace_slug",
            "title",
            "summary",
            "owner",
            "status",
            "status_label",
            "priority",
            "priority_label",
            "due_date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ActivityLogSerializer(serializers.ModelSerializer):
    workspace_slug = serializers.CharField(source="workspace.slug", read_only=True)
    item_title = serializers.CharField(source="item.title", read_only=True)
    action_label = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = ActivityLog
        fields = (
            "id",
            "workspace",
            "workspace_slug",
            "item",
            "item_title",
            "action",
            "action_label",
            "message",
            "metadata",
            "created_at",
        )
        read_only_fields = fields
