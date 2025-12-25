"""
Models cho Storage Management - Metadata của files trên Object Storage
Chỉ lưu metadata, không lưu binary data
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class StorageFile(models.Model):
    """
    Metadata của file trên Object Storage
    Lưu thông tin: key, type, size, lesson liên quan, etc.
    """
    FILE_TYPE_CHOICES = [
        ('IMAGE', 'Ảnh'),
        ('VIDEO', 'Video'),
        ('PDF', 'PDF'),
        ('AUDIO', 'Audio'),
        ('OTHER', 'Khác'),
    ]
    
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Công khai'),
        ('PRIVATE', 'Riêng tư'),
    ]

    # Thông tin file trên Object Storage
    storage_key = models.CharField(
        max_length=500,
        unique=True,
        verbose_name='Storage Key',
        help_text='Key/path của file trên Object Storage (ví dụ: media/lessons/lesson-1/image.jpg)'
    )
    
    file_name = models.CharField(
        max_length=255,
        verbose_name='Tên file',
        help_text='Tên file gốc'
    )
    
    file_type = models.CharField(
        max_length=20,
        choices=FILE_TYPE_CHOICES,
        verbose_name='Loại file',
        help_text='Loại file: ảnh, video, pdf, etc.'
    )
    
    file_size = models.BigIntegerField(
        verbose_name='Kích thước (bytes)',
        help_text='Kích thước file tính bằng bytes'
    )
    
    mime_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='MIME Type',
        help_text='MIME type của file (ví dụ: image/jpeg, video/mp4)'
    )
    
    # Visibility & Access
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='PRIVATE',
        verbose_name='Quyền truy cập',
        help_text='PUBLIC: ai cũng xem được, PRIVATE: cần signed URL'
    )
    
    # Metadata
    folder_prefix = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Folder Prefix',
        help_text='Prefix/folder chứa file (ví dụ: media/lessons/)'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả',
        help_text='Mô tả về file (tùy chọn)'
    )
    
    # Liên kết với bài học (optional)
    lesson_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Lesson ID',
        help_text='ID của bài học liên quan (nếu có)'
    )
    
    # Audit fields
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_files',
        verbose_name='Người upload',
        help_text='User đã upload file này'
    )
    
    uploaded_at = models.DateTimeField(
        default=timezone.now,
        verbose_name='Thời gian upload',
        help_text='Thời điểm file được upload'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Cập nhật lúc',
        help_text='Thời điểm metadata được cập nhật lần cuối'
    )
    
    # URL cache (optional, để tránh generate lại nhiều lần)
    public_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='Public URL',
        help_text='URL công khai (nếu visibility=PUBLIC)'
    )
    
    class Meta:
        verbose_name = 'Storage File'
        verbose_name_plural = 'Storage Files'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['storage_key']),
            models.Index(fields=['folder_prefix']),
            models.Index(fields=['file_type']),
            models.Index(fields=['lesson_id']),
            models.Index(fields=['uploaded_at']),
        ]
    
    def __str__(self):
        return f"{self.file_name} ({self.storage_key})"
    
    def get_file_extension(self):
        """Lấy extension của file"""
        if '.' in self.file_name:
            return self.file_name.rsplit('.', 1)[1].lower()
        return ''
    
    def is_image(self):
        """Kiểm tra có phải ảnh không"""
        return self.file_type == 'IMAGE'
    
    def is_video(self):
        """Kiểm tra có phải video không"""
        return self.file_type == 'VIDEO'
