import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import boards.routing  # Upewnij się, że ten import działa

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            boards.routing.websocket_urlpatterns
        )
    ),
})