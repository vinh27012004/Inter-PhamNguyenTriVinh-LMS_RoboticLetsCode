"""
Admin Panel cho ứng dụng Content
Giao diện quản trị phân cấp: Program -> Subcourse -> Lesson
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Program, Subcourse, Lesson, UserProgress


# ============================================================================
# INLINE CLASSES - Quản lý phân cấp
# ============================================================================

class SubcourseInline(admin.TabularInline):
    """
    Inline để quản lý Subcourse trong Program Admin
    Hiển thị danh sách khóa con ngay trong trang chỉnh sửa Chương trình
    """
    model = Subcourse
    extra = 1  # Số dòng trống mặc định để thêm mới
    min_num = 0
    max_num = 50
    
    fields = [
        'title', 
        'slug', 
        'coding_language', 
        'level',
        'level_number',
        'session_count',
        'status', 
        'sort_order',
    ]
    
    # Chỉ cho phép xem, không cho thêm/xóa trực tiếp (optional)
    # can_delete = False
    # show_change_link = True  # Hiển thị link để edit chi tiết
    
    prepopulated_fields = {'slug': ('title',)}
    
    verbose_name = 'Khóa học con'
    verbose_name_plural = 'Khóa học con trong chương trình'


class LessonInline(admin.TabularInline):
    """
    Inline để quản lý Lesson trong Subcourse Admin
    Hiển thị danh sách bài học ngay trong trang chỉnh sửa Khóa con
    """
    model = Lesson
    extra = 1
    min_num = 0
    max_num = 100
    
    fields = [
        'title',
        'slug',
        'status',
        'sort_order',
    ]
    
    prepopulated_fields = {'slug': ('title',)}
    
    verbose_name = 'Bài học'
    verbose_name_plural = 'Bài học trong khóa con'


# ============================================================================
# ADMIN CLASSES - Giao diện quản trị chính
# ============================================================================

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    """
    Admin cho Program (Chương trình học)
    Hiển thị Subcourses inline để quản lý phân cấp
    """
    list_display = [
        'title',
        'kit_type',
        'status_badge',
        'sort_order',
        'subcourse_count',
        'created_at',
    ]
    
    list_filter = [
        'kit_type',
        'status',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'description',
    ]
    
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('title', 'slug', 'description', 'kit_type')
        }),
        ('Media & Hiển thị', {
            'fields': ('thumbnail_url', 'status', 'sort_order'),
            'classes': ('collapse',),  # Có thể thu gọn
        }),
    )
    
    # Thêm Subcourse inline
    inlines = [SubcourseInline]
    
    list_editable = ['sort_order']
    list_per_page = 20
    ordering = ['sort_order', 'title']
    
    def status_badge(self, obj):
        """Hiển thị trạng thái với màu sắc"""
        colors = {
            'DRAFT': '#FFA500',      # Cam
            'PUBLISHED': '#28A745',   # Xanh lá
            'ARCHIVED': '#6C757D',    # Xám
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Trạng thái'
    
    def subcourse_count(self, obj):
        """Hiển thị số lượng khóa con"""
        count = obj.subcourses.count()
        url = reverse('admin:content_subcourse_changelist') + f'?program__id__exact={obj.id}'
        return format_html(
            '<a href="{}">{} khóa con</a>',
            url,
            count
        )
    subcourse_count.short_description = 'Số khóa con'


@admin.register(Subcourse)
class SubcourseAdmin(admin.ModelAdmin):
    """
    Admin cho Subcourse (Khóa học con)
    Hiển thị Lessons inline để quản lý phân cấp
    """
    list_display = [
        'title',
        'program',
        'coding_language',
        'level',
        'level_number',
        'session_count',
        'status_badge',
        'sort_order',
        'lesson_count',
        'created_at',
    ]
    
    list_filter = [
        'program',
        'coding_language',
        'status',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'subtitle',
        'description',
        'objective',
        'program__title',
    ]
    
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Thuộc chương trình', {
            'fields': ('program',)
        }),
        ('Thông tin cơ bản', {
            'fields': ('title', 'slug', 'subtitle', 'description', 'objective')
        }),
        ('Cấu hình học tập', {
            'fields': ('coding_language', 'level', 'level_number', 'session_count')
        }),
        ('Media & Hiển thị', {
            'fields': ('thumbnail_url', 'status', 'sort_order'),
            'classes': ('collapse',),
        }),
    )
    
    # Thêm Lesson inline
    inlines = [LessonInline]
    
    list_editable = ['sort_order']
    list_per_page = 20
    ordering = ['program', 'sort_order', 'title']
    
    def status_badge(self, obj):
        """Hiển thị trạng thái với màu sắc"""
        colors = {
            'DRAFT': '#FFA500',
            'PUBLISHED': '#28A745',
            'ARCHIVED': '#6C757D',
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Trạng thái'
    
    def lesson_count(self, obj):
        """Hiển thị số lượng bài học"""
        count = obj.lessons.count()
        url = reverse('admin:content_lesson_changelist') + f'?subcourse__id__exact={obj.id}'
        return format_html(
            '<a href="{}">{} bài học</a>',
            url,
            count
        )
    lesson_count.short_description = 'Số bài học'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """
    Admin cho Lesson (Bài học)
    Giao diện chi tiết cho từng bài học
    """
    list_display = [
        'title',
        'subcourse',
        'status_badge',
        'sort_order',
        'created_at',
    ]
    
    list_filter = [
        'subcourse__program',
        'subcourse',
        'status',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'subtitle',
        'objective',
        'content_text',
        'subcourse__title',
        'subcourse__program__title',
    ]
    
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Thuộc khóa học', {
            'fields': ('subcourse',)
        }),
        ('Thông tin cơ bản', {
            'fields': ('title', 'slug',)
        }),
        ('Mục tiêu & Nội dung', {
            'fields': ('objective', 'knowledge_skills', 'content_text'),
            'classes': ('wide',),
        }),
        ('Hiển thị', {
            'fields': ('status', 'sort_order'),
        }),
    )
    
    list_editable = ['sort_order']
    list_per_page = 30
    ordering = ['subcourse', 'sort_order', 'title']
    
    def status_badge(self, obj):
        """Hiển thị trạng thái với màu sắc"""
        colors = {
            'DRAFT': '#FFA500',
            'PUBLISHED': '#28A745',
            'ARCHIVED': '#6C757D',
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Trạng thái'


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    """
    Admin cho UserProgress (Tiến độ học tập)
    Theo dõi tiến độ của học viên
    """
    list_display = [
        'user',
        'lesson',
        'subcourse_name',
        'completion_badge',
        'completed_at',
        'created_at',
    ]
    
    list_filter = [
        'is_completed',
        'lesson__subcourse__program',
        'lesson__subcourse',
        'created_at',
        'completed_at',
    ]
    
    search_fields = [
        'user__username',
        'user__email',
        'lesson__title',
        'lesson__subcourse__title',
    ]
    
    date_hierarchy = 'created_at'
    
    list_per_page = 50
    ordering = ['-created_at']
    
    # Readonly fields
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin học viên', {
            'fields': ('user', 'lesson')
        }),
        ('Trạng thái hoàn thành', {
            'fields': ('is_completed', 'completed_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def subcourse_name(self, obj):
        """Hiển thị tên khóa con"""
        return obj.lesson.subcourse.title
    subcourse_name.short_description = 'Khóa học'
    
    def completion_badge(self, obj):
        """Hiển thị trạng thái hoàn thành"""
        if obj.is_completed:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Hoàn thành</span>'
            )
        return format_html(
            '<span style="color: orange;">○ Đang học</span>'
        )
    completion_badge.short_description = 'Trạng thái'


# ============================================================================
# TUỲ CHỈNH ADMIN SITE
# ============================================================================

admin.site.site_header = 'E-Robotic Let\'s Code - Quản trị'
admin.site.site_title = 'Admin Panel'
admin.site.index_title = 'Bảng điều khiển quản trị'
