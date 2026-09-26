from rest_framework import serializers
from .models import ConsumerComplaint, EnforcementAction, Notice

class ConsumerComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsumerComplaint
        fields = '__all__'
        read_only_fields = ['id', 'status', 'assigned_officer', 'created_at', 'updated_at']

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'
        read_only_fields = ['id', 'notice_number', 'issue_date', 'created_at', 'updated_at']

class EnforcementActionSerializer(serializers.ModelSerializer):
    notices = NoticeSerializer(many=True, read_only=True)
    class Meta:
        model = EnforcementAction
        fields = '__all__'
        read_only_fields = ['id', 'officer', 'created_at', 'updated_at']
