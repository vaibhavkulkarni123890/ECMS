from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Document, Version
from .serializers import DocumentSerializer, VersionSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django.http import FileResponse
import os
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        try:
            document = self.get_object()
            file_path = document.file.path
            
            # Check if file exists
            if not os.path.exists(file_path):
                return Response(
                    {"error": f"File not found at {file_path}"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Try to open the file
            try:
                file = open(file_path, 'rb')
            except PermissionError:
                return Response(
                    {"error": "Permission denied when accessing file"},
                    status=status.HTTP_403_FORBIDDEN
                )
            except Exception as e:
                return Response(
                    {"error": f"Error opening file: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create response with proper filename handling for Windows
            response = FileResponse(file)
            filename = os.path.basename(document.file.name)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            # Log the error for debugging
            print(f"Download error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred while downloading the file"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def create_version(self, request, pk=None):
        document = self.get_object()
        
        # Get the latest version number and increment
        latest_version = document.versions.order_by('-version_number').first()
        version_number = 1 if not latest_version else latest_version.version_number + 1
        
        serializer = VersionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                document=document,
                version_number=version_number,
                created_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        document = self.get_object()
        versions = document.versions.all()
        serializer = VersionSerializer(versions, many=True)
        return Response(serializer.data)

class VersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Version.objects.all()
    serializer_class = VersionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document', 'created_by']
