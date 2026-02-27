from rest_framework import status
from rest_framework.test import APITestCase

from .models import WorkItem, Workspace


class WorkItemApiTests(APITestCase):
    def setUp(self):
        self.workspace = Workspace.objects.create(name="Platform")
        self.item = WorkItem.objects.create(
            workspace=self.workspace,
            title="Ship first endpoint",
            status=WorkItem.Status.BACKLOG,
            priority=WorkItem.Priority.HIGH,
        )

    def test_overview_contains_expected_fields(self):
        response = self.client.get("/api/overview/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("totals", response.data)
        self.assertIn("status_breakdown", response.data)
        self.assertIn("recent_items", response.data)

    def test_advance_status_moves_item_forward(self):
        response = self.client.post(f"/api/items/{self.item.id}/advance-status/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertEqual(self.item.status, WorkItem.Status.IN_PROGRESS)


class BootstrapApiTests(APITestCase):
    def test_bootstrap_creates_data_when_empty(self):
        response = self.client.post("/api/bootstrap/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["created"])
        self.assertGreater(Workspace.objects.count(), 0)
        self.assertGreater(WorkItem.objects.count(), 0)

    def test_bootstrap_skips_when_data_exists(self):
        Workspace.objects.create(name="Existing")

        response = self.client.post("/api/bootstrap/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["created"])
