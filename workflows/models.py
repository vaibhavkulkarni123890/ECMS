from django.db import models
from django.contrib.auth.models import User
from documents.models import Document


class Workflow(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_workflows')
    
    def __str__(self):
        return self.name


class WorkflowStep(models.Model):
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='steps')
    name = models.CharField(max_length=255)
    order = models.PositiveIntegerField()
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approval_steps')
    
    def __str__(self):
        return f"{self.workflow.name} - {self.name} (Step {self.order})"
    
    class Meta:
        ordering = ['order']
        unique_together = ['workflow', 'order']


class DocumentWorkflow(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='workflows')
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='document_workflows')
    current_step = models.ForeignKey(WorkflowStep, on_delete=models.CASCADE, related_name='current_documents', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.document.title} - {self.workflow.name}"
    
    class Meta:
        unique_together = ['document', 'workflow']


class WorkflowStepApproval(models.Model):
    document_workflow = models.ForeignKey(DocumentWorkflow, on_delete=models.CASCADE, related_name='step_approvals')
    step = models.ForeignKey(WorkflowStep, on_delete=models.CASCADE, related_name='approvals')
    approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='step_approvals', null=True, blank=True)
    comments = models.TextField(blank=True, null=True)
    
    def __str__(self):
        status = "Approved" if self.approved else "Pending"
        return f"{self.step.name} - {status}"
    
    class Meta:
        unique_together = ['document_workflow', 'step']
