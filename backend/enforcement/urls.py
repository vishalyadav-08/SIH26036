from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsumerComplaintViewSet, EnforcementActionViewSet, NoticeViewSet

router = DefaultRouter()
router.register(r'complaints', ConsumerComplaintViewSet, basename='complaints')
router.register(r'actions', EnforcementActionViewSet, basename='actions')
router.register(r'notices', NoticeViewSet, basename='notices')

urlpatterns = [
    path('', include(router.urls)),
]
