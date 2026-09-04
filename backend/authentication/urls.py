"""Auth routes, mounted at /api/v1/auth/ by root/urls.py."""

from django.urls import path

from .views import GoogleLoginView, GoogleSignupView, LoginView, SignupView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("signup/", SignupView.as_view(), name="auth-signup"),
    path("google/", GoogleLoginView.as_view(), name="auth-google"),
    path("google/signup/", GoogleSignupView.as_view(), name="auth-google-signup"),
]
