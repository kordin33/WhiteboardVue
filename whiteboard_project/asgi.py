"""
ASGI config for whiteboard_project.
"""

import os
import django
from django.core.asgi import get_asgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard_project.settings')

# Initialize Django first - MUST happen before any models or ORM imports
django.setup()

# Now import routing after Django is fully set up
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
