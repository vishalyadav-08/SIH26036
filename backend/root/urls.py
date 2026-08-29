"""Root URL configuration for MapanSetu.

Every domain module mounts under /api/v1 to match docs/API_CONTRACT.md.
Modules with no endpoints yet still mount, so adding a route is a one-line
change inside the module rather than an edit here.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

API = "api/v1/"

urlpatterns = [
    path("admin/", admin.site.urls),

    path(f"{API}auth/", include("authentication.urls")),
    path(f"{API}businesses/", include("businesses.urls")),
    path(f"{API}instruments/", include("instruments.urls")),
    path(f"{API}applications/", include("applications.urls")),
    path(f"{API}schedules/", include("scheduling.urls")),
    path(f"{API}inspections/", include("inspections.urls")),
    path(f"{API}evidence/", include("evidence.urls")),
    path(f"{API}certificates/", include("certificates.urls")),
    path(f"{API}", include("verification.urls")),
    path(f"{API}notifications/", include("notifications.urls")),
    path(f"{API}audit/", include("audit.urls")),
    path(f"{API}sync/", include("sync.urls")),

    path(f"{API}schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        f"{API}docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
