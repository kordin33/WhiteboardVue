import { createRouter, createWebHistory } from 'vue-router';
import tokenUtils from '@/utils/tokenUtils';

// Lazy loaded components for better performance
const BoardListView = () => import('@/views/BoardListView.vue');
const BoardDetailView = () => import('@/views/BoardDetailView.vue');
const LoginView = () => import('@/views/LoginView.vue');
const RegisterView = () => import('@/views/RegisterView.vue');
const NotFoundView = () => import('@/views/NotFoundView.vue');

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
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { 
      requiresAuth: false,
      title: 'Register'
    }
  },
  {
    path: '/boards',
    name: 'boards',
    component: BoardListView,
    meta: { 
      requiresAuth: true,
      title: 'My Boards'
    }
  },
  {
    path: '/boards/:id',
    name: 'board-detail',
    component: BoardDetailView,
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Whiteboard'
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

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = to.meta.title ? `${to.meta.title} | Whiteboard App` : 'Whiteboard App';

  // Check authentication for routes that require it
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = tokenUtils.isAuthenticated();

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (!requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    // Redirect to boards if already authenticated and trying to access login/register
    next({ name: 'boards' });
  } else {
    // Proceed as normal
    next();
  }
});

export default router;