from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuarterlyReturnViewSet, ProductionRecordViewSet, SaleRecordViewSet, RepairRecordViewSet

router = DefaultRouter()
router.register(r'returns', QuarterlyReturnViewSet, basename='returns')

urlpatterns = [
    path('', include(router.urls)),
    
    # Nested routes for records
    path('returns/<uuid:return_pk>/production/', ProductionRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='return-production'),
    path('returns/<uuid:return_pk>/production/<uuid:pk>/', ProductionRecordViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='return-production-detail'),
    
    path('returns/<uuid:return_pk>/sales/', SaleRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='return-sales'),
    path('returns/<uuid:return_pk>/sales/<uuid:pk>/', SaleRecordViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='return-sales-detail'),
    
    path('returns/<uuid:return_pk>/repairs/', RepairRecordViewSet.as_view({'get': 'list', 'post': 'create'}), name='return-repairs'),
    path('returns/<uuid:return_pk>/repairs/<uuid:pk>/', RepairRecordViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='return-repairs-detail'),
]
