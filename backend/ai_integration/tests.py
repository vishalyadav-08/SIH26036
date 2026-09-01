from django.test import TestCase, Client
from rest_framework import status

class AIIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = '/api/v1/internal/ai/context/'

    def test_service_auth_missing_token(self):
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST'}, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_service_auth_invalid_token(self):
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST'}, HTTP_X_AI_SERVICE_TOKEN='wrong', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_service_auth_valid_token_unauthenticated_user(self):
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST'}, HTTP_X_AI_SERVICE_TOKEN='ai-service-dev-token-123', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json()['authorized'], False)

    def test_authenticated_allowed_request_business(self):
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST'}, HTTP_X_AI_SERVICE_TOKEN='ai-service-dev-token-123', HTTP_AUTHORIZATION='Bearer mock-jwt-business-user', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['authorized'], True)
        self.assertIn('applicationReference', response.json()['data'])

    def test_data_minimization(self):
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST'}, HTTP_X_AI_SERVICE_TOKEN='ai-service-dev-token-123', HTTP_AUTHORIZATION='Bearer mock-jwt-business-user', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()['data']
        self.assertNotIn('password', data)
        self.assertNotIn('hash', data)
        self.assertNotIn('database', data)

    def test_cross_user_access_attempt(self):
        # Spoofing via context is ignored. Identity derived purely from auth header.
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST', 'context': {'userId': 'some-other-id'}}, HTTP_X_AI_SERVICE_TOKEN='ai-service-dev-token-123', HTTP_AUTHORIZATION='Bearer mock-jwt-business-user', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['data']['role'], 'BUSINESS')

    def test_role_escalation_attempt(self):
        response = self.client.post(self.url, {'intent': 'LIVE_DATA_REQUEST'}, HTTP_X_AI_SERVICE_TOKEN='ai-service-dev-token-123', HTTP_AUTHORIZATION='Bearer mock-jwt-invalid-user', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
