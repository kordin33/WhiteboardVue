
<template>
  <div class="boards-view">
    <div class="container">
      <div class="boards-header">
        <h1>Moje tablice</h1>
        <button @click="createNewBoard" class="btn btn-primary">
          Utwórz nową tablicę
        </button>
      </div>
      
      <div v-if="loading" class="loading">
        Ładowanie tablic...
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-else>
        <h2>Własne tablice</h2>
        <div v-if="ownedBoards.length" class="boards-grid">
          <div v-for="board in ownedBoards" :key="board.id" class="board-card">
            <div class="board-card-body">
              <h3>{{ board.title }}</h3>
              <p>Utworzono: {{ formatDate(board.created_at) }}</p>
            </div>
            <div class="board-card-footer">
              <router-link :to="`/boards/${board.id}`" class="btn btn-primary">
                Otwórz
              </router-link>
            </div>
          </div>
        </div>
        <p v-else>Nie masz jeszcze żadnych tablic.</p>
        
        <h2>Udostępnione tablice</h2>
        <div v-if="sharedBoards.length" class="boards-grid">
          <div v-for="board in sharedBoards" :key="board.id" class="board-card">
            <div class="board-card-body">
              <h3>{{ board.title }}</h3>
              <p>Właściciel: {{ board.owner.username }}</p>
            </div>
            <div class="board-card-footer">
              <router-link :to="`/boards/${board.id}`" class="btn btn-primary">
                Otwórz
              </router-link>
            </div>
          </div>
        </div>
        <p v-else>Nikt nie udostępnił Ci jeszcze żadnych tablic.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { toast } from 'vue3-toastify';

export default {
  name: 'BoardsView',
  
  setup() {
    const router = useRouter();
    const boards = ref([]);
    const loading = ref(true);
    const error = ref('');
    
    const fetchBoards = async () => {
      try {
        loading.value = true;
        error.value = '';
        const response = await api.get('/boards/');
        boards.value = response.data;
      } catch (err) {
        console.error('Error fetching boards:', err);
        error.value = 'Nie udało się pobrać tablic. Spróbuj ponownie później.';
        toast.error('Błąd podczas pobierania tablic');
      } finally {
        loading.value = false;
      }
    };
    
    const createNewBoard = async () => {
      try {
        const title = prompt('Podaj tytuł nowej tablicy:');
        if (!title) return;
        
        const response = await api.post('/boards/', { title });
        toast.success('Tablica została utworzona');
        
        // Przejdź do nowej tablicy
        router.push(`/boards/${response.data.id}`);
      } catch (err) {
        console.error('Error creating board:', err);
        toast.error('Nie udało się utworzyć tablicy');
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Filtry dla tablic
    const ownedBoards = computed(() => {
      return boards.value.filter(board => board.is_owner);
    });
    
    const sharedBoards = computed(() => {
      return boards.value.filter(board => !board.is_owner);
    });
    
    onMounted(() => {
      fetchBoards();
    });
    
    return {
      boards,
      loading,
      error,
      ownedBoards,
      sharedBoards,
      createNewBoard,
      formatDate
    };
  }
}
</script>

<style scoped>
.boards-view {
  padding: 2rem 0;
}

.boards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.board-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.board-card-body {
  padding: 1.5rem;
  flex: 1;
}

.board-card-footer {
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

h2 {
  margin: 1.5rem 0 1rem;
  font-size: 1.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #777;
}
</style>
