"""
Views (ViewSets) cho Storage Management API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
import os
import uuid

from .models import StorageFile
from .serializers import (
    StorageFileSerializer,
    StorageFileListSerializer,
    FileUploadSerializer,
    PresignedURLSerializer,
    FileListQuerySerializer,
)
from .services import ObjectStorageService, get_file_type_from_name


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission: Chỉ admin mới được upload/xóa
    Read-only cho user thường
    """
    
    def has_permission(self, request, view):
        # Read-only: ai cũng có thể xem (nếu đã authenticate)
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write operations: chỉ admin
        return request.user.is_authenticated and request.user.is_staff


class StorageFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý Storage Files
    
    Endpoints:
    - GET /api/storage/files/ - List files
    - POST /api/storage/files/upload/ - Upload file
    - GET /api/storage/files/{id}/ - Chi tiết file
    - DELETE /api/storage/files/{id}/ - Xóa file
    - POST /api/storage/files/generate-presigned-url/ - Tạo presigned URL
    - GET /api/storage/files/list-objects/ - List files từ Object Storage trực tiếp
    """
    
    queryset = StorageFile.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StorageFileListSerializer
        return StorageFileSerializer
    
    def get_queryset(self):
        """Filter queryset theo query params"""
        queryset = StorageFile.objects.select_related('uploaded_by').all()
        
        # Filter theo prefix (folder)
        prefix = self.request.query_params.get('prefix', '')
        if prefix:
            queryset = queryset.filter(folder_prefix__startswith=prefix)
        
        # Filter theo file type
        file_type = self.request.query_params.get('file_type', '')
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        
        # Filter theo lesson_id
        lesson_id = self.request.query_params.get('lesson_id', '')
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        
        return queryset.order_by('-uploaded_at')
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload_file(self, request):
        """
        Upload file lên Object Storage
        
        POST /api/storage/files/upload/
        Body: multipart/form-data
        - file: File object
        - folder_prefix: (optional) Folder prefix
        - visibility: (optional) 'PUBLIC' or 'PRIVATE'
        - description: (optional) Mô tả
        - lesson_id: (optional) ID bài học liên quan
        """
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'Không có file được upload'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Lấy các tham số
        folder_prefix = serializer.validated_data.get('folder_prefix', 'media/uploads/')
        visibility = serializer.validated_data.get('visibility', 'PRIVATE')
        description = serializer.validated_data.get('description', '')
        lesson_id = serializer.validated_data.get('lesson_id', None)
        
        # Đảm bảo folder_prefix kết thúc bằng /
        if folder_prefix and not folder_prefix.endswith('/'):
            folder_prefix += '/'
        
        # Tạo storage key: folder_prefix + unique_filename
        file_ext = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        storage_key = f"{folder_prefix}{unique_filename}"
        
        # Xác định file type
        file_type = get_file_type_from_name(file.name)
        
        # Upload lên Object Storage
        service = ObjectStorageService()
        upload_result = service.upload_file(
            file=file,
            storage_key=storage_key,
            visibility=visibility
        )
        
        if not upload_result.get('success'):
            return Response(
                {'error': upload_result.get('error', 'Upload thất bại')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Lưu metadata vào database
        storage_file = StorageFile.objects.create(
            storage_key=storage_key,
            file_name=file.name,
            file_type=file_type,
            file_size=upload_result['file_size'],
            mime_type=upload_result['content_type'],
            visibility=visibility,
            folder_prefix=folder_prefix,
            description=description,
            lesson_id=lesson_id,
            uploaded_by=request.user,
            public_url=service.get_file_url(storage_key, public=(visibility == 'PUBLIC')) if visibility == 'PUBLIC' else '',
        )
        
        # Serialize và return
        response_serializer = StorageFileSerializer(storage_file)
        return Response(
            {
                'message': 'Upload thành công',
                'file': response_serializer.data
            },
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'])
    def delete_file(self, request, pk=None):
        """
        Xóa file khỏi Object Storage và database
        
        DELETE /api/storage/files/{id}/delete_file/
        """
        try:
            storage_file = self.get_object()
            storage_key = storage_file.storage_key
            
            # Xóa khỏi Object Storage
            service = ObjectStorageService()
            delete_result = service.delete_file(storage_key)
            
            if not delete_result.get('success'):
                return Response(
                    {'error': delete_result.get('error', 'Xóa file thất bại')},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Xóa khỏi database
            storage_file.delete()
            
            return Response(
                {'message': 'Xóa file thành công'},
                status=status.HTTP_200_OK
            )
        
        except StorageFile.DoesNotExist:
            return Response(
                {'error': 'File không tồn tại'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy để xóa cả trên Object Storage"""
        instance = self.get_object()
        storage_key = instance.storage_key
        
        # Xóa khỏi Object Storage
        service = ObjectStorageService()
        delete_result = service.delete_file(storage_key)
        
        if not delete_result.get('success'):
            return Response(
                {'error': delete_result.get('error', 'Xóa file thất bại')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Xóa khỏi database
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], url_path='generate-presigned-url')
    def generate_presigned_url(self, request):
        """
        Tạo Presigned URL cho file
        
        POST /api/storage/files/generate-presigned-url/
        Body: {
            "storage_key": "media/lessons/lesson-1/image.jpg",
            "expiration": 3600  // optional, default 1 hour
        }
        """
        serializer = PresignedURLSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        storage_key = serializer.validated_data['storage_key']
        expiration = serializer.validated_data.get('expiration', 3600)
        
        service = ObjectStorageService()
        result = service.generate_presigned_url(
            storage_key=storage_key,
            expiration=expiration
        )
        
        if not result.get('success'):
            return Response(
                {'error': result.get('error', 'Tạo presigned URL thất bại')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(result, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='list-objects')
    def list_objects(self, request):
        """
        List files trực tiếp từ Object Storage (không qua database)
        
        GET /api/storage/files/list-objects/?prefix=media/lessons/
        """
        prefix = request.query_params.get('prefix', '')
        max_keys = int(request.query_params.get('max_keys', 1000))
        
        service = ObjectStorageService()
        result = service.list_files(prefix=prefix, max_keys=max_keys)
        
        if not result.get('success'):
            return Response(
                {'error': result.get('error', 'List files thất bại')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(result, status=status.HTTP_200_OK)
