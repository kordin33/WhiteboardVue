// Zastąp zawartość pliku frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

// Komponenty ładowane leniwie dla lepszej wydajności
const BoardListView = () => import('@/views/BoardListView.vue');
const BoardDetailView = () => import('@/views/BoardDetailView.vue');
const NotFoundView = () => import('@/views/NotFoundView.vue');

const routes = [
  {
    path: '/',
    redirect: '/boards'
  },
  {
    path: '/boards',
    name: 'boards',
    component: BoardListView,
    meta: { 
      title: 'Moje tablice'
    }
  },
  {
    path: '/boards/:id',
    name: 'board-detail',
    component: BoardDetailView,
    props: true,
    meta: { 
      title: 'Whiteboard'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { 
      title: 'Strona nie znaleziona'
    }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Dodaj debugowe logowanie do nawigacji routera
router.beforeEach((to, from, next) => {
  console.log(`[Router] Nawigacja: ${from.fullPath} → ${to.fullPath}`);

  // Aktualizuj tytuł dokumentu
  document.title = to.meta.title ? `${to.meta.title} | Whiteboard App` : 'Whiteboard App';

  next();
});

export default router;