from django.contrib import admin
from .models import Board, Element, BoardPermission

admin.site.register(Board)
admin.site.register(Element)
admin.site.register(BoardPermission)