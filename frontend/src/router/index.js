// Zastąp zawartość pliku frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

// Importuj tylko widok tablicy
const BoardDetailView = () => import('@/views/BoardDetailView.vue');
const NotFoundView = () => import('@/views/NotFoundView.vue');

const routes = [
  {
    // Przekierowanie strony głównej bezpośrednio do tablicy
    path: '/',
    redirect: '/board'
  },
  {
    // Główny i jedyny widok - tablica
    path: '/board',
    name: 'board',
    component: BoardDetailView,
    props: { boardId: 1 }, // Stałe ID tablicy
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
  document.title = to.meta.title ? `${to.meta.title}` : 'Whiteboard';

  next();
});

export default router;