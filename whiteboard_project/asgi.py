import os
from django.core.asgi import get_asgi_application

# Ustawienie zmiennej środowiskowej przed jakimkolwiek importem Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard_project.settings')

# Najpierw inicjalizujemy aplikację Django ASGI
django_asgi_app = get_asgi_application()

# Dopiero po inicjalizacji Django importujemy zależności Channels
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import boards.routing  # Import routing patterns

# Inicjalizacja aplikacji ASGI z odpowiednią kolejnością
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            boards.routing.websocket_urlpatterns
        )
    ),
})
