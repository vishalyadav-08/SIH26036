from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

@override_settings(AI_DJANGO_USE_MOCK_DATA=True)
class AIIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("ai_context")
        self.business_user = User.objects.create_user(username="business_user1", password="password123")
        self.officer_user = User.objects.create_user(username="officer_user1", password="password123")
        self.ai_token = getattr(settings, 'AI_SERVICE_TOKEN', 'ai-service-dev-token-123')

    # Case 1: Valid AI token + valid user
    def test_valid_service_and_user_auth(self):
        self.client.force_authenticate(user=self.business_user)
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        response = self.client.post(self.url, {"intent": "LIVE_DATA_REQUEST"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data["authorized"])
        self.assertEqual(data["data"]["role"], "BUSINESS")

    # Case 2: Forged user ID in request body -> ignored, returns true user data
    def test_forged_user_id_ignored(self):
        self.client.force_authenticate(user=self.business_user)
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        # Attempt to spoof user ID in context payload
        payload = {
            "intent": "LIVE_DATA_REQUEST",
            "context": {"userId": self.officer_user.id}
        }
        response = self.client.post(self.url, payload, format="json")
        data = response.json()
        self.assertTrue(data["authorized"])
        self.assertEqual(data["data"]["role"], "BUSINESS") # Remains business, spoofing failed

    # Case 3: Forged role -> ignored
    def test_forged_role_ignored(self):
        self.client.force_authenticate(user=self.business_user)
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        payload = {
            "intent": "LIVE_DATA_REQUEST",
            "context": {"role": "ADMIN"}
        }
        response = self.client.post(self.url, payload, format="json")
        data = response.json()
        self.assertEqual(data["data"]["role"], "BUSINESS") # Remains business

    # Case 4: Invalid AI service token + valid user -> denied
    def test_invalid_service_token_rejected(self):
        self.client.force_authenticate(user=self.business_user)
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN="invalid-token")
        response = self.client.post(self.url, {"intent": "LIVE_DATA_REQUEST"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Case 5: Valid AI token + no user -> denied for live data, allowed for generic
    def test_no_user_denied_live_data(self):
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        response = self.client.post(self.url, {"intent": "LIVE_DATA_REQUEST"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        data = response.json()
        self.assertFalse(data["authorized"])
        self.assertEqual(data["reason"], "not_authorized")
        
    def test_no_user_allowed_generic(self):
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        response = self.client.post(self.url, {"intent": "unknown"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["authorized"])

    # Part 8: Sensitive Data Test
    def test_sensitive_fields_excluded(self):
        self.client.force_authenticate(user=self.business_user)
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        response = self.client.post(self.url, {"intent": "LIVE_DATA_REQUEST"}, format="json")
        data = response.json()["data"]
        # Ensure only explicit DTO fields exist
        self.assertNotIn("password", data)
        self.assertNotIn("id", data)
        self.assertIn("applicationReference", data)

    @override_settings(AI_DJANGO_USE_MOCK_DATA=False)
    def test_production_mode_fails_closed(self):
        # When mock data is false, returns 503 unavailable instead of fabricating data
        self.client.force_authenticate(user=self.business_user)
        self.client.credentials(HTTP_X_AI_SERVICE_TOKEN=self.ai_token)
        response = self.client.post(self.url, {"intent": "LIVE_DATA_REQUEST"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        data = response.json()
        self.assertFalse(data["authorized"])
        self.assertEqual(data["reason"], "unavailable")
