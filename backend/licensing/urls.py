from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicenseApplicationViewSet, LicenseViewSet

router = DefaultRouter()
router.register(r'applications', LicenseApplicationViewSet, basename='license-applications')
router.register(r'', LicenseViewSet, basename='licenses')

urlpatterns = [
    path('', include(router.urls)),
]
