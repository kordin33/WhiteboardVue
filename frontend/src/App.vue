<template>
  <div id="app" :class="{ 'dark-theme': isDarkMode }">
    <div class="navbar" :class="{ 'navbar-dark': isDarkMode, 'navbar-light': !isDarkMode }">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-easel2"></i> Whiteboard App
        </router-link>

        <div class="nav-links">
          <template v-if="isAuthenticated">
            <router-link class="nav-link" to="/boards">
              <i class="bi bi-grid"></i> Moje tablice
            </router-link>
            <router-link class="nav-link" to="/boards/create">
              <i class="bi bi-plus-circle"></i> Utwórz nową
            </router-link>
            <div class="user-section">
              <span>{{ username }}</span>
              <button @click="logout" class="btn btn-danger btn-sm">Wyloguj</button>
            </div>
          </template>
          <template v-else>
            <router-link class="nav-link" to="/login">
              <i class="bi bi-box-arrow-in-right"></i> Zaloguj
            </router-link>
            <router-link class="nav-link" to="/register">
              <i class="bi bi-person-plus"></i> Zarejestruj
            </router-link>
          </template>
        </div>
      </div>
    </div>

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
import { useRouter } from 'vue-router';
import AppLoader from '@/components/common/AppLoader.vue';

export default {
  name: 'App',

  components: {
    AppLoader
  },

  setup() {
    const store = useStore();
    const router = useRouter();

    const isAppLoading = computed(() => store.getters.isAppLoading);
    const isDarkMode = computed(() => store.getters.isDarkMode);
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const username = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user ? user.username : '';
    });

    // Inicjalizacja stanu uwierzytelniania użytkownika
    const initAuth = async () => {
      try {
        await store.dispatch('auth/initAuth');
      } catch (error) {
        console.error('Błąd inicjalizacji uwierzytelniania:', error);
      }
    };

    // Obserwuj zmiany trybu ciemnego i aktualizuj dokument
    watch(isDarkMode, (newValue) => {
      if (newValue) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }, { immediate: true });

    // Funkcja wylogowania
    const logout = async () => {
      await store.dispatch('auth/logout');
      router.push('/login');
    };

    onMounted(() => {
      initAuth();
      console.log('App component został zamontowany');
    });

    return {
      isAppLoading,
      isDarkMode,
      isAuthenticated,
      username,
      logout
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

/* Style globalne */
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
  padding: 20px;
}

/* Navbar */
.navbar {
  background-color: var(--primary);
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  color: white;
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