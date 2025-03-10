<template>
  <nav class="navbar navbar-expand-lg" :class="{ 'navbar-dark': isDark, 'navbar-light': !isDark }">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-easel2"></i> Whiteboard App
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto" v-if="isAuthenticated">
          <li class="nav-item">
            <router-link class="nav-link" to="/boards">
              <i class="bi bi-grid"></i> Moje tablice
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/boards/create">
              <i class="bi bi-plus-circle"></i> Utwórz nową
            </router-link>
          </li>
        </ul>

        <div class="navbar-nav">
          <template v-if="isAuthenticated">
            <div class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle"></i> {{ userName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="bi bi-person"></i> Profil
                  </router-link>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="toggleTheme">
                    <i class="bi" :class="isDark ? 'bi-sun' : 'bi-moon'"></i>
                    {{ isDark ? 'Tryb jasny' : 'Tryb ciemny' }}
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="logout">
                    <i class="bi bi-box-arrow-right"></i> Wyloguj
                  </a>
                </li>
              </ul>
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
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AppNavbar',

  setup() {
    const store = useStore();

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const userName = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user ? user.username : '';
    });
    const isDark = computed(() => store.getters.isDarkMode);

    const logout = () => {
      store.dispatch('auth/logout');
    };

    const toggleTheme = () => {
      store.dispatch('toggleDarkMode');
    };

    return {
      isAuthenticated,
      userName,
      isDark,
      logout,
      toggleTheme
    };
  }
};
</script>

<style scoped>
.navbar {
  background-color: var(--bs-primary, #3498db);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.25rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.dropdown-item i,
.nav-link i {
  margin-right: 0.5rem;
}

/* Dark theme overrides */
:root.dark-theme .navbar {
  background-color: #2c3e50;
}
</style>