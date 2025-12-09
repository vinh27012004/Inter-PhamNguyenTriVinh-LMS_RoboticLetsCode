"""
Serializers cho ứng dụng User Auth
Quản lý UserProfile và AuthAssignment (Phân quyền)
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, AuthAssignment


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer cho UserProfile
    Hiển thị thông tin hồ sơ và vai trò của user
    """
    username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    email = serializers.CharField(
        source='user.email',
        read_only=True
    )
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(
        source='get_role_display',
        read_only=True
    )
    
    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'username',
            'email',
            'full_name',
            'role',
            'role_display',
            'phone',
            'avatar_url',
            'bio',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Lấy họ tên đầy đủ từ User"""
        user = obj.user
        full = f"{user.first_name} {user.last_name}".strip()
        return full if full else user.username


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer cho User với thông tin profile
    """
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'date_joined',
            'profile',
        ]
        read_only_fields = ['id', 'date_joined']


class AuthAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer cho AuthAssignment
    Để Frontend biết User được gán quyền học gì
    """
    user_username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    user_role = serializers.CharField(
        source='user.profile.role',
        read_only=True
    )
    user_role_display = serializers.CharField(
        source='user.profile.get_role_display',
        read_only=True
    )
    
    # Thông tin về Program/Subcourse được gán
    program_id = serializers.IntegerField(
        source='program.id',
        read_only=True,
        allow_null=True
    )
    program_title = serializers.CharField(
        source='program.title',
        read_only=True,
        allow_null=True
    )
    program_slug = serializers.CharField(
        source='program.slug',
        read_only=True,
        allow_null=True
    )
    
    subcourse_id = serializers.IntegerField(
        source='subcourse.id',
        read_only=True,
        allow_null=True
    )
    subcourse_title = serializers.CharField(
        source='subcourse.title',
        read_only=True,
        allow_null=True
    )
    subcourse_slug = serializers.CharField(
        source='subcourse.slug',
        read_only=True,
        allow_null=True
    )
    
    # Hiển thị status
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    # Check validity
    is_valid = serializers.SerializerMethodField()
    
    # Thông tin người gán quyền
    assigned_by_username = serializers.CharField(
        source='assigned_by.username',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = AuthAssignment
        fields = [
            'id',
            'user',
            'user_username',
            'user_role',
            'user_role_display',
            
            # Program info
            'program',
            'program_id',
            'program_title',
            'program_slug',
            
            # Subcourse info
            'subcourse',
            'subcourse_id',
            'subcourse_title',
            'subcourse_slug',
            
            # Status & validity
            'status',
            'status_display',
            'is_valid',
            
            # Time period (start_at/end_at theo yêu cầu -> valid_from/valid_until trong model)
            'valid_from',  # start_at
            'valid_until',  # end_at
            
            # Metadata
            'assigned_by',
            'assigned_by_username',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        """Kiểm tra phân quyền còn hiệu lực không"""
        return obj.is_valid()


class AuthAssignmentListSerializer(serializers.ModelSerializer):
    """
    Serializer rút gọn cho danh sách phân quyền
    Dùng cho list view, chỉ hiển thị thông tin cần thiết
    """
    user_username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    user_role = serializers.CharField(
        source='user.profile.role',
        read_only=True
    )
    
    target_content = serializers.SerializerMethodField()
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = AuthAssignment
        fields = [
            'id',
            'user',
            'user_username',
            'user_role',
            'target_content',
            'status',
            'status_display',
            'is_valid',
            'valid_from',
            'valid_until',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_target_content(self, obj):
        """Trả về thông tin ngắn gọn về nội dung được gán"""
        if obj.program:
            return {
                'type': 'program',
                'id': obj.program.id,
                'title': obj.program.title,
                'slug': obj.program.slug,
            }
        elif obj.subcourse:
            return {
                'type': 'subcourse',
                'id': obj.subcourse.id,
                'title': obj.subcourse.title,
                'slug': obj.subcourse.slug,
            }
        return None
    
    def get_is_valid(self, obj):
        """Kiểm tra phân quyền còn hiệu lực không"""
        return obj.is_valid()


class UserWithAssignmentsSerializer(serializers.ModelSerializer):
    """
    Serializer cho User kèm theo danh sách phân quyền
    Dùng để Frontend kiểm tra user có quyền truy cập gì
    """
    profile = UserProfileSerializer(read_only=True)
    assignments = AuthAssignmentListSerializer(
        source='auth_assignments',
        many=True,
        read_only=True
    )
    active_assignments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'profile',
            'assignments',
            'active_assignments_count',
        ]
        read_only_fields = ['id']
    
    def get_active_assignments_count(self, obj):
        """Đếm số phân quyền đang active"""
        return obj.auth_assignments.filter(status='ACTIVE').count()
