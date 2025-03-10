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
    <DebugHelper />
  </div>
</template>

<script>
import { onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import Navbar from '@/components/common/Navbar.vue';
import AppLoader from '@/components/common/AppLoader.vue';
import DebugHelper from '@/components/common/DebugHelper.vue';

export default {
  name: 'App',

  components: {
    Navbar,
    AppLoader,
    DebugHelper
  },

  setup() {
    const store = useStore();

    const isAppLoading = computed(() => store.getters.isAppLoading);
    const isDarkMode = computed(() => store.getters.isDarkMode);

    // Initialize user authentication state
    const initAuth = async () => {
      try {
        await store.dispatch('auth/initAuth');
      } catch (error) {
        console.error('Auth initialization error:', error);
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

    onMounted(() => {
      initAuth();
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