<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <Navbar />

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppLoader v-if="isAppLoading" />
  </div>
</template>

<script>
import { onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import Navbar from '@/components/common/Navbar.vue';
import AppLoader from '@/components/common/AppLoader.vue';
import api from '@/services/api';

export default {
  name: 'App',

  components: {
    Navbar,
    AppLoader
  },

  setup() {
    const store = useStore();

    const isAppLoading = computed(() => store.getters.isAppLoading);
    const isDarkMode = computed(() => store.getters.isDarkMode);

    // Inicjalizacja tablicy przy starcie
    const initializeBoard = async () => {
      try {
        store.dispatch('setAppLoading', true);
        console.log('Sprawdzanie czy tablica istnieje...');

        try {
          // Sprawdź czy tablica o ID=1 istnieje
          const response = await api.get('/boards/1/');
          console.log('Znaleziono istniejącą tablicę:', response.data);
          return response.data.id;
        } catch (error) {
          console.log('Tworzenie nowej tablicy...');
          // Utwórz nową tablicę
          const newBoardResponse = await api.post('/boards/', {
            title: 'Whiteboard'
          });
          console.log('Utworzono nową tablicę:', newBoardResponse.data);
          return newBoardResponse.data.id;
        }
      } catch (error) {
        console.error('Błąd podczas inicjalizacji tablicy:', error);
        return 1; // Domyślne ID w przypadku błędu
      } finally {
        store.dispatch('setAppLoading', false);
      }
    };

    // Watch for dark mode changes and update document
    watch(isDarkMode, (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }, { immediate: true });

    onMounted(async () => {
      // Inicjalizacja motywu
      store.dispatch('initTheme');

      // Inicjalizacja tablicy
      const boardId = await initializeBoard();
      console.log('Tablica gotowa, ID:', boardId);
    });

    return {
      isAppLoading,
      isDarkMode
    };
  }
};
</script>

<style>
:root {
  --primary: #3498db;
  --secondary: #6c757d;
  --success: #2ecc71;
  --danger: #e74c3c;
  --warning: #f39c12;
  --info: #3498db;
  --light: #f8f9fa;
  --dark: #343a40;
  --body-bg: #f8f9fa;
  --body-color: #212529;
}

:root.dark-theme {
  --primary: #3498db;
  --secondary: #6c757d;
  --success: #2ecc71;
  --danger: #e74c3c;
  --warning: #f39c12;
  --info: #3498db;
  --light: #343a40;
  --dark: #f8f9fa;
  --body-bg: #121212;
  --body-color: #f8f9fa;
}

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--body-bg);
  color: var(--body-color);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>