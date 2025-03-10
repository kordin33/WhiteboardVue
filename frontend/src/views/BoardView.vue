<!-- BoardView.vue - Główny komponent widoku tablicy -->
<template>
  <div class="board-view">
    <!-- Górny pasek narzędzi -->
    <BoardHeader 
      :board-title="board.title" 
      @save="saveBoard" 
      @export-pdf="exportPDF"
      @toggle-history="showHistory = !showHistory"
      @toggle-templates="showTemplates = !showTemplates"
    />

    <!-- Główny obszar edycji -->
    <div class="board-container">
      <!-- Boczny pasek narzędzi -->
      <Toolbar 
        v-model:current-tool="currentTool"
        v-model:pen-color="penColor"
        v-model:pen-size="penSize"
        v-model:pen-smoothing="penSmoothing"
        @tool-clicked="handleToolClick"
      />

      <!-- Panel właściwości dla wybranego elementu -->
      <PropertiesPanel 
        v-if="selectedElement"
        :selected-element="selectedElement"
        @update:properties="updateElementProperties"
        @delete="deleteElement"
      />

      <!-- Główne płótno -->
      <Canvas 
        ref="canvas"
        :current-tool="currentTool"
        :pen-color="penColor"
        :pen-size="penSize"
        :pen-smoothing="penSmoothing"
        :show-grid="showGrid"
        :grid-size="gridSize"
        :elements="elements"
        @canvas-ready="handleCanvasReady"
        @element-created="handleElementCreated"
        @element-updated="handleElementUpdated"
        @element-deleted="handleElementDeleted"
        @element-selected="selectedElement = $event"
      />

      <!-- Panel historii zmian (Undo/Redo) -->
      <HistoryPanel 
        v-if="showHistory"
        :history="history"
        @undo="undoAction"
        @redo="redoAction"
        @restore="restoreState"
      />

      <!-- Panel szablonów -->
      <TemplatesPanel 
        v-if="showTemplates"
        :templates="templates"
        :categories="templateCategories"
        @apply-template="applyTemplate"
        @save-as-template="saveAsTemplate"
      />

      <!-- Panel współpracy -->
      <CollaborationPanel 
        v-if="collaborators.length > 0"
        :collaborators="collaborators"
      />

      <!-- Miniaturka nawigacyjna -->
      <MiniMap 
        :canvas-ref="$refs.canvas" 
        :view-port="viewPort"
      />
    </div>

    <!-- Powiadomienia -->
    <Toast ref="toast" position="bottom-right" />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import BoardHeader from '@/components/board/BoardHeader.vue';
import Toolbar from '@/components/board/Toolbar.vue';
import PropertiesPanel from '@/components/board/PropertiesPanel.vue';
import Canvas from '@/components/board/Canvas.vue';
import HistoryPanel from '@/components/board/HistoryPanel.vue';
import TemplatesPanel from '@/components/board/TemplatesPanel.vue';
import CollaborationPanel from '@/components/board/CollaborationPanel.vue';
import MiniMap from '@/components/board/MiniMap.vue';
import Toast from '@/components/common/Toast.vue';

// Importy serwisów
import boardService from '@/services/boardService';
import elementService from '@/services/elementService';
import templateService from '@/services/templateService';
import websocketService from '@/services/websocketService';
import pdfExport from '@/services/pdfExport';

export default {
  name: 'BoardView',

  components: {
    BoardHeader,
    Toolbar,
    PropertiesPanel,
    Canvas,
    HistoryPanel,
    TemplatesPanel,
    CollaborationPanel,
    MiniMap,
    Toast
  },

  setup() {
    const route = useRoute();
    const boardId = route.params.id;

    // Referencje do komponentów
    const canvas = ref(null);
    const toast = ref(null);

    // Dane tablicy
    const board = ref({});
    const elements = ref([]);
    const history = ref([]);
    const templates = ref([]);
    const collaborators = ref([]);

    // Stan interfejsu
    const currentTool = ref('select');
    const penColor = ref('#000000');
    const penSize = ref(5);
    const penSmoothing = ref(true);
    const selectedElement = ref(null);
    const showHistory = ref(false);
    const showTemplates = ref(false);
    const showGrid = ref(true);
    const gridSize = ref(20);
    const viewPort = reactive({
      x: 0,
      y: 0,
      zoom: 1
    });

    // Pobieranie danych tablicy
    const loadBoard = async () => {
      try {
        board.value = await boardService.getBoard(boardId);
        elements.value = await elementService.getBoardElements(boardId);
        history.value = await elementService.getBoardHistory(boardId);

        // Inicjalizacja WebSocket dla współpracy w czasie rzeczywistym
        initializeWebSocket();
      } catch (error) {
        console.error('Error loading board:', error);
        toast.value.show('Błąd wczytywania tablicy', 'error');
      }
    };

    // Inicjalizacja WebSocket
    const initializeWebSocket = () => {
      websocketService.connect(boardId, {
        onConnect: () => {
          toast.value.show('Połączono z sesją współpracy', 'success');
        },
        onDisconnect: () => {
          toast.value.show('Utracono połączenie z sesją współpracy', 'warning');
        },
        onElementCreated: (element) => {
          elements.value.push(element);
          if (canvas.value) {
            canvas.value.addElementFromData(element);
          }
        },
        onElementUpdated: (element) => {
          const index = elements.value.findIndex(e => e.id === element.id);
          if (index !== -1) {
            elements.value[index] = element;
            if (canvas.value) {
              canvas.value.updateElementFromData(element);
            }
          }
        },
        onElementDeleted: (elementId) => {
          elements.value = elements.value.filter(e => e.id !== elementId);
          if (canvas.value) {
            canvas.value.deleteElementById(elementId);
          }
        },
        onCollaboratorJoined: (user) => {
          collaborators.value.push(user);
          toast.value.show(`${user.username} dołączył do tablicy`, 'info');
        },
        onCollaboratorLeft: (userId) => {
          const user = collaborators.value.find(u => u.id === userId);
          if (user) {
            toast.value.show(`${user.username} opuścił tablicę`, 'info');
            collaborators.value = collaborators.value.filter(u => u.id !== userId);
          }
        },
        onCollaboratorCursorMoved: (data) => {
          const { userId, position } = data;
          const index = collaborators.value.findIndex(u => u.id === userId);
          if (index !== -1) {
            collaborators.value[index].cursorPosition = position;
          }
        }
      });
    };

    // Kategorie szablonów
    const templateCategories = computed(() => {
      const categories = new Set(templates.value.map(t => t.category));
      return Array.from(categories);
    });

    // Zapisywanie całej tablicy
    const saveBoard = async () => {
      try {
        await boardService.updateBoard(boardId, {
          title: board.value.title
        });
        toast.value.show('Tablica zapisana', 'success');
      } catch (error) {
        console.error('Error saving board:', error);
        toast.value.show('Błąd zapisywania tablicy', 'error');
      }
    };

    // Eksport do PDF
    const exportPDF = async () => {
      try {
        const pdf = await pdfExport.generatePDF(board.value.title, canvas.value);
        pdfExport.downloadPDF(pdf, `${board.value.title.replace(/\s+/g, '_')}.pdf`);
        toast.value.show('Tablica wyeksportowana do PDF', 'success');
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        toast.value.show('Błąd eksportu do PDF', 'error');
      }
    };

    // Obsługa kliknięcia narzędzia
    const handleToolClick = (toolName) => {
      currentTool.value = toolName;
      if (canvas.value) {
        canvas.value.setTool(toolName);
      }
    };

    // Obsługa gotowości płótna
    const handleCanvasReady = () => {
      if (canvas.value) {
        canvas.value.loadElements(elements.value);
      }
    };

    // Obsługa utworzenia elementu
    const handleElementCreated = async (elementData) => {
      try {
        const newElement = await elementService.createElement(boardId, elementData);
        elements.value.push(newElement);
        websocketService.sendElementCreated(newElement);
        return newElement; // Zwracamy nowo utworzony element
      } catch (error) {
        console.error('Error creating element:', error);
        toast.value.show('Błąd tworzenia elementu', 'error');
        return null;
      }
    };

    // Obsługa aktualizacji elementu
    const handleElementUpdated = async (elementData) => {
      try {
        const updatedElement = await elementService.updateElement(boardId, elementData.id, elementData);
        const index = elements.value.findIndex(e => e.id === updatedElement.id);
        if (index !== -1) {
          elements.value[index] = updatedElement;
        }
        websocketService.sendElementUpdated(updatedElement);
      } catch (error) {
        console.error('Error updating element:', error);
        toast.value.show('Błąd aktualizacji elementu', 'error');
      }
    };

    // Obsługa usunięcia elementu
    const handleElementDeleted = async (elementId) => {
      try {
        await elementService.deleteElement(boardId, elementId);
        elements.value = elements.value.filter(e => e.id !== elementId);
        websocketService.sendElementDeleted(elementId);
      } catch (error) {
        console.error('Error deleting element:', error);
        toast.value.show('Błąd usuwania elementu', 'error');
      }
    };

    // Aktualizacja właściwości wybranego elementu
    const updateElementProperties = (properties) => {
      if (selectedElement.value && canvas.value) {
        selectedElement.value = { ...selectedElement.value, ...properties };
        canvas.value.updateElementProperties(selectedElement.value.id, properties);
      }
    };

    // Usunięcie wybranego elementu
    const deleteElement = () => {
      if (selectedElement.value && canvas.value) {
        const elementId = selectedElement.value.id;
        canvas.value.deleteElement(elementId);
        selectedElement.value = null;
      }
    };

    // Cofnięcie akcji (undo)
    const undoAction = async () => {
      try {
        const result = await elementService.undoAction(boardId);
        loadBoard(); // Odświeżenie danych po cofnięciu
        toast.value.show('Akcja cofnięta', 'success');
      } catch (error) {
        console.error('Error undoing action:', error);
        toast.value.show('Brak akcji do cofnięcia', 'warning');
      }
    };

    // Ponowienie akcji (redo)
    const redoAction = async () => {
      // Implementacja redo będzie rozbudowana po stronie frontendu
      toast.value.show('Funkcja redo jeszcze nie zaimplementowana', 'info');
    };

    // Przywrócenie stanu z historii
    const restoreState = async (historyItem) => {
      try {
        // Implementacja przywracania stanu z historii
        toast.value.show('Stan przywrócony', 'success');
      } catch (error) {
        console.error('Error restoring state:', error);
        toast.value.show('Błąd przywracania stanu', 'error');
      }
    };

    // Zastosowanie szablonu
    const applyTemplate = async (templateId) => {
      try {
        await templateService.applyTemplate(templateId, boardId);
        loadBoard(); // Odświeżenie danych po zastosowaniu szablonu
        toast.value.show('Szablon zastosowany', 'success');
      } catch (error) {
        console.error('Error applying template:', error);
        toast.value.show('Błąd zastosowania szablonu', 'error');
      }
    };

    // Zapisanie szablonu
    const saveAsTemplate = async (templateData) => {
      try {
        const canvasSnapshot = canvas.value.takeSnapshot();
        const newTemplate = await templateService.createTemplate({
          ...templateData,
          elements: elements.value,
          thumbnail: canvasSnapshot
        });
        templates.value.push(newTemplate);
        toast.value.show('Szablon zapisany', 'success');
      } catch (error) {
        console.error('Error saving template:', error);
        toast.value.show('Błąd zapisywania szablonu', 'error');
      }
    };

    // Inicjalizacja
    onMounted(() => {
      loadBoard();

      // Załadowanie szablonów
      templateService.getTemplates().then(data => {
        templates.value = data;
      }).catch(error => {
        console.error('Error loading templates:', error);
      });
    });

    // Czyszczenie przy zamykaniu
    onBeforeUnmount(() => {
      websocketService.disconnect();
    });

    return {
      // Referencje
      canvas,
      toast,

      // Dane
      board,
      elements,
      history,
      templates,
      collaborators,
      templateCategories,

      // Stan interfejsu
      currentTool,
      penColor,
      penSize,
      penSmoothing,
      selectedElement,
      showHistory,
      showTemplates,
      showGrid,
      gridSize,
      viewPort,

      // Metody
      saveBoard,
      exportPDF,
      handleToolClick,
      handleCanvasReady,
      handleElementCreated,
      handleElementUpdated,
      handleElementDeleted,
      updateElementProperties,
      deleteElement,
      undoAction,
      redoAction,
      restoreState,
      applyTemplate,
      saveAsTemplate
    };
  }
};
</script>

<style lang="scss" scoped>
.board-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-background);
}

.board-container {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Dodatkowe style będą dodane w stylach globalnych */
</style>

