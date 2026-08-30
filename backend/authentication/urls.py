"""Auth routes, mounted at /api/v1/auth/ by root/urls.py."""

from django.urls import path

from .views import GoogleLoginView, LoginView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("google/", GoogleLoginView.as_view(), name="auth-google"),
]
