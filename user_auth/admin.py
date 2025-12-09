"""
Admin Panel cho ứng dụng User Auth
Quản lý: UserProfile (tích hợp vào User) và AuthAssignment (Phân quyền RBAC)
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone

from .models import UserProfile, AuthAssignment


# ============================================================================
# INLINE CLASSES
# ============================================================================

class UserProfileInline(admin.StackedInline):
    """
    Inline để tích hợp UserProfile vào User Admin
    Hiển thị role và thông tin bổ sung ngay trong form User
    """
    model = UserProfile
    can_delete = False
    verbose_name = 'Hồ sơ & Vai trò'
    verbose_name_plural = 'Hồ sơ & Vai trò'
    
    fields = [
        'role',
        'phone',
        'avatar_url',
        'bio',
    ]
    
    # Hiển thị role nổi bật
    classes = ['wide']


# ============================================================================
# CUSTOM USER ADMIN - Tích hợp UserProfile
# ============================================================================

class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin với UserProfile được tích hợp inline
    KHÔNG hiển thị UserProfile riêng lẻ trong menu
    """
    # Tích hợp UserProfile inline
    inlines = [UserProfileInline]
    
    # List display
    list_display = [
        'username',
        'email',
        'full_name',
        'role_badge',
        'is_active',
        'is_staff',
        'date_joined',
    ]
    
    # Filters bên phải
    list_filter = [
        'is_active',
        'is_staff',
        'is_superuser',
        'profile__role',  # Lọc theo vai trò
        'date_joined',
    ]
    
    # Search
    search_fields = [
        'username',
        'email',
        'first_name',
        'last_name',
    ]
    
    # Custom methods
    def full_name(self, obj):
        """Hiển thị họ tên đầy đủ"""
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full if full else "—"
    full_name.short_description = 'Họ tên'
    
    def role_badge(self, obj):
        """Hiển thị vai trò với badge màu sắc"""
        try:
            profile = obj.profile
            colors = {
                'STUDENT': '#007BFF',   # Xanh dương
                'TEACHER': '#FFC107',   # Vàng
                'ADMIN': '#DC3545',     # Đỏ
            }
            color = colors.get(profile.role, '#6C757D')
            return format_html(
                '<span style="background-color: {}; color: white; '
                'padding: 4px 10px; border-radius: 4px; font-size: 11px; '
                'font-weight: bold;">{}</span>',
                color,
                profile.get_role_display()
            )
        except UserProfile.DoesNotExist:
            return format_html(
                '<span style="color: #999; font-style: italic;">Chưa có profile</span>'
            )
    role_badge.short_description = 'Vai trò'


# Unregister User mặc định và register lại với custom admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ============================================================================
# KHÔNG ĐĂNG KÝ UserProfile riêng lẻ
# ============================================================================
# UserProfile đã được tích hợp vào User Admin thông qua Inline
# Không cần hiển thị nó như một mục menu riêng


# ============================================================================
# AUTH ASSIGNMENT ADMIN - Quản lý Phân quyền
# ============================================================================

@admin.register(AuthAssignment)
class AuthAssignmentAdmin(admin.ModelAdmin):
    """
    Admin cho AuthAssignment - Quản lý phân quyền truy cập
    Giáo vụ dùng để gán quyền cho Giáo viên/Học viên
    """
    
    # ========================================
    # List Display
    # ========================================
    list_display = [
        'user',
        'user_role',  # Vai trò của user
        'target_content',  # Program hoặc Subcourse
        'status_badge',
        'validity_period',  # Thời gian hiệu lực
        'created_at',
    ]
    
    # ========================================
    # Filters (Bộ lọc bên phải)
    # ========================================
    list_filter = [
        'status',  # Lọc theo trạng thái
        'program',  # Lọc theo chương trình
        'subcourse',  # Lọc theo khóa con
        'user__profile__role',  # Lọc theo vai trò user (GV/HS)
        'created_at',
        'valid_from',
        'valid_until',
    ]
    
    # ========================================
    # Search
    # ========================================
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'program__title',
        'subcourse__title',
    ]
    
    # ========================================
    # Fieldsets (Gom nhóm trong trang chi tiết)
    # ========================================
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': (
                'user',
                'program',
                'subcourse',
            ),
            'description': '⚠️ Chọn Program HOẶC Subcourse (không cần cả hai)'
        }),
        ('Trạng thái & Thời gian', {
            'fields': (
                'status',
                'valid_from',
                'valid_until',
            ),
        }),
        ('Thông tin bổ sung', {
            'fields': (
                'assigned_by',
                'notes',
            ),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )
    
    # ========================================
    # Readonly fields
    # ========================================
    readonly_fields = ['created_at', 'updated_at']
    
    # ========================================
    # Other settings
    # ========================================
    date_hierarchy = 'created_at'
    list_per_page = 50
    ordering = ['-created_at']
    
    # ========================================
    # Admin Actions
    # ========================================
    actions = ['activate_assignments', 'revoke_assignments', 'check_expired']
    
    # ========================================
    # Custom Display Methods
    # ========================================
    
    def user_role(self, obj):
        """Hiển thị vai trò của user được gán quyền"""
        try:
            profile = obj.user.profile
            colors = {
                'STUDENT': '#007BFF',
                'TEACHER': '#FFC107',
                'ADMIN': '#DC3545',
            }
            color = colors.get(profile.role, '#6C757D')
            return format_html(
                '<span style="background-color: {}; color: white; '
                'padding: 3px 8px; border-radius: 3px; font-size: 10px;">{}</span>',
                color,
                profile.get_role_display()
            )
        except:
            return "—"
    user_role.short_description = 'Vai trò'
    
    def target_content(self, obj):
        """Hiển thị nội dung được gán quyền (Program hoặc Subcourse)"""
        if obj.program:
            url = reverse('admin:content_program_change', args=[obj.program.id])
            return format_html(
                '📚 Program: <a href="{}" style="font-weight: bold;">{}</a>',
                url,
                obj.program.title
            )
        elif obj.subcourse:
            url = reverse('admin:content_subcourse_change', args=[obj.subcourse.id])
            return format_html(
                '📖 Subcourse: <a href="{}" style="font-weight: bold;">{}</a>',
                url,
                obj.subcourse.title
            )
        return format_html('<span style="color: #999;">Chưa gán</span>')
    target_content.short_description = 'Nội dung được gán'
    
    def status_badge(self, obj):
        """Hiển thị trạng thái với badge màu sắc"""
        colors = {
            'ACTIVE': '#28A745',     # Xanh lá
            'EXPIRED': '#FFC107',    # Vàng
            'REVOKED': '#DC3545',    # Đỏ
        }
        color = colors.get(obj.status, '#6C757D')
        return format_html(
            '<span style="background-color: {}; color: white; '
            'padding: 4px 10px; border-radius: 4px; font-size: 11px; '
            'font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Trạng thái'
    
    def validity_period(self, obj):
        """Hiển thị khoảng thời gian hiệu lực"""
        valid_from = obj.valid_from.strftime('%d/%m/%Y') if obj.valid_from else '—'
        valid_until = obj.valid_until.strftime('%d/%m/%Y') if obj.valid_until else 'Vô thời hạn'
        
        # Check if still valid
        if obj.is_valid():
            icon = '✓'
            color = 'green'
        else:
            icon = '✗'
            color = 'red'
        
        return format_html(
            '<span style="color: {};">{}</span> {} → {}',
            color,
            icon,
            valid_from,
            valid_until
        )
    validity_period.short_description = 'Thời gian hiệu lực'
    
    # ========================================
    # Admin Actions Implementation
    # ========================================
    
    def activate_assignments(self, request, queryset):
        """Kích hoạt các phân quyền đã chọn"""
        updated = queryset.update(status='ACTIVE')
        self.message_user(
            request,
            f'✅ Đã kích hoạt {updated} phân quyền.',
            level='SUCCESS'
        )
    activate_assignments.short_description = '✅ Kích hoạt các phân quyền đã chọn'
    
    def revoke_assignments(self, request, queryset):
        """Thu hồi các phân quyền đã chọn"""
        updated = queryset.update(status='REVOKED')
        self.message_user(
            request,
            f'⛔ Đã thu hồi {updated} phân quyền.',
            level='WARNING'
        )
    revoke_assignments.short_description = '⛔ Thu hồi các phân quyền đã chọn'
    
    def check_expired(self, request, queryset):
        """Kiểm tra và cập nhật các phân quyền hết hạn"""
        now = timezone.now()
        expired_count = 0
        
        for assignment in queryset:
            if assignment.valid_until and now > assignment.valid_until:
                if assignment.status == 'ACTIVE':
                    assignment.status = 'EXPIRED'
                    assignment.save()
                    expired_count += 1
        
        if expired_count > 0:
            self.message_user(
                request,
                f'⏰ Đã cập nhật {expired_count} phân quyền hết hạn.',
                level='INFO'
            )
        else:
            self.message_user(
                request,
                '✅ Không có phân quyền nào hết hạn.',
                level='SUCCESS'
            )
    check_expired.short_description = '⏰ Kiểm tra phân quyền hết hạn'
