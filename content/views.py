"""
Views (ViewSets) cho Content API
Read-only endpoints cho Program, Subcourse, Lesson
"""
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch
from django.utils import timezone

from .models import (
    Program, Subcourse, Lesson, UserProgress,
    Media, LessonObjective, LessonModel, Preparation,
    BuildBlock, PreparationBuildBlock, LessonContentBlock, LessonAttachment,
    Challenge, Quiz, QuizQuestion, QuestionOption,
    QuizSubmission, QuizAnswer
)
from .serializers import (
    ProgramSerializer,
    ProgramListSerializer,
    SubcourseSerializer,
    SubcourseListSerializer,
    LessonSerializer,
    LessonListSerializer,
    UserProgressSerializer,
    MediaSerializer,
    LessonObjectiveSerializer,
    LessonModelSerializer,
    PreparationSerializer,
    BuildBlockSerializer,
    LessonContentBlockSerializer,
    LessonAttachmentSerializer,
    ChallengeSerializer,
    QuizListSerializer,
    QuizDetailSerializer,
    QuizQuestionSerializer,
    QuestionOptionSerializer,
    QuizSubmissionSerializer,
    QuizAnswerSerializer,
    LessonDetailSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    """Custom pagination class with configurable page_size"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Program (Chương trình học)
    Read-only: Học viên chỉ xem, không sửa
    
    Endpoints:
    - GET /api/programs/ - List tất cả programs
    - GET /api/programs/{slug}/ - Chi tiết 1 program (có nested subcourses)
    """
    permission_classes = [AllowAny]  # Cho phép truy cập công khai
    lookup_field = 'slug'  # Sử dụng slug thay vì id để lookup
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['kit_type', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['sort_order', 'created_at', 'title']
    ordering = ['sort_order', 'title']
    
    def get_queryset(self):
        """
        Chỉ lấy các Program đã published
        Tối ưu hóa với prefetch_related để tránh N+1 queries
        """
        return Program.objects.filter(
            status='PUBLISHED'
        ).prefetch_related(
            'subcourses'
        )
    
    def get_serializer_class(self):
        """
        Dùng serializer khác nhau cho list vs detail
        List: Không có nested (nhẹ)
        Detail: Có nested subcourses & lessons (đầy đủ)
        """
        if self.action == 'list':
            return ProgramListSerializer
        return ProgramSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """
        Chi tiết program - public access
        """
        return super().retrieve(request, *args, **kwargs)


class SubcourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Subcourse (Khóa học con)
    Read-only: Học viên chỉ xem
    
    Endpoints:
    - GET /api/subcourses/ - List tất cả subcourses (public)
    - GET /api/subcourses/{id}/ - Chi tiết 1 subcourse (requires authentication & authorization)
    """
    lookup_field = 'slug'  
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program', 'coding_language', 'status', 'slug']
    search_fields = ['title', 'description']
    ordering_fields = ['sort_order', 'created_at', 'price']
    ordering = ['program', 'sort_order']
    
    def get_permissions(self):
        """
        List: Public access
        Detail: Requires authentication
        """
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Chỉ lấy subcourses của programs đã published
        Tối ưu hóa với select_related và prefetch_related
        """
        return Subcourse.objects.filter(
            status='PUBLISHED',
            program__status='PUBLISHED'
        ).select_related(
            'program'
        )
    
    def get_serializer_class(self):
        """
        List: Không có nested lessons
        Detail: Có nested lessons
        """
        if self.action == 'list':
            return SubcourseListSerializer
        return SubcourseSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """
        Chi tiết subcourse - public access
        """
        return super().retrieve(request, *args, **kwargs)


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Lesson (Bài học)
    Read-only: Học viên chỉ xem
    
    Endpoints:
    - GET /api/lessons/ - List tất cả lessons (public)
    - GET /api/lessons/{id}/ - Chi tiết 1 lesson (requires authentication & authorization)
    """
    lookup_field = 'slug'  # Sử dụng slug thay vì id để lookup
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subcourse', 'subcourse__program', 'status']
    search_fields = ['title', 'subtitle', 'objective', 'content_text']
    ordering_fields = ['sort_order', 'created_at', 'estimated_duration']
    ordering = ['subcourse', 'sort_order']
    
    def get_permissions(self):
        """
        List: Public access
        Detail: Requires authentication
        """
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Chỉ lấy lessons của subcourses & programs đã published
        Tối ưu hóa với select_related
        """
        return Lesson.objects.filter(
            status='PUBLISHED',
            subcourse__status='PUBLISHED',
            subcourse__program__status='PUBLISHED'
        ).select_related(
            'subcourse',
            'subcourse__program'
        )
    
    def get_serializer_class(self):
        """
        List: Rút gọn
        Detail: Đầy đủ
        """
        if self.action == 'list':
            return LessonListSerializer
        return LessonSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """
        Chi tiết lesson - public access
        """
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_complete(self, request, *args, **kwargs):
        """
        Đánh dấu bài học hoàn thành (đơn giản)
        POST /api/content/lessons/{slug}/mark_complete/
        """
        user = request.user
        
        # Lấy lesson từ slug (vì URL dùng slug)
        lesson = self.get_object()
        
        # Tạo hoặc cập nhật UserProgress
        progress, created = UserProgress.objects.update_or_create(
            user=user,
            lesson=lesson,
            defaults={
                'is_completed': True,
                'completed_at': timezone.now()
            }
        )
        
        # Tính phần trăm hoàn thành trong subcourse
        total_lessons = lesson.subcourse.lessons.filter(status='PUBLISHED').count()
        completed_lessons = UserProgress.objects.filter(
            user=user,
            lesson__subcourse=lesson.subcourse,
            is_completed=True
        ).count()
        
        completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        return Response({
            'success': True,
            'message': 'Đã đánh dấu hoàn thành!',
            'progress': {
                'lesson_id': lesson.id,
                'lesson_title': lesson.title,
                'is_completed': progress.is_completed,
                'completed_at': progress.completed_at,
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'completion_percentage': round(completion_percentage, 2)
            }
        }, status=status.HTTP_200_OK)


class UserProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho UserProgress (Tiến độ học tập)
    Chỉ xem tiến độ của chính user đang đăng nhập
    
    Endpoints:
    - GET /api/progress/ - Tiến độ của user hiện tại
    """
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_completed', 'lesson__subcourse__program']
    ordering_fields = ['created_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Chỉ trả về tiến độ của user hiện tại
        """
        user = self.request.user
        return UserProgress.objects.filter(
            user=user
        ).select_related(
            'lesson',
            'lesson__subcourse',
            'lesson__subcourse__program'
        )


# ========================
# Media & Resource ViewSets
# ========================

class MediaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Media (Tài nguyên chia sẻ)
    Read-only: Admin quản lý qua admin panel
    
    Endpoints:
    - GET /api/media/ - List tất cả media
    - GET /api/media/{id}/ - Chi tiết 1 media item
    """
    serializer_class = MediaSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['media_type', 'is_featured']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Tất cả media items"""
        return Media.objects.all()


# ========================
# Lesson Content ViewSets
# ========================

class LessonObjectiveViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho LessonObjective (Mục tiêu bài học)
    Read-only: Quản lý qua admin panel hoặc Lesson API
    
    Endpoints:
    - GET /api/objectives/ - List objectives (filtered by lesson)
    - GET /api/objectives/{id}/ - Chi tiết 1 objective
    """
    serializer_class = LessonObjectiveSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson', 'objective_type']
    search_fields = ['objective_text']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['lesson', 'sort_order']
    
    def get_queryset(self):
        """Objectives của published lessons"""
        return LessonObjective.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson')


class LessonModelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho LessonModel (Mô hình thiết kế)
    
    Endpoints:
    - GET /api/models/ - List models (filtered by lesson)
    - GET /api/models/{id}/ - Chi tiết 1 model
    """
    serializer_class = LessonModelSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson']
    search_fields = ['model_name', 'description']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['lesson', 'sort_order']
    
    def get_queryset(self):
        """Models của published lessons với prefetch media"""
        return LessonModel.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson').prefetch_related('media')


class PreparationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Preparation (Chuẩn bị)
    
    Endpoints:
    - GET /api/preparations/ - List preparations (filtered by lesson)
    - GET /api/preparations/{id}/ - Chi tiết
    """
    serializer_class = PreparationSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson']
    search_fields = []
    ordering_fields = ['created_at']
    ordering = ['lesson']
    
    def get_queryset(self):
        """Preparations của published lessons với prefetch build_blocks"""
        build_block_qs = PreparationBuildBlock.objects.select_related('build_block', 'build_block__program').order_by('build_block__order', 'id')

        return Preparation.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson').prefetch_related(
            Prefetch('preparation_build_blocks', queryset=build_block_qs)
        )


class BuildBlockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho BuildBlock (Khối xây dựng)
    
    Endpoints:
    - GET /api/build-blocks/ - List build blocks (filtered by lesson)
    - GET /api/build-blocks/{id}/ - Chi tiết
    """
    serializer_class = BuildBlockSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at']
    ordering = ['program', 'order']
    
    def get_queryset(self):
        """Build blocks theo chương trình học"""
        return BuildBlock.objects.select_related('program')


class LessonContentBlockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho LessonContentBlock (Nội dung bài học)
    
    Endpoints:
    - GET /api/content-blocks/ - List content blocks (filtered by lesson)
    - GET /api/content-blocks/{id}/ - Chi tiết
    """
    serializer_class = LessonContentBlockSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson', 'block_type']
    search_fields = ['title', 'content_text', 'code_snippet']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['lesson', 'sort_order']
    
    def get_queryset(self):
        """Content blocks của published lessons với prefetch media"""
        return LessonContentBlock.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson').prefetch_related('media')


class LessonAttachmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho LessonAttachment (File đính kèm)
    
    Endpoints:
    - GET /api/attachments/ - List attachments (filtered by lesson)
    - GET /api/attachments/{id}/ - Chi tiết
    """
    serializer_class = LessonAttachmentSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson', 'file_type']
    search_fields = ['file_name', 'description']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['lesson', 'sort_order']
    
    def get_queryset(self):
        """Attachments của published lessons"""
        return LessonAttachment.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson')


class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Challenge (Thử thách)
    
    Endpoints:
    - GET /api/challenges/ - List challenges (filtered by lesson)
    - GET /api/challenges/{id}/ - Chi tiết
    """
    serializer_class = ChallengeSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson', 'difficulty_level']
    search_fields = ['challenge_title', 'description', 'hint']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['lesson', 'sort_order']
    
    def get_queryset(self):
        """Challenges của published lessons với prefetch media"""
        return Challenge.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson').prefetch_related('media')


# ========================
# Quiz & Assessment ViewSets
# ========================

class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Quiz (Bài kiểm tra)
    
    Endpoints:
    - GET /api/quizzes/ - List quizzes (filtered by lesson)
    - GET /api/quizzes/{id}/ - Chi tiết quiz với questions
    - POST /api/quizzes/{id}/submit/ - Nộp bài (tạo submission)
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesson', 'quiz_type']
    search_fields = ['quiz_title', 'description']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['lesson', 'sort_order']
    
    def get_queryset(self):
        """Quizzes của published lessons với prefetch questions"""
        return Quiz.objects.filter(
            lesson__status='PUBLISHED'
        ).select_related('lesson').prefetch_related(
            'questions',
            'questions__options'
        )
    
    def get_serializer_class(self):
        """
        List: Rút gọn (không có questions)
        Detail: Đầy đủ (có questions & options)
        """
        if self.action == 'list':
            return QuizListSerializer
        return QuizDetailSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        """
        Custom action: Nộp bài quiz
        POST /api/quizzes/{id}/submit/
        Body: {
            "answers": [
                {"question_id": 1, "selected_option_id": 3},
                {"question_id": 2, "selected_option_id": 7}
            ]
        }
        """
        quiz = self.get_object()
        user = request.user
        answers_data = request.data.get('answers', [])
        
        # Tạo QuizSubmission
        from django.utils import timezone
        submission = QuizSubmission.objects.create(
            user=user,
            quiz=quiz,
            submitted_at=timezone.now()
        )
        
        # Tạo QuizAnswers và tính điểm
        correct_count = 0
        total_questions = 0
        
        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            selected_option_id = answer_data.get('selected_option_id')
            
            if not question_id or not selected_option_id:
                continue
            
            try:
                question = QuizQuestion.objects.get(id=question_id, quiz=quiz)
                selected_option = QuestionOption.objects.get(id=selected_option_id, question=question)
                
                QuizAnswer.objects.create(
                    submission=submission,
                    question=question,
                    selected_option=selected_option
                )
                
                total_questions += 1
                if selected_option.is_correct:
                    correct_count += 1
                    
            except (QuizQuestion.DoesNotExist, QuestionOption.DoesNotExist):
                continue
        
        # Tính điểm
        if total_questions > 0:
            submission.score = (correct_count / total_questions) * 100
            submission.is_passed = submission.score >= quiz.passing_score
            submission.save()
        
        serializer = QuizSubmissionSerializer(submission)
        return Response(serializer.data)


class QuizSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho QuizSubmission (Lần nộp bài)
    Chỉ xem submissions của chính user
    
    Endpoints:
    - GET /api/quiz-submissions/ - Submissions của user hiện tại
    - GET /api/quiz-submissions/{id}/ - Chi tiết 1 submission
    """
    serializer_class = QuizSubmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['quiz', 'is_passed']
    ordering_fields = ['submitted_at', 'score']
    ordering = ['-submitted_at']
    
    def get_queryset(self):
        """Chỉ submissions của user hiện tại"""
        return QuizSubmission.objects.filter(
            user=self.request.user
        ).select_related('quiz', 'quiz__lesson').prefetch_related(
            'answers',
            'answers__question',
            'answers__selected_option'
        )


# ========================
# Composite Lesson ViewSet
# ========================

class LessonDetailViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Lesson Detail với TẤT CẢ nội dung lồng nhau
    (Objectives, Models, Preparations, BuildBlocks, ContentBlocks, Attachments, Challenges, Quizzes)
    
    Endpoints:
    - GET /api/lesson-details/ - List lessons với full content
    - GET /api/lesson-details/{slug}/ - Chi tiết 1 lesson với full content
    """
    serializer_class = LessonDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subcourse', 'status']
    search_fields = ['title', 'subtitle', 'objective']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['subcourse', 'sort_order']
    
    def get_queryset(self):
        """
        Lessons với full prefetch để tránh N+1 queries
        """
        return Lesson.objects.filter(
            status='PUBLISHED',
            subcourse__status='PUBLISHED'
        ).select_related(
            'subcourse',
            'subcourse__program'
        ).prefetch_related(
            'objectives',
            'models', 'models__media',
            'assembly_guides', 'assembly_guides__media',
            'preparation',
            Prefetch(
                'preparation__preparation_build_blocks',
                queryset=PreparationBuildBlock.objects.select_related('build_block', 'build_block__program').order_by('build_block__order', 'id')
            ),
            'content_blocks', 'content_blocks__media',
            'attachments',
            'challenges', 'challenges__media',
            'quizzes', 'quizzes__questions', 'quizzes__questions__options'
        )
