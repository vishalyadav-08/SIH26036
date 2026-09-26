from rest_framework import serializers
from .models import State, Division, District, JurisdictionAssignment
from authentication.serializers import UserSerializer

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'

class DivisionSerializer(serializers.ModelSerializer):
    districts = DistrictSerializer(many=True, read_only=True)
    class Meta:
        model = Division
        fields = '__all__'

class JurisdictionAssignmentSerializer(serializers.ModelSerializer):
    officer_details = UserSerializer(source='officer', read_only=True)
    state_details = StateSerializer(source='state', read_only=True)
    division_details = DivisionSerializer(source='division', read_only=True)
    district_details = DistrictSerializer(source='district', read_only=True)
    
    class Meta:
        model = JurisdictionAssignment
        fields = '__all__'
