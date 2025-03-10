<template>
  <div class="login-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-header text-center py-3">
              <h2 class="mb-0">Logowanie</h2>
            </div>
            <div class="card-body p-4">
              <!-- Debug Info -->
              <div class="alert alert-info mb-3">
                <strong>Debug Info:</strong>
                <p>Form Submitted: {{ formSubmitted }}</p>
                <p>Loading State: {{ loading }}</p>
                <p>Error: {{ error }}</p>
                <button class="btn btn-sm btn-primary mt-2" @click="testNavigation">Test Navigation</button>
                <button class="btn btn-sm btn-warning mt-2 ms-2" @click="testAction">Test Action</button>
              </div>

              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="username" class="form-label">Nazwa użytkownika</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-person"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="username" 
                      v-model="username"
                      required
                      :disabled="loading"
                      autocomplete="username"
                    >
                  </div>
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label">Hasło</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      id="password" 
                      v-model="password"
                      required
                      :disabled="loading"
                      autocomplete="current-password"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="togglePasswordVisibility"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
                  </button>
                </div>
              </form>

              <div class="mt-4 text-center">
                <p class="mb-0">Nie masz jeszcze konta?</p>
                <router-link to="/register" class="fw-bold">Zarejestruj się</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-hidden="true" ref="errorModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Error Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <pre class="bg-light p-3">{{ errorDetails }}</pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
import { Modal } from 'bootstrap';

export default {
  name: 'LoginView',

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const errorModal = ref(null);

    const username = ref('demo');
    const password = ref('demo123');
    const showPassword = ref(false);
    const formSubmitted = ref(false);
    const errorDetails = ref('');

    const loading = computed(() => store.getters['auth/isLoading']);
    const error = computed(() => store.getters['auth/authError']);

    onMounted(() => {
      // Log that component was mounted
      console.log('LoginView mounted', { router, route });
    });

    const handleLogin = async () => {
      try {
        formSubmitted.value = true;
        console.log('Login form submitted', { username: username.value });

        await store.dispatch('auth/login', {
          username: username.value,
          password: password.value
        });

        // Log success
        console.log('Login successful, redirecting...');

        // Redirect to the intended page or the boards page
        const redirectPath = route.query.redirect || '/boards';
        console.log('Redirecting to:', redirectPath);

        router.push(redirectPath);
      } catch (err) {
        // Show detailed error
        errorDetails.value = JSON.stringify(err, null, 2);
        console.error('Login failed:', err);

        // Show error modal
        if (errorModal.value) {
          const modal = new Modal(errorModal.value);
          modal.show();
        }
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    // Test functions
    const testNavigation = () => {
      try {
        console.log('Testing navigation to /boards');
        router.push('/boards');
      } catch (err) {
        console.error('Navigation test failed:', err);
        errorDetails.value = JSON.stringify(err, null, 2);

        if (errorModal.value) {
          const modal = new Modal(errorModal.value);
          modal.show();
        }
      }
    };

    const testAction = () => {
      try {
        console.log('Testing Vuex action');
        store.dispatch('setAppLoading', true);
        setTimeout(() => {
          store.dispatch('setAppLoading', false);
        }, 2000);
      } catch (err) {
        console.error('Action test failed:', err);
        errorDetails.value = JSON.stringify(err, null, 2);

        if (errorModal.value) {
          const modal = new Modal(errorModal.value);
          modal.show();
        }
      }
    };

    return {
      username,
      password,
      showPassword,
      loading,
      error,
      formSubmitted,
      errorDetails,
      errorModal,
      handleLogin,
      togglePasswordVisibility,
      testNavigation,
      testAction
    };
  }
};
</script>

<style scoped>
.login-view {
  padding-top: 80px;
  min-height: 100vh;
  background-color: var(--bs-light, #f8f9fa);
}

.card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  background-color: var(--bs-primary, #3498db);
  color: white;
}

@media (max-width: 576px) {
  .login-view {
    padding-top: 40px;
  }

  .card {
    border-radius: 0;
  }
}
</style>