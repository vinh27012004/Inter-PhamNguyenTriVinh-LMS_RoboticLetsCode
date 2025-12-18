"""
Views (ViewSets) cho User Auth API
Quản lý UserProfile và AuthAssignment
"""
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User

from .models import UserProfile, AuthAssignment
from .serializers import (
    UserProfileSerializer,
    UserSerializer,
    AuthAssignmentSerializer,
    AuthAssignmentListSerializer,
    UserWithAssignmentsSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
)
class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho UserProfile
    User chỉ xem profile của chính mình
    
    Endpoints:
    - GET /api/profile/ - Profile của user hiện tại
    - GET /api/profile/me/ - Profile của user hiện tại
    - PUT /api/profile/me/update/ - Cập nhật profile
    - POST /api/profile/me/change_password/ - Đổi mật khẩu
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Chỉ trả về profile của user hiện tại
        """
        user = self.request.user
        return UserProfile.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Custom action: Lấy profile của user hiện tại
        GET /api/profile/me/
        """
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """
        Cập nhật thông tin profile
        PUT/PATCH /api/profile/update_profile/
        """
        try:
            profile = request.user.profile
            serializer = UpdateProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # Trả về profile đầy đủ
                full_serializer = UserProfileSerializer(profile)
                return Response(full_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Đổi mật khẩu
        POST /api/profile/change_password/
        Body: {
            "old_password": "...",
            "new_password": "...",
            "confirm_password": "..."
        }
        """
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Kiểm tra mật khẩu cũ
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Mật khẩu cũ không đúng'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Đặt mật khẩu mới
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {'message': 'Đổi mật khẩu thành công'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AuthAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho AuthAssignment (Phân quyền)
    QUAN TRỌNG: API này cho Frontend biết User được phép học gì
    
    Endpoints:
    - GET /api/assignments/ - Danh sách quyền của user hiện tại
    - GET /api/assignments/{id}/ - Chi tiết 1 assignment
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'program', 'subcourse']
    ordering_fields = ['created_at', 'valid_from', 'valid_until']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        LOGIC QUAN TRỌNG:
        - Chỉ trả về assignments của user hiện tại (self.request.user)
        - Chỉ lấy các assignment có status='ACTIVE'
        - Sắp xếp theo created_at giảm dần (mới nhất trước)
        - Tối ưu với select_related để giảm queries
        """
        user = self.request.user
        
        # Xử lý trường hợp AnonymousUser (chưa đăng nhập)
        if not user.is_authenticated:
            return AuthAssignment.objects.none()
        
        return AuthAssignment.objects.filter(
            user=user,
            status='ACTIVE'
        ).select_related(
            'program',
            'subcourse',
            'user__profile',
            'assigned_by'
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        """
        List: Rút gọn
        Detail: Đầy đủ
        """
        if self.action == 'list':
            return AuthAssignmentListSerializer
        return AuthAssignmentSerializer
    
    @action(detail=False, methods=['get'])
    def my_programs(self, request):
        """
        Custom action: Lấy danh sách Programs mà user có quyền truy cập
        GET /api/assignments/my_programs/
        """
        user = request.user
        
        # Lấy các assignments active của user
        assignments = AuthAssignment.objects.filter(
            user=user,
            status='ACTIVE'
        ).select_related('program', 'subcourse')
        
        # Tập hợp các program IDs
        program_ids = set()
        for assignment in assignments:
            if assignment.program:
                program_ids.add(assignment.program.id)
            elif assignment.subcourse:
                program_ids.add(assignment.subcourse.program.id)
        
        return Response({
            'program_ids': list(program_ids),
            'total_programs': len(program_ids)
        })
    
    @action(detail=False, methods=['get'])
    def my_subcourses(self, request):
        """
        Custom action: Lấy danh sách Subcourses mà user có quyền truy cập
        GET /api/assignments/my_subcourses/
        GET /api/assignments/my_subcourses/?program_id=1  # Filter theo program
        """
        user = request.user
        program_id = request.query_params.get('program_id')
        
        # Lấy các assignments active của user
        assignments = AuthAssignment.objects.filter(
            user=user,
            status='ACTIVE'
        ).select_related('program', 'subcourse').prefetch_related('program__subcourses')
        
        # Tập hợp các subcourse IDs
        subcourse_ids = set()
        for assignment in assignments:
            if assignment.subcourse:
                # Gán trực tiếp 1 subcourse
                if program_id:
                    # Filter theo program nếu có
                    if str(assignment.subcourse.program_id) == program_id:
                        subcourse_ids.add(assignment.subcourse.id)
                else:
                    subcourse_ids.add(assignment.subcourse.id)
            elif assignment.program:
                # Gán cả program -> có quyền tất cả subcourses
                if program_id:
                    # Filter theo program nếu có
                    if str(assignment.program.id) == program_id:
                        for subcourse in assignment.program.subcourses.all():
                            subcourse_ids.add(subcourse.id)
                else:
                    for subcourse in assignment.program.subcourses.all():
                        subcourse_ids.add(subcourse.id)
        
        return Response({
            'subcourse_ids': list(subcourse_ids),
            'total_subcourses': len(subcourse_ids)
        })


class CurrentUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cho User hiện tại kèm assignments
    
    Endpoints:
    - GET /api/me/ - Thông tin user + profile + assignments
    """
    serializer_class = UserWithAssignmentsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Chỉ trả về user hiện tại
        """
        user = self.request.user
        return User.objects.filter(id=user.id).prefetch_related(
            'profile',
            'auth_assignments',
            'auth_assignments__program',
            'auth_assignments__subcourse'
        )
    
    @action(detail=False, methods=['get'])
    def info(self, request):
        """
        Custom action: Lấy thông tin đầy đủ của user hiện tại
        GET /api/me/info/
        """
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)
