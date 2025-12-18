"""
Serializers cho Classes App
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Class, ClassTeacher, ClassEnrollment
from content.models import Subcourse


class TeacherInfoSerializer(serializers.ModelSerializer):
    """Thông tin giáo viên"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    role_display = serializers.CharField(source='profile.get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role_display']


class StudentInfoSerializer(serializers.ModelSerializer):
    """Thông tin học viên"""
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    school = serializers.CharField(source='profile.school', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'school']


class ClassTeacherSerializer(serializers.ModelSerializer):
    """Serializer cho ClassTeacher"""
    teacher_info = TeacherInfoSerializer(source='teacher', read_only=True)
    teacher_username = serializers.CharField(source='teacher.username', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    
    class Meta:
        model = ClassTeacher
        fields = [
            'id',
            'class_obj',
            'class_name',
            'teacher',
            'teacher_username',
            'teacher_info',
            'role',
            'role_display',
            'assigned_at',
            'assigned_by',
        ]
        read_only_fields = ['id', 'assigned_at']


class ClassEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer cho ClassEnrollment"""
    student_info = StudentInfoSerializer(source='student', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    class_code = serializers.CharField(source='class_obj.code', read_only=True)
    
    class Meta:
        model = ClassEnrollment
        fields = [
            'id',
            'class_obj',
            'class_name',
            'class_code',
            'student',
            'student_username',
            'student_info',
            'status',
            'status_display',
            'enrolled_at',
            'completed_at',
            'enrolled_by',
            'notes',
        ]
        read_only_fields = ['id', 'enrolled_at']


class ClassSerializer(serializers.ModelSerializer):
    """Serializer chi tiết cho Class"""
    subcourse_title = serializers.CharField(source='subcourse.title', read_only=True)
    subcourse_slug = serializers.CharField(source='subcourse.slug', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Danh sách giáo viên và học viên
    teachers = ClassTeacherSerializer(many=True, read_only=True)
    enrollments = ClassEnrollmentSerializer(many=True, read_only=True)
    
    # Thống kê
    current_enrollment_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Class
        fields = [
            'id',
            'name',
            'code',
            'subcourse',
            'subcourse_title',
            'subcourse_slug',
            'status',
            'status_display',
            'start_date',
            'end_date',
            'max_students',
            'current_enrollment_count',
            'is_full',
            'description',
            'notes',
            'teachers',
            'enrollments',
            'created_at',
            'updated_at',
            'created_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassListSerializer(serializers.ModelSerializer):
    """Serializer rút gọn cho danh sách lớp"""
    subcourse_title = serializers.CharField(source='subcourse.title', read_only=True)
    subcourse_slug = serializers.CharField(source='subcourse.slug', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_enrollment_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    
    # Thông tin giáo viên chính
    lead_teacher = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            'id',
            'name',
            'code',
            'subcourse',
            'subcourse_title',
            'subcourse_slug',
            'status',
            'status_display',
            'start_date',
            'end_date',
            'max_students',
            'current_enrollment_count',
            'is_full',
            'lead_teacher',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_lead_teacher(self, obj):
        """Lấy giáo viên chính của lớp"""
        lead = obj.teachers.filter(role='LEAD').first()
        if lead:
            return {
                'id': lead.teacher.id,
                'username': lead.teacher.username,
                'full_name': lead.teacher.profile.full_name if hasattr(lead.teacher, 'profile') else ''
            }
        return None

