# Zastąp zawartość pliku boards/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Board, Element

class BoardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.board_id = self.scope['url_route']['kwargs']['board_id']
        self.board_group_name = f'board_{self.board_id}'

        # Akceptuj połączenie bez sprawdzania uwierzytelnienia
        await self.channel_layer.group_add(
            self.board_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Opuszczenie grupy tablicy
        await self.channel_layer.group_discard(
            self.board_group_name,
            self.channel_name
        )

    # Odbieranie wiadomości od WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'create_element':
            element_data = data.get('element')
            element_id = await self.create_element(element_data)

            # Wysyłanie informacji do wszystkich członków grupy
            await self.channel_layer.group_send(
                self.board_group_name,
                {
                    'type': 'board_event',
                    'action': 'create_element',
                    'element': {**element_data, 'id': element_id}
                }
            )

        elif action == 'update_element':
            element_data = data.get('element')
            success = await self.update_element(element_data)

            if success:
                await self.channel_layer.group_send(
                    self.board_group_name,
                    {
                        'type': 'board_event',
                        'action': 'update_element',
                        'element': element_data
                    }
                )

        elif action == 'delete_element':
            element_id = data.get('element_id')
            success = await self.delete_element(element_id)

            if success:
                await self.channel_layer.group_send(
                    self.board_group_name,
                    {
                        'type': 'board_event',
                        'action': 'delete_element',
                        'element_id': element_id
                    }
                )

    # Obsługa zdarzeń z kanału
    async def board_event(self, event):
        # Wysyłanie wiadomości do WebSocket
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'element': event.get('element'),
            'element_id': event.get('element_id')
        }))

    @database_sync_to_async
    def create_element(self, element_data):
        board = Board.objects.get(id=self.board_id)
        element = Element.objects.create(
            board=board,
            element_type=element_data.get('element_type'),
            content=element_data.get('content'),
            position_x=element_data.get('position_x', 0),
            position_y=element_data.get('position_y', 0),
            width=element_data.get('width', 100),
            height=element_data.get('height', 100),
            rotation=element_data.get('rotation', 0),
            z_index=element_data.get('z_index', 0),
            properties=element_data.get('properties', {}),
            path=element_data.get('path')
        )
        return element.id

    @database_sync_to_async
    def update_element(self, element_data):
        try:
            element_id = element_data.get('id')
            element = Element.objects.get(id=element_id, board_id=self.board_id)

            # Aktualizacja właściwości
            if 'content' in element_data:
                element.content = element_data['content']
            if 'position_x' in element_data:
                element.position_x = element_data['position_x']
            if 'position_y' in element_data:
                element.position_y = element_data['position_y']
            if 'width' in element_data:
                element.width = element_data['width']
            if 'height' in element_data:
                element.height = element_data['height']
            if 'rotation' in element_data:
                element.rotation = element_data['rotation']
            if 'z_index' in element_data:
                element.z_index = element_data['z_index']
            if 'properties' in element_data:
                element.properties = element_data['properties']
            if 'path' in element_data:
                element.path = element_data['path']

            element.save()
            return True
        except Element.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_element(self, element_id):
        try:
            element = Element.objects.get(id=element_id, board_id=self.board_id)
            element.delete()
            return True
        except Element.DoesNotExist:
            return False