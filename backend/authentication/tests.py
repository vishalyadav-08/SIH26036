"""Auth/RBAC tests (TESTING_SECURITY.md sections 2 and 3).

Covers valid and invalid login, inactive accounts, token handling, the role
matrix, and the rule that no password, hash, or token leaks into a response.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

PASSWORD = "synthetic-password-123"


def make_user(email, role=User.Role.BUSINESS, active=True):
    return User.objects.create_user(
        email=email,
        password=PASSWORD,
        display_name="Demo User",
        role=role,
        is_active=active,
    )


class AuthTestCase(APITestCase):
    """Throttle state lives in the cache and would otherwise leak between
    tests, so a later test could fail with 429 for a reason it never asked
    about. Each test starts with a clean throttle."""

    def setUp(self):
        cache.clear()


class LoginTests(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.url = reverse("auth-login")
        self.user = make_user("owner@example.test")

    def test_valid_login_returns_token_and_profile(self):
        response = self.client.post(
            self.url, {"email": "owner@example.test", "password": PASSWORD}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tokenType"], "Bearer")
        self.assertTrue(response.data["accessToken"])
        self.assertIn("expiresAt", response.data)
        self.assertEqual(response.data["user"]["email"], "owner@example.test")
        self.assertEqual(response.data["user"]["role"], "BUSINESS")

    def test_email_is_normalised_on_login(self):
        response = self.client.post(
            self.url, {"email": "OWNER@Example.TEST", "password": PASSWORD}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_response_never_contains_password_or_hash(self):
        response = self.client.post(
            self.url, {"email": "owner@example.test", "password": PASSWORD}
        )

        body = str(response.data)

        self.assertNotIn(PASSWORD, body)
        self.assertNotIn("password", body.lower())
        self.assertNotIn("argon2", body.lower())

    def test_wrong_password_is_rejected_generically(self):
        response = self.client.post(
            self.url, {"email": "owner@example.test", "password": "wrong-password"}
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["code"], "UNAUTHENTICATED")

    def test_unknown_email_gives_the_same_answer_as_wrong_password(self):
        unknown = self.client.post(
            self.url, {"email": "nobody@example.test", "password": PASSWORD}
        )
        wrong = self.client.post(
            self.url, {"email": "owner@example.test", "password": "wrong-password"}
        )

        # Identical responses: anything else is an account enumeration oracle.
        self.assertEqual(unknown.status_code, wrong.status_code)
        self.assertEqual(unknown.data["message"], wrong.data["message"])

    def test_inactive_user_cannot_authenticate(self):
        make_user("dormant@example.test", active=False)

        response = self.client.post(
            self.url, {"email": "dormant@example.test", "password": PASSWORD}
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_missing_fields_are_a_validation_error(self):
        response = self.client.post(self.url, {"email": "owner@example.test"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "VALIDATION_ERROR")
        self.assertTrue(
            any(e["field"] == "password" for e in response.data["fieldErrors"])
        )

    def test_login_updates_last_login(self):
        self.assertIsNone(self.user.last_login)

        self.client.post(self.url, {"email": "owner@example.test", "password": PASSWORD})
        self.user.refresh_from_db()

        self.assertIsNotNone(self.user.last_login)


class ProfileTests(AuthTestCase):
    def setUp(self):
        super().setUp()
        self.url = reverse("users-me")
        self.user = make_user("owner@example.test")

    def _token_for(self, email):
        response = self.client.post(
            reverse("auth-login"), {"email": email, "password": PASSWORD}
        )
        return response.data["accessToken"]

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["code"], "UNAUTHENTICATED")

    def test_authenticated_request_returns_own_profile(self):
        token = self._token_for("owner@example.test")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "owner@example.test")
        self.assertEqual(response.data["displayName"], "Demo User")
        self.assertEqual(response.data["role"], "BUSINESS")
        self.assertTrue(response.data["active"])
        # Business entity is REG-001; the field exists but resolves to None.
        self.assertIsNone(response.data["businessId"])

    def test_profile_never_exposes_the_password_hash(self):
        token = self._token_for("owner@example.test")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.url)

        self.assertNotIn("password", response.data)
        self.assertNotIn("password", str(response.data).lower())

    def test_garbage_token_is_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoleTests(AuthTestCase):
    """The role matrix: each role reports itself correctly and distinctly."""

    def test_each_role_is_reported_on_its_own_profile(self):
        for role in [User.Role.ADMIN, User.Role.OFFICER, User.Role.BUSINESS]:
            with self.subTest(role=role):
                email = f"{role.lower()}@example.test"
                make_user(email, role=role)

                login = self.client.post(
                    reverse("auth-login"), {"email": email, "password": PASSWORD}
                )
                self.client.credentials(
                    HTTP_AUTHORIZATION=f"Bearer {login.data['accessToken']}"
                )

                response = self.client.get(reverse("users-me"))

                self.assertEqual(response.data["role"], role)

    def test_role_is_required(self):
        with self.assertRaises(Exception):
            User.objects.create_user(
                email="noroll@example.test",
                password=PASSWORD,
                display_name="No Role",
            )

    def test_duplicate_email_is_rejected_case_insensitively(self):
        make_user("dupe@example.test")

        with self.assertRaises(Exception):
            make_user("DUPE@example.test")


class PasswordHashingTests(AuthTestCase):
    def test_password_is_hashed_with_argon2(self):
        user = make_user("hash@example.test")

        # ADR-009: Argon2id, and never a reversible or fast hash.
        self.assertTrue(user.password.startswith("argon2$argon2id$"))
        self.assertNotIn(PASSWORD, user.password)
        self.assertTrue(user.check_password(PASSWORD))


class RateLimitTests(AuthTestCase):
    """Login is rate-limited so credential stuffing is not free."""

    def test_repeated_failures_are_eventually_throttled(self):
        url = reverse("auth-login")
        make_user("target@example.test")

        statuses = [
            self.client.post(
                url, {"email": "target@example.test", "password": "wrong"}
            ).status_code
            for _ in range(15)
        ]

        self.assertIn(status.HTTP_429_TOO_MANY_REQUESTS, statuses)

    def test_throttled_response_uses_the_contract_envelope(self):
        url = reverse("auth-login")

        response = None
        for _ in range(15):
            response = self.client.post(url, {"email": "a@b.test", "password": "x"})
            if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                break

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["code"], "RATE_LIMITED")


GOOGLE_CLAIMS = {
    "sub": "google-subject-1234567890",
    "email": "owner@example.test",
    "email_verified": True,
}


@override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client-id.apps.googleusercontent.com")
class GoogleLoginTests(AuthTestCase):
    """Google is a sign-in method, never a sign-up method."""

    def setUp(self):
        super().setUp()
        self.url = reverse("auth-google")

    def _verify_returns(self, claims):
        """Stand in for Google's token endpoint. Verification itself is
        google-auth's job and is not re-tested here; what is tested is what we
        do with the claims it hands back."""
        return patch(
            "authentication.services.google_id_token.verify_oauth2_token",
            return_value=claims,
        )

    def test_linked_account_signs_in_and_receives_a_token(self):
        user = make_user("owner@example.test")
        user.google_sub = GOOGLE_CLAIMS["sub"]
        user.save()

        with self._verify_returns(GOOGLE_CLAIMS):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tokenType"], "Bearer")
        self.assertEqual(response.data["user"]["email"], "owner@example.test")

    def test_first_sign_in_links_the_google_subject_to_the_account(self):
        user = make_user("owner@example.test")
        self.assertIsNone(user.google_sub)

        with self._verify_returns(GOOGLE_CLAIMS):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertEqual(user.google_sub, GOOGLE_CLAIMS["sub"])

    def test_subject_survives_an_email_change_at_google(self):
        user = make_user("owner@example.test")
        user.google_sub = GOOGLE_CLAIMS["sub"]
        user.save()

        moved = {**GOOGLE_CLAIMS, "email": "renamed@gmail.test"}

        with self._verify_returns(moved):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], "owner@example.test")

    def test_unknown_google_identity_is_rejected_not_provisioned(self):
        stranger = {**GOOGLE_CLAIMS, "email": "stranger@example.test"}

        with self._verify_returns(stranger):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(User.objects.filter(email="stranger@example.test").exists())

    def test_unverified_google_email_cannot_claim_an_account(self):
        make_user("owner@example.test")

        unverified = {**GOOGLE_CLAIMS, "email_verified": False}

        with self._verify_returns(unverified):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # And crucially: the account was not linked to the attacker's subject.
        self.assertIsNone(User.objects.get(email="owner@example.test").google_sub)

    def test_account_already_linked_to_a_different_subject_is_not_relinked(self):
        user = make_user("owner@example.test")
        user.google_sub = "the-original-subject"
        user.save()

        with self._verify_returns(GOOGLE_CLAIMS):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        user.refresh_from_db()
        self.assertEqual(user.google_sub, "the-original-subject")

    def test_inactive_user_cannot_sign_in_with_google(self):
        user = make_user("dormant@example.test", active=False)
        user.google_sub = GOOGLE_CLAIMS["sub"]
        user.save()

        claims = {**GOOGLE_CLAIMS, "email": "dormant@example.test"}

        with self._verify_returns(claims):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_token_is_rejected(self):
        make_user("owner@example.test")

        with patch(
            "authentication.services.google_id_token.verify_oauth2_token",
            side_effect=ValueError("bad signature"),
        ):
            response = self.client.post(self.url, {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_failure_message_is_identical_to_password_login(self):
        """Otherwise the endpoint reveals which emails hold accounts."""
        make_user("owner@example.test")

        stranger = {**GOOGLE_CLAIMS, "email": "stranger@example.test"}

        with self._verify_returns(stranger):
            google = self.client.post(self.url, {"idToken": "fake"})

        password = self.client.post(
            reverse("auth-login"),
            {"email": "owner@example.test", "password": "wrong-password"},
        )

        self.assertEqual(google.data["message"], password.data["message"])

    def test_missing_id_token_is_a_validation_error(self):
        response = self.client.post(self.url, {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "VALIDATION_ERROR")


class GoogleDisabledTests(AuthTestCase):
    @override_settings(GOOGLE_OAUTH_CLIENT_ID=None)
    def test_endpoint_rejects_when_client_id_is_not_configured(self):
        make_user("owner@example.test")

        response = self.client.post(reverse("auth-google"), {"idToken": "fake"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
