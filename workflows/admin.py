from django.contrib import admin
from .models import Workflow, WorkflowStep, DocumentWorkflow, WorkflowStepApproval


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    search_fields = ('name', 'description')


@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ('workflow', 'name', 'order', 'approver')
    list_filter = ('workflow',)
    search_fields = ('name', 'workflow__name')


@admin.register(DocumentWorkflow)
class DocumentWorkflowAdmin(admin.ModelAdmin):
    list_display = ('document', 'workflow', 'status', 'started_at', 'completed_at')
    list_filter = ('status', 'started_at', 'completed_at')
    search_fields = ('document__title', 'workflow__name')


@admin.register(WorkflowStepApproval)
class WorkflowStepApprovalAdmin(admin.ModelAdmin):
    list_display = ('document_workflow', 'step', 'approved', 'approved_at', 'approved_by')
    list_filter = ('approved', 'approved_at')
    search_fields = ('document_workflow__document__title', 'step__name')
