from rest_framework.routers import DefaultRouter
from .views import InternshipPlacementViewSet

"""
Router automatically generates RESTful routes:
- GET /placements/
- POST /placements/
- GET /placements/{id}/
- PUT/PATCH /placements/{id}/
- DELETE /placements/{id}/
"""

router = DefaultRouter()
router.register(r'', InternshipPlacementViewSet, basename='placements')

urlpatterns = router.urls