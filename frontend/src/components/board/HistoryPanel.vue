<!-- HistoryPanel.vue - Panel historii zmian -->
<template>
  <div class="history-panel" :class="{ 'is-visible': visible }">
    <div class="panel-header">
      <h2>Historia zmian</h2>
      <div class="header-actions">
        <tooltip-button
          icon="refresh"
          title="Odśwież historię"
          @click="refreshHistory"
        />
        <tooltip-button
          icon="x"
          title="Zamknij panel"
          @click="close"
        />
      </div>
    </div>

    <div class="panel-actions">
      <div class="action-buttons">
        <tooltip-button
          icon="corner-up-left"
          title="Cofnij (Ctrl+Z)"
          :disabled="!canUndo"
          @click="undo"
        />
        <tooltip-button
          icon="corner-up-right"
          title="Ponów (Ctrl+Y)"
          :disabled="!canRedo"
          @click="redo"
        />
        <tooltip-button
          icon="trash-2"
          title="Wyczyść historię"
          :disabled="historyItems.length === 0"
          @click="showClearConfirm = true"
        />
      </div>

      <div class="view-options">
        <button 
          v-for="view in viewOptions" 
          :key="view.value"
          :class="{ active: currentView === view.value }"
          @click="currentView = view.value"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <div class="history-content">
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        <span>Ładowanie historii...</span>
      </div>

      <div v-else-if="historyItems.length === 0" class="empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p>Brak historii zmian</p>
        <p class="hint">Dokonaj zmian na tablicy, aby zacząć śledzić historię</p>
      </div>

      <div v-else class="history-items">
        <!-- Tryb listy -->
        <div v-if="currentView === 'list'" class="history-list">
          <div 
            v-for="(item, index) in historyItems" 
            :key="index"
            class="history-item"
            :class="{ 
              'current': index === currentIndex,
              'restored': item.restored
            }"
            @click="previewHistoryState(index)"
          >
            <div class="item-icon" :class="item.action_type">
              <svg-icon :name="getActionIcon(item.action_type)" />
            </div>
            <div class="item-content">
              <div class="item-title">
                {{ getActionLabel(item.action_type) }} {{ getElementLabel(item.element_type) }}
              </div>
              <div class="item-details">
                <time-ago :datetime="item.timestamp" />
                <span class="user-info">{{ item.user || 'Nieznany użytkownik' }}</span>
              </div>
            </div>
            <div class="item-actions">
              <tooltip-button
                v-if="index !== currentIndex"
                icon="corner-left-up"
                title="Przywróć do tego stanu"
                small
                @click.stop="restoreToState(index)"
              />
              <tooltip-button
                icon="eye"
                title="Podgląd"
                small
                @click.stop="previewHistoryState(index)"
              />
            </div>
          </div>
        </div>

        <!-- Tryb miniatur -->
        <div v-else-if="currentView === 'thumbnails'" class="history-thumbnails">
          <div 
            v-for="(item, index) in historyItems" 
            :key="index"
            class="thumbnail-item"
            :class="{ 
              'current': index === currentIndex,
              'restored': item.restored
            }"
            @click="previewHistoryState(index)"
          >
            <div class="thumbnail-image" :style="{ backgroundImage: `url(${item.thumbnail || '/static/placeholder.png'})` }">
              <div class="thumbnail-overlay">
                <tooltip-button
                  v-if="index !== currentIndex"
                  icon="corner-left-up"
                  title="Przywróć do tego stanu"
                  small
                  @click.stop="restoreToState(index)"
                />
              </div>
            </div>
            <div class="thumbnail-info">
              <div class="thumbnail-title">
                {{ getActionLabel(item.action_type) }}
              </div>
              <div class="thumbnail-time">
                <time-ago :datetime="item.timestamp" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tryb osi czasu -->
        <div v-else-if="currentView === 'timeline'" class="history-timeline">
          <div class="timeline-track">
            <div class="timeline-line"></div>
            <div 
              v-for="(item, index) in historyItems" 
              :key="index"
              class="timeline-point"
              :class="{ 
                'current': index === currentIndex,
                'restored': item.restored
              }"
              :style="{ left: `${(index / (historyItems.length - 1)) * 100}%` }"
              @click="previewHistoryState(index)"
            >
              <div class="point-icon" :class="item.action_type">
                <svg-icon :name="getActionIcon(item.action_type)" />
              </div>
              <div class="point-tooltip">
                <div class="tooltip-title">
                  {{ getActionLabel(item.action_type) }} {{ getElementLabel(item.element_type) }}
                </div>
                <div class="tooltip-time">
                  <time-ago :datetime="item.timestamp" />
                </div>
                <div class="tooltip-actions">
                  <button
                    v-if="index !== currentIndex"
                    @click.stop="restoreToState(index)"
                  >
                    Przywróć stan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="previewMode" class="preview-panel">
      <div class="preview-header">
        <h3>Podgląd</h3>
        <tooltip-button
          icon="x"
          title="Zamknij podgląd"
          @click="closePreview"
        />
      </div>
      <div class="preview-content">
        <div class="preview-image" :style="{ backgroundImage: `url(${previewImage || '/static/placeholder.png'})` }"></div>
      </div>
      <div class="preview-footer">
        <button class="btn-secondary" @click="closePreview">Zamknij</button>
        <button 
          v-if="previewIndex !== currentIndex"
          class="btn-primary" 
          @click="restoreToState(previewIndex)"
        >
          Przywróć stan
        </button>
      </div>
    </div>

    <confirm-dialog
      v-if="showClearConfirm"
      title="Wyczyścić historię?"
      message="Czy na pewno chcesz wyczyścić całą historię zmian? Ta operacja nie może być cofnięta."
      confirm-text="Wyczyść"
      cancel-text="Anuluj"
      @confirm="clearHistory"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import TooltipButton from '@/components/common/TooltipButton.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import TimeAgo from '@/components/common/TimeAgo.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

export default {
  name: 'HistoryPanel',

  components: {
    TooltipButton,
    SvgIcon,
    TimeAgo,
    ConfirmDialog
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    boardId: {
      type: String,
      required: true
    },
    historyService: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'undo', 'redo', 'restore'],

  setup(props, { emit }) {
    // Stan komponentu
    const loading = ref(false);
    const historyItems = ref([]);
    const currentIndex = ref(-1);
    const currentView = ref('list');
    const showClearConfirm = ref(false);

    // Stan podglądu
    const previewMode = ref(false);
    const previewIndex = ref(-1);
    const previewImage = ref(null);

    // Opcje widoku
    const viewOptions = [
      { value: 'list', label: 'Lista' },
      { value: 'thumbnails', label: 'Miniatury' },
      { value: 'timeline', label: 'Oś czasu' }
    ];

    // Możliwość cofania/ponawiania
    const canUndo = computed(() => historyItems.value.length > 0 && currentIndex.value > 0);
    const canRedo = computed(() => historyItems.value.length > 0 && currentIndex.value < historyItems.value.length - 1);

    // Pobieranie historii
    const loadHistory = async () => {
      loading.value = true;

      try {
        const history = await props.historyService.getHistory(props.boardId);
        historyItems.value = history;
        currentIndex.value = history.length - 1; // Ustawienie na najnowszym stanie
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        loading.value = false;
      }
    };

    // Odświeżanie historii
    const refreshHistory = () => {
      loadHistory();
    };

    // Zamykanie panelu
    const close = () => {
      emit('close');
    };

    // Cofanie zmian
    const undo = () => {
      if (canUndo.value) {
        emit('undo');
        currentIndex.value--;
      }
    };

    // Ponawianie zmian
    const redo = () => {
      if (canRedo.value) {
        emit('redo');
        currentIndex.value++;
      }
    };

    // Czyszczenie historii
    const clearHistory = async () => {
      try {
        await props.historyService.clearHistory(props.boardId);
        historyItems.value = [];
        currentIndex.value = -1;
        showClearConfirm.value = false;
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    };

    // Przywracanie do stanu
    const restoreToState = async (index) => {
      if (index >= 0 && index < historyItems.value.length) {
        try {
          await props.historyService.restoreToState(props.boardId, historyItems.value[index].id);
          emit('restore', historyItems.value[index]);

          // Oznacz stan jako przywrócony
          historyItems.value[index].restored = true;
          currentIndex.value = index;

          // Zamknij podgląd, jeśli aktywny
          if (previewMode.value) {
            closePreview();
          }
        } catch (error) {
          console.error('Error restoring to state:', error);
        }
      }
    };

    // Podgląd stanu
    const previewHistoryState = (index) => {
      if (index >= 0 && index < historyItems.value.length) {
        previewIndex.value = index;
        previewImage.value = historyItems.value[index].snapshot;
        previewMode.value = true;
      }
    };

    // Zamykanie podglądu
    const closePreview = () => {
      previewMode.value = false;
      previewIndex.value = -1;
    };

    // Pobranie ikony akcji
    const getActionIcon = (actionType) => {
      const actionIcons = {
        'create': 'plus-circle',
        'update': 'edit',
        'delete': 'trash',
        'move': 'move',
        'resize': 'maximize',
        'rotate': 'refresh-cw',
        'restore': 'rewind'
      };

      return actionIcons[actionType] || 'activity';
    };

    // Pobranie etykiety akcji
    const getActionLabel = (actionType) => {
      const actionLabels = {
        'create': 'Utworzenie',
        'update': 'Aktualizacja',
        'delete': 'Usunięcie',
        'move': 'Przesunięcie',
        'resize': 'Zmiana rozmiaru',
        'rotate': 'Obrót',
        'restore': 'Przywrócenie'
      };

      return actionLabels[actionType] || actionType;
    };

    // Pobranie etykiety elementu
    const getElementLabel = (elementType) => {
      const elementLabels = {
        'text': 'tekstu',
        'shape': 'kształtu',
        'sticky': 'notatki',
        'line': 'linii',
        'path': 'rysunku',
        'image': 'obrazu',
        'function': 'funkcji',
        'coordinate': 'układu współrzędnych',
        'equation': 'równania',
        'geometry': 'figury geometrycznej'
      };

      return elementLabels[elementType] || '';
    };

    // Obsługa skrótów klawiszowych
    const handleKeyDown = (e) => {
      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y lub Ctrl+Shift+Z: Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    // Inicjalizacja komponentu
    onMounted(() => {
      // Pobranie historii
      if (props.visible) {
        loadHistory();
      }

      // Dodanie obsługi skrótów klawiszowych
      document.addEventListener('keydown', handleKeyDown);
    });

    // Czyszczenie przy usuwaniu komponentu
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    // Obserwowanie zmian
    watch(() => props.visible, (newValue) => {
      if (newValue && historyItems.value.length === 0) {
        loadHistory();
      }
    });

    return {
      loading,
      historyItems,
      currentIndex,
      currentView,
      viewOptions,
      canUndo,
      canRedo,
      showClearConfirm,
      previewMode,
      previewIndex,
      previewImage,
      refreshHistory,
      close,
      undo,
      redo,
      clearHistory,
      restoreToState,
      previewHistoryState,
      closePreview,
      getActionIcon,
      getActionLabel,
      getElementLabel
    };
  }
};
</script>

<style lang="scss" scoped>
.history-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease-in-out;
  z-index: 100;

  &.is-visible {
    right: 0;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.panel-actions {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .view-options {
    display: flex;
    gap: 2px;

    button {
      background-color: transparent;
      border: none;
      padding: 6px 8px;
      font-size: 13px;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
      }

      &.active {
        background-color: #e3f2fd;
        color: #1976d2;
        font-weight: 500;
      }
    }
  }
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: #f9f9f9;
}

.loading-message, .empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  padding: 20px;

  svg {
    color: #9e9e9e;
    margin-bottom: 16px;
  }

  p {
    color: #616161;
    margin: 0 0 8px;

    &.hint {
      font-size: 13px;
      color: #9e9e9e;
    }
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1976d2;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #eeeeee;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    &.current {
      background-color: #e3f2fd;

      &:hover {
        background-color: #d0e8fd;
      }
    }

    &.restored {
      border-left: 3px solid #4caf50;
    }

    .item-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;

      &.create {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.update {
        background-color: #fff8e1;
        color: #ff8f00;
      }

      &.delete {
        background-color: #ffebee;
        color: #d32f2f;
      }

      &.restore {
        background-color: #e8f5e9;
        color: #2e7d32;
      }
    }

    .item-content {
      flex: 1;

      .item-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
      }

      .item-details {
        font-size: 12px;
        color: #757575;
        display: flex;
        align-items: center;

        .user-info {
          margin-left: 8px;
          padding-left: 8px;
          border-left: 1px solid #e0e0e0;
        }
      }
    }

    .item-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .item-actions {
      opacity: 1;
    }
  }
}

.history-thumbnails {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;

  .thumbnail-item {
    border-radius: 8px;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      .thumbnail-overlay {
        opacity: 1;
      }
    }

    &.current {
      border: 2px solid #1976d2;
    }

    &.restored {
      border-left: 3px solid #4caf50;
    }

    .thumbnail-image {
      height: 100px;
      background-color: #f5f5f5;
      background-size: cover;
      background-position: center;
      position: relative;

      .thumbnail-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
      }
    }

    .thumbnail-info {
      padding: 8px 12px;

      .thumbnail-title {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .thumbnail-time {
        font-size: 12px;
        color: #757575;
      }
    }
  }
}

.history-timeline {
  padding: 30px 16px;
  position: relative;

  .timeline-track {
    position: relative;
    height: 50px;

    .timeline-line {
      position: absolute;
      top: 15px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #e0e0e0;
    }

    .timeline-point {
      position: absolute;
      top: 0;
      transform: translateX(-50%);

      &:hover .point-tooltip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      &.current .point-icon {
        border: 2px solid #1976d2;
        background-color: white;
      }

      &.restored .point-icon {
        border: 2px solid #4caf50;
      }

      .point-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e0e0e0;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          transform: scale(1.1);
        }
      }

      .point-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        width: 200px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 12px;
        opacity: 0;
        transition: all 0.2s;
        pointer-events: none;
        z-index: 10;
        margin-bottom: 8px;

        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px;
          border-style: solid;
          border-color: white transparent transparent transparent;
        }

        .tooltip-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .tooltip-time {
          font-size: 12px;
          color: #757575;
          margin-bottom: 8px;
        }

        .tooltip-actions {
          display: flex;
          justify-content: flex-end;

          button {
            background-color: #1976d2;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;

            &:hover {
              background-color: #1565c0;
            }
          }
        }
      }
    }
  }
}

.preview-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 200;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .preview-content {
    flex: 1;
    overflow: hidden;
    padding: 16px;

    .preview-image {
      width: 100%;
      height: 400px;
      background-color: #f5f5f5;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 4px;
    }
  }

  .preview-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    gap: 12px;

    button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      &.btn-primary {
        background-color: #1976d2;
        color: white;
        border: none;

        &:hover {
          background-color: #1565c0;
        }
      }

      &.btn-secondary {
        background-color: white;
        color: #333;
        border: 1px solid #e0e0e0;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .history-panel {
    width: 100%;
    right: -100%;
  }

  .history-thumbnails {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
    top: 0;
    left: 0;
    transform: none;
    border-radius: 0;
  }
}
</style>




