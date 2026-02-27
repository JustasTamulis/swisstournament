from django.db import transaction
from django.views.generic import TemplateView
from rest_framework import permissions, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import ActivityLog, Feature, Stage
from .serializers import ActivityLogSerializer, FeatureSerializer, StageSerializer


class React(TemplateView):
    template_name = "index.html"


class StageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer
    permission_classes = [permissions.AllowAny]


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.select_related("stage").all()
    serializer_class = FeatureSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=["post"], url_path="advance")
    def advance(self, request, pk=None):
        feature = self.get_object()
        statuses = [choice[0] for choice in Feature.STATUS_CHOICES]
        current_index = statuses.index(feature.status)

        if current_index == len(statuses) - 1:
            return Response({"detail": "Feature is already done."}, status=400)

        feature.status = statuses[current_index + 1]
        feature.save(update_fields=["status", "updated_at"])
        ActivityLog.objects.create(
            feature=feature,
            message=f"{feature.title} moved to {feature.get_status_display().lower()}.",
        )
        return Response(self.get_serializer(feature).data)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related("feature").all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.AllowAny]


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def template_summary(request):
    active_stage = Stage.objects.filter(is_active=True).order_by("order").first()
    return Response(
        {
            "stage": StageSerializer(active_stage).data if active_stage else None,
            "feature_counts": {
                "todo": Feature.objects.filter(status="todo").count(),
                "in_progress": Feature.objects.filter(status="in_progress").count(),
                "done": Feature.objects.filter(status="done").count(),
            },
            "recent_activity": ActivityLogSerializer(ActivityLog.objects.all()[:5], many=True).data,
        }
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def seed_template_data(request):
    if Stage.objects.exists() or Feature.objects.exists():
        return Response({"detail": "Template data already exists."}, status=400)

    with transaction.atomic():
        discovery = Stage.objects.create(
            name="Discovery",
            order=1,
            description="Define goals, users, and delivery milestones.",
            is_active=True,
        )
        implementation = Stage.objects.create(
            name="Implementation",
            order=2,
            description="Build backend APIs and frontend user flows.",
        )
        release = Stage.objects.create(
            name="Release",
            order=3,
            description="Prepare deployment, observability, and handoff.",
        )

        feature_1 = Feature.objects.create(
            title="Health check endpoint",
            summary="Provide /api/health so uptime monitors can validate the app.",
            owner="Backend",
            status="done",
            stage=implementation,
        )
        feature_2 = Feature.objects.create(
            title="Authentication scaffold",
            summary="Add login/logout placeholders and role-based guards.",
            owner="Backend",
            status="in_progress",
            stage=implementation,
        )
        feature_3 = Feature.objects.create(
            title="Landing page shell",
            summary="Create reusable page layout and navigation.",
            owner="Frontend",
            status="todo",
            stage=discovery,
        )

        ActivityLog.objects.bulk_create(
            [
                ActivityLog(message="Project template initialized."),
                ActivityLog(feature=feature_1, message="Health check endpoint marked done."),
                ActivityLog(feature=feature_2, message="Authentication scaffold started."),
                ActivityLog(feature=feature_3, message="Landing page shell planned."),
                ActivityLog(message=f"Release stage ready: {release.name}.")
            ]
        )

    return Response({"detail": "Template data created."}, status=201)
