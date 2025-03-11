<!-- Zastąp zawartość pliku frontend/src/components/common/Navbar.vue -->

<template>
  <nav class="navbar navbar-expand-lg" :class="{ 'navbar-dark': isDark, 'navbar-light': !isDark }">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <i class="bi bi-easel2"></i> Whiteboard
      </a>

      <div class="navbar-nav ms-auto">
        <a class="nav-link" href="#" @click.prevent="toggleTheme">
          <i class="bi" :class="isDark ? 'bi-sun' : 'bi-moon'"></i>
          {{ isDark ? 'Tryb jasny' : 'Tryb ciemny' }}
        </a>
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
    const isDark = computed(() => store.getters.isDarkMode);

    const toggleTheme = () => {
      store.dispatch('toggleDarkMode');
    };

    return {
      isDark,
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

.nav-link i {
  margin-right: 0.5rem;
}

/* Dark theme overrides */
:root.dark-theme .navbar {
  background-color: #2c3e50;
}
</style>