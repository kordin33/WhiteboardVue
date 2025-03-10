from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Board, Element, BoardPermission
from .serializers import BoardSerializer, ElementSerializer, BoardPermissionSerializer

class IsOwnerOrHasPermission(permissions.BasePermission):
    """
    Custom permission to only allow owners of a board or users with permissions to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request with view permission
        # so we'll always allow GET, HEAD or OPTIONS requests for those
        if isinstance(obj, Board):
            board = obj
        elif isinstance(obj, Element):
            board = obj.board
        elif isinstance(obj, BoardPermission):
            board = obj.board
        else:
            return False

        # Allow board owners full access
        if board.owner == request.user:
            return True

        # Check if user has appropriate permission
        try:
            permission = BoardPermission.objects.get(board=board, user=request.user)
            if request.method in permissions.SAFE_METHODS:
                # Allow any permission for read-only
                return True
            else:
                # For write operations, require 'edit' or 'admin' permission
                return permission.permission_type in ['edit', 'admin']
        except BoardPermission.DoesNotExist:
            return False

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Boards created by user + boards shared with user
        return Board.objects.filter(
            Q(owner=user) | 
            Q(permissions__user=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'elements', 'permissions']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrHasPermission]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def elements(self, request, pk=None):
        board = self.get_object()
        elements = Element.objects.filter(board=board)
        serializer = ElementSerializer(elements, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def permissions(self, request, pk=None):
        board = self.get_object()

        if request.method == 'GET':
            permissions = BoardPermission.objects.filter(board=board)
            serializer = BoardPermissionSerializer(permissions, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            # Only owner and admin can add permissions
            if board.owner != request.user and not BoardPermission.objects.filter(
                board=board, user=request.user, permission_type='admin'
            ).exists():
                return Response(
                    {"detail": "Tylko właściciel lub administrator może zarządzać uprawnieniami."},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = BoardPermissionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(board=board)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ElementViewSet(viewsets.ModelViewSet):
    serializer_class = ElementSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrHasPermission]

    def get_queryset(self):
        # Filter elements by board if board_id is provided
        board_id = self.request.query_params.get('board_id')
        if board_id:
            return Element.objects.filter(board_id=board_id)

        # Otherwise return elements from boards user has access to
        user = self.request.user
        boards = Board.objects.filter(
            Q(owner=user) | 
            Q(permissions__user=user)
        ).distinct()
        return Element.objects.filter(board__in=boards)

    def perform_create(self, serializer):
        board_id = self.request.data.get('board')
        board = get_object_or_404(Board, id=board_id)

        # Check permissions
        if board.owner != self.request.user and not BoardPermission.objects.filter(
            board=board, user=self.request.user, permission_type__in=['edit', 'admin']
        ).exists():
            raise permissions.PermissionDenied("Nie masz uprawnień do edycji tej tablicy.")

        serializer.save(created_by=self.request.user)

class BoardPermissionViewSet(viewsets.ModelViewSet):
    serializer_class = BoardPermissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrHasPermission]

    def get_queryset(self):
        # Admin or owners can see all permissions
        user = self.request.user
        admin_or_owner_boards = Board.objects.filter(
            Q(owner=user) | 
            Q(permissions__user=user, permissions__permission_type='admin')
        ).distinct()

        return BoardPermission.objects.filter(board__in=admin_or_owner_boards)