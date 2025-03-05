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