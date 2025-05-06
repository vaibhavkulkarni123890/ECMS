from rest_framework import serializers
from .models import Workflow, WorkflowStep, DocumentWorkflow, WorkflowStepApproval
from documents.serializers import DocumentSerializer, UserSerializer
from django.utils import timezone


class WorkflowStepSerializer(serializers.ModelSerializer):
    approver = UserSerializer(read_only=True)
    approver_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = WorkflowStep
        fields = ['id', 'workflow', 'name', 'order', 'approver', 'approver_id']
        read_only_fields = ['workflow']


class WorkflowSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    steps = WorkflowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = Workflow
        fields = ['id', 'name', 'description', 'created_at', 'created_by', 'steps']
        read_only_fields = ['created_at', 'created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class WorkflowStepApprovalSerializer(serializers.ModelSerializer):
    approved_by = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkflowStepApproval
        fields = ['id', 'document_workflow', 'step', 'approved', 'approved_at', 'approved_by', 'comments']
        read_only_fields = ['approved_at', 'approved_by']
    
    def update(self, instance, validated_data):
        if 'approved' in validated_data and validated_data['approved'] and not instance.approved:
            validated_data['approved_at'] = timezone.now()
            validated_data['approved_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class DocumentWorkflowSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    document_id = serializers.UUIDField(write_only=True)
    workflow = WorkflowSerializer(read_only=True)
    workflow_id = serializers.IntegerField(write_only=True)
    current_step = WorkflowStepSerializer(read_only=True)
    step_approvals = WorkflowStepApprovalSerializer(many=True, read_only=True)
    
    class Meta:
        model = DocumentWorkflow
        fields = ['id', 'document', 'document_id', 'workflow', 'workflow_id', 
                  'current_step', 'status', 'started_at', 'completed_at', 'step_approvals']
        read_only_fields = ['current_step', 'status', 'started_at', 'completed_at']
    
    def create(self, validated_data):
        # Get the first step of the workflow
        workflow_id = validated_data.pop('workflow_id')
        workflow = Workflow.objects.get(pk=workflow_id)
        first_step = workflow.steps.order_by('order').first()
        
        # Create the document workflow
        document_workflow = DocumentWorkflow.objects.create(
            document_id=validated_data.pop('document_id'),
            workflow=workflow,
            current_step=first_step
        )
        
        # Create approval entries for each step
        for step in workflow.steps.all():
            WorkflowStepApproval.objects.create(
                document_workflow=document_workflow,
                step=step
            )
        
        return document_workflow