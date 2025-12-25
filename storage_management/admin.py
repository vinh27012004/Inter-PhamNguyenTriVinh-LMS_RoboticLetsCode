"""
Admin configuration cho Storage Management
"""
from django.contrib import admin
from .models import StorageFile


@admin.register(StorageFile)
class StorageFileAdmin(admin.ModelAdmin):
    """Admin interface cho StorageFile"""
    
    list_display = [
        'file_name',
        'storage_key',
        'file_type',
        'file_size',
        'visibility',
        'folder_prefix',
        'uploaded_by',
        'uploaded_at',
    ]
    
    list_filter = [
        'file_type',
        'visibility',
        'folder_prefix',
        'uploaded_at',
    ]
    
    search_fields = [
        'file_name',
        'storage_key',
        'description',
    ]
    
    readonly_fields = [
        'id',
        'uploaded_at',
        'updated_at',
        'public_url',
    ]
    
    fieldsets = (
        ('Thông tin file', {
            'fields': (
                'file_name',
                'storage_key',
                'file_type',
                'file_size',
                'mime_type',
            )
        }),
        ('Quyền truy cập', {
            'fields': (
                'visibility',
                'public_url',
            )
        }),
        ('Metadata', {
            'fields': (
                'folder_prefix',
                'description',
                'lesson_id',
            )
        }),
        ('Audit', {
            'fields': (
                'uploaded_by',
                'uploaded_at',
                'updated_at',
            )
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Một số fields chỉ readonly khi đã tạo"""
        readonly = list(self.readonly_fields)
        if obj:  # Editing existing object
            readonly.extend(['storage_key', 'file_name', 'file_type', 'file_size'])
        return readonly
