import os
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)

class IsAIService(BasePermission):
    """
    Validates that the request originates from the authorized AI service via X-AI-Service-Token.
    """
    def has_permission(self, request, view):
        token = request.META.get('HTTP_X_AI_SERVICE_TOKEN', '')
        expected_token = getattr(settings, 'AI_SERVICE_TOKEN', os.environ.get('AI_SERVICE_TOKEN', 'ai-service-dev-token-123'))
        if not expected_token:
            logger.error("AI_SERVICE_TOKEN is not configured.")
            return False
        return token == expected_token

class AIContextView(APIView):
    """
    Controlled boundary for AI Service to fetch user-specific data.
    The AI Service must provide X-AI-Service-Token.
    The end-user identity is resolved natively via Django's REST Framework authentication (e.g. JWT) 
    from the Authorization header forwarded by the AI Service.
    """
    permission_classes = [IsAIService]

    def post(self, request):
        intent = request.data.get('intent')
        context = request.data.get('context', {})
        
        # User identity must NOT be spoofed.
        # It is resolved by DRF automatically (request.user).
        
        if intent == 'LIVE_DATA_REQUEST':
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {'authorized': False, 'data': None, 'reason': 'not_authorized'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # AI_DJANGO_USE_MOCK_DATA defaults to False (safe).
            use_mock_data = getattr(settings, 'AI_DJANGO_USE_MOCK_DATA', False)
            
            if not use_mock_data:
                # Real domain models are not yet implemented. Fail safely.
                return Response(
                    {'authorized': False, 'data': None, 'reason': 'unavailable'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
                
            # --- DEVELOPMENT MOCK DATA BOUNDARY ---
            # Do NOT use in production.
            logger.warning("Returning DEVELOPMENT MOCK DATA. Real domain models are bypassed.")
            
            # Simple mock role logic for testing boundary based on username or email
            username = request.user.username.lower() if request.user.username else ""
            
            if 'admin' in username:
                dto = {
                    'role': 'ADMIN',
                    'systemStatus': 'Operational',
                    'activeOfficers': 45
                }
            elif 'officer' in username:
                dto = {
                    'role': 'OFFICER',
                    'pendingInspections': 3,
                    'nextInspection': 'APP-2026-00124 at Synthetic Metrology Labs'
                }
            elif 'business' in username:
                dto = {
                    'role': 'BUSINESS',
                    'applicationReference': 'APP-2026-00124',
                    'status': 'UNDER_REVIEW',
                    'createdAt': '2026-08-25',
                    'instrumentType': 'Electronic Weighing Instrument'
                }
            else:
                return Response(
                    {'authorized': False, 'data': None, 'reason': 'not_authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response({'authorized': True, 'data': dto, 'source': 'django'}, status=status.HTTP_200_OK)
            
        elif intent == 'WORKFLOW_ACTION':
            return Response(
                {'authorized': False, 'data': None, 'reason': 'not_authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Informational request requiring no live data
        return Response({'authorized': True, 'data': None, 'source': 'django'}, status=status.HTTP_200_OK)
