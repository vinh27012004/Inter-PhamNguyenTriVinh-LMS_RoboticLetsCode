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
    MediaViewSet,
    LessonObjectiveViewSet,
    LessonModelViewSet,
    PreparationViewSet,
    BuildBlockViewSet,
    LessonContentBlockViewSet,
    LessonAttachmentViewSet,
    ChallengeViewSet,
    QuizViewSet,
    QuizSubmissionViewSet,
    LessonDetailViewSet,
)

# Tạo router cho DRF
router = DefaultRouter()

# Đăng ký ViewSets - Core Content
router.register(r'programs', ProgramViewSet, basename='program')
router.register(r'subcourses', SubcourseViewSet, basename='subcourse')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'progress', UserProgressViewSet, basename='userprogress')

# Media & Resources
router.register(r'media', MediaViewSet, basename='media')

# Lesson Content Components
router.register(r'objectives', LessonObjectiveViewSet, basename='lessonobjective')
router.register(r'models', LessonModelViewSet, basename='lessonmodel')
router.register(r'preparations', PreparationViewSet, basename='preparation')
router.register(r'build-blocks', BuildBlockViewSet, basename='buildblock')
router.register(r'content-blocks', LessonContentBlockViewSet, basename='lessoncontentblock')
router.register(r'attachments', LessonAttachmentViewSet, basename='lessonattachment')
router.register(r'challenges', ChallengeViewSet, basename='challenge')

# Quiz & Assessments
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'quiz-submissions', QuizSubmissionViewSet, basename='quizsubmission')

# Composite Endpoint (Full Lesson Detail)
router.register(r'lesson-details', LessonDetailViewSet, basename='lessondetail')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]
