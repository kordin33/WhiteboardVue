from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from boards.vue_views import vue_app_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('boards.api_urls')),  # API endpoints
    path('api-auth/', include('rest_framework.urls')),  # DRF login
    path('accounts/', include('django.contrib.auth.urls')),  # Auth views

    # Original Django views (to keep backwards compatibility)
    path('django/', include('boards.urls')),

    # Vue.js app - catch all routes for SPA
    re_path(r'^$', vue_app_view, name='vue_app'),
    re_path(r'^(?!admin|api|api-auth|accounts|django|static|media).*$', vue_app_view, name='vue_app_routes'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)