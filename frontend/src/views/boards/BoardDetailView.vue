
<template>
  <div class="board-detail" :class="{ 'read-only': !canEdit }">
    <div class="board-header">
      <div class="container">
        <div class="board-header-content">
          <h1>{{ board ? board.title : 'Ładowanie tablicy...' }}</h1>
          <div class="board-controls">
            <button v-if="canEdit" @click="saveBoard" class="btn btn-success">
              Zapisz
            </button>
            <router-link to="/boards" class="btn btn-outline-secondary">
              Powrót
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!canEdit" class="read-only-indicator">
      Tylko podgląd
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    
    <div v-else-if="error" class="error-message container">
      <div class="alert alert-danger">{{ error }}</div>
    </div>
    
    <div v-else-if="board" class="board-content">
      <div v-if="canEdit" class="tools-panel">
        <!-- Narzędzia do edycji tablicy -->
      </div>
      
      <div id="whiteboard-canvas" class="whiteboard-canvas">
        <!-- Tu będzie canvas -->
      </div>
    </div>
    
    <!-- Debugowanie WebSocket -->
    <div v-if="isDevelopment" class="websocket-debug">
      <h5>WebSocket</h5>
      <p>Status: <span :class="wsStatusClass">{{ wsStatus }}</span></p>
      <button @click="testWebSocket" class="btn btn-sm btn-primary">
        Test połączenia
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import websocketService from '@/services/websocket';
import { toast } from 'vue3-toastify';

export default {
  name: 'BoardDetailView',
  
  setup() {
    const route = useRoute();
    const boardId = computed(() => route.params.id);
    
    const board = ref(null);
    const loading = ref(true);
    const error = ref('');
    const canEdit = ref(false);
    const wsStatus = ref('Niepołączony');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // WebSocket status styling
    const wsStatusClass = computed(() => {
      return {
        'ws-connected': wsStatus.value === 'Połączony',
        'ws-disconnected': wsStatus.value === 'Niepołączony',
        'ws-error': wsStatus.value.includes('Błąd')
      };
    });
    
    // Funkcje
    const fetchBoard = async () => {
      try {
        loading.value = true;
        error.value = '';
        
        const response = await api.get(`/boards/${boardId.value}/`);
        board.value = response.data;
        
        // Sprawdź uprawnienia
        canEdit.value = board.value.is_owner || 
                       (board.value.permission && 
                        ['edit', 'admin'].includes(board.value.permission.permission_type));
        
        // Połącz z WebSocket
        connectWebSocket();
        
      } catch (err) {
        console.error('Error fetching board:', err);
        error.value = 'Nie udało się pobrać tablicy. Spróbuj ponownie później.';
        toast.error('Błąd podczas pobierania tablicy');
      } finally {
        loading.value = false;
      }
    };
    
    const saveBoard = () => {
      toast.success('Zmiany zapisane');
    };
    
    // WebSocket
    const connectWebSocket = () => {
      websocketService.connect(boardId.value);
      
      // Nasłuchuj na zmiany statusu połączenia
      websocketService.addListener('connection_status', (data) => {
        wsStatus.value = data.connected ? 'Połączony' : 'Niepołączony';
        if (data.code && data.code !== 1000) {
          wsStatus.value = `Błąd: ${data.code}`;
        }
      });
    };
    
    const testWebSocket = () => {
      const success = websocketService.send('ping', {
        message: 'Test message from client'
      });
      
      if (success) {
        toast.info('Wiadomość testowa wysłana');
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      fetchBoard();
    });
    
    onUnmounted(() => {
      websocketService.disconnect();
    });
    
    return {
      board,
      loading,
      error,
      canEdit,
      wsStatus,
      wsStatusClass,
      isDevelopment,
      saveBoard,
      testWebSocket
    };
  }
}
</script>

<style scoped>
.board-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.board-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 0;
}

.board-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.board-controls {
  display: flex;
  gap: 0.5rem;
}

.read-only-indicator {
  background-color: rgba(255, 193, 7, 0.8);
  color: #212529;
  text-align: center;
  padding: 0.5rem;
  font-weight: bold;
}

.board-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tools-panel {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.whiteboard-canvas {
  flex: 1;
  background-color: #ffffff;
  overflow: hidden;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.websocket-debug {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  z-index: 1000;
}

.ws-connected {
  color: #28a745;
}

.ws-disconnected {
  color: #dc3545;
}

.ws-error {
  color: #ffc107;
}
</style>
