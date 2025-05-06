from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Workflow, WorkflowStep, DocumentWorkflow, WorkflowStepApproval
from .serializers import (WorkflowSerializer, WorkflowStepSerializer, 
                          DocumentWorkflowSerializer, WorkflowStepApprovalSerializer)
from django_filters.rest_framework import DjangoFilterBackend


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    @action(detail=True, methods=['post'])
    def add_step(self, request, pk=None):
        workflow = self.get_object()
        serializer = WorkflowStepSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(workflow=workflow)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.all()
    serializer_class = WorkflowStepSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['workflow']


class DocumentWorkflowViewSet(viewsets.ModelViewSet):
    queryset = DocumentWorkflow.objects.all()
    serializer_class = DocumentWorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['document', 'workflow', 'status']
    search_fields = ['document__title', 'workflow__name']
    
    @action(detail=True, methods=['post'])
    def approve_step(self, request, pk=None):
        document_workflow = self.get_object()
        current_step = document_workflow.current_step
        
        if not current_step:
            return Response({'error': 'No current step to approve'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is the approver for this step
        if current_step.approver != request.user:
            return Response({'error': 'You are not authorized to approve this step'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        # Get the approval record for this step
        approval = get_object_or_404(WorkflowStepApproval, 
                                    document_workflow=document_workflow, 
                                    step=current_step)
        
        # Update the approval
        approval.approved = True
        approval.approved_at = timezone.now()
        approval.approved_by = request.user
        approval.comments = request.data.get('comments', '')
        approval.save()
        
        # Move to the next step or complete the workflow
        next_step = WorkflowStep.objects.filter(
            workflow=document_workflow.workflow,
            order__gt=current_step.order
        ).order_by('order').first()
        
        if next_step:
            document_workflow.current_step = next_step
            document_workflow.save()
        else:
            # All steps completed
            document_workflow.current_step = None
            document_workflow.status = 'approved'
            document_workflow.completed_at = timezone.now()
            document_workflow.save()
        
        return Response(DocumentWorkflowSerializer(document_workflow).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        document_workflow = self.get_object()
        current_step = document_workflow.current_step
        
        if not current_step:
            return Response({'error': 'No current step to reject'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is the approver for this step
        if current_step.approver != request.user:
            return Response({'error': 'You are not authorized to reject this workflow'}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        # Get the approval record for this step
        approval = get_object_or_404(WorkflowStepApproval, 
                                    document_workflow=document_workflow, 
                                    step=current_step)
        
        # Update the approval as rejected
        approval.approved = False
        approval.approved_at = timezone.now()
        approval.approved_by = request.user
        approval.comments = request.data.get('comments', '')
        approval.save()
        
        # Mark the workflow as rejected
        document_workflow.status = 'rejected'
        document_workflow.completed_at = timezone.now()
        document_workflow.save()
        
        return Response(DocumentWorkflowSerializer(document_workflow).data)
