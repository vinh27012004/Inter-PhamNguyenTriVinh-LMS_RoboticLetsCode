"""
Views (ViewSets) cho Content API
Read-only endpoints cho Program, Subcourse, Lesson
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.db import models

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
        Chi tiết subcourse - kiểm tra quyền truy cập
        User phải có AuthAssignment cho subcourse này hoặc program cha của nó
        """
        instance = self.get_object()
        
        # ADMIN có quyền xem tất cả
        if (
            request.user.is_staff
            or request.user.is_superuser
            or (hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN')
        ):
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        # Kiểm tra xem user có quyền truy cập không
        from user_auth.models import AuthAssignment
        from django.utils import timezone
        now = timezone.now()
        
        # Kiểm tra assignment cho subcourse này hoặc program cha
        has_access = AuthAssignment.objects.filter(
            user=request.user,
            status='ACTIVE',
            valid_from__lte=now
        ).filter(
            # Kiểm tra valid_until nếu có (null = không giới hạn)
            models.Q(valid_until__isnull=True) | models.Q(valid_until__gte=now)
        ).filter(
            # Có quyền trực tiếp cho subcourse này
            (Q(subcourse=instance)) |
            # Hoặc có quyền cho program cha (program-level access)
            (Q(program=instance.program, subcourse__isnull=True))
        ).exists()
        
        if not has_access:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Bạn không có quyền truy cập khóa học này.')
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


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
        Chi tiết lesson - kiểm tra quyền truy cập
        User phải có AuthAssignment cho subcourse hoặc program
        """
        instance = self.get_object()
        
        # ADMIN có quyền xem tất cả
        if (
            request.user.is_staff
            or request.user.is_superuser
            or (hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN')
        ):
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        # Kiểm tra xem user có quyền truy cập không
        from user_auth.models import AuthAssignment
        from django.utils import timezone
        now = timezone.now()
        
        # Kiểm tra assignment cho subcourse chứa lesson này hoặc program cha
        has_access = AuthAssignment.objects.filter(
            user=request.user,
            status='ACTIVE',
            valid_from__lte=now
        ).filter(
            # Kiểm tra valid_until nếu có (null = không giới hạn)
            models.Q(valid_until__isnull=True) | models.Q(valid_until__gte=now)
        ).filter(
            # Có quyền cho subcourse chứa lesson này
            (Q(subcourse=instance.subcourse)) |
            # Hoặc có quyền cho program cha (program-level access)
            (Q(program=instance.subcourse.program, subcourse__isnull=True))
        ).exists()
        
        if not has_access:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Bạn không có quyền truy cập bài học này.')
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
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
