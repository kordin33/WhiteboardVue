# Zastąp zawartość pliku boards/serializers.py

from rest_framework import serializers
from .models import Board, Element

class ElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = [
            'id', 'board', 'element_type', 'content', 'path', 
            'position_x', 'position_y', 'width', 'height', 
            'rotation', 'z_index', 'properties', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class BoardSerializer(serializers.ModelSerializer):
    elements_count = serializers.SerializerMethodField()
    serialized_state = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Board
        fields = ['id', 'title', 'created_at', 'updated_at', 'elements_count', 'serialized_state']
        read_only_fields = ['created_at', 'updated_at']

    def get_elements_count(self, obj):
        return obj.elements.count()

# Serializator eksportu elementów dla bardziej szczegółowego eksportu
class ElementExportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Element
        fields = [
            'id', 'element_type', 'content', 'path', 
            'position_x', 'position_y', 'width', 'height', 
            'rotation', 'z_index', 'properties'
        ]

# Serializator eksportu tablicy dla bardziej szczegółowego eksportu
class BoardExportSerializer(serializers.ModelSerializer):
    elements = ElementExportSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = ['id', 'title', 'elements', 'created_at', 'updated_at']