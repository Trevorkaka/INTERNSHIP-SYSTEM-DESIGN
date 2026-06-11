"""
Custom REST Framework exception handlers for the Common application.

Standardizes API error payload structures across all endpoints.
"""

from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Map and standardize API exceptions into a unified response schema.

    Reformats non-2xx payloads to always include an error status flag, the message/errors payload,
    and the status code.

    Args:
        exc (Exception): The raw raised Exception.
        context (dict): Execution context dict containing request and view instances.

    Returns:
        Response: DRF Response instance containing standardized error details, or None.
    """
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "error": True,
            "message": response.data,
            "status_code": response.status_code
        }

    return response
