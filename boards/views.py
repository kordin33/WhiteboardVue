from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Board, Element, BoardPermission, ElementHistory, Template
from .serializers import (
    BoardSerializer, ElementSerializer, BoardPermissionSerializer,
    ElementHistorySerializer, TemplateSerializer
)
from .permissions import IsBoardOwnerOrHasPermission, IsElementBoardOwnerOrHasPermission

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Zwróć tablice, których użytkownik jest właścicielem lub ma uprawnienia
        owned_boards = Board.objects.filter(owner=user)
        shared_boards = Board.objects.filter(permissions__user=user)
        return (owned_boards | shared_boards).distinct().order_by('-updated_at')

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        board = self.get_object()
        if board.owner != request.user:
            return Response({"error": "Tylko właściciel może udostępniać tablicę"}, 
                           status=status.HTTP_403_FORBIDDEN)

        serializer = BoardPermissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(board=board)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def unshare(self, request, pk=None):
        board = self.get_object()
        if board.owner != request.user:
            return Response({"error": "Tylko właściciel może cofnąć udostępnianie"}, 
                           status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "Brak parametru user_id"}, 
                           status=status.HTTP_400_BAD_REQUEST)

        permission = get_object_or_404(BoardPermission, board=board, user_id=user_id)
        permission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        # Logika eksportu do PDF będzie implementowana w Vue.js
        # Ten endpoint jest tylko do weryfikacji uprawnień
        self.get_object()  # Sprawdza uprawnienia
        return Response({"status": "PDF export initiated"})

class ElementViewSet(viewsets.ModelViewSet):
    serializer_class = ElementSerializer
    permission_classes = [permissions.IsAuthenticated, IsElementBoardOwnerOrHasPermission]

    def get_queryset(self):
        board_id = self.kwargs.get('board_pk')
        return Element.objects.filter(board_id=board_id).order_by('z_index')

    def perform_create(self, serializer):
        board_id = self.kwargs.get('board_pk')
        board = get_object_or_404(Board, id=board_id)
        serializer.save(board=board, created_by=self.request.user)

        # Zapisz historię (dla undo/redo)
        ElementHistory.objects.create(
            element_id=serializer.instance.id,
            action_type='create',
            data=ElementSerializer(serializer.instance).data,
            performed_by=self.request.user
        )

    def perform_update(self, serializer):
        # Zapisz historię przed aktualizacją
        original_data = ElementSerializer(self.get_object()).data
        ElementHistory.objects.create(
            element=self.get_object(),
            action_type='update',
            data=original_data,
            performed_by=self.request.user
        )
        serializer.save()

    def perform_destroy(self, instance):
        # Zapisz historię przed usunięciem
        ElementHistory.objects.create(
            element=instance,
            action_type='delete',
            data=ElementSerializer(instance).data,
            performed_by=self.request.user
        )
        instance.delete()

    @action(detail=False, methods=['get'])
    def history(self, request, board_pk=None):
        board = get_object_or_404(Board, id=board_pk)
        elements = Element.objects.filter(board=board)
        history = ElementHistory.objects.filter(element__in=elements).order_by('-timestamp')

        # Opcjonalnie możemy ograniczyć ilość historii
        limit = int(request.query_params.get('limit', 100))
        history = history[:limit]

        serializer = ElementHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def undo(self, request, board_pk=None):
        # Implementacja logiki undo
        board = get_object_or_404(Board, id=board_pk)
        # Znajdź najnowszą akcję dla tablicy
        last_action = ElementHistory.objects.filter(
            element__board=board,
            performed_by=request.user
        ).order_by('-timestamp').first()

        if not last_action:
            return Response({"error": "Brak akcji do cofnięcia"}, 
                           status=status.HTTP_404_NOT_FOUND)

        # Logika cofania w zależności od typu akcji
        if last_action.action_type == 'create':
            # Usuń element, który został utworzony
            last_action.element.delete()
        elif last_action.action_type == 'update':
            # Przywróć poprzedni stan elementu
            element = last_action.element
            previous_data = last_action.data
            for key, value in previous_data.items():
                if key not in ['id', 'created_at', 'updated_at', 'created_by']:
                    setattr(element, key, value)
            element.save()
        elif last_action.action_type == 'delete':
            # Odtwórz usunięty element
            deleted_data = last_action.data
            Element.objects.create(
                board_id=board_pk,
                **{k: v for k, v in deleted_data.items() 
                   if k not in ['id', 'created_at', 'updated_at', 'created_by', 'board']}
            )

        # Usuń wpis historii
        last_action.delete()

        return Response({"status": "Akcja cofnięta pomyślnie"})

class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Zwraca szablony użytkownika oraz publiczne
        user = self.request.user
        return Template.objects.filter(
            created_by=user
        ) | Template.objects.filter(is_public=True)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        template = self.get_object()
        board_id = request.data.get('board_id')

        if not board_id:
            return Response({"error": "Brak parametru board_id"}, 
                           status=status.HTTP_400_BAD_REQUEST)

        board = get_object_or_404(Board, id=board_id)

        # Sprawdź uprawnienia do tablicy
        has_permission = (
            board.owner == request.user or 
            BoardPermission.objects.filter(
                board=board, 
                user=request.user,
                permission_type__in=['edit', 'admin']
            ).exists()
        )

        if not has_permission:
            return Response({"error": "Brak uprawnień do tej tablicy"}, 
                           status=status.HTTP_403_FORBIDDEN)

        # Skopiuj elementy szablonu do tablicy
        for template_element in template.elements.all():
            element_data = ElementSerializer(template_element).data
            element_data.pop('id', None)
            element_data.pop('created_at', None)
            element_data.pop('updated_at', None)
            element_data.pop('created_by', None)
            element_data.pop('board', None)

            Element.objects.create(
                board=board,
                created_by=request.user,
                **element_data
            )

        return Response({"status": "Szablon zastosowany"})