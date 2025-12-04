"""
URL Configuration cho User Auth API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserProfileViewSet,
    AuthAssignmentViewSet,
    CurrentUserViewSet,
)

# Tạo router cho DRF
router = DefaultRouter()

# Đăng ký ViewSets
router.register(r'profile', UserProfileViewSet, basename='userprofile')
router.register(r'assignments', AuthAssignmentViewSet, basename='authassignment')
router.register(r'me', CurrentUserViewSet, basename='currentuser')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# API Endpoints được tạo ra:
# /api/auth/profile/ - User profile
# /api/auth/profile/me/ - GET profile của user hiện tại
# /api/auth/assignments/ - Danh sách quyền của user
# /api/auth/assignments/{id}/ - Chi tiết 1 assignment
# /api/auth/assignments/my_programs/ - Danh sách Program IDs có quyền
# /api/auth/assignments/my_subcourses/ - Danh sách Subcourse IDs có quyền
# /api/auth/me/ - Thông tin user + profile + assignments
# /api/auth/me/info/ - GET thông tin đầy đủ user hiện tại
#
# LƯU Ý: Quản lý phân quyền (AuthAssignment) được thực hiện qua Django Admin Panel
