"""
URL Configuration cho Content API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ProgramViewSet,
    SubcourseViewSet,
    LessonViewSet,
    UserProgressViewSet,
)

# Tạo router cho DRF
router = DefaultRouter()

# Đăng ký ViewSets
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'subcourses', SubcourseViewSet, basename='subcourse')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'progress', UserProgressViewSet, basename='userprogress')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# API Endpoints được tạo ra:
# /api/content/programs/ - List all programs
# /api/content/programs/{id}/ - Program detail
# /api/content/subcourses/ - List all subcourses
# /api/content/subcourses/{id}/ - Subcourse detail
# /api/content/lessons/ - List all lessons
# /api/content/lessons/{id}/ - Lesson detail
# /api/content/lessons/{id}/mark_complete/ - POST để đánh dấu hoàn thành
# /api/content/progress/ - User's learning progress
# /api/content/progress/{id}/ - Progress detail
