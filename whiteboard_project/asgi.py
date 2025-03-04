
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import boards.routing  # Import routing patterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard_project.settings')

# Inicjalizacja aplikacji ASGI
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            boards.routing.websocket_urlpatterns
        )
    ),
})
