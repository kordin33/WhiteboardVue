from rest_framework import permissions
from .models import Board, Element, BoardPermission

class IsBoardOwnerOrHasPermission(permissions.BasePermission):
    """
    Custom permission to only allow owners of a board or users with permissions to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request with view permission
        # so we'll always allow GET, HEAD or OPTIONS requests for those
        if not isinstance(obj, Board):
            return False

        # Allow board owners full access
        if obj.owner == request.user:
            return True

        # Check if user has appropriate permission
        try:
            permission = BoardPermission.objects.get(board=obj, user=request.user)
            if request.method in permissions.SAFE_METHODS:
                # Allow any permission for read-only
                return True
            else:
                # For write operations, require 'edit' or 'admin' permission
                return permission.permission_type in ['edit', 'admin']
        except BoardPermission.DoesNotExist:
            return False

class IsElementBoardOwnerOrHasPermission(permissions.BasePermission):
    """
    Custom permission to only allow owners of an element's board or users with permissions to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request with view permission
        # so we'll always allow GET, HEAD or OPTIONS requests for those
        if not isinstance(obj, Element):
            return False

        board = obj.board

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

# Dla celów rozwojowych, można dodać permisję, która zawsze zwraca True
class AlwaysAllow(permissions.BasePermission):
    """
    Development permission that always allows access.
    Use ONLY for development and testing!
    """
    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        return True
    