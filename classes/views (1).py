"""
Views cho Classes App
"""
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Q

from .models import Class, ClassTeacher, ClassEnrollment, UserProgress
from .serializers import (
    ClassSerializer,
    ClassListSerializer,
    ClassTeacherSerializer,
    ClassEnrollmentSerializer,
    UserProgressSerializer,
    StudentProgressSummarySerializer,
)


class ClassViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho Class
    - Admin: xem tất cả lớp
    - Teacher: chỉ xem lớp mình dạy
    - Student: chỉ xem lớp mình học
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'program', 'start_date']
    search_fields = ['name', 'code', 'program__title']
    ordering_fields = ['start_date', 'created_at', 'name']
    ordering = ['-start_date']
    
    def get_queryset(self):
        """Filter theo role"""
        user = self.request.user
        
        # Admin xem tất cả
        if user.is_staff or user.is_superuser:
            return Class.objects.all().select_related('program', 'created_by')
        
        # Teacher xem lớp mình dạy
        if hasattr(user, 'profile') and user.profile.role == 'TEACHER':
            return Class.objects.filter(
                teachers__teacher=user
            ).distinct().select_related('program', 'created_by')
        
        # Student xem lớp mình học
        return Class.objects.filter(
            enrollments__student=user,
            enrollments__status='ACTIVE'
        ).distinct().select_related('program', 'created_by')
    
    def get_serializer_class(self):
        """List dùng serializer rút gọn"""
        if self.action == 'list':
            return ClassListSerializer
        return ClassSerializer
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        Danh sách học viên trong lớp (roster)
        GET /api/classes/{id}/students/
        """
        class_obj = self.get_object()
        enrollments = class_obj.enrollments.filter(
            status='ACTIVE'
        ).select_related('student', 'student__profile')
        
        serializer = ClassEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Tiến độ học tập của các học viên trong lớp
        GET /api/classes/{id}/progress/
        Query params: ?student={id} để lọc theo học viên
        """
        class_obj = self.get_object()
        student_id = request.query_params.get('student')
        
        enrollments = class_obj.enrollments.filter(status='ACTIVE')
        
        if student_id:
            enrollments = enrollments.filter(student_id=student_id)
        
        # Tổng hợp tiến độ từng học viên
        results = []
        for enrollment in enrollments:
            progress_records = UserProgress.objects.filter(
                student=enrollment.student,
                class_enrollment=enrollment
            ).select_related('subcourse')
            
            # Tính overall completion
            if progress_records.exists():
                avg_completion = progress_records.aggregate(
                    Avg('completion_percentage')
                )['completion_percentage__avg'] or 0
            else:
                avg_completion = 0
            
            results.append({
                'student': enrollment.student,
                'enrollment': enrollment,
                'progress': progress_records,
                'overall_completion': round(avg_completion, 2)
            })
        
        serializer = StudentProgressSummarySerializer(results, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        """
        Ghi danh học viên vào lớp (chỉ admin/teacher)
        POST /api/classes/{id}/enroll_student/
        Body: {"student_id": 123, "status": "ACTIVE", "notes": "..."}
        """
        if not (request.user.is_staff or 
                (hasattr(request.user, 'profile') and request.user.profile.role in ['ADMIN', 'TEACHER'])):
            return Response(
                {'error': 'Bạn không có quyền ghi danh học viên'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        class_obj = self.get_object()
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response(
                {'error': 'Thiếu student_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check lớp đã đầy chưa
        if class_obj.is_full:
            return Response(
                {'error': 'Lớp đã đầy'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tạo enrollment
        enrollment, created = ClassEnrollment.objects.get_or_create(
            class_obj=class_obj,
            student_id=student_id,
            defaults={
                'status': request.data.get('status', 'ACTIVE'),
                'notes': request.data.get('notes', ''),
                'enrolled_by': request.user
            }
        )
        
        if not created:
            return Response(
                {'error': 'Học viên đã được ghi danh vào lớp này'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ClassEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClassEnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho ClassEnrollment
    Quản lý ghi danh học viên
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ClassEnrollmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'class_obj', 'student']
    ordering_fields = ['enrolled_at', 'completed_at']
    ordering = ['-enrolled_at']
    
    def get_queryset(self):
        """Filter theo role"""
        user = self.request.user
        
        # Admin xem tất cả
        if user.is_staff or user.is_superuser:
            return ClassEnrollment.objects.all().select_related(
                'class_obj', 'student', 'student__profile'
            )
        
        # Teacher xem enrollment của lớp mình dạy
        if hasattr(user, 'profile') and user.profile.role == 'TEACHER':
            return ClassEnrollment.objects.filter(
                class_obj__teachers__teacher=user
            ).distinct().select_related('class_obj', 'student', 'student__profile')
        
        # Student chỉ xem enrollment của chính mình
        return ClassEnrollment.objects.filter(
            student=user
        ).select_related('class_obj', 'student', 'student__profile')


class UserProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho UserProgress
    Theo dõi tiến độ học tập
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProgressSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'student', 'subcourse', 'class_enrollment']
    ordering_fields = ['completion_percentage', 'last_activity_at', 'updated_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """Filter theo role"""
        user = self.request.user
        
        # Admin xem tất cả
        if user.is_staff or user.is_superuser:
            return UserProgress.objects.all().select_related(
                'student', 'subcourse', 'class_enrollment'
            )
        
        # Teacher xem progress của học viên trong lớp mình dạy
        if hasattr(user, 'profile') and user.profile.role == 'TEACHER':
            return UserProgress.objects.filter(
                class_enrollment__class_obj__teachers__teacher=user
            ).distinct().select_related('student', 'subcourse', 'class_enrollment')
        
        # Student chỉ xem progress của chính mình
        return UserProgress.objects.filter(
            student=user
        ).select_related('student', 'subcourse', 'class_enrollment')
    
    @action(detail=True, methods=['post'])
    def update_completion(self, request, pk=None):
        """
        Cập nhật tiến độ hoàn thành
        POST /api/progress/{id}/update_completion/
        Body: {"lessons_completed": 5, "total_lessons": 10}
        """
        progress = self.get_object()
        
        # Chỉ admin/teacher hoặc chính học viên mới update được
        if not (request.user.is_staff or 
                request.user == progress.student or
                (hasattr(request.user, 'profile') and request.user.profile.role in ['ADMIN', 'TEACHER'])):
            return Response(
                {'error': 'Bạn không có quyền cập nhật tiến độ này'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        lessons_completed = request.data.get('lessons_completed')
        total_lessons = request.data.get('total_lessons')
        
        if lessons_completed is not None:
            progress.lessons_completed = lessons_completed
        if total_lessons is not None:
            progress.total_lessons = total_lessons
        
        progress.update_progress()
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)
