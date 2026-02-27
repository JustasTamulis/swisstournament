from django.db import models
from django.utils.text import slugify


class Workspace(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:100] or "workspace"
            candidate = base_slug
            suffix = 2
            while Workspace.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class WorkItem(models.Model):
    class Status(models.TextChoices):
        BACKLOG = "backlog", "Backlog"
        IN_PROGRESS = "in_progress", "In Progress"
        REVIEW = "review", "Review"
        DONE = "done", "Done"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="items")
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True)
    owner = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.BACKLOG)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    due_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return self.title


class ActivityLog(models.Model):
    class Action(models.TextChoices):
        SYSTEM = "system", "System"
        ITEM_CREATED = "item_created", "Item Created"
        STATUS_CHANGED = "status_changed", "Status Changed"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="activity")
    item = models.ForeignKey(
        WorkItem,
        on_delete=models.SET_NULL,
        related_name="activity",
        blank=True,
        null=True,
    )
    action = models.CharField(max_length=40, choices=Action.choices)
    message = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.message
