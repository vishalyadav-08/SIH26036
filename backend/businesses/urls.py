"""Business routes, mounted at /api/v1/businesses/ by root/urls.py."""

from django.urls import path

from .views import BusinessCreateView, BusinessMeView

urlpatterns = [
    path("", BusinessCreateView.as_view(), name="business-create"),
    path("me/", BusinessMeView.as_view(), name="business-me"),
]
