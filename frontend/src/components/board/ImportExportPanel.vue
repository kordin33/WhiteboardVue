<!-- Utwórz nowy plik frontend/src/components/board/ImportExportPanel.vue -->

<template>
  <div class="import-export-panel" :class="{ 'is-visible': visible }">
    <div class="panel-header">
      <h2>{{ mode === 'import' ? 'Importuj tablicę' : 'Eksportuj tablicę' }}</h2>
      <button class="close-btn" @click="close">×</button>
    </div>

    <div class="panel-content">
      <template v-if="mode === 'export'">
        <p class="mb-3">
          Skopiuj ten JSON i zapisz go. Będziesz mógł go użyć do odtworzenia tablicy później.
        </p>
        <textarea 
          v-model="exportData" 
          class="export-textarea"
          readonly
          @click="selectAll"
          ref="exportTextarea"
        ></textarea>
        <div class="actions">
          <button class="btn btn-primary" @click="copyToClipboard">
            <i class="bi bi-clipboard"></i> Kopiuj do schowka
          </button>
          <button class="btn btn-secondary" @click="downloadJson">
            <i class="bi bi-download"></i> Pobierz jako JSON
          </button>
        </div>
      </template>

      <template v-else>
        <p class="mb-3">
          Wklej wcześniej wyeksportowane dane tablicy, aby ją odtworzyć.
        </p>
        <textarea 
          v-model="importData" 
          class="export-textarea"
          placeholder="Wklej JSON tutaj..."
        ></textarea>
        <div class="actions">
          <button 
            class="btn btn-primary" 
            @click="processImport"
            :disabled="!isValidJson"
          >
            <i class="bi bi-cloud-upload"></i> Importuj tablicę
          </button>
        </div>
        <div v-if="importError" class="error-message">
          {{ importError }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ImportExportPanel',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'export',
      validator: (value) => ['export', 'import'].includes(value)
    },
    boardData: {
      type: [Object, String],
      default: () => ({})
    }
  },

  emits: ['close', 'import-board'],

  setup(props, { emit }) {
    const exportData = ref('');
    const importData = ref('');
    const importError = ref('');
    const exportTextarea = ref(null);

    // Obserwuj zmiany boardData i aktualizuj exportData
    watch(() => props.boardData, (newVal) => {
      if (newVal && typeof newVal === 'object') {
        exportData.value = JSON.stringify(newVal, null, 2);
      } else if (typeof newVal === 'string') {
        exportData.value = newVal;
      }
    }, { immediate: true });

    // Właściwość obliczeniowa do sprawdzania, czy importData jest prawidłowym JSON
    const isValidJson = computed(() => {
      if (!importData.value.trim()) return false;

      try {
        JSON.parse(importData.value);
        importError.value = '';
        return true;
      } catch (e) {
        importError.value = 'Nieprawidłowy format JSON';
        return false;
      }
    });

    // Funkcja zamykająca panel
    const close = () => {
      emit('close');
    };

    // Funkcja zaznaczająca cały tekst w polu eksportu
    const selectAll = () => {
      if (exportTextarea.value) {
        exportTextarea.value.select();
      }
    };

    // Funkcja kopiująca dane eksportu do schowka
    const copyToClipboard = () => {
      selectAll();
      document.execCommand('copy');

      // Alternatywnie, używając Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(exportData.value)
          .then(() => {
            // Tu można wyświetlić komunikat o sukcesie
          })
          .catch(err => {
            console.error('Nie można skopiować tekstu: ', err);
          });
      }
    };

    // Funkcja do pobierania danych eksportu jako JSON
    const downloadJson = () => {
      const blob = new Blob([exportData.value], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tablica_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Funkcja do przetwarzania danych importu
    const processImport = () => {
      if (!isValidJson.value) return;

      try {
        const data = JSON.parse(importData.value);
        emit('import-board', data);
      } catch (e) {
        importError.value = `Błąd importu: ${e.message}`;
      }
    };

    return {
      exportData,
      importData,
      importError,
      exportTextarea,
      isValidJson,
      close,
      selectAll,
      copyToClipboard,
      downloadJson,
      processImport
    };
  }
};
</script>

<style scoped>
.import-export-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}

.import-export-panel.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #000;
}

.panel-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.export-textarea {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.error-message {
  margin-top: 12px;
  color: #e74c3c;
  font-size: 14px;
}

@media (max-width: 768px) {
  .import-export-panel {
    width: 95vw;
    max-height: 80vh;
  }
}
</style>