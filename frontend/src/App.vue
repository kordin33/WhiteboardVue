
<template>
  <div id="app">
    <Navbar v-if="showNavbar" />
    <main class="main-content">
      <router-view />
    </main>
    <DebugHelper v-if="isDevelopment" />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

// Importy komponentów
export default {
  name: 'App',
  
  setup() {
    const store = useStore();
    const route = useRoute();
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Sprawdź czy pokazać navbar
    const showNavbar = computed(() => {
      return route.name !== 'Login' && route.name !== 'Register';
    });
    
    onMounted(() => {
      console.log('App component mounted');
      
      // Próba załadowania użytkownika z localStorage
      store.dispatch('loadUser');
      
      console.log('Vue app created and mounted');
      console.log('Navigating to: ' + route.path);
    });
    
    return {
      showNavbar,
      isDevelopment
    };
  },
  
  components: {
    Navbar: () => import('@/components/common/Navbar.vue'),
    DebugHelper: () => import('@/components/common/DebugHelper.vue')
  }
}
</script>

<style>
:root {
  --primary-color: #4a6fa5;
  --secondary-color: #166088;
  --accent-color: #4cb5f5;
  --dark-color: #13293d;
  --light-color: #e8f1f2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --border-radius: 4px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: var(--border-radius);
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.btn-outline-secondary {
  color: var(--dark-color);
  background-color: transparent;
  border-color: var(--dark-color);
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: var(--dark-color);
  border-color: var(--dark-color);
}

.card {
  background-color: #fff;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: var(--light-color);
}

.card-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: var(--border-radius);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: var(--accent-color);
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(74, 111, 165, 0.25);
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: var(--border-radius);
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}
</style>
