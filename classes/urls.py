"""
URLs cho Classes App
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassViewSet, ClassEnrollmentViewSet

router = DefaultRouter()
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'enrollments', ClassEnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
