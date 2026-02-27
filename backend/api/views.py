from django.db.models import Count
from django.utils import timezone
from django.views.generic import TemplateView
from rest_framework import permissions, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import ActivityLog, WorkItem, Workspace
from .serializers import ActivityLogSerializer, WorkItemSerializer, WorkspaceSerializer


class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.AllowAny]


class WorkItemViewSet(viewsets.ModelViewSet):
    queryset = WorkItem.objects.select_related("workspace")
    serializer_class = WorkItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()

        workspace = self.request.query_params.get("workspace")
        if workspace:
            if workspace.isdigit():
                queryset = queryset.filter(workspace_id=int(workspace))
            else:
                queryset = queryset.filter(workspace__slug=workspace)

        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        priority = self.request.query_params.get("priority")
        if priority:
            queryset = queryset.filter(priority=priority)

        return queryset

    def perform_create(self, serializer):
        item = serializer.save()
        ActivityLog.objects.create(
            workspace=item.workspace,
            item=item,
            action=ActivityLog.Action.ITEM_CREATED,
            message=f"Created work item '{item.title}'",
            metadata={"status": item.status, "priority": item.priority},
        )

    @action(detail=True, methods=["post"], url_path="advance-status")
    def advance_status(self, request, pk=None):
        item = self.get_object()
        transitions = {
            WorkItem.Status.BACKLOG: WorkItem.Status.IN_PROGRESS,
            WorkItem.Status.IN_PROGRESS: WorkItem.Status.REVIEW,
            WorkItem.Status.REVIEW: WorkItem.Status.DONE,
            WorkItem.Status.DONE: WorkItem.Status.DONE,
        }

        previous_status = item.status
        next_status = transitions[item.status]

        if previous_status == next_status:
            return Response(
                {
                    "detail": "Item is already in the final status.",
                    "item": WorkItemSerializer(item).data,
                }
            )

        item.status = next_status
        item.save(update_fields=["status", "updated_at"])

        ActivityLog.objects.create(
            workspace=item.workspace,
            item=item,
            action=ActivityLog.Action.STATUS_CHANGED,
            message=(
                f"Moved '{item.title}' from {previous_status} to {next_status}"
            ),
            metadata={"from": previous_status, "to": next_status},
        )

        return Response(WorkItemSerializer(item).data)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related("workspace", "item")
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()

        workspace = self.request.query_params.get("workspace")
        if workspace:
            if workspace.isdigit():
                queryset = queryset.filter(workspace_id=int(workspace))
            else:
                queryset = queryset.filter(workspace__slug=workspace)

        item_id = self.request.query_params.get("item")
        if item_id and item_id.isdigit():
            queryset = queryset.filter(item_id=int(item_id))

        limit = self.request.query_params.get("limit")
        if limit and limit.isdigit():
            queryset = queryset[: int(limit)]

        return queryset


class React(TemplateView):
    template_name = "index.html"


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health(request):
    return Response(
        {
            "status": "ok",
            "service": "webapp-template-api",
            "timestamp": timezone.now().isoformat(),
        }
    )


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def overview(request):
    totals = {
        "workspaces": Workspace.objects.count(),
        "items": WorkItem.objects.count(),
        "completed_items": WorkItem.objects.filter(status=WorkItem.Status.DONE).count(),
    }

    status_counts = {status: 0 for status, _ in WorkItem.Status.choices}
    for row in WorkItem.objects.values("status").annotate(total=Count("id")):
        status_counts[row["status"]] = row["total"]

    breakdown = [
        {
            "status": status,
            "label": label,
            "count": status_counts[status],
        }
        for status, label in WorkItem.Status.choices
    ]

    recent_items = WorkItem.objects.select_related("workspace")[:5]
    recent_activity = ActivityLog.objects.select_related("workspace", "item")[:8]

    return Response(
        {
            "totals": totals,
            "status_breakdown": breakdown,
            "recent_items": WorkItemSerializer(recent_items, many=True).data,
            "recent_activity": ActivityLogSerializer(recent_activity, many=True).data,
        }
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def bootstrap(request):
    if Workspace.objects.exists():
        return Response(
            {
                "created": False,
                "detail": "Bootstrap skipped because data already exists.",
            }
        )

    workspace = Workspace.objects.create(
        name="Starter Workspace",
        description="Sample data to demonstrate CRUD, filters, and status transitions.",
    )

    sample_items = [
        {
            "title": "Set up authentication",
            "summary": "Create login and registration flow with token persistence.",
            "owner": "Backend",
            "status": WorkItem.Status.IN_PROGRESS,
            "priority": WorkItem.Priority.HIGH,
        },
        {
            "title": "Build dashboard widgets",
            "summary": "Show aggregate KPIs and recent activity in one place.",
            "owner": "Frontend",
            "status": WorkItem.Status.BACKLOG,
            "priority": WorkItem.Priority.MEDIUM,
        },
        {
            "title": "Design API error contract",
            "summary": "Align backend errors so frontend can present consistent messages.",
            "owner": "Platform",
            "status": WorkItem.Status.REVIEW,
            "priority": WorkItem.Priority.MEDIUM,
        },
        {
            "title": "Prepare deployment checklist",
            "summary": "Document environment variables and release verification steps.",
            "owner": "DevOps",
            "status": WorkItem.Status.DONE,
            "priority": WorkItem.Priority.LOW,
        },
    ]

    created_items = []
    for entry in sample_items:
        item = WorkItem.objects.create(workspace=workspace, **entry)
        created_items.append(item)

        ActivityLog.objects.create(
            workspace=workspace,
            item=item,
            action=ActivityLog.Action.ITEM_CREATED,
            message=f"Created work item '{item.title}'",
            metadata={"status": item.status, "priority": item.priority},
        )

    ActivityLog.objects.create(
        workspace=workspace,
        action=ActivityLog.Action.SYSTEM,
        message="Bootstrapped starter workspace",
        metadata={"items_created": len(created_items)},
    )

    return Response(
        {
            "created": True,
            "workspace": WorkspaceSerializer(workspace).data,
            "items_created": len(created_items),
        }
    )
