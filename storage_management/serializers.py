"""
Serializers cho Storage Management API
"""
from rest_framework import serializers
from .models import StorageFile
from .services import get_file_type_from_name


class StorageFileSerializer(serializers.ModelSerializer):
    """Serializer cho StorageFile model"""
    
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username',
        read_only=True
    )
    
    file_url = serializers.SerializerMethodField()
    presigned_url = serializers.SerializerMethodField()
    
    class Meta:
        model = StorageFile
        fields = [
            'id',
            'storage_key',
            'file_name',
            'file_type',
            'file_size',
            'mime_type',
            'visibility',
            'folder_prefix',
            'description',
            'lesson_id',
            'uploaded_by',
            'uploaded_by_username',
            'uploaded_at',
            'updated_at',
            'public_url',
            'file_url',
            'presigned_url',
        ]
        read_only_fields = [
            'id',
            'uploaded_at',
            'updated_at',
            'uploaded_by',
        ]
    
    def get_file_url(self, obj):
        """Lấy URL của file (public hoặc presigned)"""
        if obj.visibility == 'PUBLIC' and obj.public_url:
            return obj.public_url
        
        # Generate presigned URL cho private files
        from .services import ObjectStorageService
        try:
            service = ObjectStorageService()
            return service.get_file_url(obj.storage_key, public=False)
        except:
            return None
    
    def get_presigned_url(self, obj):
        """Lấy presigned URL (luôn generate mới)"""
        from .services import ObjectStorageService
        try:
            service = ObjectStorageService()
            result = service.generate_presigned_url(obj.storage_key, expiration=3600)
            return result.get('url') if result.get('success') else None
        except:
            return None


class StorageFileListSerializer(serializers.ModelSerializer):
    """Serializer rút gọn cho list view"""
    
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username',
        read_only=True
    )
    
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = StorageFile
        fields = [
            'id',
            'storage_key',
            'file_name',
            'file_type',
            'file_size',
            'mime_type',
            'visibility',
            'folder_prefix',
            'uploaded_by_username',
            'uploaded_at',
            'file_url',
        ]
    
    def get_file_url(self, obj):
        """Lấy URL của file"""
        if obj.visibility == 'PUBLIC' and obj.public_url:
            return obj.public_url
        
        from .services import ObjectStorageService
        try:
            service = ObjectStorageService()
            return service.get_file_url(obj.storage_key, public=False)
        except:
            return None


class FileUploadSerializer(serializers.Serializer):
    """Serializer cho upload file"""
    
    file = serializers.FileField(required=True)
    folder_prefix = serializers.CharField(
        required=False,
        default='media/uploads/',
        help_text='Folder prefix trên storage (ví dụ: media/lessons/lesson-1/)'
    )
    visibility = serializers.ChoiceField(
        choices=['PUBLIC', 'PRIVATE'],
        default='PRIVATE',
        required=False
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Mô tả về file'
    )
    lesson_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text='ID của bài học liên quan (nếu có)'
    )


class PresignedURLSerializer(serializers.Serializer):
    """Serializer cho generate presigned URL"""
    
    storage_key = serializers.CharField(required=True)
    expiration = serializers.IntegerField(
        required=False,
        default=3600,
        min_value=60,
        max_value=604800,  # 7 days max
        help_text='Thời gian hết hạn (giây), tối đa 7 ngày'
    )


class FileListQuerySerializer(serializers.Serializer):
    """Serializer cho query params của list API"""
    
    prefix = serializers.CharField(
        required=False,
        default='',
        help_text='Folder prefix để filter (ví dụ: media/lessons/)'
    )
    file_type = serializers.ChoiceField(
        choices=['IMAGE', 'VIDEO', 'PDF', 'AUDIO', 'OTHER'],
        required=False,
        help_text='Filter theo loại file'
    )
    lesson_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text='Filter theo lesson ID'
    )

