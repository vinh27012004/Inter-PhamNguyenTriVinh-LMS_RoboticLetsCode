"""
Serializers cho ứng dụng Content
Cấu trúc nested: Program -> Subcourse -> Lesson
Mở rộng: Objectives, Models, AssemblyGuide, Preparation, BuildBlocks, 
ContentBlocks, Attachments, Challenges, Quizzes
"""
from rest_framework import serializers
from .models import (
    Program, Subcourse, Lesson, UserProgress,
    Media, LessonObjective, LessonModel, AssemblyGuide, Preparation,
    BuildBlock, PreparationBuildBlock, LessonContentBlock, LessonAttachment,
    Challenge, Quiz, QuizQuestion, QuestionOption,
    QuizSubmission, QuizAnswer
)


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
            'objective',
            'knowledge_skills',
            'content_text',
            'status',
            'status_display',
            'sort_order',
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
            'status',
            'status_display',
            'sort_order',
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
    level_display = serializers.CharField(
        source='get_level_display',
        read_only=True
    )
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subcourse
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'objective',
            'coding_language',
            'coding_language_display',
            'thumbnail_url',
            'status',
            'status_display',
            'sort_order',
            'level',
            'level_display',
            'level_number',
            'session_count',
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
    level_display = serializers.CharField(
        source='get_level_display',
        read_only=True
    )
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subcourse
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'objective',
            'coding_language',
            'coding_language_display',
            'thumbnail_url',
            'status',
            'status_display',
            'sort_order',
            'level',
            'level_display',
            'level_number',
            'session_count',
            'lesson_count',
        ]
        read_only_fields = ['id']
    
    def get_lesson_count(self, obj):
        """Đếm số lượng bài học"""
        return obj.lessons.count()


class ProgramSerializer(serializers.ModelSerializer):
    """
    Serializer cho Program (Chương trình học)
    Bao gồm nested list của subcourses (rút gọn, không có lessons)
    """
    subcourses = SubcourseListSerializer(many=True, read_only=True)
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

# ============================================================================
# EXPANDED LESSON CONTENT SERIALIZERS
# ============================================================================

class MediaSerializer(serializers.ModelSerializer):
    """Serializer cho Media (Ảnh/Video/File)"""
    media_type_display = serializers.CharField(
        source='get_media_type_display',
        read_only=True
    )
    
    class Meta:
        model = Media
        fields = [
            'id',
            'url',
            'media_type',
            'media_type_display',
            'caption',
            'alt_text',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LessonObjectiveSerializer(serializers.ModelSerializer):
    """Serializer cho Mục tiêu bài học"""
    objective_type_display = serializers.CharField(
        source='get_objective_type_display',
        read_only=True
    )
    
    class Meta:
        model = LessonObjective
        fields = [
            'id',
            'lesson',
            'objective_type',
            'objective_type_display',
            'text',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LessonModelSerializer(serializers.ModelSerializer):
    """Serializer cho Mô hình/Demo bài học"""
    media = MediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = LessonModel
        fields = [
            'id',
            'lesson',
            'title',
            'description',
            'media',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AssemblyGuideSerializer(serializers.ModelSerializer):
    """Serializer cho Hướng dẫn lắp ráp"""
    media = MediaSerializer(many=True, read_only=True)
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AssemblyGuide
        fields = [
            'id',
            'lesson',
            'title',
            'description',
            'pdf_url',
            'media',
            'media_count',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_media_count(self, obj):
        """Đếm số media"""
        return obj.media.count()


class BuildBlockSerializer(serializers.ModelSerializer):
    """Serializer cho Khối xây dựng"""
    class Meta:
        model = BuildBlock
        fields = [
            'id',
            'program',
            'title',
            'description',
            'pdf_url',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class PreparationBuildBlockSerializer(serializers.ModelSerializer):
    """Serializer cho bảng trung gian Preparation - BuildBlock (có số lượng)."""
    build_block = BuildBlockSerializer(read_only=True)

    class Meta:
        model = PreparationBuildBlock
        fields = [
            'id',
            'build_block',
            'quantity',
        ]
        read_only_fields = ['id']


class PreparationSerializer(serializers.ModelSerializer):
    """Serializer cho Chuẩn bị bài học - Nhiều BuildBlocks"""
    build_blocks = PreparationBuildBlockSerializer(
        source='preparation_build_blocks',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = Preparation
        fields = [
            'id',
            'lesson',
            'build_blocks',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonContentBlockSerializer(serializers.ModelSerializer):
    """Serializer cho Khối nội dung học"""
    content_type_display = serializers.CharField(
        source='get_content_type_display',
        read_only=True
    )
    media = MediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = LessonContentBlock
        fields = [
            'id',
            'lesson',
            'title',
            'subtitle',
            'content_type',
            'content_type_display',
            'description',
            'usage_text',
            'example_text',
            'media',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LessonAttachmentSerializer(serializers.ModelSerializer):
    """Serializer cho Tệp đính kèm"""
    file_type_display = serializers.CharField(
        source='get_file_type_display',
        read_only=True
    )
    
    class Meta:
        model = LessonAttachment
        fields = [
            'id',
            'lesson',
            'file_url',
            'name',
            'description',
            'file_type',
            'file_type_display',
            'file_size_kb',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ChallengeSerializer(serializers.ModelSerializer):
    """Serializer cho Thử thách"""
    difficulty_display = serializers.CharField(
        source='get_difficulty_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    media = MediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Challenge
        fields = [
            'id',
            'lesson',
            'title',
            'subtitle',
            'description',
            'instructions',
            'expected_output',
            'difficulty',
            'difficulty_display',
            'points',
            'time_limit_minutes',
            'media',
            'status',
            'status_display',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# QUIZ SERIALIZERS
# ============================================================================

class QuestionOptionSerializer(serializers.ModelSerializer):
    """Serializer cho Lựa chọn câu hỏi"""
    
    class Meta:
        model = QuestionOption
        fields = [
            'id',
            'option_text',
            'is_correct',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer cho Câu hỏi Quiz"""
    question_type_display = serializers.CharField(
        source='get_question_type_display',
        read_only=True
    )
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizQuestion
        fields = [
            'id',
            'quiz',
            'question_text',
            'question_type',
            'question_type_display',
            'explanation',
            'points',
            'options',
            'order',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class QuizAnswerSerializer(serializers.ModelSerializer):
    """Serializer cho Câu trả lời Quiz"""
    question_text = serializers.CharField(
        source='question.question_text',
        read_only=True
    )
    
    class Meta:
        model = QuizAnswer
        fields = [
            'id',
            'quiz_submission',
            'question',
            'question_text',
            'selected_option_ids',
            'answer_text',
            'is_correct',
            'points_earned',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class QuizSubmissionSerializer(serializers.ModelSerializer):
    """Serializer cho Bài nộp Quiz"""
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    answers = QuizAnswerSerializer(many=True, read_only=True)
    user_username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    
    class Meta:
        model = QuizSubmission
        fields = [
            'id',
            'quiz',
            'user',
            'user_username',
            'score',
            'max_score',
            'percentage',
            'status',
            'status_display',
            'is_passed',
            'attempt_number',
            'started_at',
            'submitted_at',
            'time_spent_seconds',
            'answers',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuizListSerializer(serializers.ModelSerializer):
    """Serializer rút gọn cho danh sách Quiz"""
    quiz_type_display = serializers.CharField(
        source='get_quiz_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id',
            'lesson',
            'title',
            'description',
            'quiz_type',
            'quiz_type_display',
            'passing_score',
            'max_attempts',
            'question_count',
            'status',
            'status_display',
            'order',
        ]
        read_only_fields = ['id']
    
    def get_question_count(self, obj):
        return obj.questions.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết cho Quiz với tất cả câu hỏi"""
    quiz_type_display = serializers.CharField(
        source='get_quiz_type_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    questions = QuizQuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id',
            'lesson',
            'title',
            'description',
            'quiz_type',
            'quiz_type_display',
            'passing_score',
            'max_attempts',
            'time_limit_minutes',
            'shuffle_questions',
            'shuffle_options',
            'show_correct_answer',
            'status',
            'status_display',
            'order',
            'questions',
            'question_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()


# ============================================================================
# LESSON DETAIL SERIALIZER (với tất cả nội dung)
# ============================================================================

class LessonDetailSerializer(serializers.ModelSerializer):
    """
    Serializer chi tiết cho Lesson với tất cả nested content
    Dùng cho lesson detail page
    """
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    objectives = LessonObjectiveSerializer(many=True, read_only=True)
    models = LessonModelSerializer(many=True, read_only=True)
    assembly_guides = AssemblyGuideSerializer(many=True, read_only=True)
    preparation = PreparationSerializer(read_only=True)
    content_blocks = LessonContentBlockSerializer(many=True, read_only=True)
    attachments = LessonAttachmentSerializer(many=True, read_only=True)
    challenges = ChallengeSerializer(many=True, read_only=True)
    quizzes = QuizDetailSerializer(many=True, read_only=True)
    
    # Counts
    objective_count = serializers.SerializerMethodField()
    model_count = serializers.SerializerMethodField()
    assembly_guide_count = serializers.SerializerMethodField()
    attachment_count = serializers.SerializerMethodField()
    challenge_count = serializers.SerializerMethodField()
    quiz_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id',
            'subcourse',
            'title',
            'slug',
            'objective',
            'knowledge_skills',
            'content_text',
            'status',
            'status_display',
            'sort_order',
            # Objectives
            'objectives',
            'objective_count',
            # Models
            'models',
            'model_count',
            # Assembly Guides
            'assembly_guides',
            'assembly_guide_count',
            # Preparation
            'preparation',
            # Content Blocks
            'content_blocks',
            # Attachments
            'attachments',
            'attachment_count',
            # Challenges
            'challenges',
            'challenge_count',
            # Quizzes
            'quizzes',
            'quiz_count',
            # Timestamps
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_objective_count(self, obj):
        return obj.objectives.count()
    
    def get_model_count(self, obj):
        return obj.models.count()
    
    def get_assembly_guide_count(self, obj):
        return obj.assembly_guides.count()
    
    def get_attachment_count(self, obj):
        return obj.attachments.count()
    
    def get_challenge_count(self, obj):
        return obj.challenges.count()
    
    def get_quiz_count(self, obj):
        return obj.quizzes.count()