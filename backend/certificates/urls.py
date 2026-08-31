"""Certificate routes, mounted at /api/v1/certificates/ by root/urls.py.

The public /certificates/verify route is owned by the verification module and
mounted ahead of these, so it stays unauthenticated.
"""

from django.urls import path

from .views import (
    CertificateDetailView,
    CertificateListCreateView,
    CertificateQrView,
    CertificateRevokeView,
)

urlpatterns = [
    path("", CertificateListCreateView.as_view(), name="certificate-list-create"),
    path("<uuid:certificate_id>/", CertificateDetailView.as_view(), name="certificate-detail"),
    path("<uuid:certificate_id>/qr/", CertificateQrView.as_view(), name="certificate-qr"),
    path("<uuid:certificate_id>/revoke/", CertificateRevokeView.as_view(), name="certificate-revoke"),
]
