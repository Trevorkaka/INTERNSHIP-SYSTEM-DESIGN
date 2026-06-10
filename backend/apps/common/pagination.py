import rest_framework.pagination

class StandardResultsSetPagination(rest_framework.pagination.PageNumberPagination):
    """
    Standard pagination for all APIs.

    Features:
    - Custom page size
    - Client-controlled page size (limited)
    """

    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100