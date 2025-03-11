from django.urls import path, re_path
from .consumers import BoardConsumer

# Trasy WebSocket
websocket_urlpatterns = [
    # Ogólny adres dla wszystkich połączeń WebSocket do tablicy
    path('ws/boards/<int:board_id>/', BoardConsumer.as_asgi()),

    # Obsługa różnych akcji na tablicy (opcjonalnie)
    # path('ws/boards/<int:board_id>/elements/', ElementConsumer.as_asgi()),
]