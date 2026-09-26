from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentTransactionViewSet, FeeScheduleViewSet

router = DefaultRouter()
router.register(r'fees', FeeScheduleViewSet, basename='fees')
router.register(r'', PaymentTransactionViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
