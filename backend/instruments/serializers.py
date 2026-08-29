"""Request/response shapes for the instruments module.

Serializers own field validation and the canonical JSON shape defined in
docs/API_CONTRACT.md. They do not own domain rules — those live in services.py.
"""

from rest_framework import serializers  # noqa: F401
