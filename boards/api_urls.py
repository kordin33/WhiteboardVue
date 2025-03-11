# Zastąp zawartość pliku boards/api_urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import BoardViewSet, ElementViewSet

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'elements', ElementViewSet, basename='element')

urlpatterns = [
    path('', include(router.urls)),
]