from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SealInventoryViewSet, SealAllocationViewSet, VerificationStandardViewSet

router = DefaultRouter()
router.register(r'inventory', SealInventoryViewSet, basename='seal-inventory')
router.register(r'allocations', SealAllocationViewSet, basename='seal-allocations')
router.register(r'equipment', VerificationStandardViewSet, basename='standards-equipment')

urlpatterns = [
    path('', include(router.urls)),
]
