from django.contrib.auth.models import update_last_login
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import Conflict, InvalidCredentials
from common.pagination import ContractPagination
from common.permissions import IsAdmin

from .models import User
from .serializers import (
    GoogleLoginSerializer,
    LoginResponseSerializer,
    LoginSerializer,
    GoogleSignupSerializer,
    SignupSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .services import (
    GoogleAuthError,
    SignupError,
    UserAdminError,
    create_user_account,
    google_signup,
    register_business_account,
    update_user_account,
    SignupError,
    UserAdminError,
    create_user_account,
    google_signup,
    register_business_account,
    update_user_account,
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
    rejected rather than provisioned: LMO, GATC and ADMIN are authorised roles
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


class SignupView(APIView):
    """POST /api/v1/auth/signup — self-registration for a shop owner.

    Always produces a BUSINESS account. Rate-limited like login, because an
    open registration endpoint is an obvious target for automated abuse.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_scope = "signup"

    @extend_schema(request=SignupSerializer, responses={201: LoginResponseSerializer})
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = register_business_account(validated_data=serializer.validated_data)
        except SignupError as exc:
            raise Conflict(str(exc))

        # Sign them straight in: making someone register and then immediately
        # log in with the credentials they just typed is friction for nothing.
        access_token, expires_at = issue_access_token(user)
        update_last_login(None, user)

        return Response(
            {
                "accessToken": access_token,
                "tokenType": "Bearer",
                "expiresAt": expires_at,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class GoogleSignupView(APIView):
    """POST /api/v1/auth/google/signup — register with a Google identity.

    Deliberately separate from /auth/google. Sign-in stays link-only, so a
    Google account can never quietly become a MapanSetu account by signing in;
    provisioning happens only where the caller explicitly signed up and
    supplied business details.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_scope = "signup"

    @extend_schema(request=GoogleSignupSerializer, responses={201: LoginResponseSerializer})
    def post(self, request):
        serializer = GoogleSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = dict(serializer.validated_data)
        raw_token = data.pop("idToken")

        try:
            user = google_signup(raw_token=raw_token, validated_data=data)
        except SignupError as exc:
            raise Conflict(str(exc))
        except GoogleAuthError:
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
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    """GET /api/v1/users/me — the signed-in user's own profile."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class UserListView(APIView):
    """GET /api/v1/users — the account directory.

    Administrators only. This is how the assignment screen finds officers, and
    it is not something a business user has any reason to enumerate.
    """

    permission_classes = [IsAdmin]

    @extend_schema(request=UserCreateSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = create_user_account(
                actor=request.user, validated_data=serializer.validated_data
            )
        except UserAdminError as exc:
            raise Conflict(str(exc))

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @extend_schema(responses={200: UserSerializer(many=True)})
    def get(self, request):
        queryset = User.objects.all()

        role = request.query_params.get("role")
        if role:
            queryset = queryset.filter(
                role__in=[r.strip() for r in role.split(",") if r.strip()]
            )

        active = request.query_params.get("active")
        if active is not None:
            queryset = queryset.filter(is_active=active.lower() == "true")

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(UserSerializer(page, many=True).data)


class UserDetailView(APIView):
    """GET / PATCH a single account. Administrators only."""

    permission_classes = [IsAdmin]

    def get_user(self, user_id):
        return get_object_or_404(User, id=user_id)

    @extend_schema(responses={200: UserSerializer})
    def get(self, request, user_id):
        return Response(UserSerializer(self.get_user(user_id)).data)

    @extend_schema(request=UserUpdateSerializer, responses={200: UserSerializer})
    def patch(self, request, user_id):
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            user = update_user_account(
                actor=request.user,
                user=self.get_user(user_id),
                validated_data=serializer.validated_data,
            )
        except UserAdminError as exc:
            raise Conflict(str(exc))

        return Response(UserSerializer(user).data)

    @extend_schema(responses={200: UserSerializer})
    def delete(self, request, user_id):
        """Deactivates rather than deletes.

        Accounts are referenced by applications, inspections, and assignments;
        removing the row would orphan that history. DATA_MODEL.md: historical
        references remain.
        """
        try:
            user = update_user_account(
                actor=request.user,
                user=self.get_user(user_id),
                validated_data={"active": False},
            )
        except UserAdminError as exc:
            raise Conflict(str(exc))

        return Response(UserSerializer(user).data)
