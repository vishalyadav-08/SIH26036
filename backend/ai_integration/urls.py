from django.urls import path
from .views import AIContextView

urlpatterns = [
    path('context/', AIContextView.as_view(), name='ai_context'),
]
