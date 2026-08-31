"""Authentication domain logic.

Views stay thin: they validate input and shape the response. Whether a
credential pair is acceptable, and what a token looks like, is decided here.
"""

from datetime import datetime, timezone

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
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


class UserAdminError(Exception):
    """The requested account change is not permitted."""


def create_user_account(*, actor, validated_data):
    """Provision an account. Administrators only (enforced by the view)."""
    from businesses.models import Business

    from audit.services import record_event

    from .models import User

    business = None
    business_id = validated_data.get("businessId")

    if business_id:
        business = Business.objects.filter(id=business_id).first()

        if business is None:
            raise UserAdminError("Unknown business.")

    user = User.objects.create_user(
        email=validated_data["email"],
        password=validated_data["password"],
        display_name=validated_data["displayName"],
        phone=validated_data.get("phone", ""),
        role=validated_data["role"],
        business=business,
    )

    record_event(
        actor=actor, action="USER_CREATED", entity_type="USER", entity_id=user.id,
        # Never the password, and never the hash.
        metadata={"email": user.email, "role": user.role},
    )

    return user


def update_user_account(*, actor, user, validated_data):
    from audit.services import record_event

    if "displayName" in validated_data:
        user.display_name = validated_data["displayName"]

    if "phone" in validated_data:
        user.phone = validated_data["phone"]

    if "role" in validated_data:
        # An administrator must not be able to strip their own privileges and
        # lock the prototype out of its only admin path.
        if user.id == actor.id and validated_data["role"] != user.role:
            raise UserAdminError("You cannot change your own role.")

        user.role = validated_data["role"]

    if "active" in validated_data:
        if user.id == actor.id and not validated_data["active"]:
            raise UserAdminError("You cannot deactivate your own account.")

        user.is_active = validated_data["active"]

    user.save()

    record_event(
        actor=actor, action="USER_UPDATED", entity_type="USER", entity_id=user.id,
        metadata={"fields": sorted(validated_data.keys())},
    )

    return user


class SignupError(Exception):
    """Self-registration could not be completed."""


@transaction.atomic
def register_business_account(*, validated_data, google_sub=None, email=None):
    """Create a BUSINESS user and their business profile together.

    Atomic on purpose: a user row without its business would be an account that
    can sign in but cannot register anything, and the owner would have no way
    to fix it themselves.

    `role` is hard-coded, never taken from input. This function is the only
    self-service account path in the system and it can produce exactly one role.
    """
    from businesses.models import Business

    from audit.services import record_event

    from .models import User

    business = Business.objects.create(
        legal_name=validated_data["legalName"],
        trade_name=validated_data.get("tradeName", ""),
        contact_name=validated_data["contactName"],
        email=email or validated_data["email"],
        phone=validated_data.get("phone", ""),
        address=validated_data["address"],
    )

    user = User.objects.create_user(
        email=email or validated_data["email"],
        password=validated_data.get("password"),
        display_name=validated_data["displayName"],
        phone=validated_data.get("phone", ""),
        role=User.Role.BUSINESS,
        business=business,
    )

    if google_sub:
        user.google_sub = google_sub
        user.save(update_fields=["google_sub", "updated_at"])

    record_event(
        actor=user, action="ACCOUNT_SELF_REGISTERED", entity_type="USER",
        entity_id=user.id,
        metadata={"email": user.email, "role": user.role,
                  "method": "google" if google_sub else "password"},
    )

    return user


def google_signup(*, raw_token, validated_data):
    """Provision a BUSINESS account from a verified Google identity.

    Separate from authenticate_google_user, which stays link-only: plain
    sign-in must never create an account, or the OFFICER/ADMIN provisioning
    rule would be bypassable by anyone with a Google account.
    """
    from .models import User

    claims = verify_google_id_token(raw_token)

    sub = claims["sub"]
    email = claims["email"].strip().lower()

    if User.objects.filter(google_sub=sub).exists() or User.objects.filter(email=email).exists():
        raise SignupError("An account already exists for this Google identity.")

    return register_business_account(
        validated_data={**validated_data, "displayName": claims.get("name") or email},
        google_sub=sub,
        email=email,
    )
