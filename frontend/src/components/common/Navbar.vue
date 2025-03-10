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
<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="navbar-brand">Whiteboard App</router-link>
      
      <div class="navbar-menu">
        <router-link to="/boards" class="navbar-item">Moje tablice</router-link>
      </div>
      
      <div class="navbar-user">
        <span v-if="user" class="user-name">{{ user.username }}</span>
        <button v-if="isAuthenticated" @click="logout" class="btn btn-outline-light">
          Wyloguj
        </button>
        <template v-else>
          <router-link to="/login" class="btn btn-outline-light">Zaloguj</router-link>
          <router-link to="/register" class="btn btn-primary">Rejestracja</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'Navbar',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const user = computed(() => store.getters.user);
    
    const logout = () => {
      store.dispatch('logout');
      router.push('/login');
    };
    
    return {
      isAuthenticated,
      user,
      logout
    };
  }
}
</script>

<style scoped>
.navbar {
  background-color: var(--dark-color);
  color: white;
  padding: 1rem 0;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 1rem;
}

.navbar-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
}

.navbar-item:hover {
  text-decoration: underline;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  margin-right: 0.5rem;
}

.btn-outline-light {
  color: white;
  border-color: white;
}

.btn-outline-light:hover {
  background-color: white;
  color: var(--dark-color);
}
</style>
