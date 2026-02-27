from rest_framework import serializers

from .models import ActivityLog, Feature, Stage


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = ["id", "name", "order", "description", "is_active"]


class FeatureSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source="stage.name", read_only=True)

    class Meta:
        model = Feature
        fields = [
            "id",
            "title",
            "summary",
            "owner",
            "status",
            "stage",
            "stage_name",
            "updated_at",
            "created_at",
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    feature_title = serializers.CharField(source="feature.title", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "message", "feature", "feature_title", "created_at"]
