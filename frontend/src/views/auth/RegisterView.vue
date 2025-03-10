
<template>
  <div class="register-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card register-card">
            <div class="card-header">
              <h2>Rejestracja</h2>
            </div>
            <div class="card-body">
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              
              <form @submit.prevent="handleRegister">
                <div class="form-group">
                  <label for="username">Nazwa użytkownika</label>
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    class="form-control"
                    required
                    placeholder="Wprowadź nazwę użytkownika"
                  />
                </div>
                
                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    required
                    placeholder="Wprowadź adres email"
                  />
                </div>
                
                <div class="form-group">
                  <label for="password">Hasło</label>
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    required
                    placeholder="Wprowadź hasło"
                  />
                </div>
                
                <div class="form-group">
                  <label for="password2">Potwierdź hasło</label>
                  <input
                    id="password2"
                    v-model="form.password2"
                    type="password"
                    class="form-control"
                    required
                    placeholder="Potwierdź hasło"
                  />
                </div>
                
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Rejestracja...' : 'Zarejestruj się' }}
                  </button>
                  <p class="mt-3">
                    Masz już konto?
                    <router-link to="/login">Zaloguj się</router-link>
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
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth';

export default {
  name: 'RegisterView',
  
  setup() {
    const router = useRouter();
    
    const form = reactive({
      username: '',
      email: '',
      password: '',
      password2: ''
    });
    
    const error = ref('');
    const loading = ref(false);
    
    const handleRegister = async () => {
      // Walidacja
      if (form.password !== form.password2) {
        error.value = 'Hasła nie są identyczne';
        return;
      }
      
      try {
        error.value = '';
        loading.value = true;
        
        await authService.register({
          username: form.username,
          email: form.email,
          password: form.password
        });
        
        // Przekieruj do logowania po udanej rejestracji
        router.push('/login');
      } catch (err) {
        error.value = err.response?.data?.error || 'Błąd podczas rejestracji';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      form,
      error,
      loading,
      handleRegister
    };
  }
}
</script>

<style scoped>
.register-view {
  display: flex;
  min-height: 100vh;
  align-items: center;
  background-color: #f5f5f5;
}

.register-card {
  margin-top: -50px;
}

.form-actions {
  margin-top: 1.5rem;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
