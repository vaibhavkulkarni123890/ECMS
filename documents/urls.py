from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, VersionViewSet

router = DefaultRouter()
router.register(r'', DocumentViewSet)
router.register(r'versions', VersionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Add explicit path for download action
    path('<str:pk>/download/', DocumentViewSet.as_view({'get': 'download'})),
]