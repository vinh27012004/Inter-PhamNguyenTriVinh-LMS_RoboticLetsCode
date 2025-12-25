"""
Models cho ứng dụng Content - Quản lý nội dung học tập
Cấu trúc 3 tầng: Program -> Subcourse -> Lesson
Mở rộng: Objectives, Models (media), Preparation, BuildBlocks, 
ContentBlocks, Attachments, Challenges, Quizzes
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator
from django.utils.text import slugify


class Program(models.Model):
    """
    Chương trình học (Cấp độ 1) - Ví dụ: "SPIKE Essential", "SPIKE Prime"
    """
    KIT_TYPE_CHOICES = [
        ('SPIKE_ESSENTIAL', 'SPIKE Essential'),
        ('SPIKE_PRIME', 'SPIKE Prime'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Bản nháp'),
        ('PUBLISHED', 'Đã xuất bản'),
        ('ARCHIVED', 'Đã lưu trữ'),
    ]

    title = models.CharField(
        max_length=255,
        verbose_name='Tên chương trình',
        help_text='Ví dụ: Lập trình SPIKE Essential Cơ bản'
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        verbose_name='Đường dẫn URL',
        help_text='Tự động tạo từ tên chương trình'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả',
        help_text='Mô tả tổng quan về chương trình học'
    )
    kit_type = models.CharField(
        max_length=50,
        choices=KIT_TYPE_CHOICES,
        verbose_name='Loại bộ kit',
        help_text='Chọn loại kit LEGO sử dụng'
    )
    thumbnail_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='Ảnh đại diện',
        help_text='URL ảnh thumbnail từ Object Storage'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        verbose_name='Trạng thái',
        db_index=True
    )
    sort_order = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Thứ tự sắp xếp',
        help_text='Số thứ tự hiển thị (nhỏ hơn = hiển thị trước)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        db_table = 'programs'
        verbose_name = 'Chương trình học'
        verbose_name_plural = 'Chương trình học'
        ordering = ['sort_order', 'title']
        indexes = [
            models.Index(fields=['status', 'sort_order']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_kit_type_display()})"


class Subcourse(models.Model):
    """
    Khóa học con (Cấp độ 2) - Ví dụ: "Module 1: Làm quen với Robot"
    """
    LEVEL_CHOICES = [
        ('BEGINNER', 'Sơ cấp'),
        ('INTERMEDIATE', 'Trung cấp'),
        ('ADVANCED', 'Nâng cao'),
    ]
    
    CODING_LANGUAGE_CHOICES = [
        ('ICON_BLOCKS', 'Icon Blocks'),
        ('WORD_BLOCKS', 'Word Blocks'),
        ('PYTHON', 'Python'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Bản nháp'),
        ('PUBLISHED', 'Đã xuất bản'),
        ('ARCHIVED', 'Đã lưu trữ'),
    ]

    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='subcourses',
        verbose_name='Chương trình học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên khóa con',
        help_text='Ví dụ: Module 1 - Làm quen với Robot'
    )
    slug = models.SlugField(
        max_length=255,
        verbose_name='Đường dẫn URL'
    )
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Tiêu đề phụ'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả',
        help_text='Mô tả chi tiết về khóa học con'
    )
    objective = models.TextField(
        blank=True,
        verbose_name='Mục tiêu',
        help_text='Mục tiêu học tập - những gì học viên sẽ đạt được'
    )
    coding_language = models.CharField(
        max_length=50,
        choices=CODING_LANGUAGE_CHOICES,
        verbose_name='Ngôn ngữ lập trình',
        help_text='Chọn ngôn ngữ lập trình sử dụng'
    )
    thumbnail_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='Ảnh đại diện'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        verbose_name='Trạng thái',
        db_index=True
    )
    sort_order = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Thứ tự sắp xếp'
    )
    
    # Thông tin khóa học
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='BEGINNER',
        verbose_name='Cấp độ',
        help_text='Sơ cấp, Trung cấp, hoặc Nâng cao'
    )
    level_number = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name='Level',
        help_text='Level 1, Level 2, Level 3, ...'
    )
    session_count = models.IntegerField(
        default=20,
        validators=[MinValueValidator(1)],
        verbose_name='Số lượng buổi học',
        help_text='Tổng số buổi học trong khóa học này'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        db_table = 'subcourses'
        verbose_name = 'Khóa học con'
        verbose_name_plural = 'Khóa học con'
        ordering = ['program', 'sort_order', 'title']
        unique_together = [['program', 'slug']]
        indexes = [
            models.Index(fields=['program', 'status', 'sort_order']),
        ]

    def __str__(self):
        return f"{self.program.title} > {self.title}"


class Lesson(models.Model):
    """
    Bài học (Cấp độ 3) - Ví dụ: "Bài 1: Xây dựng robot đầu tiên"
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Bản nháp'),
        ('PUBLISHED', 'Đã xuất bản'),
        ('ARCHIVED', 'Đã lưu trữ'),
    ]
    subcourse = models.ForeignKey(
        Subcourse,
        on_delete=models.CASCADE,
        related_name='lessons',
        verbose_name='Khóa học con'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên bài học',
        help_text='Ví dụ: Bài 1 - Xây dựng robot đầu tiên'
    )
    slug = models.SlugField(
        max_length=255,
        verbose_name='Đường dẫn URL'
    )
    
    # Nội dung bài học
    objective = models.TextField(
        blank=True,
        verbose_name='Mục tiêu bài học',
        help_text='Học viên sẽ đạt được gì sau bài học này?'
    )
    knowledge_skills = models.TextField(
        blank=True,
        verbose_name='Kiến thức & Kỹ năng',
        help_text='Các kiến thức và kỹ năng học được trong bài học'
    )
    content_text = models.TextField(
        blank=True,
        verbose_name='Nội dung bài học',
        help_text='Nội dung text/HTML của bài học'
    )
    
    # Media URLs (Lưu trên Object Storage)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        verbose_name='Trạng thái',
        db_index=True
    )
    sort_order = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Thứ tự sắp xếp'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        db_table = 'lessons'
        verbose_name = 'Bài học'
        verbose_name_plural = 'Bài học'
        ordering = ['subcourse', 'sort_order', 'title']
        unique_together = [['subcourse', 'slug']]
        indexes = [
            models.Index(fields=['subcourse', 'status', 'sort_order']),
        ]

    def __str__(self):
        return f"{self.subcourse.title} > {self.title}"


class UserProgress(models.Model):
    """
    Tiến độ học tập của học viên
    """
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='learning_progress',
        verbose_name='Học viên'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='user_progresses',
        verbose_name='Bài học'
    )
    
    is_completed = models.BooleanField(
        default=False,
        verbose_name='Đã hoàn thành',
        db_index=True
    )
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Thời gian hoàn thành'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày bắt đầu')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        db_table = 'user_progress'
        verbose_name = 'Tiến độ học tập'
        verbose_name_plural = 'Tiến độ học tập'
        unique_together = [['user', 'lesson']]
        indexes = [
            models.Index(fields=['user', 'is_completed']),
        ]

    def __str__(self):
        status = "✓" if self.is_completed else "○"
        return f"{status} {self.user.username} - {self.lesson.title}"


# ============================================================================
# EXPANDED LESSON CONTENT MODELS
# ============================================================================

class Media(models.Model):
    """
    Mô hình lưu trữ Media (Ảnh/Video/File)
    Có thể dùng chung cho nhiều block trong một bài học
    Được tối ưu hóa cho Object Storage (S3/MinIO)
    """
    MEDIA_TYPE_CHOICES = [
        ('image', 'Hình ảnh (JPG/PNG)'),
        ('video', 'Video (MP4/WebM)'),
        ('pdf', 'PDF Document'),
        ('animation', '3D Animation/GIF'),
        ('file', 'File khác'),
    ]
    
    url = models.URLField(
        max_length=500,
        verbose_name='URL Media'
    )
    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        verbose_name='Loại Media',
        db_index=True
    )
    caption = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Chú thích',
        help_text='Chú thích hoặc mô tả ngắn của media'
    )
    alt_text = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Alt Text',
        help_text='Văn bản thay thế cho hình ảnh (SEO & A11y)'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự hiển thị',
        help_text='Sắp xếp media theo thứ tự (0 = không có thứ tự cố định)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'media'
        verbose_name = 'Media'
        verbose_name_plural = 'Media'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['media_type', 'order']),
        ]
    
    def __str__(self):
        return f"{self.get_media_type_display()} - {self.caption or self.url[:50]}"


class LessonObjective(models.Model):
    """
    Mục tiêu bài học theo 4 lĩnh vực (Knowledge, Thinking, Skills, Attitude)
    Theo chuẩn Bloom's taxonomy
    """
    OBJECTIVE_TYPE_CHOICES = [
        ('knowledge', 'Kiến thức (Knowledge)'),
        ('thinking', 'Tư duy (Thinking)'),
        ('skills', 'Kỹ năng (Skills)'),
        ('attitude', 'Thái độ (Attitude)'),
    ]
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='objectives',
        verbose_name='Bài học'
    )
    objective_type = models.CharField(
        max_length=20,
        choices=OBJECTIVE_TYPE_CHOICES,
        verbose_name='Loại mục tiêu',
        db_index=True
    )
    text = models.TextField(
        verbose_name='Mô tả mục tiêu',
        help_text='Mô tả chi tiết mục tiêu học tập'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'lesson_objectives'
        verbose_name = 'Mục tiêu bài học'
        verbose_name_plural = 'Mục tiêu bài học'
        ordering = ['lesson', 'objective_type', 'order']
        unique_together = [['lesson', 'objective_type', 'order']]
        indexes = [
            models.Index(fields=['lesson', 'objective_type']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} - {self.get_objective_type_display()}: {self.text[:50]}"


class LessonModel(models.Model):
    """
    Mô hình/Demo cho bài học
    Gồm tiêu đề, mô tả và các media liên quan (ảnh/video)
    """
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='models',
        verbose_name='Bài học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên mô hình'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả mô hình'
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='lesson_models',
        verbose_name='Media liên quan'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự hiển thị'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'lesson_models'
        verbose_name = 'Mô hình bài học'
        verbose_name_plural = 'Mô hình bài học'
        ordering = ['lesson', 'order']
        indexes = [
            models.Index(fields=['lesson', 'order']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class AssemblyGuide(models.Model):
    """
    Hướng dẫn lắp ráp (Assembly Instructions)
    Liên kết với Lesson, gồm tiêu đề, mô tả, PDF URL (optional) và nhiều ảnh/media
    Thừa kế Media để hiển thị các bước lắp ráp chi tiết
    """
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='assembly_guides',
        verbose_name='Bài học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên hướng dẫn lắp ráp'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả'
    )
    pdf_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='Link PDF',
        help_text='Link PDF hướng dẫn lắp ráp (optional)'
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='assembly_guides',
        verbose_name='Ảnh/Media hướng dẫn'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'assembly_guides'
        verbose_name = 'Hướng dẫn lắp ráp'
        verbose_name_plural = 'Hướng dẫn lắp ráp'
        ordering = ['lesson', 'id']
        indexes = [
            models.Index(fields=['lesson']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class Preparation(models.Model):
    """
    Chuẩn bị cho bài học
    Liên kết với nhiều BuildBlocks để hiển thị các khối chuẩn bị (png, pdf)
    """
    lesson = models.OneToOneField(
        Lesson,
        on_delete=models.CASCADE,
        related_name='preparation',
        verbose_name='Bài học',
        help_text='Mỗi bài học chỉ có một phần chuẩn bị'
    )
    build_blocks = models.ManyToManyField(
        'BuildBlock',
        blank=True,
        through='PreparationBuildBlock',
        through_fields=('preparation', 'build_block'),
        related_name='used_in_preparations',
        verbose_name='Các khối xây dựng chuẩn bị',
        help_text='Chọn các build blocks cần hiển thị trong phần chuẩn bị'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'preparations'
        verbose_name = 'Chuẩn bị bài học'
        verbose_name_plural = 'Chuẩn bị bài học'
        ordering = ['lesson']
    
    def __str__(self):
        return f"Chuẩn bị - {self.lesson.title}"


class BuildBlock(models.Model):
    """
    Khối xây dựng (Build Instructions)
    Có thể là PDF hoặc tập hợp các ảnh slide
    Liên kết với Program (Chương trình học) để dùng chung cho tất cả lessons
    """
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='build_blocks',
        verbose_name='Chương trình học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên khối xây dựng'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả'
    )
    pdf_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='Link ảnh  ',
        help_text='Link PDF hoặc PNG'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'build_blocks'
        verbose_name = 'Khối xây dựng'
        verbose_name_plural = 'Khối xây dựng'
        ordering = ['program', 'order']
        indexes = [
            models.Index(fields=['program', 'order']),
        ]
    
    def __str__(self):
        return f"{self.program.title} - Build Block: {self.title}"


class PreparationBuildBlock(models.Model):
    """Bảng trung gian giữa Preparation và BuildBlock kèm số lượng."""
    preparation = models.ForeignKey(
        Preparation,
        on_delete=models.CASCADE,
        db_column='preparation_id',
        related_name='preparation_build_blocks',
        verbose_name='Chuẩn bị'
    )
    build_block = models.ForeignKey(
        BuildBlock,
        on_delete=models.CASCADE,
        db_column='buildblock_id',
        related_name='preparation_build_blocks',
        verbose_name='Khối xây dựng'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        verbose_name='Số lượng cần chuẩn bị',
        help_text='Số lượng khối cần chuẩn bị cho bài học'
    )

    class Meta:
        db_table = 'preparations_build_blocks'
        verbose_name = 'Khối chuẩn bị'
        verbose_name_plural = 'Khối chuẩn bị'
        unique_together = ('preparation', 'build_block')
        ordering = ['preparation', 'build_block__order', 'id']
        indexes = [
            models.Index(fields=['preparation']),
            models.Index(fields=['build_block']),
        ]

    def __str__(self):
        return f"{self.preparation} - {self.build_block} (x{self.quantity})"


class LessonContentBlock(models.Model):
    """
    Khối nội dung học tập chính
    Có thể chứa: text, video, ảnh, ví dụ, hướng dẫn sử dụng, v.v.
    """
    CONTENT_TYPE_CHOICES = [
        ('text', 'Văn bản'),
        ('text_media', 'Văn bản + Media'),
        ('video', 'Video'),
        ('example', 'Ví dụ code/bài tập'),
        ('tips', 'Mẹo vặt'),
        ('summary', 'Tóm tắt'),
    ]
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='content_blocks',
        verbose_name='Bài học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tiêu đề khối nội dung'
    )
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Tiêu đề phụ'
    )
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        default='text_media',
        verbose_name='Loại nội dung'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả/Giải thích chính'
    )
    usage_text = models.TextField(
        blank=True,
        verbose_name='Hướng dẫn sử dụng',
        help_text='Cách sử dụng / cách áp dụng nội dung này'
    )
    example_text = models.TextField(
        blank=True,
        verbose_name='Ví dụ minh họa',
        help_text='Code, công thức hoặc ví dụ cụ thể'
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='content_blocks',
        verbose_name='Media (Ảnh/Video)'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự hiển thị'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'lesson_content_blocks'
        verbose_name = 'Khối nội dung'
        verbose_name_plural = 'Khối nội dung'
        ordering = ['lesson', 'order']
        indexes = [
            models.Index(fields=['lesson', 'order']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} > {self.title}"


class LessonAttachment(models.Model):
    """
    Tệp đính kèm (File, Code, Document)
    Có thể tải xuống hoặc xem trực tiếp
    """
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attachments')
    name = models.CharField(max_length=255, verbose_name='Tên file')
    file = models.FileField(upload_to='lessons/attachments/', verbose_name='File')
    file_type = models.CharField(
        max_length=20,  # ⭐ Tăng từ 10 lên 20 để fit 'video' (5), 'image' (5), 'other' (5)
        choices=[
            ('pdf', 'PDF'),
            ('image', 'Ảnh'),
            ('video', 'Video'),
            ('code', 'Code'),
            ('other', 'Khác'),
        ],
        verbose_name='Loại file'
    )
    file_size_kb = models.IntegerField(default=0, verbose_name='Kích thước (KB)')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    order = models.IntegerField(default=0, verbose_name='Thứ tự')
    
    class Meta:
        verbose_name = 'Tệp đính kèm'
        verbose_name_plural = 'Tệp đính kèm'
        ordering = ['order']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size_kb = self.file.size // 1024
        super().save(*args, **kwargs)


class Challenge(models.Model):
    """
    Thử thách/Bài tập cho bài học
    Bao gồm: mô tả, hướng dẫn, yêu cầu, media
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Dễ'),
        ('medium', 'Trung bình'),
        ('hard', 'Khó'),
        ('expert', 'Chuyên gia'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('published', 'Đã xuất bản'),
        ('archived', 'Đã lưu trữ'),
    ]
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='challenges',
        verbose_name='Bài học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên thử thách'
    )
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Tiêu đề phụ'
    )
    description = models.TextField(
        verbose_name='Mô tả chi tiết',
        help_text='Mô tả bài tập/thử thách'
    )
    instructions = models.TextField(
        verbose_name='Hướng dẫn',
        help_text='Các bước thực hiện chi tiết'
    )
    expected_output = models.TextField(
        blank=True,
        verbose_name='Kết quả mong đợi',
        help_text='Kết quả robot/chương trình nên đạt được'
    )
    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='medium',
        verbose_name='Độ khó',
        db_index=True
    )
    points = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name='Điểm thưởng',
        help_text='Điểm tối đa khi hoàn thành'
    )
    time_limit_minutes = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
        verbose_name='Giới hạn thời gian (phút)',
        help_text='Thời gian tối đa để hoàn thành (optional)'
    )
    media = models.ManyToManyField(
        Media,
        blank=True,
        related_name='challenges',
        verbose_name='Media (Ảnh/Video hướng dẫn)'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Trạng thái'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'challenges'
        verbose_name = 'Thử thách'
        verbose_name_plural = 'Thử thách'
        ordering = ['lesson', 'order']
        indexes = [
            models.Index(fields=['lesson', 'difficulty', 'status']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title} ({self.get_difficulty_display()})"


class Quiz(models.Model):
    """
    Bài kiểm tra/Quiz
    Có thể chứa nhiều câu hỏi với các loại khác nhau
    """
    QUIZ_TYPE_CHOICES = [
        ('single', 'Một lựa chọn'),
        ('multiple', 'Nhiều lựa chọn'),
        ('open', 'Câu hỏi mở'),
        ('mixed', 'Hỗn hợp'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('published', 'Đã xuất bản'),
        ('archived', 'Đã lưu trữ'),
    ]
    
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='quizzes',
        verbose_name='Bài học'
    )
    title = models.CharField(
        max_length=255,
        verbose_name='Tên quiz/bài kiểm tra'
    )
    description = models.TextField(
        blank=True,
        verbose_name='Mô tả quiz'
    )
    quiz_type = models.CharField(
        max_length=20,
        choices=QUIZ_TYPE_CHOICES,
        default='mixed',
        verbose_name='Loại quiz'
    )
    passing_score = models.IntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Điểm vượt qua (%)',
        help_text='Điểm phần trăm tối thiểu để vượt qua'
    )
    max_attempts = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1)],
        verbose_name='Số lần làm bài tối đa',
        help_text='Số lần học viên được phép làm quiz'
    )
    time_limit_minutes = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
        verbose_name='Giới hạn thời gian (phút)',
        help_text='Thời gian tối đa để hoàn thành (optional)'
    )
    shuffle_questions = models.BooleanField(
        default=True,
        verbose_name='Xáo trộn câu hỏi'
    )
    shuffle_options = models.BooleanField(
        default=True,
        verbose_name='Xáo trộn lựa chọn'
    )
    show_correct_answer = models.BooleanField(
        default=True,
        verbose_name='Hiển thị đáp án đúng'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name='Trạng thái'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    
    class Meta:
        db_table = 'quizzes'
        verbose_name = 'Bài kiểm tra'
        verbose_name_plural = 'Bài kiểm tra'
        ordering = ['lesson', 'order']
        indexes = [
            models.Index(fields=['lesson', 'status']),
        ]
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class QuizQuestion(models.Model):
    """
    Câu hỏi trong quiz
    Hỗ trợ 3 loại: single choice, multiple choice, open answer
    """
    QUESTION_TYPE_CHOICES = [
        ('single', 'Một lựa chọn'),
        ('multiple', 'Nhiều lựa chọn'),
        ('open', 'Câu hỏi mở'),
    ]
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Quiz'
    )
    question_text = models.TextField(
        verbose_name='Nội dung câu hỏi'
    )
    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        default='single',
        verbose_name='Loại câu hỏi'
    )
    explanation = models.TextField(
        blank=True,
        verbose_name='Giải thích',
        help_text='Giải thích đáp án sau khi nộp bài'
    )
    points = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name='Điểm số'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự câu hỏi'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'quiz_questions'
        verbose_name = 'Câu hỏi quiz'
        verbose_name_plural = 'Câu hỏi quiz'
        ordering = ['quiz', 'order']
        indexes = [
            models.Index(fields=['quiz', 'question_type']),
        ]
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class QuestionOption(models.Model):
    """
    Lựa chọn cho câu hỏi (chỉ dùng cho Single/Multiple choice)
    """
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name='options',
        verbose_name='Câu hỏi'
    )
    option_text = models.TextField(
        verbose_name='Nội dung lựa chọn'
    )
    is_correct = models.BooleanField(
        default=False,
        verbose_name='Là đáp án đúng',
        db_index=True
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Thứ tự'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'question_options'
        verbose_name = 'Lựa chọn câu hỏi'
        verbose_name_plural = 'Lựa chọn câu hỏi'
        ordering = ['question', 'order']
        indexes = [
            models.Index(fields=['question', 'is_correct']),
        ]
    
    def __str__(self):
        return f"{self.question.quiz.title} - Option {self.order}"


class QuizSubmission(models.Model):
    """
    Bài nộp quiz từ học viên
    Lưu trữ thời gian, điểm số, trạng thái
    """
    STATUS_CHOICES = [
        ('in_progress', 'Đang làm'),
        ('submitted', 'Đã nộp'),
        ('graded', 'Đã chấm'),
    ]
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='Quiz'
    )
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='quiz_submissions',
        verbose_name='Học viên'
    )
    score = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
        verbose_name='Điểm số',
        help_text='Điểm nhận được (nếu đã chấm)'
    )
    max_score = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
        verbose_name='Điểm tối đa',
        help_text='Tổng điểm tối đa của quiz'
    )
    percentage = models.FloatField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Phần trăm (%)'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress',
        verbose_name='Trạng thái'
    )
    is_passed = models.BooleanField(
        default=False,
        verbose_name='Đã vượt qua',
        db_index=True
    )
    attempt_number = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Lần thứ'
    )
    started_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Thời gian bắt đầu'
    )
    submitted_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Thời gian nộp'
    )
    time_spent_seconds = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0)],
        verbose_name='Thời gian làm (giây)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'quiz_submissions'
        verbose_name = 'Bài nộp quiz'
        verbose_name_plural = 'Bài nộp quiz'
        unique_together = [['quiz', 'user', 'attempt_number']]
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['quiz', 'user']),
            models.Index(fields=['user', 'is_passed']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} (Lần {self.attempt_number})"


class QuizAnswer(models.Model):
    """
    Câu trả lời của học viên cho từng câu hỏi
    Lưu trữ câu trả lời và kết quả (đúng/sai)
    """
    quiz_submission = models.ForeignKey(
        QuizSubmission,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Bài nộp quiz'
    )
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Câu hỏi'
    )
    # Cho multiple choice: lưu IDs các option được chọn (JSON)
    selected_option_ids = models.JSONField(
        default=list,
        blank=True,
        verbose_name='IDs lựa chọn được chọn',
        help_text='[1, 2, 3] cho multiple choice'
    )
    # Cho open answer: lưu text trả lời
    answer_text = models.TextField(
        blank=True,
        verbose_name='Trả lời mở',
        help_text='Câu trả lời dạng text cho câu hỏi mở'
    )
    is_correct = models.BooleanField(
        default=False,
        verbose_name='Câu trả lời đúng',
        db_index=True
    )
    points_earned = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Điểm nhận được'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'quiz_answers'
        verbose_name = 'Câu trả lời'
        verbose_name_plural = 'Câu trả lời'
        unique_together = [['quiz_submission', 'question']]
        indexes = [
            models.Index(fields=['quiz_submission', 'is_correct']),
        ]
    
    def __str__(self):
        return f"{self.quiz_submission.user.username} - Q{self.question.order}"
