from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IntegrationLogViewSet, DigiLockerDocumentViewSet

router = DefaultRouter()
router.register(r'logs', IntegrationLogViewSet, basename='integration-logs')
router.register(r'digilocker', DigiLockerDocumentViewSet, basename='digilocker')

urlpatterns = [
    path('', include(router.urls)),
]
