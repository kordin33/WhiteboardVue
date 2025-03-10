<template>
  <div class="debug-panel" v-if="showDebug">
    <h4>Debug Information</h4>
    <div class="debug-content">
      <p><strong>Current Route:</strong> {{ currentRoute }}</p>
      <p><strong>Authentication Status:</strong> {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}</p>
      <div v-if="user">
        <p><strong>User:</strong> {{ user.username }}</p>
      </div>
      <p><strong>Last Error:</strong> {{ lastError || 'None' }}</p>

      <div class="debug-actions">
        <button @click="clearTokens" class="btn btn-danger btn-sm">Clear Auth Tokens</button>
        <button @click="navigateHome" class="btn btn-primary btn-sm">Go to Home</button>
        <button @click="navigateLogin" class="btn btn-info btn-sm">Go to Login</button>
        <button @click="hideDebug" class="btn btn-secondary btn-sm">Hide Debug</button>
      </div>
    </div>
  </div>
  <button 
    v-else 
    @click="showDebug = true" 
    class="debug-toggle"
    title="Show Debug Panel"
  >
    D
  </button>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import tokenUtils from '@/utils/tokenUtils';

export default {
  name: 'DebugHelper',

  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const showDebug = ref(false);
    const lastError = ref('');

    const currentRoute = computed(() => {
      return route.fullPath;
    });

    const isAuthenticated = computed(() => {
      return tokenUtils.isAuthenticated();
    });

    const user = computed(() => {
      return tokenUtils.getUser();
    });

    const clearTokens = () => {
      tokenUtils.clearTokens();
      lastError.value = 'Tokens cleared';
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const navigateHome = () => {
      router.push('/').catch(err => {
        lastError.value = `Navigation error: ${err.message}`;
      });
    };

    const navigateLogin = () => {
      router.push('/login').catch(err => {
        lastError.value = `Navigation error: ${err.message}`;
      });
    };

    const hideDebug = () => {
      showDebug.value = false;
    };

    // Monitor for errors
    const originalConsoleError = console.error;
    console.error = function() {
      lastError.value = Array.from(arguments).join(' ');
      originalConsoleError.apply(console, arguments);
    };

    return {
      showDebug,
      currentRoute,
      isAuthenticated,
      user,
      lastError,
      clearTokens,
      navigateHome,
      navigateLogin,
      hideDebug
    };
  }
};
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 400px;
  max-width: 90vw;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 5px;
  padding: 10px;
  z-index: 10000;
  font-size: 12px;
}

.debug-panel h4 {
  margin-top: 0;
  border-bottom: 1px solid #666;
  padding-bottom: 5px;
}

.debug-content {
  max-height: 300px;
  overflow-y: auto;
}

.debug-actions {
  display: flex;
  gap: 5px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.debug-toggle {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}
</style>