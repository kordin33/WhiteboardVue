// Utwórz nowy plik w frontend/src/components/debug/ApiTester.vue

<template>
  <div class="api-tester">
    <h2>Tester Połączenia API</h2>

    <div class="status-box" :class="status">
      <div v-if="loading" class="spinner"></div>
      <div v-else>
        Status: <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <div class="actions">
      <button @click="testApi" :disabled="loading">
        {{ loading ? 'Testowanie...' : 'Testuj Połączenie API' }}
      </button>
    </div>

    <div v-if="error" class="error-box">
      <h3>Błąd:</h3>
      <pre>{{ error }}</pre>
    </div>

    <div v-if="result" class="result-box">
      <h3>Wynik:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <div class="debug-info">
      <h3>Informacje debugowania:</h3>
      <p><strong>Bazowy URL API:</strong> {{ baseUrl }}</p>
      <p><strong>Bieżący adres strony:</strong> {{ currentOrigin }}</p>
      <p><strong>Używany backend:</strong> {{ backendType }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { testConnection } from '@/services/api';

export default {
  name: 'ApiTester',

  setup() {
    const loading = ref(false);
    const status = ref('unknown');
    const result = ref(null);
    const error = ref(null);

    const currentOrigin = window.location.origin;
    const baseUrl = currentOrigin + '/api';

    // Określ używany backend na podstawie URLa
    const backendType = computed(() => {
      if (currentOrigin.includes('replit')) {
        return 'Replit';
      }
      if (currentOrigin.includes('localhost')) {
        return 'Lokalny serwer';
      }
      return 'Nieokreślony';
    });

    const statusText = computed(() => {
      if (status.value === 'success') return 'Połączenie udane';
      if (status.value === 'error') return 'Błąd połączenia';
      return 'Nieznany';
    });

    const testApi = async () => {
      loading.value = true;
      status.value = 'unknown';
      result.value = null;
      error.value = null;

      try {
        const response = await testConnection();

        if (response.success) {
          status.value = 'success';
          result.value = response.data;
        } else {
          status.value = 'error';
          error.value = response.error.toString();
        }
      } catch (err) {
        status.value = 'error';
        error.value = err.toString();
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      // Automatycznie przetestuj połączenie przy załadowaniu
      testApi();
    });

    return {
      loading,
      status,
      statusText,
      result,
      error,
      testApi,
      baseUrl,
      currentOrigin,
      backendType
    };
  }
}
</script>

<style scoped>
.api-tester {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-width: 800px;
  margin: 0 auto;
}

.status-box {
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  text-align: center;
  font-weight: bold;
}

.status-box.unknown {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}

.status-box.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.status-box.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.status-text {
  font-weight: bold;
}

.actions {
  margin: 15px 0;
  text-align: center;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-box, .result-box {
  margin-top: 20px;
  padding: 15px;
  border-radius: 5px;
  overflow: auto;
}

.error-box {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.result-box {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
  background-color: rgba(0,0,0,0.05);
  padding: 10px;
  border-radius: 3px;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 5px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>