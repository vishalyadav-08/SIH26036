"""Public verification route, mounted at /api/v1/ by root/urls.py."""

from django.urls import path

from .views import PublicVerifyView

urlpatterns = [
    path("certificates/verify", PublicVerifyView.as_view(), name="public-verify"),
]
