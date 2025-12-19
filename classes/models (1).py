"""
Models cho Classes App - Quản lý lớp học
"""
from django.db import models
from django.contrib.auth.models import User
from content.models import Program, Subcourse


class Class(models.Model):
    """
    Lớp học - một khóa học (Program) có thể có nhiều lớp
    """
    STATUS_CHOICES = [
        ('UPCOMING', 'Sắp khai giảng'),
        ('ACTIVE', 'Đang hoạt động'),
        ('COMPLETED', 'Đã kết thúc'),
        ('CANCELLED', 'Đã hủy'),
    ]
    
    name = models.CharField(max_length=255, verbose_name='Tên lớp')
    code = models.CharField(max_length=50, unique=True, verbose_name='Mã lớp')
    program = models.ForeignKey(
        Program,
        on_delete=models.CASCADE,
        related_name='classes',
        verbose_name='Khóa học'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='UPCOMING',
        verbose_name='Trạng thái'
    )
    
    start_date = models.DateField(verbose_name='Ngày khai giảng')
    end_date = models.DateField(null=True, blank=True, verbose_name='Ngày kết thúc')
    
    max_students = models.IntegerField(
        default=30,
        verbose_name='Số học viên tối đa'
    )
    
    description = models.TextField(blank=True, verbose_name='Mô tả')
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_classes',
        verbose_name='Người tạo'
    )
    
    class Meta:
        verbose_name = 'Lớp học'
        verbose_name_plural = 'Lớp học'
        ordering = ['-start_date', 'name']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['program', 'status']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def current_enrollment_count(self):
        """Số học viên hiện tại"""
        return self.enrollments.filter(status='ACTIVE').count()
    
    @property
    def is_full(self):
        """Lớp đã đầy chưa"""
        return self.current_enrollment_count >= self.max_students


class ClassTeacher(models.Model):
    """
    Gán giáo viên vào lớp - một lớp có thể có nhiều giáo viên
    """
    ROLE_CHOICES = [
        ('LEAD', 'Giáo viên chính'),
        ('ASSISTANT', 'Trợ giảng'),
    ]
    
    class_obj = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='teachers',
        verbose_name='Lớp học'
    )
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teaching_classes',
        verbose_name='Giáo viên'
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='LEAD',
        verbose_name='Vai trò'
    )
    
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày phân công')
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_teachers',
        verbose_name='Người phân công'
    )
    
    class Meta:
        verbose_name = 'Giáo viên lớp'
        verbose_name_plural = 'Giáo viên lớp'
        unique_together = ['class_obj', 'teacher']
        ordering = ['class_obj', '-role']
    
    def __str__(self):
        return f"{self.teacher.username} - {self.class_obj.code} ({self.get_role_display()})"


class ClassEnrollment(models.Model):
    """
    Ghi danh học viên vào lớp
    """
    STATUS_CHOICES = [
        ('PENDING', 'Chờ xác nhận'),
        ('ACTIVE', 'Đang học'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('DROPPED', 'Đã bỏ học'),
        ('EXPELLED', 'Bị đuổi'),
    ]
    
    class_obj = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='Lớp học'
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='class_enrollments',
        verbose_name='Học viên'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name='Trạng thái'
    )
    
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày ghi danh')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Ngày hoàn thành')
    
    enrolled_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrolled_students',
        verbose_name='Người ghi danh'
    )
    
    notes = models.TextField(blank=True, verbose_name='Ghi chú')
    
    class Meta:
        verbose_name = 'Ghi danh lớp'
        verbose_name_plural = 'Ghi danh lớp'
        unique_together = ['class_obj', 'student']
        ordering = ['class_obj', 'enrolled_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['class_obj', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.username} - {self.class_obj.code}"


class UserProgress(models.Model):
    """
    Tiến độ học tập của học viên trong từng Subcourse
    """
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Chưa bắt đầu'),
        ('IN_PROGRESS', 'Đang học'),
        ('COMPLETED', 'Đã hoàn thành'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='progress',
        verbose_name='Học viên'
    )
    subcourse = models.ForeignKey(
        Subcourse,
        on_delete=models.CASCADE,
        related_name='student_progress',
        verbose_name='Khóa học con'
    )
    class_enrollment = models.ForeignKey(
        ClassEnrollment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='progress_records',
        verbose_name='Ghi danh lớp'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NOT_STARTED',
        verbose_name='Trạng thái'
    )
    
    # Tiến độ
    lessons_completed = models.IntegerField(default=0, verbose_name='Số bài đã hoàn thành')
    total_lessons = models.IntegerField(default=0, verbose_name='Tổng số bài')
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name='Phần trăm hoàn thành'
    )
    
    # Thời gian
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Ngày bắt đầu')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Ngày hoàn thành')
    last_activity_at = models.DateTimeField(null=True, blank=True, verbose_name='Hoạt động gần nhất')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Tiến độ học tập'
        verbose_name_plural = 'Tiến độ học tập'
        unique_together = ['student', 'subcourse', 'class_enrollment']
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['subcourse', 'status']),
            models.Index(fields=['class_enrollment', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.username} - {self.subcourse.title} ({self.completion_percentage}%)"
    
    def update_progress(self):
        """Cập nhật phần trăm hoàn thành"""
        if self.total_lessons > 0:
            self.completion_percentage = (self.lessons_completed / self.total_lessons) * 100
        else:
            self.completion_percentage = 0
        self.save()
