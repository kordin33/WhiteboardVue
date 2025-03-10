
// store/index.js
import { createStore } from 'vuex';
import auth from './modules/auth';
import boards from './modules/boards';
import elements from './modules/elements';
import main from './modules/main';

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
    elements,
    main
  }
});
import { createStore } from 'vuex';
import tokenUtils from '@/utils/tokenUtils';

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    boards: [],
    currentBoard: null,
    isLoading: false,
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    boards: state => state.boards,
    currentBoard: state => state.currentBoard,
    isLoading: state => state.isLoading
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    SET_BOARDS(state, boards) {
      state.boards = boards;
    },
    SET_CURRENT_BOARD(state, board) {
      state.currentBoard = board;
    },
    ADD_BOARD(state, board) {
      state.boards.push(board);
    },
    UPDATE_BOARD(state, updatedBoard) {
      const index = state.boards.findIndex(b => b.id === updatedBoard.id);
      if (index !== -1) {
        state.boards.splice(index, 1, updatedBoard);
      }
    },
    REMOVE_BOARD(state, boardId) {
      state.boards = state.boards.filter(b => b.id !== boardId);
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    }
  },
  
  actions: {
    loadUser({ commit }) {
      const userData = tokenUtils.getUserData();
      if (userData) {
        commit('SET_USER', userData);
        return true;
      }
      return false;
    },
    
    logout({ commit }) {
      tokenUtils.clearTokens();
      commit('SET_USER', null);
    }
  }
});
