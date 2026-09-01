import os
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)

class IsAIService(BasePermission):
    def has_permission(self, request, view):
        token = request.META.get('HTTP_X_AI_SERVICE_TOKEN', '')
        expected_token = getattr(settings, 'AI_SERVICE_TOKEN', os.environ.get('AI_SERVICE_TOKEN', 'ai-service-dev-token-123'))
        if not expected_token:
            return False
        return token == expected_token

class PrototypeAuth:
    @staticmethod
    def authenticate(request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        
        class MockUser:
            def __init__(self, token):
                self.is_authenticated = True
                self.token = token
                if 'admin' in token.lower():
                    self.role = 'ADMIN'
                elif 'business' in token.lower():
                    self.role = 'BUSINESS'
                elif 'officer' in token.lower():
                    self.role = 'OFFICER'
                else:
                    self.role = 'UNKNOWN'
        return MockUser(token)

class AIContextView(APIView):
    permission_classes = [IsAIService]

    def post(self, request):
        intent = request.data.get('intent')
        user = PrototypeAuth.authenticate(request)
        
        if intent == 'LIVE_DATA_REQUEST':
            if not user or not user.is_authenticated:
                return Response({'authorized': False, 'reason': 'Unauthorized. Please log in to access your data.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if user.role == 'BUSINESS':
                dto = {
                    'role': 'BUSINESS',
                    'applicationReference': 'APP-2026-00124',
                    'status': 'UNDER_REVIEW',
                    'createdAt': '2026-08-25',
                    'instrumentType': 'Electronic Weighing Instrument'
                }
                return Response({'authorized': True, 'data': dto}, status=status.HTTP_200_OK)
            elif user.role == 'OFFICER':
                dto = {
                    'role': 'OFFICER',
                    'pendingInspections': 3,
                    'nextInspection': 'APP-2026-00124 at Synthetic Metrology Labs'
                }
                return Response({'authorized': True, 'data': dto}, status=status.HTTP_200_OK)
            elif user.role == 'ADMIN':
                dto = {
                    'role': 'ADMIN',
                    'systemStatus': 'Operational',
                    'activeOfficers': 45
                }
                return Response({'authorized': True, 'data': dto}, status=status.HTTP_200_OK)
            else:
                return Response({'authorized': False, 'reason': 'Forbidden. Insufficient permissions.'}, status=status.HTTP_403_FORBIDDEN)
                
        return Response({'authorized': True, 'data': {'generalContext': 'No live data required.'}})
