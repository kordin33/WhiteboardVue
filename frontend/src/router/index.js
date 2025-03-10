import { createRouter, createWebHistory } from 'vue-router';
import tokenUtils from '@/utils/tokenUtils';

// Import the test page
import TestPage from '@/components/common/TestPage.vue';

// Lazy loaded components for better performance
const BoardListView = () => import('@/views/BoardListView.vue');
const BoardDetailView = () => import('@/views/BoardDetailView.vue');
const LoginView = () => import('@/views/LoginView.vue');
const RegisterView = () => import('@/views/RegisterView.vue');
const NotFoundView = () => import('@/views/NotFoundView.vue');

// Add debug information to imports
const debugImport = (importFn, name) => {
  return () => {
    console.log(`[Router] Loading component: ${name}`);
    return importFn().catch(err => {
      console.error(`[Router] Failed to load component ${name}:`, err);
      throw err;
    });
  };
};

const routes = [
  {
    path: '/',
    redirect: '/boards'
  },
  {
    path: '/login',
    name: 'login',
    component: debugImport(() => import('@/views/LoginView.vue'), 'LoginView'),
    meta: { 
      requiresAuth: false,
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: debugImport(() => import('@/views/RegisterView.vue'), 'RegisterView'),
    meta: { 
      requiresAuth: false,
      title: 'Register'
    }
  },
  {
    path: '/boards',
    name: 'boards',
    component: debugImport(() => import('@/views/BoardListView.vue'), 'BoardListView'),
    meta: { 
      requiresAuth: true,
      title: 'My Boards'
    }
  },
  {
    path: '/boards/:id',
    name: 'board-detail',
    component: debugImport(() => import('@/views/BoardDetailView.vue'), 'BoardDetailView'),
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Whiteboard'
    }
  },
  // Add test page route
  {
    path: '/test',
    name: 'test',
    component: TestPage,
    meta: {
      title: 'Router Test Page'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { 
      title: 'Page Not Found'
    }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Add debug logging to router navigation
router.beforeEach((to, from, next) => {
  console.log(`[Router] Navigation: ${from.fullPath} → ${to.fullPath}`);

  // Update document title
  document.title = to.meta.title ? `${to.meta.title} | Whiteboard App` : 'Whiteboard App';

  // Check authentication for routes that require it
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = tokenUtils.isAuthenticated();

  console.log(`[Router] Route requires auth: ${requiresAuth}, User is authenticated: ${isAuthenticated}`);

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    console.log(`[Router] Redirecting to login (auth required)`);
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (!requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    // Redirect to boards if already authenticated and trying to access login/register
    console.log(`[Router] Redirecting to boards (already authenticated)`);
    next({ name: 'boards' });
  } else {
    // Proceed as normal
    console.log(`[Router] Proceeding with navigation`);
    next();
  }
});

// Add debugging for navigation errors
router.onError((error) => {
  console.error('[Router] Navigation Error:', error);
});

export default router;