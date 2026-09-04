import copy
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from common.canonical import canonical_json, sha256_hex
from certificates.crypto import sign_payload, verify_payload

class TamperDemoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('tamper-demo-no-slash')
        self.original_payload = {
            "payloadVersion": "1",
            "certificateNumber": "CERT-DEMO-001",
            "applicationNumber": "APP-DEMO-001",
            "instrumentNumber": "ES-GKP-2026-001",
            "instrumentType": "ELECTRONIC_SCALE",
            "issuedAt": "2026-09-01T10:30:00Z",
            "validUntil": "2027-09-01T23:59:59Z",
            "inspectionResult": "PASS",
            "demoConfiguration": "SIH-PROTOTYPE"
        }
        self.canonical_original = canonical_json(self.original_payload)
        self.signature = sign_payload(self.canonical_original)

    def test_get_returns_original(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["verification"], "VALID")
        self.assertTrue(data["signatureValid"])
        self.assertEqual(data["payload"]["inspectionResult"], "PASS")

    def test_post_valid_payload(self):
        response = self.client.post(self.url, self.original_payload, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["verification"], "VALID")

    def test_post_tampered_payload_fails(self):
        tampered = copy.deepcopy(self.original_payload)
        tampered["inspectionResult"] = "FAIL"
        
        response = self.client.post(self.url, tampered, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["verification"], "INVALID")
        self.assertFalse(data["signatureValid"])
        self.assertEqual(data["payload"]["inspectionResult"], "FAIL")

    def test_private_key_never_returned(self):
        response = self.client.get(self.url)
        self.assertNotIn("PRIVATE KEY", response.content.decode())
