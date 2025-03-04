import os
import django

# Set Django settings before anything else
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard_project.settings')

# Initialize Django
django.setup()

# Now import other dependencies
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import boards.routing

# Initialize application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            boards.routing.websocket_urlpatterns
        )
    ),
})