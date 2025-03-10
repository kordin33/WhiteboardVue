<template>
  <div class="test-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h2>Vue Router Test Page</h2>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h4>Current Route Information</h4>
                <pre class="bg-light p-3">{{ routeInfo }}</pre>
              </div>

              <div class="mb-4">
                <h4>Navigation Tests</h4>
                <div class="d-flex flex-wrap gap-2">
                  <button 
                    v-for="route in routes" 
                    :key="route.path"
                    @click="navigateTo(route.path)"
                    class="btn"
                    :class="route.class || 'btn-outline-primary'"
                  >
                    {{ route.label }}
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <h4>Vuex Store Tests</h4>
                <div class="d-flex flex-wrap gap-2">
                  <button @click="toggleLoading" class="btn btn-outline-secondary">
                    {{ isLoading ? 'Hide' : 'Show' }} Loader
                  </button>
                  <button @click="toggleDarkMode" class="btn btn-outline-dark">
                    Toggle Dark Mode
                  </button>
                </div>

                <div class="mt-3">
                  <strong>Store State:</strong>
                  <ul class="list-group mt-2">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      App Loading
                      <span class="badge" :class="isLoading ? 'bg-success' : 'bg-danger'">
                        {{ isLoading ? 'ON' : 'OFF' }}
                      </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Dark Mode
                      <span class="badge" :class="isDarkMode ? 'bg-dark' : 'bg-light text-dark'">
                        {{ isDarkMode ? 'ON' : 'OFF' }}
                      </span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Authentication
                      <span class="badge" :class="isAuthenticated ? 'bg-success' : 'bg-secondary'">
                        {{ isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT' }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-4">
                <h4>Console Output</h4>
                <div class="console-output bg-dark text-light p-3" style="min-height: 100px; max-height: 200px; overflow-y: auto;">
                  <div v-for="(log, index) in consoleOutput" :key="index" :class="log.type">
                    {{ log.message }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'TestPage',

  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const consoleOutput = ref([]);

    // Route test data
    const routes = [
      { path: '/', label: 'Home', class: 'btn-primary' },
      { path: '/login', label: 'Login', class: 'btn-success' },
      { path: '/register', label: 'Register', class: 'btn-info' },
      { path: '/boards', label: 'Boards', class: 'btn-warning' },
      { path: '/not-found', label: '404 Page', class: 'btn-danger' }
    ];

    // Computed values
    const routeInfo = computed(() => {
      return {
        path: route.path,
        fullPath: route.fullPath,
        name: route.name,
        params: route.params,
        query: route.query,
        hash: route.hash,
        meta: route.meta
      };
    });

    const isLoading = computed(() => store.getters.isAppLoading);
    const isDarkMode = computed(() => store.getters.isDarkMode);
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

    // Navigation function
    const navigateTo = (path) => {
      logToConsole(`Navigating to: ${path}`);

      router.push(path).catch(err => {
        logToConsole(`Navigation error: ${err.message}`, 'error');
      });
    };

    // Store actions
    const toggleLoading = () => {
      const newValue = !isLoading.value;
      logToConsole(`Setting app loading to: ${newValue}`);
      store.dispatch('setAppLoading', newValue);
    };

    const toggleDarkMode = () => {
      logToConsole('Toggling dark mode');
      store.dispatch('toggleDarkMode');
    };

    // Console override
    const logToConsole = (message, type = 'info') => {
      consoleOutput.value.unshift({ 
        message: `[${new Date().toLocaleTimeString()}] ${message}`,
        type 
      });

      // Keep original behavior
      if (type === 'error') {
        console.error(message);
      } else {
        console.log(message);
      }
    };

    // Override console methods
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function() {
      const message = Array.from(arguments).join(' ');
      consoleOutput.value.unshift({ 
        message: `[${new Date().toLocaleTimeString()}] ${message}`,
        type: 'info' 
      });
      originalConsoleLog.apply(console, arguments);
    };

    console.error = function() {
      const message = Array.from(arguments).join(' ');
      consoleOutput.value.unshift({ 
        message: `[${new Date().toLocaleTimeString()}] ${message}`,
        type: 'error' 
      });
      originalConsoleError.apply(console, arguments);
    };

    // Component lifecycle
    onMounted(() => {
      logToConsole('Test page mounted');

      // Restore console methods when component is destroyed
      return () => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
      };
    });

    return {
      routes,
      routeInfo,
      isLoading,
      isDarkMode,
      isAuthenticated,
      consoleOutput,
      navigateTo,
      toggleLoading,
      toggleDarkMode
    };
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}

.console-output {
  font-family: monospace;
  border-radius: 4px;
}

.console-output .info {
  color: #fff;
}

.console-output .error {
  color: #ff6b6b;
}

.test-page {
  margin-top: 20px;
}
</style>