"""Public verification route, mounted at /api/v1/ by root/urls.py."""

from django.urls import path

from .views import PublicVerifyView, TamperDemoView, PublicCertificatesSampleView

urlpatterns = [
    path("certificates/verify/", PublicVerifyView.as_view(), name="public-verify"),
    path("certificates/verify", PublicVerifyView.as_view(), name="public-verify-no-slash"),
    path("certificates/samples/", PublicCertificatesSampleView.as_view(), name="public-certificate-samples"),
    path("certificates/samples", PublicCertificatesSampleView.as_view(), name="public-certificate-samples-no-slash"),
    path("certificates/demo/tamper/", TamperDemoView.as_view(), name="tamper-demo"),
    path("certificates/demo/tamper", TamperDemoView.as_view(), name="tamper-demo-no-slash"),
]
