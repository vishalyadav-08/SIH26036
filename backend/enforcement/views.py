from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ConsumerComplaint, EnforcementAction, Notice
from .serializers import ConsumerComplaintSerializer, EnforcementActionSerializer, NoticeSerializer
from .services import EnforcementService
from rest_framework.exceptions import PermissionDenied

class ConsumerComplaintViewSet(viewsets.ModelViewSet):
    queryset = ConsumerComplaint.objects.all()
    serializer_class = ConsumerComplaintSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            # Public can create complaints
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if user.role == 'ADMIN':
            return self.queryset
        elif user.role in ['OFFICER', 'LMO', 'GATC']:
            return self.queryset.filter(assigned_officer=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        # We override perform_create to use the service which auto-assigns
        complaint = EnforcementService.file_complaint(serializer.validated_data)
        serializer.instance = complaint

class EnforcementActionViewSet(viewsets.ModelViewSet):
    queryset = EnforcementAction.objects.all()
    serializer_class = EnforcementActionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        elif user.role in ['OFFICER', 'LMO', 'GATC']:
            return self.queryset.filter(officer=user)
        return self.queryset.none()

    def perform_create(self, serializer):
        if self.request.user.role not in ['ADMIN', 'OFFICER', 'LMO', 'GATC']:
            raise PermissionDenied("Only officers can log enforcement actions.")
        serializer.save(officer=self.request.user)

    @action(detail=True, methods=['post'])
    def issue_notice(self, request, pk=None):
        action_obj = self.get_object()
        sections = request.data.get('sections', [])
        amount = request.data.get('amount')
        due_date = request.data.get('due_date')
        
        if not sections or not due_date:
            return Response({"error": "sections and due_date are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        notice = EnforcementService.generate_notice(action_obj, sections, amount, due_date)
        return Response(NoticeSerializer(notice).data)

class NoticeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        elif user.role in ['OFFICER', 'LMO', 'GATC']:
            return self.queryset.filter(enforcement_action__officer=user)
        elif user.role == 'BUSINESS':
            return self.queryset.filter(enforcement_action__business=user.business)
        return self.queryset.none()
