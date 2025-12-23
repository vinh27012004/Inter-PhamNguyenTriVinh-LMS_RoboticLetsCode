"""
Admin cho Classes App
"""
from django.contrib import admin
from .models import Class, ClassTeacher, ClassEnrollment


class ClassTeacherInline(admin.TabularInline):
    """Inline cho giáo viên của lớp"""
    model = ClassTeacher
    extra = 1
    fields = ['teacher', 'role', 'assigned_by']
    readonly_fields = ['assigned_at']
    autocomplete_fields = ['teacher', 'assigned_by']


class ClassEnrollmentInline(admin.TabularInline):
    """Inline cho học viên của lớp"""
    model = ClassEnrollment
    extra = 0
    fields = ['student', 'status', 'enrolled_at', 'notes']
    readonly_fields = ['enrolled_at']
    autocomplete_fields = ['student']


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    """Admin cho Class"""
    list_display = [
        'code',
        'name',
        'subcourse',
        'status',
        'start_date',
        'end_date',
        'current_enrollment_count',
        'max_students',
        'is_full',
    ]
    list_filter = ['status', 'subcourse', 'start_date']
    search_fields = ['name', 'code', 'subcourse__title']
    date_hierarchy = 'start_date'
    
    fieldsets = [
        ('Thông tin cơ bản', {
            'fields': ['name', 'code', 'subcourse', 'status']
        }),
        ('Thời gian', {
            'fields': ['start_date', 'end_date']
        }),
        ('Cài đặt', {
            'fields': ['max_students', 'description', 'notes']
        }),
        ('Metadata', {
            'fields': ['created_by', 'created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['subcourse', 'created_by']
    
    inlines = [ClassTeacherInline, ClassEnrollmentInline]
    
    def save_model(self, request, obj, form, change):
        """Tự động set created_by"""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ClassTeacher)
class ClassTeacherAdmin(admin.ModelAdmin):
    """Admin cho ClassTeacher"""
    list_display = ['class_obj', 'teacher', 'role', 'assigned_at']
    list_filter = ['role', 'assigned_at']
    search_fields = ['class_obj__name', 'class_obj__code', 'teacher__username']
    date_hierarchy = 'assigned_at'
    autocomplete_fields = ['class_obj', 'teacher', 'assigned_by']
    
    def save_model(self, request, obj, form, change):
        """Tự động set assigned_by"""
        if not change:
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    """Admin cho ClassEnrollment"""
    list_display = [
        'class_obj',
        'student',
        'status',
        'enrolled_at',
        'completed_at',
    ]
    list_filter = ['status', 'enrolled_at', 'class_obj__status']
    search_fields = ['class_obj__name', 'class_obj__code', 'student__username']
    date_hierarchy = 'enrolled_at'
    autocomplete_fields = ['class_obj', 'student', 'enrolled_by']
    
    fieldsets = [
        ('Thông tin cơ bản', {
            'fields': ['class_obj', 'student', 'status']
        }),
        ('Thời gian', {
            'fields': ['enrolled_at', 'completed_at']
        }),
        ('Metadata', {
            'fields': ['enrolled_by', 'notes'],
            'classes': ['collapse']
        }),
    ]
    readonly_fields = ['enrolled_at']
    
    def save_model(self, request, obj, form, change):
        """Tự động set enrolled_by"""
        if not change:
            obj.enrolled_by = request.user
        super().save_model(request, obj, form, change)
