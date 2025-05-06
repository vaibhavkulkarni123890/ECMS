from django.db import models
import uuid
from django.contrib.auth.models import User
from django.utils.text import slugify
from PIL import Image
import os


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='documents/')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        # Generate slug from title if not provided
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Generate thumbnail for image files
        super().save(*args, **kwargs)
        if self.file and not self.thumbnail:
            file_ext = os.path.splitext(self.file.name)[1].lower()
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            
            if file_ext in image_extensions:
                try:
                    img = Image.open(self.file.path)
                    img.thumbnail((300, 300))
                    thumb_path = f'media/thumbnails/{self.id}{file_ext}'
                    img.save(thumb_path)
                    self.thumbnail = f'thumbnails/{self.id}{file_ext}'
                    super().save(update_fields=['thumbnail'])
                except Exception as e:
                    # Handle thumbnail generation error
                    pass
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']


class Version(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to='versions/')
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_versions')
    
    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"
    
    class Meta:
        ordering = ['-version_number']
        unique_together = ['document', 'version_number']
