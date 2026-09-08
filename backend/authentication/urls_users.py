"""User routes, mounted at /api/v1/users/ by root/urls.py.

Separate from urls.py because the API contract puts the profile under
/users/me while authentication actions live under /auth/.
"""

from django.urls import path

from .views import MeView, UserDetailView, UserListView

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("me/", MeView.as_view(), name="users-me"),
    path("<uuid:user_id>/", UserDetailView.as_view(), name="user-detail"),
]
