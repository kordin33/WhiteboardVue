
<template>
  <div class="login-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card login-card">
            <div class="card-header">
              <h2>Logowanie</h2>
            </div>
            <div class="card-body">
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              
              <form @submit.prevent="handleLogin">
                <div class="form-group">
                  <label for="username">Nazwa użytkownika</label>
                  <input
                    id="username"
                    v-model="username"
                    type="text"
                    class="form-control"
                    required
                    placeholder="Wprowadź nazwę użytkownika"
                  />
                </div>
                
                <div class="form-group">
                  <label for="password">Hasło</label>
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    class="form-control"
                    required
                    placeholder="Wprowadź hasło"
                  />
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Logowanie...' : 'Zaloguj' }}
                  </button>
                  <p class="mt-3">
                    Nie masz konta?
                    <router-link to="/register">Zarejestruj się</router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import authService from '@/services/auth';

export default {
  name: 'LoginView',
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);
    
    const handleLogin = async () => {
      try {
        error.value = '';
        loading.value = true;
        
        const response = await authService.login(username.value, password.value);
        
        // Save user to store
        store.commit('SET_USER', response.user);
        
        // Redirect to the original destination or default
        const redirectPath = route.query.redirect || '/boards';
        router.push(redirectPath);
      } catch (err) {
        error.value = err.response?.data?.error || 'Nieprawidłowe dane logowania';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      username,
      password,
      error,
      loading,
      handleLogin
    };
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  min-height: 100vh;
  align-items: center;
  background-color: #f5f5f5;
}

.login-card {
  margin-top: -100px;
}

.form-actions {
  margin-top: 1.5rem;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
