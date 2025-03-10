import { createRouter, createWebHistory } from 'vue-router';
import tokenUtils from '@/utils/tokenUtils';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
// Oparte na lazy loading dla lepszej wydajności

// Dodajemy debugowanie
const loadComponent = (importFn, name) => {
  console.log(`Ładowanie komponentu: ${name}`);
  return importFn();
};

const routes = [
  {
    path: '/',
    redirect: '/boards'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { 
      requiresAuth: false,
      title: 'Logowanie'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { 
      requiresAuth: false,
      title: 'Rejestracja'
    }
  },
  {
    path: '/boards',
    name: 'boards',
    component: () => loadComponent(import('@/views/BoardListView.vue'), 'BoardListView'),
    meta: { 
      requiresAuth: true,
      title: 'Moje tablice'
    }
  },
  {
    path: '/boards/:id',
    name: 'board-detail',
    component: () => loadComponent(import('@/views/BoardDetailView.vue'), 'BoardDetailView'),
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Tablica'
    }
  },
  {
    path: '/basic',
    name: 'basic',
    component: () => loadComponent(import('@/views/BasicView.vue'), 'BasicView'),
    meta: {
      requiresAuth: false,
      title: 'Strona testowa'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      requiresAuth: false,
      title: '404 - Nie znaleziono'
    }
  }

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // Zawsze przewijaj do góry przy zmianie strony
    return { top: 0 }
  }
});

// Zabezpieczenie nawigacji
router.beforeEach((to, from, next) => {
  console.log(`Nawigacja: ${from.fullPath} → ${to.fullPath}`);

  // Aktualizuj tytuł dokumentu
  document.title = to.meta.title ? `${to.meta.title} | Whiteboard App` : 'Whiteboard App';

  // Sprawdź uwierzytelnianie dla tras, które tego wymagają
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = tokenUtils.isAuthenticated();

  console.log(`Trasa wymaga uwierzytelnienia: ${requiresAuth}, Użytkownik jest uwierzytelniony: ${isAuthenticated}`);

  if (requiresAuth && !isAuthenticated) {
    // Przekieruj do logowania, jeśli nie jest uwierzytelniony
    console.log(`Przekierowanie do logowania (wymagane uwierzytelnienie)`);
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (!requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    // Przekieruj do tablic, jeśli już uwierzytelniony i próbuje uzyskać dostęp do logowania/rejestracji
    console.log(`Przekierowanie do tablic (już uwierzytelniony)`);
    next({ name: 'boards' });
  } else {
    // Kontynuuj normalnie
    console.log(`Kontynuacja nawigacji`);
    next();
  }
});

// Dodaj debugowanie błędów nawigacji
router.onError((error) => {
  console.error('[Router] Błąd nawigacji:', error);
});

export default router;