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
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'LoginView',

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);

    const loading = computed(() => store.getters['auth/isLoading']);
    const error = computed(() => store.getters['auth/authError']);

    const handleLogin = async () => {
      try {
        await store.dispatch('auth/login', {
          username: username.value,
          password: password.value
        });

        // Redirect to the intended page or the boards page
        const redirectPath = route.query.redirect || '/boards';
        router.push(redirectPath);
      } catch (err) {
        // Error is handled in the auth module
        console.error('Login failed:', err);
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      username,
      password,
      showPassword,
      loading,
      error,
      handleLogin,
      togglePasswordVisibility
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