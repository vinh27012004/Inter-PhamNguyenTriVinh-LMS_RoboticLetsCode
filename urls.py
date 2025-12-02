"""
URL configuration for E-Robotic Let's Code project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # REST API Endpoints
    path('api/content/', include('content.urls')),
    path('api/auth/', include('user_auth.urls')),
    
    # DRF Authentication (Login/Logout trong Browsable API)
    path('api-auth/', include('rest_framework.urls')),
]

# Tổng hợp API Endpoints:
# ==========================
# ADMIN:
# /admin/ - Django Admin Panel
#
# CONTENT API:
# /api/content/programs/ - Danh sách chương trình học
# /api/content/programs/{id}/ - Chi tiết chương trình
# /api/content/subcourses/ - Danh sách khóa học
# /api/content/subcourses/{id}/ - Chi tiết khóa học
# /api/content/lessons/ - Danh sách bài học
# /api/content/lessons/{id}/ - Chi tiết bài học
# /api/content/lessons/{id}/mark_complete/ - Đánh dấu hoàn thành bài học
# /api/content/progress/ - Tiến độ học tập của user
#
# AUTH API:
# /api/auth/profile/ - Thông tin profile
# /api/auth/profile/me/ - Profile của user hiện tại
# /api/auth/assignments/ - Quyền truy cập của user
# /api/auth/assignments/my_programs/ - Program IDs có quyền
# /api/auth/assignments/my_subcourses/ - Subcourse IDs có quyền
# /api/auth/me/ - Thông tin user đầy đủ
# /api/auth/me/info/ - GET user info
#
# DRF AUTH:
# /api-auth/login/ - Login trong Browsable API
# /api-auth/logout/ - Logout trong Browsable API
