"""The list envelope from API_CONTRACT.md.

Pages are zero-based and the response is
`{items, page, pageSize, totalItems, totalPages}` — not DRF's default
`{count, next, previous, results}`.
"""

import math

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ContractPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "pageSize"
    max_page_size = 100
    page_query_param = "page"

    def get_page_number(self, request, paginator):
        # The contract's `page` is zero-based; Django's paginator is one-based.
        raw = request.query_params.get(self.page_query_param, 0)

        try:
            return int(raw) + 1
        except (TypeError, ValueError):
            return 1

    def get_paginated_response(self, data):
        total_items = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page_size

        return Response(
            {
                "items": data,
                "page": self.page.number - 1,
                "pageSize": page_size,
                "totalItems": total_items,
                "totalPages": math.ceil(total_items / page_size) if page_size else 0,
            }
        )
