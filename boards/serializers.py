rom rest_framework import serializers
from .models import Board, Element, BoardPermission, ElementHistory, Template
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'email']

class BoardPermissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BoardPermission
        fields = ['id', 'user', 'user_id', 'permission_type']

class BoardSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    shared_users = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ['id', 'title', 'owner', 'created_at', 'updated_at', 'shared_users']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_shared_users(self, obj):
        permissions = obj.permissions.all()
        return BoardPermissionSerializer(permissions, many=True).data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['owner'] = request.user
        return super().create(validated_data)

class ElementSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Element
        fields = [
            'id', 'board', 'element_type', 'content', 'path', 
            'position_x', 'position_y', 'width', 'height', 
            'rotation', 'z_index', 'properties', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)

class ElementHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ElementHistory
        fields = ['id', 'element', 'action_type', 'data', 'timestamp', 'performed_by']
        read_only_fields = ['timestamp', 'performed_by']

class TemplateSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    elements = ElementSerializer(many=True, read_only=True)

    class Meta:
        model = Template
        fields = ['id', 'name', 'category', 'thumbnail', 'elements', 'created_by', 'is_public']
        read_only_fields = ['created_by']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)