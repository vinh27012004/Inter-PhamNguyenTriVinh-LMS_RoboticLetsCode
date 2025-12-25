"""
Service layer cho Object Storage operations
Sử dụng boto3 để tương tác với S3-compatible storage
"""
import os
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from typing import Optional, List, Dict
import mimetypes
from datetime import timedelta


class ObjectStorageService:
    """
    Service để quản lý Object Storage (S3-compatible)
    Hỗ trợ: AWS S3, MinIO, OB Việt Nam, etc.
    """
    
    def __init__(self):
        """Khởi tạo S3 client từ settings"""
        self.access_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
        self.secret_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
        self.bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        self.endpoint_url = getattr(settings, 'AWS_S3_ENDPOINT_URL', None)
        self.region = getattr(settings, 'AWS_S3_REGION_NAME', 'auto')
        self.use_ssl = getattr(settings, 'AWS_S3_USE_SSL', True)
        
        if not all([self.access_key, self.secret_key, self.bucket_name]):
            raise ValueError("Object Storage credentials chưa được cấu hình trong settings.py")
        
        # Tạo S3 client
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
            use_ssl=self.use_ssl,
            verify=getattr(settings, 'AWS_S3_VERIFY', True),
        )
    
    def upload_file(
        self,
        file: UploadedFile,
        storage_key: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict] = None,
        visibility: str = 'PRIVATE'
    ) -> Dict:
        """
        Upload file lên Object Storage
        
        Args:
            file: Django UploadedFile object
            storage_key: Key/path trên storage (ví dụ: media/lessons/lesson-1/image.jpg)
            content_type: MIME type (auto-detect nếu None)
            metadata: Custom metadata dict
            visibility: 'PUBLIC' hoặc 'PRIVATE'
        
        Returns:
            Dict với thông tin file đã upload
        """
        try:
            # Auto-detect content type
            if not content_type:
                content_type, _ = mimetypes.guess_type(file.name)
                if not content_type:
                    content_type = 'application/octet-stream'
            
            # Extra args cho upload
            extra_args = {
                'ContentType': content_type,
            }
            
            # Set ACL nếu PUBLIC
            if visibility == 'PUBLIC':
                extra_args['ACL'] = 'public-read'
            
            # Add metadata
            if metadata:
                extra_args['Metadata'] = metadata
            
            # Upload file
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                storage_key,
                ExtraArgs=extra_args
            )
            
            # Get file size
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset
            
            return {
                'success': True,
                'storage_key': storage_key,
                'file_name': file.name,
                'file_size': file_size,
                'content_type': content_type,
                'bucket': self.bucket_name,
            }
        
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.response.get('Error', {}).get('Code', 'Unknown'),
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def list_files(
        self,
        prefix: str = '',
        max_keys: int = 1000,
        delimiter: str = '/'
    ) -> Dict:
        """
        List files trong bucket theo prefix (folder)
        
        Args:
            prefix: Prefix/folder path (ví dụ: 'media/lessons/')
            max_keys: Số lượng file tối đa
            delimiter: Delimiter để phân tách folder (default: '/')
        
        Returns:
            Dict với danh sách files và folders
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys,
                Delimiter=delimiter,
            )
            
            files = []
            folders = []
            
            # Files
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                        'storage_class': obj.get('StorageClass', 'STANDARD'),
                    })
            
            # Folders (CommonPrefixes)
            if 'CommonPrefixes' in response:
                for prefix_obj in response['CommonPrefixes']:
                    folders.append({
                        'prefix': prefix_obj['Prefix'],
                    })
            
            return {
                'success': True,
                'files': files,
                'folders': folders,
                'prefix': prefix,
                'is_truncated': response.get('IsTruncated', False),
            }
        
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.response.get('Error', {}).get('Code', 'Unknown'),
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def delete_file(self, storage_key: str) -> Dict:
        """
        Xóa file khỏi Object Storage
        
        Args:
            storage_key: Key/path của file cần xóa
        
        Returns:
            Dict với kết quả
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=storage_key
            )
            
            return {
                'success': True,
                'storage_key': storage_key,
            }
        
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.response.get('Error', {}).get('Code', 'Unknown'),
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def generate_presigned_url(
        self,
        storage_key: str,
        expiration: int = 3600,
        http_method: str = 'GET'
    ) -> Dict:
        """
        Tạo Presigned URL có thời hạn
        
        Args:
            storage_key: Key/path của file
            expiration: Thời gian hết hạn (giây), default 1 giờ
            http_method: HTTP method ('GET' hoặc 'PUT')
        
        Returns:
            Dict với presigned URL
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object' if http_method == 'GET' else 'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': storage_key,
                },
                ExpiresIn=expiration
            )
            
            return {
                'success': True,
                'url': url,
                'expiration': expiration,
                'storage_key': storage_key,
            }
        
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'error_code': e.response.get('Error', {}).get('Code', 'Unknown'),
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def get_file_url(self, storage_key: str, public: bool = False) -> Optional[str]:
        """
        Lấy URL của file
        
        Args:
            storage_key: Key/path của file
            public: True nếu file là public (không cần signed URL)
        
        Returns:
            URL string hoặc None
        """
        if public:
            # Public URL
            if self.endpoint_url:
                # Custom endpoint (MinIO, OB VN, etc.)
                if self.endpoint_url.startswith('http'):
                    base_url = self.endpoint_url.rstrip('/')
                else:
                    base_url = f"https://{self.endpoint_url}"
                return f"{base_url}/{self.bucket_name}/{storage_key}"
            else:
                # AWS S3 standard
                return f"https://{self.bucket_name}.s3.amazonaws.com/{storage_key}"
        else:
            # Private - cần signed URL
            result = self.generate_presigned_url(storage_key, expiration=3600)
            return result.get('url') if result.get('success') else None
    
    def file_exists(self, storage_key: str) -> bool:
        """
        Kiểm tra file có tồn tại không
        
        Args:
            storage_key: Key/path của file
        
        Returns:
            True nếu file tồn tại
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=storage_key
            )
            return True
        except ClientError:
            return False


def get_file_type_from_name(file_name: str) -> str:
    """
    Xác định loại file từ tên file
    
    Returns:
        'IMAGE', 'VIDEO', 'PDF', 'AUDIO', hoặc 'OTHER'
    """
    ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else ''
    
    image_exts = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'}
    video_exts = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'}
    audio_exts = {'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'}
    pdf_exts = {'pdf'}
    
    if ext in image_exts:
        return 'IMAGE'
    elif ext in video_exts:
        return 'VIDEO'
    elif ext in audio_exts:
        return 'AUDIO'
    elif ext in pdf_exts:
        return 'PDF'
    else:
        return 'OTHER'

