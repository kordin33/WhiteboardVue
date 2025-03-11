// Zastąp zawartość pliku frontend/src/store/index.js

import { createStore } from 'vuex';

// Import modules
import boards from './modules/boards';
import elements from './modules/elements';

export default createStore({
  state: {
    appLoading: false,
    darkMode: false,
  },
  getters: {
    isAppLoading: (state) => state.appLoading,
    isDarkMode: (state) => state.darkMode,
  },
  mutations: {
    SET_APP_LOADING(state, isLoading) {
      state.appLoading = isLoading;
    },
    TOGGLE_DARK_MODE(state) {
      state.darkMode = !state.darkMode;
      // Save preference
      localStorage.setItem('darkMode', state.darkMode ? '1' : '0');
    },
    INIT_DARK_MODE(state) {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        state.darkMode = savedMode === '1';
      } else {
        // Check user preference from OS
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.darkMode = prefersDark;
      }
    }
  },
  actions: {
    setAppLoading({ commit }, isLoading) {
      commit('SET_APP_LOADING', isLoading);
    },
    toggleDarkMode({ commit }) {
      commit('TOGGLE_DARK_MODE');
    },
    initTheme({ commit }) {
      commit('INIT_DARK_MODE');
    }
  },
  modules: {
    boards,
    elements
  }
});