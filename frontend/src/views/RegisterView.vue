<template>
  <div class="register-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-header text-center py-3">
              <h2 class="mb-0">Rejestracja</h2>
            </div>
            <div class="card-body p-4">
              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <form @submit.prevent="handleRegister">
                <div class="row mb-3">
                  <div class="col-md-6 mb-3 mb-md-0">
                    <label for="firstName" class="form-label">Imię</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="firstName" 
                      v-model="firstName"
                      required
                      :disabled="loading"
                    >
                  </div>
                  <div class="col-md-6">
                    <label for="lastName" class="form-label">Nazwisko</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="lastName" 
                      v-model="lastName"
                      required
                      :disabled="loading"
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Adres e-mail</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      v-model="email"
                      required
                      :disabled="loading"
                      autocomplete="email"
                    >
                  </div>
                </div>

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

                <div class="mb-3">
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
                      autocomplete="new-password"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="togglePasswordVisibility"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div class="password-strength mt-2" v-if="password">
                    <div class="progress">
                      <div 
                        class="progress-bar" 
                        :class="passwordStrengthClass"
                        :style="{ width: passwordStrength + '%' }" 
                      ></div>
                    </div>
                    <small class="text-muted">{{ passwordStrengthText }}</small>
                  </div>
                </div>

                <div class="mb-4">
                  <label for="password2" class="form-label">Powtórz hasło</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control" 
                      id="password2" 
                      v-model="password2"
                      required
                      :disabled="loading"
                      autocomplete="new-password"
                    >
                  </div>
                  <div class="password-match mt-1" v-if="password && password2">
                    <small :class="passwordsMatch ? 'text-success' : 'text-danger'">
                      <i class="bi" :class="passwordsMatch ? 'bi-check-circle' : 'bi-x-circle'"></i>
                      {{ passwordsMatch ? 'Hasła są identyczne' : 'Hasła nie są identyczne' }}
                    </small>
                  </div>
                </div>

                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="loading || !passwordsMatch || passwordStrength < 40"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ loading ? 'Rejestracja...' : 'Zarejestruj się' }}
                  </button>
                </div>
              </form>

              <div class="mt-4 text-center">
                <p class="mb-0">Masz już konto?</p>
                <router-link to="/login" class="fw-bold">Zaloguj się</router-link>
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
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterView',

  setup() {
    const store = useStore();
    const router = useRouter();

    const firstName = ref('');
    const lastName = ref('');
    const email = ref('');
    const username = ref('');
    const password = ref('');
    const password2 = ref('');
    const showPassword = ref(false);

    const loading = computed(() => store.getters['auth/isLoading']);
    const error = computed(() => store.getters['auth/authError']);

    const passwordsMatch = computed(() => 
      password.value && password2.value && password.value === password2.value
    );

    // Simple password strength calculation
    const passwordStrength = computed(() => {
      if (!password.value) return 0;

      let strength = 0;

      // Length check
      if (password.value.length >= 8) strength += 25;

      // Contains lowercase
      if (/[a-z]/.test(password.value)) strength += 15;

      // Contains uppercase
      if (/[A-Z]/.test(password.value)) strength += 15;

      // Contains number
      if (/[0-9]/.test(password.value)) strength += 15;

      // Contains special character
      if (/[^A-Za-z0-9]/.test(password.value)) strength += 15;

      // Length bonus
      if (password.value.length >= 12) strength += 15;

      return Math.min(100, strength);
    });

    const passwordStrengthClass = computed(() => {
      const strength = passwordStrength.value;
      if (strength < 40) return 'bg-danger';
      if (strength < 70) return 'bg-warning';
      return 'bg-success';
    });

    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value;
      if (strength < 40) return 'Słabe hasło';
      if (strength < 70) return 'Średnie hasło';
      return 'Silne hasło';
    });

    const handleRegister = async () => {
      if (!passwordsMatch.value) {
        return;
      }

      try {
        await store.dispatch('auth/register', {
          first_name: firstName.value,
          last_name: lastName.value,
          email: email.value,
          username: username.value,
          password: password.value,
          password2: password2.value
        });

        // Redirect to boards page after successful registration
        router.push('/boards');
      } catch (err) {
        // Error is handled in the auth module
        console.error('Registration failed:', err);
      }
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      firstName,
      lastName,
      email,
      username,
      password,
      password2,
      showPassword,
      loading,
      error,
      passwordsMatch,
      passwordStrength,
      passwordStrengthClass,
      passwordStrengthText,
      handleRegister,
      togglePasswordVisibility
    };
  }
};
</script>

<style scoped>
.register-view {
  padding-top: 60px;
  padding-bottom: 60px;
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

.password-strength {
  font-size: 0.8rem;
}

@media (max-width: 576px) {
  .register-view {
    padding-top: 30px;
    padding-bottom: 30px;
  }

  .card {
    border-radius: 0;
  }
}
</style>