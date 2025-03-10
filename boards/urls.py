from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import BoardViewSet, ElementViewSet, TemplateViewSet

# Główny router
router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'templates', TemplateViewSet, basename='template')

# Zagnieżdżony router dla elementów tablicy
boards_router = routers.NestedSimpleRouter(router, r'boards', lookup='board')
boards_router.register(r'elements', ElementViewSet, basename='board-element')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(boards_router.urls)),
]