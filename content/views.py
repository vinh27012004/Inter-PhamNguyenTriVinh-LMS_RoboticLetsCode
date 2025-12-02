"""
Views (ViewSets) cho Content API
Read-only endpoints cho Program, Subcourse, Lesson
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Program, Subcourse, Lesson, UserProgress
from .serializers import (
    ProgramSerializer,
    ProgramListSerializer,
    SubcourseSerializer,
    SubcourseListSerializer,
    LessonSerializer,
    LessonListSerializer,
    UserProgressSerializer,
)


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Program (Chương trình học)
    Read-only: Học viên chỉ xem, không sửa
    
    Endpoints:
    - GET /api/programs/ - List tất cả programs
    - GET /api/programs/{id}/ - Chi tiết 1 program (có nested subcourses)
    """
    permission_classes = [IsAuthenticated]
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
            'subcourses',
            'subcourses__lessons'
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


class SubcourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Subcourse (Khóa học con)
    Read-only: Học viên chỉ xem
    
    Endpoints:
    - GET /api/subcourses/ - List tất cả subcourses
    - GET /api/subcourses/{id}/ - Chi tiết 1 subcourse (có nested lessons)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program', 'coding_language', 'status']
    search_fields = ['title', 'subtitle', 'description']
    ordering_fields = ['sort_order', 'created_at', 'price']
    ordering = ['program', 'sort_order']
    
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
        ).prefetch_related(
            'lessons'
        )
    
    def get_serializer_class(self):
        """
        List: Không có nested lessons
        Detail: Có nested lessons
        """
        if self.action == 'list':
            return SubcourseListSerializer
        return SubcourseSerializer


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho Lesson (Bài học)
    Read-only: Học viên chỉ xem
    
    Endpoints:
    - GET /api/lessons/ - List tất cả lessons
    - GET /api/lessons/{id}/ - Chi tiết 1 lesson
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subcourse', 'subcourse__program', 'status']
    search_fields = ['title', 'subtitle', 'objective', 'content_text']
    ordering_fields = ['sort_order', 'created_at', 'estimated_duration']
    ordering = ['subcourse', 'sort_order']
    
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
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """
        Custom action: Đánh dấu bài học hoàn thành
        POST /api/lessons/{id}/mark_complete/
        """
        lesson = self.get_object()
        user = request.user
        
        # Tạo hoặc cập nhật UserProgress
        progress, created = UserProgress.objects.get_or_create(
            user=user,
            lesson=lesson,
            defaults={'is_completed': True}
        )
        
        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.save()
        
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)


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
