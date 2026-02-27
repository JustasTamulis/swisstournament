from django.db import models


class Stage(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.PositiveSmallIntegerField(unique=True)
    description = models.TextField()
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Feature(models.Model):
    STATUS_CHOICES = [
        ("todo", "To do"),
        ("in_progress", "In progress"),
        ("done", "Done"),
    ]

    title = models.CharField(max_length=140)
    summary = models.TextField()
    owner = models.CharField(max_length=80)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    stage = models.ForeignKey(Stage, related_name="features", on_delete=models.PROTECT)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class ActivityLog(models.Model):
    message = models.CharField(max_length=255)
    feature = models.ForeignKey(
        Feature,
        null=True,
        blank=True,
        related_name="activity",
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.message
