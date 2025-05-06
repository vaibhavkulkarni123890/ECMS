from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet, WorkflowStepViewSet, DocumentWorkflowViewSet

router = DefaultRouter()
router.register(r'', WorkflowViewSet)
router.register(r'steps', WorkflowStepViewSet)
router.register(r'document-workflows', DocumentWorkflowViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
