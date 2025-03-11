# Zastąp zawartość pliku boards/api.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Board, Element
from .serializers import BoardSerializer, ElementSerializer, BoardExportSerializer
import json

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

    @action(detail=True, methods=['get'])
    def elements(self, request, pk=None):
        board = self.get_object()
        elements = Element.objects.filter(board=board)
        serializer = ElementSerializer(elements, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def import_state(self, request, pk=None):
        board = self.get_object()
        try:
            data = request.data
            board.update_from_json(data)
            return Response({"status": "success"})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def export_state(self, request, pk=None):
        board = self.get_object()
        data = board.serialize_to_json()
        return Response(data)

class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

    def get_queryset(self):
        # Filtruj elementy według tablicy, jeśli board_id jest podane
        board_id = self.request.query_params.get('board_id')
        if board_id:
            return Element.objects.filter(board_id=board_id)
        return Element.objects.all()

    def perform_create(self, serializer):
        board_id = self.request.data.get('board')
        board = get_object_or_404(Board, id=board_id)
        serializer.save()