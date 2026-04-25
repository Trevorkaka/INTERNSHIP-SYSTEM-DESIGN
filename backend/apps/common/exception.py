from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Standardize API error responses.
    """

    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "error": True,
            "message": response.data,
            "status_code": response.status_code
        }

    return response