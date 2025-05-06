from rest_framework import serializers
from .models import Document, Version
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class VersionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Version
        fields = ['id', 'document', 'version_number', 'file', 'comment', 'created_at', 'created_by']
        read_only_fields = ['created_at', 'created_by']


class DocumentSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    versions = VersionSerializer(many=True, read_only=True)
    latest_version = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'thumbnail', 'created_at', 
                  'updated_at', 'created_by', 'slug', 'versions', 'latest_version']
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'thumbnail']
    
    def get_latest_version(self, obj):
        latest = obj.versions.order_by('-version_number').first()
        if latest:
            return VersionSerializer(latest).data
        return None
    
    def create(self, validated_data):
        # Set the current user as the creator
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)