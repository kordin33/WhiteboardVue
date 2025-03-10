<!-- TemplatesPanel.vue - Panel szablonów -->
<template>
  <div class="templates-panel" :class="{ 'is-visible': visible }">
    <div class="panel-header">
      <h2>Szablony</h2>
      <div class="header-actions">
        <button class="btn-icon" @click="createTemplate" title="Utwórz nowy szablon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="btn-icon" @click="close" title="Zamknij panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <div class="panel-filter">
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="Szukaj..." class="search-input" />
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      <div class="category-filter">
        <span>Kategoria:</span>
        <select v-model="selectedCategory">
          <option value="">Wszystkie</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ getCategoryLabel(category) }}
          </option>
        </select>
      </div>
    </div>

    <div class="templates-content">
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        <span>Ładowanie szablonów...</span>
      </div>

      <div v-else-if="filteredTemplates.length === 0" class="empty-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
        <p>Brak szablonów</p>
        <button class="btn-primary" @click="createTemplate">Utwórz pierwszy szablon</button>
      </div>

      <div v-else class="templates-grid">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="template-thumbnail" :style="{ backgroundImage: `url(${template.thumbnail || '/static/placeholder.png'})` }">
            <div class="template-actions">
              <button class="btn-icon" @click.stop="editTemplate(template)" title="Edytuj szablon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon" @click.stop="deleteTemplate(template)" title="Usuń szablon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <div class="template-meta">
              <span class="template-category" :class="template.category">
                {{ getCategoryLabel(template.category) }}
              </span>
              <span v-if="template.is_public" class="template-public">Publiczny</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog tworzenia/edycji szablonu -->
    <TemplateEditor
      v-if="showTemplateEditor"
      :template="editingTemplate"
      :categories="categories"
      @save="saveTemplate"
      @cancel="cancelTemplateEdit"
    />

    <!-- Dialog potwierdzenia usunięcia -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      title="Usunąć szablon?"
      message="Czy na pewno chcesz usunąć ten szablon? Tej operacji nie można cofnąć."
      confirm-text="Usuń"
      cancel-text="Anuluj"
      @confirm="confirmDeleteTemplate"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Dialog zastosowania szablonu -->
    <ConfirmDialog
      v-if="showApplyConfirm"
      title="Zastosować szablon?"
      message="Zastosowanie szablonu doda jego elementy do bieżącej tablicy. Kontynuować?"
      confirm-text="Zastosuj"
      cancel-text="Anuluj"
      @confirm="confirmApplyTemplate"
      @cancel="showApplyConfirm = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import TemplateEditor from './TemplateEditor.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import templateService from '@/services/templateService';

export default {
  name: 'TemplatesPanel',

  components: {
    TemplateEditor,
    ConfirmDialog
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'apply-template', 'create-template'],

  setup(props, { emit }) {
    // Stan komponentu
    const loading = ref(true);
    const templates = ref([]);
    const searchQuery = ref('');
    const selectedCategory = ref('');

    // Stan dialogów
    const showTemplateEditor = ref(false);
    const editingTemplate = ref(null);
    const showDeleteConfirm = ref(false);
    const templateToDelete = ref(null);
    const showApplyConfirm = ref(false);
    const templateToApply = ref(null);

    // Kategorie szablonów
    const categories = [
      'math',
      'physics',
      'biology',
      'chemistry',
      'general',
      'other'
    ];

    // Filtrowanie szablonów
    const filteredTemplates = computed(() => {
      let result = templates.value;

      // Filtrowanie po kategorii
      if (selectedCategory.value) {
        result = result.filter(template => template.category === selectedCategory.value);
      }

      // Filtrowanie po zapytaniu wyszukiwania
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(template => 
          template.name.toLowerCase().includes(query) ||
          getCategoryLabel(template.category).toLowerCase().includes(query)
        );
      }

      return result;
    });

    // Pobranie szablonów
    const loadTemplates = async () => {
      loading.value = true;

      try {
        templates.value = await templateService.getTemplates();
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        loading.value = false;
      }
    };

    // Zamykanie panelu
    const close = () => {
      emit('close');
    };

    // Tworzenie nowego szablonu
    const createTemplate = () => {
      editingTemplate.value = {
        name: '',
        category: 'general',
        is_public: false
      };
      showTemplateEditor.value = true;
    };

    // Edycja szablonu
    const editTemplate = (template) => {
      editingTemplate.value = { ...template };
      showTemplateEditor.value = true;
    };

    // Zapisanie szablonu
    const saveTemplate = async (templateData) => {
      try {
        if (templateData.id) {
          // Aktualizacja istniejącego szablonu
          const updatedTemplate = await templateService.updateTemplate(templateData.id, templateData);
          const index = templates.value.findIndex(t => t.id === updatedTemplate.id);
          if (index !== -1) {
            templates.value[index] = updatedTemplate;
          }
        } else {
          // Tworzenie nowego szablonu
          const newTemplate = await templateService.createTemplate(templateData);
          templates.value.push(newTemplate);
        }
      } catch (error) {
        console.error('Error saving template:', error);
      } finally {
        showTemplateEditor.value = false;
        editingTemplate.value = null;
      }
    };

    // Anulowanie edycji szablonu
    const cancelTemplateEdit = () => {
      showTemplateEditor.value = false;
      editingTemplate.value = null;
    };

    // Usunięcie szablonu
    const deleteTemplate = (template) => {
      templateToDelete.value = template;
      showDeleteConfirm.value = true;
    };

    // Potwierdzenie usunięcia szablonu
    const confirmDeleteTemplate = async () => {
      try {
        await templateService.deleteTemplate(templateToDelete.value.id);
        templates.value = templates.value.filter(t => t.id !== templateToDelete.value.id);
      } catch (error) {
        console.error('Error deleting template:', error);
      } finally {
        showDeleteConfirm.value = false;
        templateToDelete.value = null;
      }
    };

    // Wybór szablonu
    const selectTemplate = (template) => {
      templateToApply.value = template;
      showApplyConfirm.value = true;
    };

    // Potwierdzenie zastosowania szablonu
    const confirmApplyTemplate = () => {
      emit('apply-template', templateToApply.value);
      showApplyConfirm.value = false;
      templateToApply.value = null;
    };

    // Pobranie etykiety kategorii
    const getCategoryLabel = (categoryKey) => {
      const categoryLabels = {
        'math': 'Matematyka',
        'physics': 'Fizyka',
        'biology': 'Biologia',
        'chemistry': 'Chemia',
        'general': 'Ogólne',
        'other': 'Inne'
      };

      return categoryLabels[categoryKey] || categoryKey;
    };

    // Załadowanie szablonów po zamontowaniu
    onMounted(() => {
      loadTemplates();
    });

    return {
      loading,
      templates,
      filteredTemplates,
      searchQuery,
      selectedCategory,
      categories,
      showTemplateEditor,
      editingTemplate,
      showDeleteConfirm,
      showApplyConfirm,
      close,
      createTemplate,
      editTemplate,
      saveTemplate,
      cancelTemplateEdit,
      deleteTemplate,
      confirmDeleteTemplate,
      selectTemplate,
      confirmApplyTemplate,
      getCategoryLabel
    };
  }
};
</script>

<style lang="scss" scoped>
.templates-panel {
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

  .btn-icon {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    border: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }
  }
}

.panel-filter {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;

  .search-container {
    position: relative;
    margin-bottom: 12px;

    .search-input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        border-color: #1976d2;
        outline: none;
      }
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #757575;
    }
  }

  .category-filter {
    display: flex;
    align-items: center;

    span {
      font-size: 14px;
      margin-right: 8px;
    }

    select {
      flex: 1;
      padding: 6px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        border-color: #1976d2;
        outline: none;
      }
    }
  }
}

.templates-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading-message, .empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  min-height: 200px;

  svg {
    color: #9e9e9e;
    margin-bottom: 16px;
  }

  p {
    color: #757575;
    margin-bottom: 16px;
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

.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #1565c0;
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.template-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    .template-actions {
      opacity: 1;
    }
  }
}

.template-thumbnail {
  height: 120px;
  background-color: #f5f5f5;
  background-size: cover;
  background-position: center;
  position: relative;

  .template-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .btn-icon {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: none;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &:hover {
        background-color: white;
      }
    }
  }
}

.template-info {
  padding: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 8px;

  .template-category {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: #e3f2fd;
    color: #1976d2;

    &.math {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    &.physics {
      background-color: #ede7f6;
      color: #673ab7;
    }

    &.biology {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    &.chemistry {
      background-color: #fce4ec;
      color: #c2185b;
    }

    &.general {
      background-color: #f5f5f5;
      color: #616161;
    }

    &.other {
      background-color: #fff8e1;
      color: #ff8f00;
    }
  }

  .template-public {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: #e8f5e9;
    color: #2e7d32;
  }
}

@media (max-width: 768px) {
  .templates-panel {
    width: 100%;
    right: -100%;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
