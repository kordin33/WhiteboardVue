# Zastąp zawartość pliku whiteboard_project/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import JsonResponse

# Funkcja testowa dla API
def api_test_view(request):
    return JsonResponse({
        'status': 'success',
        'message': 'API działa poprawnie',
        'serverInfo': {
            'djangoVersion': settings.DJANGO_VERSION if hasattr(settings, 'DJANGO_VERSION') else 'unknown'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('boards.api_urls')),  # API endpoints

    # Endpoint testowy dla sprawdzenia działania API
    path('api/test/', api_test_view, name='api_test'),

    # Przekierowanie głównej strony do frontendu
    path('', RedirectView.as_view(url='/boards/', permanent=False)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)