from django.db import models
from django.contrib.auth.models import User

class Board(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='boards')

    def __str__(self):
        return self.title

class Element(models.Model):
    ELEMENT_TYPES = (
        ('text', 'Tekst'),
        ('image', 'Obraz'),
        ('shape', 'Kształt'),
        ('sticky', 'Notatka'),
        ('line', 'Linia'),
        ('path', 'Rysunek odręczny'),  # Dodano nowy typ dla rysunków odręcznych
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
    properties = models.JSONField(default=dict, blank=True)  # Do przechowywania dodatkowych właściwości
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_elements')

    def __str__(self):
        return f"{self.element_type} on {self.board.title}"

class BoardPermission(models.Model):
    PERMISSION_TYPES = (
        ('view', 'Podgląd'),
        ('edit', 'Edycja'),
        ('admin', 'Administrator'),
    )

    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='board_permissions')
    permission_type = models.CharField(max_length=10, choices=PERMISSION_TYPES, default='view')

    class Meta:
        unique_together = ('board', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.permission_type} - {self.board.title}"
# Dodaj te modele do istniejącego pliku models.py
class ElementHistory(models.Model):
    ACTION_TYPES = (
        ('create', 'Utworzenie'),
        ('update', 'Aktualizacja'),
        ('delete', 'Usunięcie'),
    )

    element = models.ForeignKey(
        'Element', on_delete=models.CASCADE, 
        related_name='history', null=True
    )
    action_type = models.CharField(max_length=10, choices=ACTION_TYPES)
    data = models.JSONField()  # Przechowuje pełny stan elementu
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='element_history'
    )

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.get_action_type_display()} elementu {self.element_id}"

class Template(models.Model):
    CATEGORY_CHOICES = (
        ('math', 'Matematyka'),
        ('physics', 'Fizyka'),
        ('biology', 'Biologia'),
        ('chemistry', 'Chemia'),
        ('general', 'Ogólne'),
        ('other', 'Inne'),
    )

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    thumbnail = models.ImageField(upload_to='template_thumbnails/', null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='templates'
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TemplateElement(models.Model):
    template = models.ForeignKey(Template, on_delete=models.CASCADE, related_name='elements')
    element_type = models.CharField(max_length=20, choices=Element.ELEMENT_TYPES)
    content = models.TextField(blank=True, null=True)
    path = models.TextField(blank=True, null=True)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    width = models.FloatField(default=100)
    height = models.FloatField(default=100)
    rotation = models.FloatField(default=0)
    z_index = models.IntegerField(default=0)
    properties = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.element_type} in {self.template.name}"

# boards/permissions.py
from rest_framework import permissions

class IsBoardOwnerOrHasPermission(permissions.BasePermission):
    """
    Pozwala na operacje tylko właścicielowi tablicy lub użytkownikom z odpowiednimi uprawnieniami.
    """
    def has_object_permission(self, request, view, obj):
        # Sprawdź czy użytkownik jest właścicielem
        if obj.owner == request.user:
            return True

        # Sprawdź uprawnienia
        if request.method in permissions.SAFE_METHODS:
            # Odczyt - wystarczy uprawnienie do oglądania
            return BoardPermission.objects.filter(
                board=obj, 
                user=request.user,
                permission_type__in=['view', 'edit', 'admin']
            ).exists()
        else:
            # Zapis - wymagane uprawnienie do edycji lub admin
            return BoardPermission.objects.filter(
                board=obj, 
                user=request.user, 
                permission_type__in=['edit', 'admin']
            ).exists()

class IsElementBoardOwnerOrHasPermission(permissions.BasePermission):
    """
    Pozwala na operacje na elementach tylko właścicielowi tablicy lub użytkownikom
    z odpowiednimi uprawnieniami do tablicy, do której należy element.
    """
    def has_permission(self, request, view):
        board_pk = view.kwargs.get('board_pk')
        if not board_pk:
            return False

        board = get_object_or_404(Board, pk=board_pk)

        # Sprawdź czy użytkownik jest właścicielem tablicy
        if board.owner == request.user:
            return True

        # Sprawdź uprawnienia do tablicy
        if request.method in permissions.SAFE_METHODS:
            # Odczyt - wystarczy uprawnienie do oglądania
            return BoardPermission.objects.filter(
                board=board, 
                user=request.user,
                permission_type__in=['view', 'edit', 'admin']
            ).exists()
        else:
            # Zapis - wymagane uprawnienie do edycji lub admin
            return BoardPermission.objects.filter(
                board=board, 
                user=request.user, 
                permission_type__in=['edit', 'admin']
            ).exists()

    def has_object_permission(self, request, view, obj):
        # Wywołamy has_permission, aby sprawdzić uprawnienia do tablicy
        return self.has_permission(request, view)