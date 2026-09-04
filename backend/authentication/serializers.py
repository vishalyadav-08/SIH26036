"""Request/response shapes for authentication and the current-user profile.

Field names are camelCase because API_CONTRACT.md specifies them that way; the
model stays snake_case, so every renamed field maps through `source`.
"""

from rest_framework import serializers

from .models import User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False)

    def validate_email(self, value):
        # Uniqueness is on the normalized email, so the lookup must normalize
        # too — otherwise "Owner@x.test" would fail to match a stored account.
        return value.strip().lower()

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Required")

        return value


class GoogleLoginSerializer(serializers.Serializer):
    """The ID token issued to the browser by Google Identity Services."""

    idToken = serializers.CharField(trim_whitespace=True)


class UserSerializer(serializers.ModelSerializer):
    """The canonical user shape. Never includes the password hash."""

    displayName = serializers.CharField(source="display_name", read_only=True)
    businessId = serializers.UUIDField(source="business_id", read_only=True, allow_null=True)
    active = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "displayName",
            "phone",
            "role",
            "businessId",
            "active",
        ]
        read_only_fields = fields


class LoginResponseSerializer(serializers.Serializer):
    """Documents the login response for the generated OpenAPI schema."""

    accessToken = serializers.CharField()
    tokenType = serializers.CharField()
    expiresAt = serializers.DateTimeField()
    user = UserSerializer()


class UserCreateSerializer(serializers.Serializer):
    """Administrator-provisioned account.

    Role is chosen here by an administrator — this is the only way an LMO,
    GATC, or ADMIN account comes into existence. Nothing self-provisions into
    a privileged role.
    """

    email = serializers.EmailField()
    displayName = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices)
    password = serializers.CharField(min_length=8, write_only=True)
    businessId = serializers.UUIDField(required=False, allow_null=True)

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")

        return email

    def validate(self, attrs):
        # DATA_MODEL.md: businessId is required for BUSINESS users and absent
        # for ADMIN/LMO/GATC.
        if attrs["role"] == User.Role.BUSINESS and not attrs.get("businessId"):
            raise serializers.ValidationError(
                {"businessId": "Required for a BUSINESS account."}
            )

        if attrs["role"] != User.Role.BUSINESS and attrs.get("businessId"):
            raise serializers.ValidationError(
                {"businessId": "Only a BUSINESS account belongs to a business."}
            )

        return attrs


class UserUpdateSerializer(serializers.Serializer):
    """Partial update. Email is immutable — it is the login identifier."""

    displayName = serializers.CharField(max_length=100, required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices, required=False)
    active = serializers.BooleanField(required=False)


class SignupSerializer(serializers.Serializer):
    """Self-registration for a shop owner.

    Role is not a field. Self-signup always produces a BUSINESS account —
    LMO, GATC and ADMIN are authorised roles an administrator grants, and
    letting a signup form choose one would be the whole authorization model
    undone.

    Business details are required because a BUSINESS user without a business
    cannot register instruments; collecting them here avoids a dead-end account.
    """

    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    displayName = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    legalName = serializers.CharField(max_length=200)
    contactName = serializers.CharField(max_length=100)
    address = serializers.CharField(max_length=500)
    tradeName = serializers.CharField(max_length=200, required=False, allow_blank=True)

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")

        return email


class GoogleSignupSerializer(serializers.Serializer):
    """Google sign-up. Same rule: BUSINESS only."""

    idToken = serializers.CharField(trim_whitespace=True)

    legalName = serializers.CharField(max_length=200)
    contactName = serializers.CharField(max_length=100)
    address = serializers.CharField(max_length=500)
    tradeName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
