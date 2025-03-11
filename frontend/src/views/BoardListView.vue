<template>
  <div class="board-list-view">
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="mb-0">Moje tablice</h1>

        <button class="btn btn-primary" @click="openCreateBoardModal">
          <i class="bi bi-plus-lg"></i> Utwórz nową tablicę
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Ładowanie...</span>
        </div>
        <p class="mt-2">Ładowanie tablic...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i> {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="loadBoards">
          Spróbuj ponownie
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!ownedBoards.length && !sharedBoards.length" class="text-center py-5">
        <div class="empty-state">
          <i class="bi bi-easel2 display-1 text-muted"></i>
          <h3 class="mt-3">Nie masz jeszcze żadnych tablic</h3>
          <p class="text-muted">Utwórz swoją pierwszą tablicę, aby rozpocząć pracę</p>
          <button class="btn btn-primary mt-3" @click="openCreateBoardModal">
            <i class="bi bi-plus-lg"></i> Utwórz nową tablicę
          </button>
        </div>
      </div>

      <!-- Content state -->
      <div v-else>
        <!-- Owned boards -->
        <h2 class="mt-4 mb-3 section-title">
          <i class="bi bi-person-check me-2"></i> Własne tablice
        </h2>

        <div v-if="!ownedBoards.length" class="alert alert-info">
          Nie masz jeszcze własnych tablic. 
          <button class="btn btn-sm btn-primary ms-2" @click="openCreateBoardModal">
            Utwórz pierwszą
          </button>
        </div>

        <div v-else class="row row-cols-1 row-cols-md-3 g-4 mb-5">
          <div 
            v-for="board in ownedBoards" 
            :key="board.id" 
            class="col"
          >
            <div class="card h-100 board-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <h5 class="card-title">{{ board.title }}</h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-link text-muted" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <button class="dropdown-item" @click="openBoard(board)">
                          <i class="bi bi-pencil-square me-2"></i> Edytuj
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item" @click="openShareModal(board)">
                          <i class="bi bi-share me-2"></i> Udostępnij
                        </button>
                      </li>
                      <li>
                        <button class="dropdown-item" @click="duplicateBoard(board)">
                          <i class="bi bi-copy me-2"></i> Duplikuj
                        </button>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <button class="dropdown-item text-danger" @click="confirmDelete(board)">
                          <i class="bi bi-trash me-2"></i> Usuń
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <p class="card-text">
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i> 
                    Utworzono: {{ formatDate(board.created_at) }}
                  </small>
                </p>

                <p class="card-text">
                  <small class="text-muted">
                    <i class="bi bi-grid-3x3 me-1"></i> 
                    Elementów: {{ board.elements_count || 0 }}
                  </small>
                </p>
              </div>
              <div class="card-footer bg-transparent">
                <button class="btn btn-sm btn-primary w-100" @click="openBoard(board)">
                  <i class="bi bi-easel me-1"></i> Otwórz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Shared boards -->
        <div v-if="sharedBoards.length > 0">
          <h2 class="mt-4 mb-3 section-title">
            <i class="bi bi-people me-2"></i> Udostępnione tablice
          </h2>

          <div class="row row-cols-1 row-cols-md-3 g-4">
            <div 
              v-for="board in sharedBoards" 
              :key="board.id" 
              class="col"
            >
              <div class="card h-100 board-card shared">
                <div class="card-body">
                  <h5 class="card-title">{{ board.title }}</h5>
                  <p class="card-text">
                    <small class="text-muted">
                      <i class="bi bi-person me-1"></i> 
                      Właściciel: {{ board.owner?.username || 'Nieznany' }}
                    </small>
                  </p>
                  <p class="card-text">
                    <span class="badge" :class="permissionBadgeClass(board.user_permission)">
                      <i class="bi" :class="permissionIcon(board.user_permission)"></i>
                      {{ permissionLabel(board.user_permission) }}
                    </span>
                  </p>
                </div>
                <div class="card-footer bg-transparent">
                  <button class="btn btn-sm btn-outline-primary w-100" @click="openBoard(board)">
                    <i class="bi bi-easel me-1"></i> Otwórz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Board Modal -->
    <div 
      class="modal fade" 
      id="createBoardModal" 
      tabindex="-1" 
      aria-hidden="true"
      ref="createBoardModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Utwórz nową tablicę</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createBoard">
              <div class="mb-3">
                <label for="boardTitle" class="form-label">Tytuł tablicy</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="boardTitle" 
                  v-model="newBoardTitle"
                  placeholder="Podaj nazwę tablicy" 
                  required
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="createBoard" 
              :disabled="!newBoardTitle || createLoading"
            >
              <span v-if="createLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ createLoading ? 'Tworzenie...' : 'Utwórz' }}
            </button>
          </div>
        </div>
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
          <div class="modal-body" v-if="boardToDelete">
            <p>Czy na pewno chcesz usunąć tablicę <strong>"{{ boardToDelete.title }}"</strong>?</p>
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
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';

export default {
  name: 'BoardListView',

  setup() {
    const store = useStore();
    const router = useRouter();

    // Template refs
    const createBoardModal = ref(null);
    const deleteModal = ref(null);

    // Local state
    const newBoardTitle = ref('');
    const createLoading = ref(false);
    const deleteLoading = ref(false);
    const boardToDelete = ref(null);

    // Computed properties
    const loading = computed(() => store.getters['boards/isLoading']);
    const error = computed(() => store.getters['boards/error']);
    const allBoards = computed(() => store.getters['boards/allBoards']);
    const ownedBoards = computed(() => store.getters['boards/ownedBoards']);
    const sharedBoards = computed(() => store.getters['boards/sharedBoards']);

    // Load boards on component mount
    onMounted(() => {
      loadBoards();
    });

    // Load boards from API
    const loadBoards = async () => {
      try {
        await store.dispatch('boards/fetchBoards');
      } catch (error) {
        console.error('Failed to load boards:', error);
      }
    };

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return '';

      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    };

    // Permission helpers
    const permissionLabel = (permission) => {
      switch (permission) {
        case 'view': return 'Tylko podgląd';
        case 'edit': return 'Edycja';
        case 'admin': return 'Administrator';
        default: return 'Nieznane uprawnienia';
      }
    };

    const permissionBadgeClass = (permission) => {
      switch (permission) {
        case 'view': return 'bg-secondary';
        case 'edit': return 'bg-success';
        case 'admin': return 'bg-primary';
        default: return 'bg-secondary';
      }
    };

    const permissionIcon = (permission) => {
      switch (permission) {
        case 'view': return 'bi-eye';
        case 'edit': return 'bi-pencil-square';
        case 'admin': return 'bi-shield-lock';
        default: return 'bi-question-circle';
      }
    };

    // Modal management
    const openCreateBoardModal = () => {
      // Reset form
      newBoardTitle.value = '';

      // Get modal instance and show it
      const modalElement = createBoardModal.value;
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    };

    const openShareModal = (board) => {
      // Placeholder for share modal
      console.log('Open share modal for board:', board);
      alert('Funkcja udostępniania zostanie zaimplementowana wkrótce.');
    };

    const confirmDelete = (board) => {
      boardToDelete.value = board;

      // Get modal instance and show it
      const modalElement = deleteModal.value;
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    };

    const createBoard = async () => {
      if (!newBoardTitle.value) return;

      createLoading.value = true;

      try {
        // Dodaj więcej logów
        console.log("Wysyłanie żądania utworzenia tablicy:", { title: newBoardTitle.value });

        const result = await store.dispatch('boards/createBoard', {
          title: newBoardTitle.value
        });

        console.log("Odpowiedź serwera:", result);

        // Zamknij modal po utworzeniu
        const modalElement = createBoardModal.value;
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }

        // Załaduj tablice na nowo zamiast przekierowywać
        await loadBoards();
      } catch (error) {
        console.error('Failed to create board:', error);
      } finally {
        createLoading.value = false;
      }
    };

    const duplicateBoard = (board) => {
      // Placeholder for duplicate board
      console.log('Duplicate board:', board);
      alert('Funkcja duplikowania zostanie zaimplementowana wkrótce.');
    };

    const deleteBoard = async () => {
      if (!boardToDelete.value) return;

      deleteLoading.value = true;

      try {
        await store.dispatch('boards/deleteBoard', boardToDelete.value.id);

        // Close modal
        const modalElement = deleteModal.value;
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
      } catch (error) {
        console.error('Failed to delete board:', error);
      } finally {
        deleteLoading.value = false;
        boardToDelete.value = null;
      }
    };

    // Navigation
    const openBoard = (board) => {
      router.push(`/boards/${board.id}`);
    };

    return {
      // Refs
      createBoardModal,
      deleteModal,

      // State
      newBoardTitle,
      createLoading,
      deleteLoading,
      boardToDelete,

      // Computed
      loading,
      error,
      allBoards,
      ownedBoards,
      sharedBoards,

      // Methods
      loadBoards,
      formatDate,
      permissionLabel,
      permissionBadgeClass,
      permissionIcon,
      openCreateBoardModal,
      openShareModal,
      confirmDelete,
      createBoard,
      duplicateBoard,
      deleteBoard,
      openBoard
    };
  }
};
</script>

<style scoped>
.board-list-view {
  min-height: calc(100vh - 56px);
  background-color: var(--bs-light, #f8f9fa);
}

.section-title {
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--bs-dark, #343a40);
  border-bottom: 2px solid var(--bs-primary, #3498db);
  padding-bottom: 0.5rem;
  display: inline-block;
}

.board-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.board-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.board-card.shared {
  border-left: 4px solid var(--bs-info, #17a2b8);
}

.empty-state {
  padding: 3rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.btn-link {
  color: var(--bs-secondary, #6c757d);
  padding: 0.25rem;
}

.btn-link:hover {
  color: var(--bs-dark, #343a40);
}
</style>