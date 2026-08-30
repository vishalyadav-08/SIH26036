"""Authentication domain logic.

Views stay thin: they validate input and shape the response. Whether a
credential pair is acceptable, and what a token looks like, is decided here.
"""

from datetime import datetime, timezone

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework_simplejwt.tokens import AccessToken


def authenticate_user(*, email, password):
    """Return the user for these credentials, or None.

    Returns None for every failure mode — unknown email, wrong password, and
    inactive account alike. The caller must not distinguish between them in its
    response: telling an attacker that an email exists is an account
    enumeration oracle. Django's ModelBackend already rejects inactive users.
    """
    return authenticate(username=email, password=password)


def issue_access_token(user):
    """Mint a short-lived access token and report when it dies.

    `expiresAt` is read back off the token's own `exp` claim rather than
    recomputed from settings, so the advertised expiry can never drift from the
    expiry the API will actually enforce.
    """
    token = AccessToken.for_user(user)

    expires_at = datetime.fromtimestamp(token["exp"], tz=timezone.utc)

    return str(token), expires_at


class GoogleAuthError(Exception):
    """Google sign-in could not be completed. Carries no detail for the client."""


def verify_google_id_token(raw_token):
    """Validate a Google ID token and return its claims.

    google-auth checks the signature against Google's rotating public keys and
    verifies `iss` and `exp` for us. The audience check is the part that matters
    most here: without pinning `aud` to our own client id, a token minted for
    any other Google application would be accepted.
    """
    client_id = settings.GOOGLE_OAUTH_CLIENT_ID

    if not client_id:
        raise GoogleAuthError("Google sign-in is not configured.")

    try:
        claims = google_id_token.verify_oauth2_token(
            raw_token, google_requests.Request(), client_id
        )
    except ValueError as exc:
        raise GoogleAuthError("Invalid Google token.") from exc

    # A Google account with an unverified email must never match a MapanSetu
    # account by email — otherwise anyone able to set an arbitrary unverified
    # address on a Google account could claim someone else's account.
    if not claims.get("email_verified"):
        raise GoogleAuthError("Google email is not verified.")

    if not claims.get("email") or not claims.get("sub"):
        raise GoogleAuthError("Google token is missing required claims.")

    return claims


def authenticate_google_user(raw_token):
    """Resolve a Google ID token to an existing MapanSetu account.

    Google is a sign-in method, not a sign-up method: this never creates a
    user. OFFICER and ADMIN are authorised roles that an administrator grants,
    so self-provisioning from a consumer identity provider is not available at
    any role.

    Matching is by `google_sub` first, then by verified email for an account
    that has not yet been linked. The link is written on that first success so
    later sign-ins no longer depend on the email staying the same.
    """
    claims = verify_google_id_token(raw_token)

    User = get_user_model()

    sub = claims["sub"]
    email = claims["email"].strip().lower()

    user = User.objects.filter(google_sub=sub).first()

    if user is None:
        user = User.objects.filter(email=email, google_sub__isnull=True).first()

        if user is None:
            raise GoogleAuthError("No account is linked to this Google identity.")

        user.google_sub = sub
        user.save(update_fields=["google_sub", "updated_at"])

    if not user.is_active:
        raise GoogleAuthError("Account is not active.")

    return user
