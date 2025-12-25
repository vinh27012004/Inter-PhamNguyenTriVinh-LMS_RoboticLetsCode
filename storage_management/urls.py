"""
URL Configuration cho Storage Management API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StorageFileViewSet

# Tạo router cho DRF
router = DefaultRouter()
router.register(r'files', StorageFileViewSet, basename='storagefile')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

