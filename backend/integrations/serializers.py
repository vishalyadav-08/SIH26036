from rest_framework import serializers
from .models import IntegrationLog, DigiLockerDocument

class IntegrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationLog
        fields = '__all__'

class DigiLockerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DigiLockerDocument
        fields = '__all__'
