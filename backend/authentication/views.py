from django.contrib.auth.models import update_last_login
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import InvalidCredentials

from .serializers import (
    GoogleLoginSerializer,
    LoginResponseSerializer,
    LoginSerializer,
    UserSerializer,
)
from .services import (
    GoogleAuthError,
    authenticate_google_user,
    authenticate_user,
    issue_access_token,
)


class LoginView(APIView):
    """POST /api/v1/auth/login — authenticate an active user."""

    permission_classes = [AllowAny]
    authentication_classes = []

    # Login is rate-limited (TESTING_SECURITY.md §4). The scope's rate lives in
    # settings so it can be tuned without touching this view.
    throttle_scope = "login"

    @extend_schema(request=LoginSerializer, responses={200: LoginResponseSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            # One message for every failure. Do not name the field at fault,
            # and do not log the attempted password. Raised rather than
            # returned so it passes through the shared exception handler and
            # carries the same envelope — requestId included — as every other
            # error the API emits.
            raise InvalidCredentials

        access_token, expires_at = issue_access_token(user)

        update_last_login(None, user)

        return Response(
            {
                "accessToken": access_token,
                "tokenType": "Bearer",
                "expiresAt": expires_at,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(APIView):
    """POST /api/v1/auth/google — sign in with a Google ID token.

    Google is a sign-in method only. An unrecognised Google identity is
    rejected rather than provisioned: OFFICER and ADMIN are authorised roles
    granted by an administrator, and no consumer identity provider decides who
    holds one.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_scope = "google_login"

    @extend_schema(request=GoogleLoginSerializer, responses={200: LoginResponseSerializer})
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = authenticate_google_user(serializer.validated_data["idToken"])
        except GoogleAuthError:
            # One message for every failure mode, exactly as password login
            # does. Saying "no account is linked" would confirm which emails
            # hold MapanSetu accounts.
            raise InvalidCredentials

        access_token, expires_at = issue_access_token(user)

        update_last_login(None, user)

        return Response(
            {
                "accessToken": access_token,
                "tokenType": "Bearer",
                "expiresAt": expires_at,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """GET /api/v1/users/me — the signed-in user's own profile."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
