from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Board, Element, BoardPermission
import json

@login_required
def board_list(request):
    # Tablice stworzone przez użytkownika
    owned_boards = Board.objects.filter(owner=request.user)

    # Tablice z uprawnieniami
    shared_boards = Board.objects.filter(permissions__user=request.user).exclude(owner=request.user)

    return render(request, 'boards/board_list.html', {
        'owned_boards': owned_boards,
        'shared_boards': shared_boards
    })

@login_required
def create_board(request):
    if request.method == 'POST':
        title = request.POST.get('title', 'Nowa tablica')
        board = Board.objects.create(title=title, owner=request.user)
        return redirect('board_detail', board_id=board.id)

    return render(request, 'boards/create_board.html')

@login_required
def board_detail(request, board_id):
    board = get_object_or_404(Board, id=board_id)

    # Sprawdzanie uprawnień
    if board.owner != request.user and not BoardPermission.objects.filter(board=board, user=request.user).exists():
        return redirect('board_list')

    # Sprawdzanie czy user ma uprawnienia do edycji czy tylko do przeglądania
    can_edit = board.owner == request.user or BoardPermission.objects.filter(
        board=board, user=request.user, permission_type__in=['edit', 'admin']
    ).exists()

    return render(request, 'boards/board_detail.html', {
        'board': board,
        'can_edit': can_edit,
    })

@login_required
@csrf_exempt
def api_elements(request, board_id):
    board = get_object_or_404(Board, id=board_id)

    # Sprawdzanie uprawnień
    has_permission = (
        board.owner == request.user or 
        BoardPermission.objects.filter(
            board=board, 
            user=request.user, 
            permission_type__in=['edit', 'admin']
        ).exists()
    )

    if not has_permission:
        return JsonResponse({'error': 'Brak uprawnień'}, status=403)

    if request.method == 'GET':
        elements = Element.objects.filter(board=board).values()
        return JsonResponse(list(elements), safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            element = Element.objects.create(
                board=board,
                element_type=data.get('element_type'),
                content=data.get('content'),
                position_x=data.get('position_x', 0),
                position_y=data.get('position_y', 0),
                width=data.get('width', 100),
                height=data.get('height', 100),
                rotation=data.get('rotation', 0),
                z_index=data.get('z_index', 0),
                properties=data.get('properties', {}),
                created_by=request.user
            )

            return JsonResponse({
                'id': element.id,
                'message': 'Element został dodany'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Nieprawidłowa metoda'}, status=405)

@login_required
@csrf_exempt
def api_element_detail(request, board_id, element_id):
    board = get_object_or_404(Board, id=board_id)
    element = get_object_or_404(Element, id=element_id, board=board)

    # Sprawdzanie uprawnień
    has_permission = (
        board.owner == request.user or 
        BoardPermission.objects.filter(
            board=board, 
            user=request.user, 
            permission_type__in=['edit', 'admin']
        ).exists()
    )

    if not has_permission:
        return JsonResponse({'error': 'Brak uprawnień'}, status=403)

    if request.method == 'GET':
        data = {
            'id': element.id,
            'element_type': element.element_type,
            'content': element.content,
            'position_x': element.position_x,
            'position_y': element.position_y,
            'width': element.width,
            'height': element.height,
            'rotation': element.rotation,
            'z_index': element.z_index,
            'properties': element.properties,
        }
        return JsonResponse(data)

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)

            # Aktualizacja właściwości elementu
            if 'element_type' in data:
                element.element_type = data['element_type']
            if 'content' in data:
                element.content = data['content']
            if 'position_x' in data:
                element.position_x = data['position_x']
            if 'position_y' in data:
                element.position_y = data['position_y']
            if 'width' in data:
                element.width = data['width']
            if 'height' in data:
                element.height = data['height']
            if 'rotation' in data:
                element.rotation = data['rotation']
            if 'z_index' in data:
                element.z_index = data['z_index']
            if 'properties' in data:
                element.properties = data['properties']

            element.save()

            return JsonResponse({'message': 'Element został zaktualizowany'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'DELETE':
        element.delete()
        return JsonResponse({'message': 'Element został usunięty'})

    return JsonResponse({'error': 'Nieprawidłowa metoda'}, status=405)