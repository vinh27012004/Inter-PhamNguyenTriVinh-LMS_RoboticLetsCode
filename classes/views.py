"""
Views cho Classes App
"""
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Class, ClassTeacher, ClassEnrollment
from .serializers import (
    ClassSerializer,
    ClassListSerializer,
    ClassTeacherSerializer,
    ClassEnrollmentSerializer,
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
    filterset_fields = ['status', 'subcourse', 'start_date']
    search_fields = ['name', 'code', 'subcourse__title']
    ordering_fields = ['start_date', 'created_at', 'name']
    ordering = ['-start_date']
    
    def get_queryset(self):
        """Filter theo role"""
        user = self.request.user
        
        # Admin xem tất cả
        if user.is_staff or user.is_superuser:
            return Class.objects.all().select_related('subcourse', 'created_by')
        
        # Teacher xem lớp mình dạy
        if hasattr(user, 'profile') and user.profile.role == 'TEACHER':
            return Class.objects.filter(
                teachers__teacher=user
            ).distinct().select_related('subcourse', 'created_by')
        
        # Student xem lớp mình học
        return Class.objects.filter(
            enrollments__student=user,
            enrollments__status='ACTIVE'
        ).distinct().select_related('subcourse', 'created_by')
    
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
    def student_progress(self, request, pk=None):
        """
        Xem tiến độ học tập của học viên trong lớp
        GET /api/classes/{id}/student_progress/
        Query params: ?student={id} để lọc theo học viên cụ thể
        """
        from content.models import UserProgress
        
        class_obj = self.get_object()
        student_id = request.query_params.get('student')
        
        # Lấy tất cả lessons trong subcourse của lớp
        lessons = class_obj.subcourse.lessons.filter(status='PUBLISHED')
        
        # Lấy danh sách học viên active trong lớp
        enrollments = class_obj.enrollments.filter(status='ACTIVE')
        
        if student_id:
            enrollments = enrollments.filter(student_id=student_id)
        
        # Tổng hợp tiến độ từng học viên
        results = []
        for enrollment in enrollments.select_related('student', 'student__profile'):
            # Lấy progress từ content.UserProgress
            completed_lessons = UserProgress.objects.filter(
                user=enrollment.student,
                lesson__in=lessons,
                is_completed=True
            ).count()
            
            # Lấy thông tin bài học gần nhất
            last_progress = UserProgress.objects.filter(
                user=enrollment.student,
                lesson__in=lessons
            ).order_by('-updated_at').first()
            
            # Lấy danh sách slug của các bài học đã hoàn thành
            completed_lesson_slugs = list(
                UserProgress.objects.filter(
                    user=enrollment.student,
                    lesson__in=lessons,
                    is_completed=True
                ).values_list('lesson__slug', flat=True)
            )
            
            total_lessons = lessons.count()
            completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
            
            results.append({
                'student_id': enrollment.student.id,
                'student_username': enrollment.student.username,
                'student_name': enrollment.student.profile.full_name if hasattr(enrollment.student, 'profile') else '',
                'enrollment_status': enrollment.status,
                'enrolled_at': enrollment.enrolled_at,
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'completion_percentage': round(completion_percentage, 2),
                'last_activity': last_progress.updated_at if last_progress else None,
                'last_lesson': last_progress.lesson.title if last_progress else None,
                'completed_lesson_slugs': completed_lesson_slugs,
            })
        
        return Response(results)
    
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

    @action(detail=True, methods=['post'])
    def mark_lesson_complete(self, request, pk=None):
        """
        Giáo viên/Quản trị đánh dấu hoàn thành bài học cho HỌC VIÊN trong lớp.
        POST /api/classes/{id}/mark_lesson_complete/
        Body: {"student_id": 123, "lesson_slug": "intro-motors"}
        """
        # Kiểm tra quyền: chỉ ADMIN/TEACHER
        if not (request.user.is_staff or 
                (hasattr(request.user, 'profile') and request.user.profile.role in ['ADMIN', 'TEACHER'])):
            return Response(
                {'error': 'Bạn không có quyền cập nhật tiến độ học viên'},
                status=status.HTTP_403_FORBIDDEN
            )

        class_obj = self.get_object()
        student_id = request.data.get('student_id')
        lesson_slug = request.data.get('lesson_slug')

        if not student_id or not lesson_slug:
            return Response(
                {'error': 'Thiếu student_id hoặc lesson_slug'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Xác thực học viên thuộc lớp và đang ACTIVE
        enrollment = class_obj.enrollments.filter(student_id=student_id, status='ACTIVE').first()
        if not enrollment:
            return Response(
                {'error': 'Học viên không thuộc lớp hoặc chưa được ghi danh'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Xác thực bài học thuộc subcourse của lớp
        from content.models import Lesson, UserProgress
        try:
            lesson = Lesson.objects.get(slug=lesson_slug, subcourse=class_obj.subcourse, status='PUBLISHED')
        except Lesson.DoesNotExist:
            return Response(
                {'error': 'Không tìm thấy bài học trong khóa học của lớp'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Cập nhật hoặc tạo UserProgress cho học viên
        progress, created = UserProgress.objects.update_or_create(
            user_id=student_id,
            lesson=lesson,
            defaults={
                'is_completed': True,
                'completed_at': timezone.now()
            }
        )

        # Tính phần trăm hoàn thành cho học viên trong subcourse
        total_lessons = class_obj.subcourse.lessons.filter(status='PUBLISHED').count()
        completed_lessons = UserProgress.objects.filter(
            user_id=student_id,
            lesson__subcourse=class_obj.subcourse,
            is_completed=True
        ).count()

        completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

        return Response({
            'success': True,
            'message': 'Đã đánh dấu hoàn thành bài học cho học viên',
            'progress': {
                'student_id': student_id,
                'lesson_id': lesson.id,
                'lesson_title': lesson.title,
                'is_completed': progress.is_completed,
                'completed_at': progress.completed_at,
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'completion_percentage': round(completion_percentage, 2)
            }
        }, status=status.HTTP_200_OK)


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
