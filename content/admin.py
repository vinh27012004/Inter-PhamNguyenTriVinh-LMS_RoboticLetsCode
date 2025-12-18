"""
Admin Panel cho ứng dụng Content
Giao diện quản trị phân cấp: Program -> Subcourse -> Lesson
Mở rộng: Quản lý Objectives, Models, Preparation, BuildBlocks, 
ContentBlocks, Attachments, Challenges, Quizzes
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Program, Subcourse, Lesson, UserProgress,
    Media, LessonObjective, LessonModel, AssemblyGuide, Preparation,
    BuildBlock, LessonContentBlock, LessonAttachment,
    Challenge, Quiz, QuizQuestion, QuestionOption,
    QuizSubmission, QuizAnswer
)


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
# LESSON CONTENT INLINES - Nội dung chi tiết bài học
# ============================================================================

class LessonObjectiveInline(admin.TabularInline):
    """Inline quản lý Mục tiêu bài học"""
    model = LessonObjective
    extra = 1
    fields = ['objective_type', 'text', 'order']
    verbose_name = 'Mục tiêu'
    verbose_name_plural = 'Mục tiêu bài học (Knowledge, Thinking, Skills, Attitude)'


class LessonModelInline(admin.TabularInline):
    """Inline quản lý Mô hình/Demo"""
    model = LessonModel
    extra = 1
    fields = ['title', 'description', 'order']
    verbose_name = 'Mô hình'
    verbose_name_plural = 'Mô hình/Demo bài học'


class AssemblyGuideInline(admin.StackedInline):
    """Inline quản lý Hướng dẫn lắp ráp"""
    model = AssemblyGuide
    extra = 1
    fields = ['title', 'description', 'pdf_url', 'media', 'order']
    verbose_name = 'Hướng dẫn lắp ráp'
    verbose_name_plural = 'Hướng dẫn lắp ráp (Assembly Guides)'
    filter_horizontal = ['media']  # Cho phép chọn multiple media dễ hơn




class LessonContentBlockInline(admin.StackedInline):
    """Inline quản lý Nội dung học"""
    model = LessonContentBlock
    extra = 1
    fields = ['title', 'subtitle', 'content_type', 'description', 'usage_text', 'example_text', 'order']
    verbose_name = 'Khối nội dung'
    verbose_name_plural = 'Khối nội dung học tập'


class LessonAttachmentInline(admin.TabularInline):
    """Inline quản lý Tệp đính kèm"""
    model = LessonAttachment
    extra = 1
    fields = ['name', 'file_url', 'file_type', 'file_size_kb', 'order']
    verbose_name = 'Tệp đính kèm'
    verbose_name_plural = 'Tệp đính kèm (Files)'


class ChallengeInline(admin.StackedInline):
    """Inline quản lý Thử thách"""
    model = Challenge
    extra = 0
    fields = ['title', 'subtitle', 'difficulty', 'description', 'instructions', 'points', 'status', 'order']
    verbose_name = 'Thử thách'
    verbose_name_plural = 'Thử thách/Bài tập'


class QuizInline(admin.TabularInline):
    """Inline quản lý Quiz"""
    model = Quiz
    extra = 0
    fields = ['title', 'quiz_type', 'passing_score', 'max_attempts', 'status', 'order']
    verbose_name = 'Quiz'
    verbose_name_plural = 'Bài kiểm tra/Quiz'


# ============================================================================
# QUIZ CONTENT INLINES
# ============================================================================

class QuestionOptionInline(admin.TabularInline):
    """Inline quản lý Lựa chọn câu hỏi"""
    model = QuestionOption
    extra = 4
    fields = ['option_text', 'is_correct', 'order']
    verbose_name = 'Lựa chọn'
    verbose_name_plural = 'Các lựa chọn (Options)'


class QuizQuestionInline(admin.StackedInline):
    """Inline quản lý Câu hỏi Quiz"""
    model = QuizQuestion
    extra = 1
    fields = ['question_text', 'question_type', 'explanation', 'points', 'order']
    verbose_name = 'Câu hỏi'
    verbose_name_plural = 'Câu hỏi Quiz'


class QuizAnswerInline(admin.TabularInline):
    """Inline quản lý Câu trả lời"""
    model = QuizAnswer
    extra = 0
    fields = ['question', 'answer_text', 'is_correct', 'points_earned']
    readonly_fields = ['question', 'is_correct', 'points_earned']
    can_delete = False
    verbose_name = 'Câu trả lời'
    verbose_name_plural = 'Các câu trả lời'


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
    Giao diện chi tiết cho từng bài học với tất cả nội dung
    """
    list_display = [
        'title',
        'subcourse',
        'status_badge',
        'sort_order',
        'content_summary',
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
    
    # Thêm tất cả inlines cho lesson content
    inlines = [
        LessonObjectiveInline,
        LessonModelInline,
        LessonContentBlockInline,
        LessonAttachmentInline,
        ChallengeInline,
        QuizInline,
    ]
    
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
    
    def content_summary(self, obj):
        """Hiển thị tóm tắt nội dung"""
        counts = []
        if obj.objectives.exists():
            counts.append(f"{obj.objectives.count()} mục tiêu")
        if obj.models.exists():
            counts.append(f"{obj.models.count()} mô hình")
        if obj.content_blocks.exists():
            counts.append(f"{obj.content_blocks.count()} blocks")
        if obj.quizzes.exists():
            counts.append(f"{obj.quizzes.count()} quiz")
        if obj.challenges.exists():
            counts.append(f"{obj.challenges.count()} thử thách")
        
        if counts:
            return format_html('<small>{}</small>', ' | '.join(counts))
        return format_html('<small style="color: #999;">Chưa có nội dung</small>')
    content_summary.short_description = 'Nội dung'


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
# EXPANDED CONTENT ADMIN CLASSES
# ============================================================================

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    """Admin cho Media (Ảnh/Video/File)"""
    list_display = [
        'media_type_badge',
        'caption',
        'url_preview',
        'order',
        'created_at',
    ]
    
    list_filter = [
        'media_type',
        'created_at',
    ]
    
    search_fields = [
        'caption',
        'alt_text',
        'url',
    ]
    
    fieldsets = (
        ('Thông tin Media', {
            'fields': ('url', 'media_type', 'caption', 'alt_text')
        }),
        ('Hiển thị', {
            'fields': ('order',)
        }),
    )
    
    list_per_page = 50
    ordering = ['-created_at']
    
    def media_type_badge(self, obj):
        """Hiển thị loại media với icon"""
        icons = {
            'image': '🖼️',
            'video': '🎥',
            'pdf': '📄',
            'animation': '🎬',
            'file': '📎',
        }
        icon = icons.get(obj.media_type, '📁')
        return format_html(
            '{} <strong>{}</strong>',
            icon,
            obj.get_media_type_display()
        )
    media_type_badge.short_description = 'Loại'
    
    def url_preview(self, obj):
        """Hiển thị URL rút gọn"""
        url = obj.url
        if len(url) > 60:
            url = url[:57] + '...'
        return format_html(
            '<a href="{}" target="_blank" style="font-family: monospace; font-size: 11px;">{}</a>',
            obj.url,
            url
        )
    url_preview.short_description = 'URL'


@admin.register(LessonObjective)
class LessonObjectiveAdmin(admin.ModelAdmin):
    """Admin cho Mục tiêu bài học"""
    list_display = [
        'lesson',
        'objective_type_badge',
        'text_preview',
        'order',
    ]
    
    list_filter = [
        'objective_type',
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'text',
        'lesson__title',
    ]
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Mục tiêu', {
            'fields': ('objective_type', 'text', 'order')
        }),
    )
    
    list_per_page = 50
    ordering = ['lesson', 'objective_type', 'order']
    
    def objective_type_badge(self, obj):
        """Hiển thị loại mục tiêu với màu sắc"""
        colors = {
            'knowledge': '#007BFF',    # Xanh dương
            'thinking': '#6F42C1',     # Tím
            'skills': '#28A745',       # Xanh lá
            'attitude': '#FD7E14',     # Cam
        }
        color = colors.get(obj.objective_type, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_objective_type_display()
        )
    objective_type_badge.short_description = 'Loại'
    
    def text_preview(self, obj):
        """Hiển thị text rút gọn"""
        text = obj.text
        if len(text) > 80:
            text = text[:77] + '...'
        return text
    text_preview.short_description = 'Nội dung'


@admin.register(LessonModel)
class LessonModelAdmin(admin.ModelAdmin):
    """Admin cho Mô hình bài học"""
    list_display = [
        'lesson',
        'title',
        'description_preview',
        'media_count',
        'order',
    ]
    
    list_filter = [
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'title',
        'description',
        'lesson__title',
    ]
    
    filter_horizontal = ['media']
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Thông tin mô hình', {
            'fields': ('title', 'description', 'media', 'order')
        }),
    )
    
    list_per_page = 30
    ordering = ['lesson', 'order']
    
    def description_preview(self, obj):
        """Hiển thị mô tả rút gọn"""
        desc = obj.description
        if len(desc) > 50:
            desc = desc[:47] + '...'
        return desc or '-'
    description_preview.short_description = 'Mô tả'
    
    def media_count(self, obj):
        """Số lượng media"""
        count = obj.media.count()
        return format_html('<strong>{}</strong> media', count)
    media_count.short_description = 'Media'


@admin.register(Preparation)
class PreparationAdmin(admin.ModelAdmin):
    """Admin cho Chuẩn bị bài học"""
    list_display = [
        'lesson',
        'build_blocks_count',
        'created_at',
    ]
    
    list_filter = [
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'lesson__title',
    ]
    
    filter_horizontal = ['build_blocks']
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Khối chuẩn bị', {
            'fields': ('build_blocks',),
            'description': 'Chọn các build blocks cần hiển thị trong phần chuẩn bị'
        }),
    )
    
    list_per_page = 30
    ordering = ['lesson']
    
    def build_blocks_count(self, obj):
        """Số lượng build blocks"""
        count = obj.build_blocks.count()
        return format_html('<strong>{}</strong> blocks', count)
    build_blocks_count.short_description = 'Build Blocks'


@admin.register(BuildBlock)
class BuildBlockAdmin(admin.ModelAdmin):
    """Admin cho Khối xây dựng"""
    list_display = [
        'program',
        'title',
        'pdf_badge',
        'order',
    ]
    
    list_filter = [
        'program',
    ]
    
    search_fields = [
        'title',
        'description',
        'program__title',
    ]
    
    fieldsets = (
        ('Chương trình học', {
            'fields': ('program',)
        }),
        ('Thông tin khối xây dựng', {
            'fields': ('title', 'description', 'pdf_url', 'order')
        }),
    )
    
    list_per_page = 30
    ordering = ['program', 'order']
    
    def pdf_badge(self, obj):
        """Hiển thị badge nếu có PDF"""
        if obj.pdf_url:
            return format_html(
                '<a href="{}" target="_blank">📄 PDF</a>',
                obj.pdf_url
            )
        return format_html('<span style="color: #999;">-</span>')
    pdf_badge.short_description = 'PDF'
    


@admin.register(LessonContentBlock)
class LessonContentBlockAdmin(admin.ModelAdmin):
    """Admin cho Khối nội dung học"""
    list_display = [
        'lesson',
        'title',
        'content_type_badge',
        'media_count',
        'order',
    ]
    
    list_filter = [
        'content_type',
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'title',
        'subtitle',
        'description',
        'lesson__title',
    ]
    
    filter_horizontal = ['media']
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Thông tin block', {
            'fields': ('title', 'subtitle', 'content_type', 'order')
        }),
        ('Nội dung', {
            'fields': ('description', 'usage_text', 'example_text', 'media'),
            'classes': ('wide',),
        }),
    )
    
    list_per_page = 30
    ordering = ['lesson', 'order']
    
    def content_type_badge(self, obj):
        """Hiển thị loại nội dung"""
        icons = {
            'text': '📝',
            'text_media': '📝🖼️',
            'video': '🎥',
            'example': '💡',
            'tips': '⭐',
            'summary': '📋',
        }
        icon = icons.get(obj.content_type, '📄')
        return format_html(
            '{} {}',
            icon,
            obj.get_content_type_display()
        )
    content_type_badge.short_description = 'Loại'
    
    def media_count(self, obj):
        """Số lượng media"""
        count = obj.media.count()
        if count > 0:
            return format_html('<strong>{}</strong> media', count)
        return '-'
    media_count.short_description = 'Media'


@admin.register(LessonAttachment)
class LessonAttachmentAdmin(admin.ModelAdmin):
    """Admin cho Tệp đính kèm"""
    list_display = [
        'lesson',
        'name',
        'file_type_badge',
        'file_size_display',
        'file_link',
        'order',
    ]
    
    list_filter = [
        'file_type',
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'name',
        'description',
        'lesson__title',
    ]
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Thông tin file', {
            'fields': ('name', 'file_url', 'file_type', 'file_size_kb', 'description', 'order')
        }),
    )
    
    list_per_page = 50
    ordering = ['lesson', 'order']
    
    def file_type_badge(self, obj):
        """Hiển thị loại file với icon"""
        icons = {
            'code': '💻',
            'document': '📄',
            'spreadsheet': '📊',
            'archive': '📦',
            'media': '🎬',
            'other': '📎',
        }
        icon = icons.get(obj.file_type, '📁')
        return format_html(
            '{} {}',
            icon,
            obj.get_file_type_display()
        )
    file_type_badge.short_description = 'Loại file'
    
    def file_size_display(self, obj):
        """Hiển thị dung lượng file"""
        if obj.file_size_kb:
            if obj.file_size_kb < 1024:
                return f'{obj.file_size_kb} KB'
            else:
                mb = obj.file_size_kb / 1024
                return f'{mb:.1f} MB'
        return '-'
    file_size_display.short_description = 'Dung lượng'
    
    def file_link(self, obj):
        """Link download file"""
        return format_html(
            '<a href="{}" target="_blank">⬇️ Download</a>',
            obj.file_url
        )
    file_link.short_description = 'Link'


@admin.register(AssemblyGuide)
class AssemblyGuideAdmin(admin.ModelAdmin):
    """Admin cho Hướng dẫn lắp ráp"""
    list_display = [
        'lesson',
        'title',
        'media_count',
        'pdf_status',
    ]
    
    list_filter = [
        'lesson__subcourse__program',
        'lesson__subcourse',
        'lesson',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'description',
        'lesson__title',
    ]
    
    filter_horizontal = ['media']
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Thông tin hướng dẫn', {
            'fields': ('title', 'description')
        }),
        ('Media & PDF', {
            'fields': ('media', 'pdf_url'),
            'classes': ('wide',),
        }),
    )
    
    list_per_page = 30
    ordering = ['lesson', 'id']
    
    def media_count(self, obj):
        """Hiển thị số lượng media"""
        count = obj.media.count()
        return format_html(
            '<span style="background-color: #E7F3FF; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{} ảnh</span>',
            count
        )
    media_count.short_description = 'Media'
    
    def pdf_status(self, obj):
        """Hiển thị trạng thái PDF"""
        if obj.pdf_url:
            return format_html(
                '<a href="{}" target="_blank" style="color: #007BFF; text-decoration: none;">📄 PDF</a>',
                obj.pdf_url
            )
        return format_html('<span style="color: #999;">-</span>')
    pdf_status.short_description = 'PDF'


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    """Admin cho Thử thách"""
    list_display = [
        'lesson',
        'title',
        'difficulty_badge',
        'points',
        'status_badge',
        'media_count',
        'order',
    ]
    
    list_filter = [
        'difficulty',
        'status',
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'title',
        'subtitle',
        'description',
        'lesson__title',
    ]
    
    filter_horizontal = ['media']
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Thông tin thử thách', {
            'fields': ('title', 'subtitle', 'difficulty', 'points', 'time_limit_minutes', 'status', 'order')
        }),
        ('Nội dung', {
            'fields': ('description', 'instructions', 'expected_output', 'media'),
            'classes': ('wide',),
        }),
    )
    
    list_per_page = 30
    ordering = ['lesson', 'order']
    
    def difficulty_badge(self, obj):
        """Hiển thị độ khó với màu sắc"""
        colors = {
            'easy': '#28A745',      # Xanh lá
            'medium': '#FFC107',    # Vàng
            'hard': '#FD7E14',      # Cam
            'expert': '#DC3545',    # Đỏ
        }
        color = colors.get(obj.difficulty, '#000000')
        return format_html(
            '<span style="color: {}; font-weight: bold;">●</span> {}',
            color,
            obj.get_difficulty_display()
        )
    difficulty_badge.short_description = 'Độ khó'
    
    def status_badge(self, obj):
        """Hiển thị trạng thái"""
        colors = {
            'draft': '#FFA500',
            'published': '#28A745',
            'archived': '#6C757D',
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {};">●</span> {}',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Trạng thái'
    
    def media_count(self, obj):
        """Số lượng media"""
        count = obj.media.count()
        if count > 0:
            return format_html('<strong>{}</strong> media', count)
        return '-'
    media_count.short_description = 'Media'


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin cho Quiz/Bài kiểm tra"""
    list_display = [
        'lesson',
        'title',
        'quiz_type_badge',
        'passing_score',
        'max_attempts',
        'question_count',
        'status_badge',
        'order',
    ]
    
    list_filter = [
        'quiz_type',
        'status',
        'lesson__subcourse__program',
        'lesson__subcourse',
    ]
    
    search_fields = [
        'title',
        'description',
        'lesson__title',
    ]
    
    fieldsets = (
        ('Bài học', {
            'fields': ('lesson',)
        }),
        ('Thông tin quiz', {
            'fields': ('title', 'description', 'quiz_type', 'status', 'order')
        }),
        ('Cài đặt', {
            'fields': ('passing_score', 'max_attempts', 'time_limit_minutes', 'shuffle_questions', 'shuffle_options', 'show_correct_answer')
        }),
    )
    
    inlines = [QuizQuestionInline]
    
    list_per_page = 30
    ordering = ['lesson', 'order']
    
    def quiz_type_badge(self, obj):
        """Hiển thị loại quiz"""
        icons = {
            'single': '⭕',
            'multiple': '☑️',
            'open': '📝',
            'mixed': '🔀',
        }
        icon = icons.get(obj.quiz_type, '❓')
        return format_html(
            '{} {}',
            icon,
            obj.get_quiz_type_display()
        )
    quiz_type_badge.short_description = 'Loại'
    
    def question_count(self, obj):
        """Số lượng câu hỏi"""
        count = obj.questions.count()
        return format_html('<strong>{}</strong> câu', count)
    question_count.short_description = 'Câu hỏi'
    
    def status_badge(self, obj):
        """Hiển thị trạng thái"""
        colors = {
            'draft': '#FFA500',
            'published': '#28A745',
            'archived': '#6C757D',
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="color: {};">●</span> {}',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Trạng thái'


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    """Admin cho Câu hỏi Quiz"""
    list_display = [
        'quiz',
        'question_preview',
        'question_type_badge',
        'points',
        'option_count',
        'order',
    ]
    
    list_filter = [
        'question_type',
        'quiz__lesson__subcourse__program',
        'quiz__lesson__subcourse',
    ]
    
    search_fields = [
        'question_text',
        'quiz__title',
    ]
    
    fieldsets = (
        ('Quiz', {
            'fields': ('quiz',)
        }),
        ('Câu hỏi', {
            'fields': ('question_text', 'question_type', 'explanation', 'points', 'order')
        }),
    )
    
    inlines = [QuestionOptionInline]
    
    list_per_page = 50
    ordering = ['quiz', 'order']
    
    def question_preview(self, obj):
        """Hiển thị câu hỏi rút gọn"""
        text = obj.question_text
        if len(text) > 60:
            text = text[:57] + '...'
        return text
    question_preview.short_description = 'Câu hỏi'
    
    def question_type_badge(self, obj):
        """Hiển thị loại câu hỏi"""
        icons = {
            'single': '⭕',
            'multiple': '☑️',
            'open': '📝',
        }
        icon = icons.get(obj.question_type, '❓')
        return format_html(
            '{} {}',
            icon,
            obj.get_question_type_display()
        )
    question_type_badge.short_description = 'Loại'
    
    def option_count(self, obj):
        """Số lượng lựa chọn"""
        if obj.question_type in ['single', 'multiple']:
            count = obj.options.count()
            correct = obj.options.filter(is_correct=True).count()
            return format_html(
                '<strong>{}</strong> options ({} đúng)',
                count,
                correct
            )
        return '-'
    option_count.short_description = 'Lựa chọn'


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    """Admin cho Lựa chọn câu hỏi"""
    list_display = [
        'question',
        'option_text_preview',
        'is_correct_badge',
        'order',
    ]
    
    list_filter = [
        'is_correct',
        'question__quiz__lesson__subcourse__program',
    ]
    
    search_fields = [
        'option_text',
        'question__question_text',
    ]
    
    list_per_page = 100
    ordering = ['question', 'order']
    
    def option_text_preview(self, obj):
        """Hiển thị text rút gọn"""
        text = obj.option_text
        if len(text) > 50:
            text = text[:47] + '...'
        return text
    option_text_preview.short_description = 'Nội dung'
    
    def is_correct_badge(self, obj):
        """Hiển thị đúng/sai"""
        if obj.is_correct:
            return format_html('<span style="color: green; font-weight: bold;">✓ Đúng</span>')
        return format_html('<span style="color: #999;">○ Sai</span>')
    is_correct_badge.short_description = 'Trạng thái'


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    """Admin cho Bài nộp Quiz"""
    list_display = [
        'user',
        'quiz',
        'attempt_number',
        'score_display',
        'is_passed_badge',
        'submitted_at',
    ]
    
    list_filter = [
        'status',
        'is_passed',
        'quiz__lesson__subcourse__program',
        'submitted_at',
    ]
    
    search_fields = [
        'user__username',
        'user__email',
        'quiz__title',
    ]
    
    readonly_fields = [
        'quiz',
        'user',
        'score',
        'max_score',
        'percentage',
        'started_at',
        'submitted_at',
    ]
    
    fieldsets = (
        ('Thông tin', {
            'fields': ('quiz', 'user', 'attempt_number', 'status')
        }),
        ('Kết quả', {
            'fields': ('score', 'max_score', 'percentage', 'is_passed')
        }),
        ('Thời gian', {
            'fields': ('started_at', 'submitted_at', 'time_spent_seconds')
        }),
    )
    
    inlines = [QuizAnswerInline]
    
    list_per_page = 50
    ordering = ['-submitted_at']
    date_hierarchy = 'submitted_at'
    
    def score_display(self, obj):
        """Hiển thị điểm số"""
        if obj.score is not None and obj.max_score:
            return format_html(
                '<strong>{}</strong>/{} ({:.0f}%)',
                obj.score,
                obj.max_score,
                obj.percentage or 0
            )
        return '-'
    score_display.short_description = 'Điểm'
    
    def is_passed_badge(self, obj):
        """Hiển thị vượt qua/chưa vượt qua"""
        if obj.is_passed:
            return format_html('<span style="color: green; font-weight: bold;">✓ Đạt</span>')
        return format_html('<span style="color: red;">✗ Chưa đạt</span>')
    is_passed_badge.short_description = 'Kết quả'


@admin.register(QuizAnswer)
class QuizAnswerAdmin(admin.ModelAdmin):
    """Admin cho Câu trả lời"""
    list_display = [
        'quiz_submission',
        'question',
        'answer_preview',
        'is_correct_badge',
        'points_earned',
    ]
    
    list_filter = [
        'is_correct',
        'quiz_submission__quiz__lesson__subcourse__program',
    ]
    
    search_fields = [
        'answer_text',
        'question__question_text',
        'quiz_submission__user__username',
    ]
    
    readonly_fields = [
        'quiz_submission',
        'question',
        'selected_option_ids',
        'answer_text',
        'is_correct',
        'points_earned',
    ]
    
    list_per_page = 100
    ordering = ['quiz_submission', 'question']
    
    def answer_preview(self, obj):
        """Hiển thị câu trả lời"""
        if obj.answer_text:
            text = obj.answer_text
            if len(text) > 40:
                text = text[:37] + '...'
            return text
        elif obj.selected_option_ids:
            return f'Options: {obj.selected_option_ids}'
        return '-'
    answer_preview.short_description = 'Trả lời'
    
    def is_correct_badge(self, obj):
        """Hiển thị đúng/sai"""
        if obj.is_correct:
            return format_html('<span style="color: green; font-weight: bold;">✓ Đúng</span>')
        return format_html('<span style="color: red;">✗ Sai</span>')
    is_correct_badge.short_description = 'Kết quả'


# ============================================================================
# TUỲ CHỈNH ADMIN SITE
# ============================================================================

admin.site.site_header = 'E-Robotic Let\'s Code - Quản trị'
admin.site.site_title = 'Admin Panel'
admin.site.index_title = 'Bảng điều khiển quản trị'
