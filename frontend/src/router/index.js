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
import { createRouter, createWebHistory } from 'vue-router';
import tokenUtils from '@/utils/tokenUtils';
import { toast } from 'vue3-toastify';

// Import views
import BasicView from '@/views/BasicView.vue';

// Lazy loaded views
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const BoardsView = () => import('@/views/boards/BoardsView.vue');
const BoardDetailView = () => import('@/views/boards/BoardDetailView.vue');
const NotFoundView = () => import('@/views/NotFoundView.vue');

const routes = [
  {
    path: '/',
    redirect: '/boards'
  },
  {
    path: '/basic',
    name: 'Basic',
    component: BasicView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/boards',
    name: 'Boards',
    component: BoardsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/boards/:id',
    name: 'BoardDetail',
    component: BoardDetailView,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  console.log(`[Router] Navigation: ${from.path} → ${to.path}`);
  
  const isAuthenticated = tokenUtils.isAuthenticated();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
  
  console.log(`[Router] Route requires auth: ${requiresAuth}, User is authenticated: ${isAuthenticated}`);

  if (requiresAuth && !isAuthenticated) {
    console.log('[Router] Redirecting to login (auth required)');
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    });
  } else if (to.path === '/login' && isAuthenticated) {
    console.log('[Router] User already logged in, redirecting to boards');
    next('/boards');
  } else {
    console.log('[Router] Proceeding with navigation');
    console.log('[Router] Loading component:', to.name + 'View');
    next();
  }
});

router.onError((error) => {
  console.error('[Router] Błąd nawigacji:', error);
  toast.error('Błąd podczas ładowania strony', { autoClose: 3000 });
});

export default router;
