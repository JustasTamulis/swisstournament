from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Feature, Stage


class TemplateApiTests(APITestCase):
    def setUp(self):
        self.stage = Stage.objects.create(
            name="Implementation",
            order=1,
            description="Build core features.",
            is_active=True,
        )
        self.feature = Feature.objects.create(
            title="Example feature",
            summary="Example summary",
            owner="Backend",
            status="todo",
            stage=self.stage,
        )

    def test_summary_endpoint(self):
        response = self.client.get(reverse("template-summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["feature_counts"]["todo"], 1)

    def test_advance_feature(self):
        url = reverse("feature-advance", kwargs={"pk": self.feature.pk})
        response = self.client.post(url)
        self.feature.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.feature.status, "in_progress")
