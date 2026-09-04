"""Evidence routes, mounted at /api/v1/ by root/urls.py.

Upload and listing hang off the inspection (API_CONTRACT.md puts them at
/inspections/{id}/evidence); a single item and its bytes live under
/evidence/{id}. Both are owned here so the inspection module does not need
to know how files are stored.
"""

from django.urls import path

from .views import EvidenceDetailView, EvidenceFileView, InspectionEvidenceView

urlpatterns = [
    path(
        "inspections/<uuid:inspection_id>/evidence/",
        InspectionEvidenceView.as_view(),
        name="inspection-evidence",
    ),
    path("evidence/<uuid:evidence_id>/", EvidenceDetailView.as_view(), name="evidence-detail"),
    path("evidence/<uuid:evidence_id>/file/", EvidenceFileView.as_view(), name="evidence-file"),
]
