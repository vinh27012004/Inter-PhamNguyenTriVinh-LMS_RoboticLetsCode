"""
Serializers cho ứng dụng Content
Cấu trúc nested: Program -> Subcourse -> Lesson
"""
from rest_framework import serializers
from .models import Program, Subcourse, Lesson, UserProgress


class LessonSerializer(serializers.ModelSerializer):
    """
    Serializer cho Lesson (Bài học)
    Hiển thị thông tin cơ bản của bài học
    """
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'slug',
            'subtitle',
            'objective',
            'knowledge_skills',
            'content_text',
            'video_url',
            'project_file_url',
            'code_snippet',
            'status',
            'status_display',
            'sort_order',
            'estimated_duration',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonListSerializer(serializers.ModelSerializer):
    """
    Serializer rút gọn cho danh sách bài học (dùng trong nested)
    Chỉ hiển thị thông tin cần thiết
    """
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'slug',
            'subtitle',
            'status',
            'status_display',
            'sort_order',
            'estimated_duration',
            'video_url',
            'project_file_url',
        ]
        read_only_fields = ['id']


class SubcourseSerializer(serializers.ModelSerializer):
    """
    Serializer cho Subcourse (Khóa học con)
    Bao gồm nested list của lessons
    """
    lessons = LessonListSerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    coding_language_display = serializers.CharField(
        source='get_coding_language_display',
        read_only=True
    )
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subcourse
        fields = [
            'id',
            'title',
            'slug',
            'subtitle',
            'description',
            'coding_language',
            'coding_language_display',
            'thumbnail_url',
            'status',
            'status_display',
            'sort_order',
            'price',
            'lesson_count',
            'lessons',  # Nested lessons
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_lesson_count(self, obj):
        """Đếm số lượng bài học"""
        return obj.lessons.count()


class SubcourseListSerializer(serializers.ModelSerializer):
    """
    Serializer rút gọn cho danh sách khóa con (dùng trong nested)
    Không bao gồm lessons để giảm payload
    """
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    coding_language_display = serializers.CharField(
        source='get_coding_language_display',
        read_only=True
    )
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subcourse
        fields = [
            'id',
            'title',
            'slug',
            'subtitle',
            'coding_language',
            'coding_language_display',
            'thumbnail_url',
            'status',
            'status_display',
            'sort_order',
            'price',
            'lesson_count',
        ]
        read_only_fields = ['id']
    
    def get_lesson_count(self, obj):
        """Đếm số lượng bài học"""
        return obj.lessons.count()


class ProgramSerializer(serializers.ModelSerializer):
    """
    Serializer cho Program (Chương trình học)
    Bao gồm nested list của subcourses
    Cấu trúc cây: Program -> Subcourse -> Lesson
    """
    subcourses = SubcourseSerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    kit_type_display = serializers.CharField(
        source='get_kit_type_display',
        read_only=True
    )
    subcourse_count = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField() 
    
    class Meta:
        model = Program
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'kit_type',
            'kit_type_display',
            'thumbnail_url',
            'status',
            'status_display',
            'sort_order',
            'subcourse_count',
            'total_lessons',
            'subcourses',  # Nested subcourses
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_subcourse_count(self, obj):
        """Đếm số lượng khóa con"""
        return obj.subcourses.count()
    
    def get_total_lessons(self, obj):
        """Đếm tổng số bài học trong tất cả subcourses"""
        from .models import Lesson
        return Lesson.objects.filter(
            subcourse__program=obj, 
            status='PUBLISHED'
        ).count()


class ProgramListSerializer(serializers.ModelSerializer):
    """
    Serializer rút gọn cho danh sách chương trình
    Không bao gồm subcourses để giảm payload
    """
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    kit_type_display = serializers.CharField(
        source='get_kit_type_display',
        read_only=True
    )
    subcourse_count = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = Program
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'kit_type',
            'kit_type_display',
            'thumbnail_url',
            'status',
            'status_display',
            'sort_order',
            'subcourse_count',
            'total_lessons',
        ]
        read_only_fields = ['id']
    
    def get_subcourse_count(self, obj):
        """Đếm số lượng khóa con"""
        return obj.subcourses.count()
    
    def get_total_lessons(self, obj):
        """Đếm tổng số bài học trong tất cả subcourses"""
        return Lesson.objects.filter(
            subcourse__program=obj, 
            status='PUBLISHED'
        ).count()


class UserProgressSerializer(serializers.ModelSerializer):
    """
    Serializer cho UserProgress (Tiến độ học tập)
    Để tracking tiến độ của user
    """
    user_username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    lesson_title = serializers.CharField(
        source='lesson.title',
        read_only=True
    )
    subcourse_title = serializers.CharField(
        source='lesson.subcourse.title',
        read_only=True
    )
    program_title = serializers.CharField(
        source='lesson.subcourse.program.title',
        read_only=True
    )
    
    class Meta:
        model = UserProgress
        fields = [
            'id',
            'user',
            'user_username',
            'lesson',
            'lesson_title',
            'subcourse_title',
            'program_title',
            'is_completed',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
