# Zastąp całą zawartość pliku boards/models.py

from django.db import models

class Board(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    serialized_state = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

    def serialize_to_json(self):
        """Serializuj całą tablicę z jej elementami do JSONa"""
        elements = self.elements.all()
        elements_data = []

        for element in elements:
            element_data = {
                'id': element.id,
                'element_type': element.element_type,
                'content': element.content,
                'path': element.path,
                'position_x': element.position_x,
                'position_y': element.position_y,
                'width': element.width,
                'height': element.height,
                'rotation': element.rotation,
                'z_index': element.z_index,
                'properties': element.properties
            }
            elements_data.append(element_data)

        board_data = {
            'id': self.id,
            'title': self.title,
            'elements': elements_data,
            'last_updated': self.updated_at.isoformat()
        }

        return board_data

    def update_from_json(self, data):
        """Zaktualizuj tablicę i elementy z danych JSON"""
        # Aktualizuj właściwości tablicy
        if 'title' in data:
            self.title = data['title']

        # Najpierw zapisz tablicę
        self.save()

        # Obsługa elementów
        if 'elements' in data:
            existing_element_ids = set(self.elements.values_list('id', flat=True))
            updated_element_ids = set()

            # Aktualizuj lub twórz elementy
            for element_data in data['elements']:
                element_id = element_data.get('id')

                if element_id and Element.objects.filter(id=element_id, board=self).exists():
                    # Aktualizacja istniejącego elementu
                    element = Element.objects.get(id=element_id)

                    # Aktualizacja pól
                    element.element_type = element_data.get('element_type', element.element_type)
                    element.content = element_data.get('content', element.content)
                    element.path = element_data.get('path', element.path)
                    element.position_x = element_data.get('position_x', element.position_x)
                    element.position_y = element_data.get('position_y', element.position_y)
                    element.width = element_data.get('width', element.width)
                    element.height = element_data.get('height', element.height)
                    element.rotation = element_data.get('rotation', element.rotation)
                    element.z_index = element_data.get('z_index', element.z_index)
                    element.properties = element_data.get('properties', element.properties)

                    element.save()
                    updated_element_ids.add(element.id)
                else:
                    # Tworzenie nowego elementu
                    new_element = Element(
                        board=self,
                        element_type=element_data.get('element_type', ''),
                        content=element_data.get('content', ''),
                        path=element_data.get('path', ''),
                        position_x=element_data.get('position_x', 0),
                        position_y=element_data.get('position_y', 0),
                        width=element_data.get('width', 100),
                        height=element_data.get('height', 100),
                        rotation=element_data.get('rotation', 0),
                        z_index=element_data.get('z_index', 0),
                        properties=element_data.get('properties', {})
                    )
                    new_element.save()
                    updated_element_ids.add(new_element.id)

            # Usuń elementy, których nie ma już w danych
            elements_to_delete = existing_element_ids - updated_element_ids
            if elements_to_delete:
                Element.objects.filter(id__in=elements_to_delete).delete()

        return self

class Element(models.Model):
    ELEMENT_TYPES = (
        ('text', 'Tekst'),
        ('image', 'Obraz'),
        ('shape', 'Kształt'),
        ('sticky', 'Notatka'),
        ('line', 'Linia'),
        ('path', 'Rysunek odręczny'),
    )

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='elements')
    element_type = models.CharField(max_length=20, choices=ELEMENT_TYPES)
    content = models.TextField(blank=True, null=True)  # Dla tekstu
    image = models.ImageField(upload_to='board_images/', blank=True, null=True)  # Dla obrazów
    path = models.TextField(blank=True, null=True)  # Dla rysunków odręcznych - ścieżka SVG
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    width = models.FloatField(default=100)
    height = models.FloatField(default=100)
    rotation = models.FloatField(default=0)
    z_index = models.IntegerField(default=0)
    properties = models.JSONField(default=dict, blank=True)  # Dla dodatkowych właściwości
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.element_type} on {self.board.title}"