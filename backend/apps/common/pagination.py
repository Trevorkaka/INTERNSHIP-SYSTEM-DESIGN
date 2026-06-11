"""
Pagination utilities for the Common application.

Standardizes results set limits, page queries, and max boundaries.
"""

import rest_framework.pagination


class StandardResultsSetPagination(rest_framework.pagination.PageNumberPagination):
    """
    Standard pagination for API query responses.

    Enables clients to dynamically query list items with specified size counts
    under maximum set boundaries.

    Attributes:
        page_size (int): Default page size count if not specified by the query.
        page_size_query_param (str): Parameter key allowing clients to request customized page sizes.
        max_page_size (int): Absolute maximum limit of page size permitted.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
