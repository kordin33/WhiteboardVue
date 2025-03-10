<template>
  <div class="board-detail-view">
    <!-- Loading state -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
      <p class="mt-3">Ładowanie tablicy...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="alert alert-danger d-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          {{ error }}
        </div>
      </div>
      <button class="btn btn-primary" @click="goBack">
        <i class="bi bi-arrow-left me-2"></i> Powrót do listy tablic
      </button>
    </div>

    <!-- Board Content -->
    <div v-else-if="board" class="board-content">
      <!-- Header -->
      <div class="board-header">
        <div class="container-fluid px-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary me-2" @click="goBack">
                <i class="bi bi-arrow-left"></i>
              </button>

              <h1 v-if="!isEditingTitle" class="board-title mb-0" @click="startEditTitle">
                {{ board.title }}
                <i class="bi bi-pencil-fill edit-icon"></i>
              </h1>

              <div v-else class="title-edit-form">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="editedTitle" 
                  ref="titleInput"
                  @keyup.enter="saveTitle"
                  @keyup.esc="cancelEditTitle"
                  @blur="saveTitle"
                >
              </div>

              <span v-if="board.user_permission !== 'owner'" class="permission-badge ms-3">
                <i class="bi" :class="permissionIcon"></i>
                {{ permissionLabel }}
              </span>
            </div>

            <div class="board-actions">
              <button class="btn btn-outline-primary me-2" title="Zapisz" @click="saveBoard">
                <i class="bi bi-save"></i>
              </button>

              <div class="btn-group" role="group">
                <button 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button class="dropdown-item" @click="exportBoard">
                      <i class="bi bi-download me-2"></i> Eksportuj
                    </button>
                  </li>
                  <li v-if="canEditBoard">
                    <button class="dropdown-item" @click="openShareModal">
                      <i class="bi bi-share me-2"></i> Udostępnij
                    </button>
                  </li>
                  <li v-if="isOwner">
                    <button class="dropdown-item text-danger" @click="confirmDelete">
                      <i class="bi bi-trash me-2"></i> Usuń tablicę
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main board area -->
      <div class="board-area">
        <!-- Toolbar -->
        <Toolbar 
          :can-edit="canEditBoard"
          :initial-tool="currentTool"
          @tool-change="handleToolChange"
          @pen-settings-change="handlePenSettingsChange"
          @shape-settings-change="handleShapeSettingsChange"
          @text-settings-change="handleTextSettingsChange"
          @grid-settings-change="handleGridSettingsChange"
        />

        <!-- Element properties panel -->
        <ElementProperties 
          :element="selectedElement"
          :is-visible="!!selectedElement"
          @update="handleElementUpdate"
          @delete="handleElementDelete"
          @hide="deselectElement"
        />

        <!-- Canvas component -->
        <BoardCanvas 
          ref="canvas"
          :board-id="boardId"
          :can-edit="canEditBoard"
          :current-tool="currentTool"
          :pen-size="penSize"
          :pen-color="penColor"
          :show-grid="showGrid"
          :grid-size="gridSize"
          @element-selected="handleElementSelected"
          @element-created="handleElementCreated"
          @element-updated="handleElementUpdated"
          @element-deleted="handleElementDeleted"
          @canvas-ready="handleCanvasReady"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      class="modal fade" 
      id="deleteModal" 
      tabindex="-1" 
      aria-hidden="true"
      ref="deleteModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Potwierdź usunięcie</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="board">
            <p>Czy na pewno chcesz usunąć tablicę <strong>"{{ board.title }}"</strong>?</p>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Ta operacja jest nieodwracalna i spowoduje usunięcie wszystkich elementów tablicy.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="deleteBoard" 
              :disabled="deleteLoading"
            >
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ deleteLoading ? 'Usuwanie...' : 'Usuń tablicę' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { Modal } from 'bootstrap';
import BoardCanvas from '@/components/board/Canvas.vue';
import Toolbar from '@/components/board/Toolbar.vue';
import ElementProperties from '@/components/board/ElementProperties.vue';
import websocketService from '@/services/websocket';

export default {
  name: 'BoardDetailView',

  components: {
    BoardCanvas,
    Toolbar,
    ElementProperties
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    // Template refs
    const canvas = ref(null);
    const titleInput = ref(null);
    const deleteModal = ref(null);

    // Route params
    const boardId = computed(() => route.params.id);

    // Board state
    const loading = computed(() => store.getters['boards/isLoading']);
    const error = computed(() => store.getters['boards/error']);
    const board = computed(() => store.getters['boards/currentBoard']);
    const isEditingTitle = ref(false);
    const editedTitle = ref('');
    const deleteLoading = ref(false);

    // Elements state
    const selectedElement = computed(() => store.getters['elements/selectedElement']);

    // Canvas settings
    const currentTool = ref('select');
    const penSize = ref(5);
    const penColor = ref('#000000');
    const showGrid = ref(true);
    const gridSize = ref(20);

    // Permissions
    const canEditBoard = computed(() => {
      if (!board.value) return false;
      return board.value.user_permission === 'owner' || 
             board.value.user_permission === 'edit' ||
             board.value.user_permission === 'admin';
    });

    const isOwner = computed(() => {
      if (!board.value) return false;
      return board.value.user_permission === 'owner';
    });

    const permissionLabel = computed(() => {
      if (!board.value) return '';

      switch (board.value.user_permission) {
        case 'view': return 'Tylko podgląd';
        case 'edit': return 'Edycja';
        case 'admin': return 'Administrator';
        default: return 'Nieznane uprawnienia';
      }
    });

    const permissionIcon = computed(() => {
      if (!board.value) return '';

      switch (board.value.user_permission) {
        case 'view': return 'bi-eye';
        case 'edit': return 'bi-pencil-square';
        case 'admin': return 'bi-shield-lock';
        default: return 'bi-question-circle';
      }
    });

    // Load board data
    const loadBoard = async () => {
      try {
        await store.dispatch('boards/fetchBoard', boardId.value);
        await store.dispatch('elements/fetchElements', boardId.value);
      } catch (error) {
        console.error('Failed to load board:', error);
      }
    };

    // Title editing
    const startEditTitle = () => {
      if (!canEditBoard.value) return;

      editedTitle.value = board.value ? board.value.title : '';
      isEditingTitle.value = true;

      // Focus the input after the DOM update
      nextTick(() => {
        if (titleInput.value) {
          titleInput.value.focus();
          titleInput.value.select();
        }
      });
    };

    const saveTitle = async () => {
      if (isEditingTitle.value && editedTitle.value.trim() && board.value) {
        isEditingTitle.value = false;

        try {
          await store.dispatch('boards/updateBoard', {
            boardId: board.value.id,
            boardData: {
              title: editedTitle.value.trim()
            }
          });
        } catch (error) {
          console.error('Failed to update title:', error);
        }
      } else {
        cancelEditTitle();
      }
    };

    const cancelEditTitle = () => {
      isEditingTitle.value = false;
    };

    // Board actions
    const saveBoard = () => {
      // For now, just show an alert
      alert('Tablica zapisana');
    };

    const exportBoard = () => {
      // Placeholder for export functionality
      alert('Funkcja eksportu zostanie zaimplementowana wkrótce');
    };

    const openShareModal = () => {
      // Placeholder for share modal
      alert('Funkcja udostępniania zostanie zaimplementowana wkrótce');
    };

    const confirmDelete = () => {
      // Show delete modal
      const modalElement = deleteModal.value;
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    };

    const deleteBoard = async () => {
      if (!board.value) return;

      deleteLoading.value = true;

      try {
        await store.dispatch('boards/deleteBoard', board.value.id);

        // Close modal
        const modalElement = deleteModal.value;
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }

        // Redirect to boards page
        router.push('/boards');
      } catch (error) {
        console.error('Failed to delete board:', error);
      } finally {
        deleteLoading.value = false;
      }
    };

    // Navigation
    const goBack = () => {
      router.push('/boards');
    };

    // Canvas event handlers
    const handleCanvasReady = () => {
      console.log('Canvas is ready');
    };

    const handleToolChange = (tool) => {
      currentTool.value = tool;
    };

    const handlePenSettingsChange = (settings) => {
      penSize.value = settings.size;
      penColor.value = settings.color;
    };

    const handleShapeSettingsChange = (settings) => {
      // Update shape settings when needed
      console.log('Shape settings changed:', settings);
    };

    const handleTextSettingsChange = (settings) => {
      // Update text settings when needed
      console.log('Text settings changed:', settings);
    };

    const handleGridSettingsChange = (settings) => {
      showGrid.value = settings.show;
      gridSize.value = settings.size;
    };

    // Element interactions
    const handleElementSelected = (element) => {
      store.dispatch('elements/selectElement', element);
    };

    const handleElementCreated = (elementData) => {
      // Add the board ID to the element data
      elementData.board = boardId.value;

      store.dispatch('elements/createElement', elementData)
        .catch(error => {
          console.error('Failed to create element:', error);
        });
    };

    const handleElementUpdated = (elementData) => {
      if (!elementData.id) return;

      store.dispatch('elements/updateElement', {
        elementId: elementData.id,
        elementData
      }).catch(error => {
        console.error('Failed to update element:', error);
      });
    };

    const handleElementDeleted = (elementId) => {
      if (!elementId) return;

      store.dispatch('elements/deleteElement', elementId)
        .catch(error => {
          console.error('Failed to delete element:', error);
        });
    };

    const deselectElement = () => {
      store.dispatch('elements/clearSelection');
    };

    // Lifecycle hooks
    onMounted(() => {
      // Initialize WebSocket
      if (boardId.value) {
        websocketService.connect(boardId.value);

        // Initialize WebSocket listeners
        store.dispatch('elements/initWebSocketListeners');
      }

      // Load board data
      loadBoard();
    });

    onBeforeUnmount(() => {
      // Clean up WebSocket when component is destroyed
      websocketService.disconnect();
    });

    return {
      // Refs
      canvas,
      titleInput,
      deleteModal,

      // Data
      boardId,
      loading,
      error,
      board,
      selectedElement,
      isEditingTitle,
      editedTitle,
      deleteLoading,
      currentTool,
      penSize,
      penColor,
      showGrid,
      gridSize,

      // Computed
      canEditBoard,
      isOwner,
      permissionLabel,
      permissionIcon,

      // Methods
      loadBoard,
      startEditTitle,
      saveTitle,
      cancelEditTitle,
      saveBoard,
      exportBoard,
      openShareModal,
      confirmDelete,
      deleteBoard,
      goBack,
      handleCanvasReady,
      handleToolChange,
      handlePenSettingsChange,
      handleShapeSettingsChange,
      handleTextSettingsChange,
      handleGridSettingsChange,
      handleElementSelected,
      handleElementCreated,
      handleElementUpdated,
      handleElementDeleted,
      deselectElement
    };
  }
};
</script>

<style scoped>
.board-detail-view {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
  overflow: hidden;
}

.loading-overlay, .error-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1050;
}

.loading-overlay p {
  color: var(--bs-primary, #3498db);
  font-weight: 500;
}

.error-container {
  padding: 2rem;
}

.board-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.board-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
  padding: 0.75rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.board-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.edit-icon {
  font-size: 0.8rem;
  margin-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.board-title:hover .edit-icon {
  opacity: 0.5;
}

.title-edit-form {
  min-width: 300px;
}

.board-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #495057;
}

.permission-badge i {
  margin-right: 0.25rem;
}
</style>