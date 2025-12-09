"""
Models cho ứng dụng User Auth - Quản lý phân quyền RBAC
Bao gồm: UserProfile và Auth_Assignment
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils import timezone


class UserProfile(models.Model):
    """
    Hồ sơ người dùng và vai trò trong hệ thống
    """
    ROLE_CHOICES = [
        ('STUDENT', 'Học viên'),
        ('TEACHER', 'Giáo viên'),
        ('ADMIN', 'Giáo vụ/Quản trị viên'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='Tài khoản'
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='STUDENT',
        verbose_name='Vai trò',
        db_index=True,
        help_text='Vai trò của người dùng trong hệ thống'
    )
    
    # Thông tin bổ sung
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Số điện thoại'
    )
    avatar_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name='Ảnh đại diện'
    )
    bio = models.TextField(
        blank=True,
        verbose_name='Giới thiệu bản thân'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        db_table = 'user_profile'
        verbose_name = 'Hồ sơ người dùng'
        verbose_name_plural = 'Hồ sơ người dùng'
        ordering = ['role', 'user__username']

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


class AuthAssignment(models.Model):
    """
    Gán quyền truy cập cho User ở cấp Program hoặc Subcourse
    Logic: Quyền được gán ở Program HOẶC Subcourse (không cần cả hai)
    """
    ASSIGNMENT_STATUS_CHOICES = [
        ('ACTIVE', 'Đang hoạt động'),
        ('EXPIRED', 'Đã hết hạn'),
        ('REVOKED', 'Đã thu hồi'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='auth_assignments',
        verbose_name='Người dùng'
    )
    
    # Gán quyền ở cấp Program (Optional)
    program = models.ForeignKey(
        'content.Program',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='auth_assignments',
        verbose_name='Chương trình học',
        help_text='Gán quyền cho toàn bộ chương trình'
    )
    
    # Gán quyền ở cấp Subcourse (Optional)
    subcourse = models.ForeignKey(
        'content.Subcourse',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='auth_assignments',
        verbose_name='Khóa học con',
        help_text='Gán quyền cho khóa học cụ thể'
    )
    
    # Thông tin phân quyền
    status = models.CharField(
        max_length=20,
        choices=ASSIGNMENT_STATUS_CHOICES,
        default='ACTIVE',
        verbose_name='Trạng thái',
        db_index=True
    )
    # Thời gian hiệu lực
    valid_from = models.DateTimeField(
        default=timezone.now,
        verbose_name='Có hiệu lực từ'
    )
    valid_until = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='Có hiệu lực đến',
        help_text='Để trống nếu không giới hạn thời gian'
    )
    
    # Metadata
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='assignments_made',
        verbose_name='Được gán bởi',
        help_text='Admin/Teacher đã tạo phân quyền này'
    )
    notes = models.TextField(
        blank=True,
        verbose_name='Ghi chú',
        help_text='Ghi chú về việc phân quyền'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        db_table = 'auth_assignment'
        verbose_name = 'Phân quyền truy cập'
        verbose_name_plural = 'Phân quyền truy cập'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['program', 'status']),
            models.Index(fields=['subcourse', 'status']),
        ]
        # Đảm bảo một user chỉ có 1 phân quyền active cho mỗi Program/Subcourse
        constraints = [
            models.CheckConstraint(
                check=models.Q(program__isnull=False) | models.Q(subcourse__isnull=False),
                name='auth_assignment_requires_program_or_subcourse'
            ),
        ]

    def __str__(self):
        target = self.program.title if self.program else self.subcourse.title
        return f"{self.user.username} → {target} [{self.get_status_display()}]"
    
    def is_valid(self):
        """Kiểm tra phân quyền còn hiệu lực hay không"""
        if self.status != 'ACTIVE':
            return False
        now = timezone.now()
        if self.valid_until and now > self.valid_until:
            return False
        return True
    
    def save(self, *args, **kwargs):
        """Tự động cập nhật trạng thái nếu hết hạn"""
        if self.valid_until and timezone.now() > self.valid_until:
            self.status = 'EXPIRED'
        super().save(*args, **kwargs)
