<<template>
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
        <button class="btn btn-primary" @click="retryLoading">
          <i class="bi bi-arrow-clockwise me-2"></i> Spróbuj ponownie
        </button>
      </div>

      <!-- Board Content -->
      <div v-else-if="board" class="board-content">
        <!-- Header -->
        <div class="board-header">
          <div class="container-fluid px-3">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
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
              </div>

              <div class="board-actions">
                <!-- Przyciski Import/Export -->
                <button class="btn btn-outline-primary me-2" @click="showImportPanel">
                  <i class="bi bi-upload me-1"></i> Import
                </button>
                <button class="btn btn-outline-primary me-2" @click="showExportPanel">
                  <i class="bi bi-download me-1"></i> Eksport
                </button>

                <button class="btn btn-outline-primary me-2" title="Zapisz" @click="saveBoard">
                  <i class="bi bi-save"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main board area -->
        <div class="board-area">
          <!-- Toolbar -->
          <Toolbar 
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

      <!-- Import/Export Panel -->
      <ImportExportPanel
        :visible="showPanel"
        :mode="panelMode"
        :board-data="exportData"
        @close="hidePanel"
        @import-board="importBoard"
      />
    </div>
  </template>

  <script>
  import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
  import { useStore } from 'vuex';
  import { toast } from 'vue3-toastify';
  import BoardCanvas from '@/components/board/Canvas.vue';
  import Toolbar from '@/components/board/Toolbar.vue';
  import ElementProperties from '@/components/board/ElementProperties.vue';
  import ImportExportPanel from '@/components/board/ImportExportPanel.vue';
  import websocketService from '@/services/websocket';
  import api from '@/services/api';

  export default {
    name: 'BoardDetailView',

    components: {
      BoardCanvas,
      Toolbar,
      ElementProperties,
      ImportExportPanel
    },

    props: {
      boardId: {
        type: [Number, String],
        default: 1
      }
    },

    setup(props) {
      const store = useStore();

      // Template refs
      const canvas = ref(null);
      const titleInput = ref(null);

      // Board state
      const loading = ref(true);
      const error = ref(null);
      const board = ref(null);
      const isEditingTitle = ref(false);
      const editedTitle = ref('');

      // Elements state
      const selectedElement = ref(null);
      const elements = ref([]);

      // Canvas settings
      const currentTool = ref('select');
      const penSize = ref(5);
      const penColor = ref('#000000');
      const showGrid = ref(true);
      const gridSize = ref(20);

      // Import/Export panel state
      const showPanel = ref(false);
      const panelMode = ref('export');
      const exportData = ref(null);

      // Load board data
      const loadBoard = async () => {
        loading.value = true;
        error.value = null;

        try {
          // Pobierz dane tablicy
          const boardResponse = await api.get(`/boards/${props.boardId}/`);
          board.value = boardResponse.data;
          editedTitle.value = board.value.title;

          // Pobierz elementy tablicy
          const elementsResponse = await api.get(`/boards/${props.boardId}/elements/`);
          elements.value = elementsResponse.data;

          console.log('Załadowano tablicę:', board.value);
          console.log('Załadowano elementy:', elements.value.length);
        } catch (err) {
          console.error('Błąd ładowania tablicy:', err);
          error.value = 'Nie udało się załadować tablicy. Sprawdź połączenie z internetem.';
        } finally {
          loading.value = false;
        }
      };

      // Ponowna próba ładowania
      const retryLoading = () => {
        loadBoard();
      };

      // Title editing
      const startEditTitle = () => {
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
            const response = await api.put(`/boards/${props.boardId}/`, {
              title: editedTitle.value.trim()
            });

            board.value = response.data;
            toast.success('Tytuł zapisany');
          } catch (error) {
            console.error('Błąd aktualizacji tytułu:', error);
            toast.error('Nie udało się zapisać tytułu');
            // Przywróć oryginalny tytuł
            editedTitle.value = board.value.title;
          }
        } else {
          cancelEditTitle();
        }
      };

      const cancelEditTitle = () => {
        isEditingTitle.value = false;
        editedTitle.value = board.value ? board.value.title : '';
      };

      // Board actions
      const saveBoard = async () => {
        try {
          await api.put(`/boards/${props.boardId}/`, {
            title: board.value.title
          });

          toast.success('Tablica zapisana');
        } catch (error) {
          console.error('Błąd zapisywania tablicy:', error);
          toast.error('Nie udało się zapisać tablicy');
        }
      };

      // Canvas event handlers
      const handleCanvasReady = () => {
        console.log('Canvas jest gotowy, ładowanie elementów...');
        if (canvas.value && elements.value) {
          canvas.value.loadElements(elements.value);
        }
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
        selectedElement.value = element;
      };

      const handleElementCreated = async (elementData) => {
        // Add the board ID to the element data
        elementData.board = props.boardId;

        try {
          const response = await api.post('/elements/', elementData);
          const newElement = response.data;

          elements.value.push(newElement);

          // Wysyłanie do WebSocket
          websocketService.sendElementCreated(newElement);

          return newElement;
        } catch (error) {
          console.error('Błąd tworzenia elementu:', error);
          toast.error('Nie udało się utworzyć elementu');
          return null;
        }
      };

      const handleElementUpdated = async (elementData) => {
        if (!elementData.id) return;

        try {
          const response = await api.put(`/elements/${elementData.id}/`, elementData);
          const updatedElement = response.data;

          // Aktualizuj lokalny stan
          const index = elements.value.findIndex(el => el.id === updatedElement.id);
          if (index !== -1) {
            elements.value[index] = updatedElement;
          }

          // Wysyłanie do WebSocket
          websocketService.sendElementUpdated(updatedElement);

          return updatedElement;
        } catch (error) {
          console.error('Błąd aktualizacji elementu:', error);
          toast.error('Nie udało się zaktualizować elementu');
          return null;
        }
      };

      const handleElementDeleted = async (elementId) => {
        if (!elementId) return;

        try {
          await api.delete(`/elements/${elementId}/`);

          // Aktualizuj lokalny stan
          elements.value = elements.value.filter(el => el.id !== elementId);

          // Wysyłanie do WebSocket
          websocketService.sendElementDeleted(elementId);

          return true;
        } catch (error) {
          console.error('Błąd usuwania elementu:', error);
          toast.error('Nie udało się usunąć elementu');
          return false;
        }
      };

      const handleElementUpdate = (elementData) => {
        handleElementUpdated(elementData);
      };

      const deselectElement = () => {
        selectedElement.value = null;
      };

      // Import/Export functions
      const showImportPanel = () => {
        panelMode.value = 'import';
        showPanel.value = true;
      };

      const showExportPanel = async () => {
        try {
          loading.value = true;
          const response = await api.get(`/boards/${props.boardId}/export_state/`);
          exportData.value = response.data;
          panelMode.value = 'export';
          showPanel.value = true;
        } catch (err) {
          console.error('Nie udało się wyeksportować tablicy:', err);
          toast.error('Nie udało się wyeksportować danych tablicy');
        } finally {
          loading.value = false;
        }
      };

      const hidePanel = () => {
        showPanel.value = false;
      };

      const importBoard = async (data) => {
        try {
          loading.value = true;
          await api.post(`/boards/${props.boardId}/import_state/`, data);

          // Załaduj tablicę ponownie po imporcie
          await loadBoard();

          // Odśwież canvas z nowymi elementami
          if (canvas.value && canvas.value.loadElements) {
            canvas.value.loadElements(elements.value);
          }

          toast.success('Tablica została zaimportowana pomyślnie');
          hidePanel();
        } catch (err) {
          console.error('Nie udało się zaimportować tablicy:', err);
          toast.error('Nie udało się zaimportować danych tablicy');
        } finally {
          loading.value = false;
        }
      };

      // WebSocket connection
      const setupWebSocket = () => {
        // Initialize WebSocket
        websocketService.connect(props.boardId);

        // Add listeners for WebSocket events
        websocketService.addListener('create_element', (data) => {
          if (data.element && data.element.id) {
            // Sprawdź czy element już istnieje
            const exists = elements.value.some(el => el.id === data.element.id);
            if (!exists) {
              elements.value.push(data.element);
              if (canvas.value) {
                canvas.value.addElementFromData(data.element);
              }
            }
          }
        });

        websocketService.addListener('update_element', (data) => {
          if (data.element && data.element.id) {
            const index = elements.value.findIndex(el => el.id === data.element.id);
            if (index !== -1) {
              elements.value[index] = data.element;
              if (canvas.value) {
                canvas.value.updateElementFromData(data.element);
              }
            }
          }
        });

        websocketService.addListener('delete_element', (data) => {
          if (data.element_id) {
            elements.value = elements.value.filter(el => el.id !== data.element_id);
            if (canvas.value) {
              canvas.value.deleteElementById(data.element_id);
            }
          }
        });
      };

      // Lifecycle hooks
      onMounted(() => {
        // Load board data
        loadBoard();

        // Set up WebSocket
        setupWebSocket();
      });

      onBeforeUnmount(() => {
        // Clean up WebSocket when component is destroyed
        websocketService.disconnect();
      });

      return {
        // Refs
        canvas,
        titleInput,

        // Data
        boardId: props.boardId,
        loading,
        error,
        board,
        elements,
        selectedElement,
        isEditingTitle,
        editedTitle,
        currentTool,
        penSize,
        penColor,
        showGrid,
        gridSize,

        // Import/Export panel
        showPanel,
        panelMode,
        exportData,

        // Methods
        loadBoard,
        retryLoading,
        startEditTitle,
        saveTitle,
        cancelEditTitle,
        saveBoard,
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
        handleElementUpdate,
        deselectElement,
        showImportPanel,
        showExportPanel,
        hidePanel,
        importBoard
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

  /* Dark theme */
  :root.dark-theme .loading-overlay,
  :root.dark-theme .error-container {
    background-color: rgba(18, 18, 18, 0.9);
  }

  :root.dark-theme .loading-overlay p {
    color: #5dade2;
  }

  :root.dark-theme .board-header {
    background-color: #1e1e1e;
    border-bottom-color: #333;
  }

  :root.dark-theme .board-title {
    color: #f0f0f0;
  }

  @media (max-width: 768px) {
    .board-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .board-actions .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  }
  </style>