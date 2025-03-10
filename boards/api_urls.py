from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .api import BoardViewSet, ElementViewSet, BoardPermissionViewSet
from .auth import RegisterView, LoginView, UserDetailsView

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'elements', ElementViewSet, basename='element')
router.register(r'permissions', BoardPermissionViewSet, basename='boardpermission')

urlpatterns = [
    path('', include(router.urls)),

    # Endpointy autoryzacji
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserDetailsView.as_view(), name='user_details'),
]