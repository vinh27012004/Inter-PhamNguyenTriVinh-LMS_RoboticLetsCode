"""
Service layer cho Local File Storage operations
Lưu trữ files trên local filesystem (MEDIA_ROOT)
"""
import os
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from typing import Optional, List, Dict
import mimetypes
from pathlib import Path


class LocalStorageService:
    """
    Service để quản lý Local File Storage
    Lưu files vào MEDIA_ROOT
    """
    
    def __init__(self):
        """Khởi tạo với MEDIA_ROOT từ settings"""
        self.media_root = getattr(settings, 'MEDIA_ROOT', None)
        if not self.media_root:
            raise ValueError("MEDIA_ROOT chưa được cấu hình trong settings.py")
        
        # Tạo thư mục nếu chưa tồn tại
        Path(self.media_root).mkdir(parents=True, exist_ok=True)
    
    def upload_file(
        self,
        file: UploadedFile,
        storage_key: str,
        content_type: Optional[str] = None,
        metadata: Optional[Dict] = None,
        visibility: str = 'PRIVATE'
    ) -> Dict:
        """
        Upload file lên Local Storage
        
        Args:
            file: Django UploadedFile object
            storage_key: Key/path trên storage (ví dụ: media/lessons/lesson-1/image.jpg)
            content_type: MIME type (auto-detect nếu None)
            metadata: Custom metadata dict (không dùng cho local storage)
            visibility: 'PUBLIC' hoặc 'PRIVATE' (không áp dụng cho local storage)
        
        Returns:
            Dict với thông tin file đã upload
        """
        try:
            # Auto-detect content type
            if not content_type:
                content_type, _ = mimetypes.guess_type(file.name)
                if not content_type:
                    content_type = 'application/octet-stream'
            
            # Tạo đường dẫn đầy đủ
            file_path = os.path.join(self.media_root, storage_key)
            
            # Tạo thư mục nếu chưa tồn tại
            file_dir = os.path.dirname(file_path)
            Path(file_dir).mkdir(parents=True, exist_ok=True)
            
            # Lưu file
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            return {
                'success': True,
                'storage_key': storage_key,
                'file_name': file.name,
                'file_size': file_size,
                'content_type': content_type,
                'file_path': file_path,
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
        List files trong MEDIA_ROOT theo prefix (folder)
        
        Args:
            prefix: Prefix/folder path (ví dụ: 'media/lessons/')
            max_keys: Số lượng file tối đa
            delimiter: Delimiter để phân tách folder (default: '/')
        
        Returns:
            Dict với danh sách files và folders
        """
        try:
            files = []
            folders = []
            
            # Tạo đường dẫn đầy đủ
            search_path = os.path.join(self.media_root, prefix) if prefix else self.media_root
            
            if not os.path.exists(search_path):
                return {
                    'success': True,
                    'files': [],
                    'folders': [],
                    'prefix': prefix,
                    'is_truncated': False,
                }
            
            count = 0
            for root, dirs, filenames in os.walk(search_path):
                # Tính relative path từ media_root
                rel_root = os.path.relpath(root, self.media_root)
                if rel_root == '.':
                    rel_root = ''
                else:
                    rel_root = rel_root.replace('\\', '/') + '/'
                
                # Add folders
                for dir_name in dirs:
                    if count >= max_keys:
                        break
                    folder_prefix = os.path.join(rel_root, dir_name).replace('\\', '/') + '/'
                    folders.append({
                        'prefix': folder_prefix,
                    })
                    count += 1
                
                # Add files
                for filename in filenames:
                    if count >= max_keys:
                        break
                    file_key = os.path.join(rel_root, filename).replace('\\', '/')
                    file_path = os.path.join(root, filename)
                    
                    files.append({
                        'key': file_key,
                        'size': os.path.getsize(file_path),
                        'last_modified': os.path.getmtime(file_path),
                        'storage_class': 'STANDARD',
                    })
                    count += 1
                
                if count >= max_keys:
                    break
            
            return {
                'success': True,
                'files': files,
                'folders': folders,
                'prefix': prefix,
                'is_truncated': count >= max_keys,
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def delete_file(self, storage_key: str) -> Dict:
        """
        Xóa file khỏi Local Storage
        
        Args:
            storage_key: Key/path của file cần xóa
        
        Returns:
            Dict với kết quả
        """
        try:
            file_path = os.path.join(self.media_root, storage_key)
            
            if os.path.exists(file_path):
                os.remove(file_path)
                return {
                    'success': True,
                    'storage_key': storage_key,
                }
            else:
                return {
                    'success': False,
                    'error': 'File không tồn tại',
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
        Tạo URL cho file (local storage không cần presigned URL)
        
        Args:
            storage_key: Key/path của file
            expiration: Thời gian hết hạn (giây) - không áp dụng cho local
            http_method: HTTP method - không áp dụng cho local
        
        Returns:
            Dict với URL
        """
        try:
            # Tạo URL từ MEDIA_URL
            media_url = getattr(settings, 'MEDIA_URL', '/media/')
            if not media_url.endswith('/'):
                media_url += '/'
            
            url = f"{media_url}{storage_key}"
            
            return {
                'success': True,
                'url': url,
                'expiration': expiration,
                'storage_key': storage_key,
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
            public: True nếu file là public (không áp dụng cho local)
        
        Returns:
            URL string hoặc None
        """
        try:
            media_url = getattr(settings, 'MEDIA_URL', '/media/')
            if not media_url.endswith('/'):
                media_url += '/'
            return f"{media_url}{storage_key}"
        except:
            return None
    
    def file_exists(self, storage_key: str) -> bool:
        """
        Kiểm tra file có tồn tại không
        
        Args:
            storage_key: Key/path của file
        
        Returns:
            True nếu file tồn tại
        """
        file_path = os.path.join(self.media_root, storage_key)
        return os.path.exists(file_path)


# Alias để tương thích với code cũ
ObjectStorageService = LocalStorageService


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
