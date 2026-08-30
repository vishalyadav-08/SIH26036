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
