from django.urls import path
from . import views

urlpatterns = [
    path('', views.board_list, name='board_list'),
    path('create/', views.create_board, name='create_board'),
    path('<int:board_id>/', views.board_detail, name='board_detail'),
    path('api/<int:board_id>/elements/', views.api_elements, name='api_elements'),
    path('api/<int:board_id>/elements/<int:element_id>/', views.api_element_detail, name='api_element_detail'),
]