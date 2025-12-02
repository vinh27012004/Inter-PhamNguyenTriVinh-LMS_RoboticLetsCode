"""
Models cho ứng dụng Content - Quản lý nội dung học tập
Cấu trúc 3 tầng: Program -> Subcourse -> Lesson
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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
    
    # Pricing (optional)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Giá khóa học (VNĐ)',
        help_text='Để 0 nếu miễn phí'
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
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Tiêu đề phụ'
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
        help_text='Kiến thức và kỹ năng cần đạt được'
    )
    content_text = models.TextField(
        blank=True,
        verbose_name='Nội dung bài học',
        help_text='Nội dung text/HTML của bài học'
    )
    
    # Media URLs (Lưu trên Object Storage)
    video_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='URL Video',
        help_text='Link video hướng dẫn từ S3/GCS'
    )
    project_file_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='URL File dự án',
        help_text='Link file .llsp hoặc .py từ S3/GCS'
    )
    
    # Code snippet
    code_snippet = models.TextField(
        blank=True,
        verbose_name='Code mẫu',
        help_text='Code mẫu để học viên tham khảo'
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
    
    # Thời lượng ước tính
    estimated_duration = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(1)],
        verbose_name='Thời lượng (phút)',
        help_text='Thời gian ước tính để hoàn thành bài học'
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
