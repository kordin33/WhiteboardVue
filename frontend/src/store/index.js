import { createStore } from 'vuex';
import auth from './modules/auth';
import boards from './modules/boards';
import elements from './modules/elements';

export default createStore({
  state: {
    appLoading: false,
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: true
  },
  getters: {
    isAppLoading: state => state.appLoading,
    isDarkMode: state => state.darkMode,
    isSidebarOpen: state => state.sidebarOpen
  },
  mutations: {
    SET_APP_LOADING(state, isLoading) {
      state.appLoading = isLoading;
    },
    TOGGLE_DARK_MODE(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    SET_DARK_MODE(state, isDark) {
      state.darkMode = isDark;
      localStorage.setItem('darkMode', state.darkMode);
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    SET_SIDEBAR_OPEN(state, isOpen) {
      state.sidebarOpen = isOpen;
    }
  },
  actions: {
    setAppLoading({ commit }, isLoading) {
      commit('SET_APP_LOADING', isLoading);
    },
    toggleDarkMode({ commit }) {
      commit('TOGGLE_DARK_MODE');
    },
    setDarkMode({ commit }, isDark) {
      commit('SET_DARK_MODE', isDark);
    },
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR');
    },
    setSidebarOpen({ commit }, isOpen) {
      commit('SET_SIDEBAR_OPEN', isOpen);
    }
  },
  modules: {
    auth,
    boards,
    elements
  }
});