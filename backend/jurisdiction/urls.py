from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StateViewSet, DivisionViewSet, DistrictViewSet, JurisdictionAssignmentViewSet

router = DefaultRouter()
router.register(r'states', StateViewSet, basename='states')
router.register(r'divisions', DivisionViewSet, basename='divisions')
router.register(r'districts', DistrictViewSet, basename='districts')
router.register(r'assignments', JurisdictionAssignmentViewSet, basename='assignments')

urlpatterns = [
    path('', include(router.urls)),
]
