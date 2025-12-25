"""
URL configuration for E-Robotic Let's Code project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # REST API Endpoints
    path('api/content/', include('content.urls')),
    path('api/auth/', include('user_auth.urls')),
    path('api/', include('classes.urls')),  # Classes management
    path('api/storage/', include('storage_management.urls')),  # Storage management
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # DRF Authentication (Login/Logout trong Browsable API)
    path('api-auth/', include('rest_framework.urls')),
]

# Tổng hợp API Endpoints:
# ==========================
# ADMIN:
# /admin/ - Django Admin Panel
#
# JWT AUTHENTICATION:
# /api/token/ - Lấy access & refresh token (POST: username, password)
# /api/token/refresh/ - Refresh access token (POST: refresh)
#
# CONTENT API:
# /api/content/programs/ - Danh sách chương trình học
# /api/content/programs/{slug}/ - Chi tiết chương trình
# /api/content/subcourses/ - Danh sách khóa học
# /api/content/subcourses/{id}/ - Chi tiết khóa học (requires auth)
# /api/content/lessons/ - Danh sách bài học
# /api/content/lessons/{id}/ - Chi tiết bài học (requires auth)
# /api/content/lessons/{id}/mark_complete/ - Đánh dấu hoàn thành bài học
# /api/content/progress/ - Tiến độ học tập của user
#
# AUTH API:
# /api/auth/profile/ - Thông tin profile
# /api/auth/profile/me/ - Profile của user hiện tại
# /api/auth/assignments/ - Quyền truy cập của user
# /api/auth/assignments/my_programs/ - Program IDs có quyền
#
# CLASSES API:
# /api/classes/ - Danh sách lớp học (filtered by role)
# /api/classes/{id}/ - Chi tiết lớp
# /api/classes/{id}/students/ - Danh sách học viên
# /api/classes/{id}/progress/ - Tiến độ học viên trong lớp
# /api/classes/{id}/enroll_student/ - Ghi danh học viên (admin/teacher)
# /api/enrollments/ - Danh sách ghi danh
# /api/progress/ - Tiến độ học tập
# /api/auth/assignments/my_subcourses/ - Subcourse IDs có quyền
# /api/auth/me/ - Thông tin user đầy đủ
# /api/auth/me/info/ - GET user info
#
# DRF AUTH:
# /api-auth/login/ - Login trong Browsable API
# /api-auth/logout/ - Logout trong Browsable API
