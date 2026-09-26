from .models import District, Division, State, JurisdictionAssignment, OfficerDesignation

class JurisdictionService:
    @staticmethod
    def resolve_district(pincode: str):
        # A real implementation would query against the pin_codes JSON field
        # For MVP, we simply find the first one that matches
        districts = District.objects.all()
        for district in districts:
            if pincode in district.pin_codes:
                return district
        return None
        
    @staticmethod
    def find_controller(state):
        # Find active controller for the state
        assignment = JurisdictionAssignment.objects.filter(
            state=state,
            designation__in=[OfficerDesignation.CONTROLLER, OfficerDesignation.ADDITIONAL_CONTROLLER],
            active_until__isnull=True
        ).first()
        return assignment.officer if assignment else None

    @staticmethod
    def find_aclm(district):
        # Find ACLM for the district or division
        assignment = JurisdictionAssignment.objects.filter(
            district=district,
            designation=OfficerDesignation.ACLM,
            active_until__isnull=True
        ).first()
        if assignment:
            return assignment.officer
            
        # Fallback to Division level Deputy Controller if no ACLM
        assignment = JurisdictionAssignment.objects.filter(
            division=district.division,
            designation=OfficerDesignation.DEPUTY_CONTROLLER,
            active_until__isnull=True
        ).first()
        return assignment.officer if assignment else None

    @staticmethod
    def route_license_application(application):
        """
        Route application to correct approving authority based on:
        1. Business premises pincode (if available) -> district
        2. License category:
           - MANUFACTURER -> Controller (State level)
           - DEALER/REPAIRER -> ACLM (Division/District level)
        """
        # Extract a pincode from premises_address if possible, or use a default district logic
        # For simplicity, if we don't have a robust pincode extractor, we assume a business 
        # is tied to a district in our system (Phase 2 upgrades businesses with jurisdiction)
        
        # Here we mock retrieving the district
        district = JurisdictionService.resolve_district("226001") # Mock UP pincode
        if not district:
            district = District.objects.first()
            
        if not district:
            return None # System not seeded
            
        if application.category == "MANUFACTURER":
            return JurisdictionService.find_controller(district.division.state)
        else:
            return JurisdictionService.find_aclm(district)
