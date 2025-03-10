import authService from '@/services/auth';
import tokenUtils from '@/utils/tokenUtils';
import router from '@/router';

const state = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  currentUser: state => state.user,
  isLoading: state => state.loading,
  authError: state => state.error
};

const actions = {
  // Initialize authentication state
  async initAuth({ commit }) {
    commit('SET_LOADING', true);

    try {
      if (tokenUtils.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        commit('SET_AUTH', { user });
      } else {
        commit('CLEAR_AUTH');
      }
      commit('SET_ERROR', null);
    } catch (error) {
      commit('CLEAR_AUTH');
      commit('SET_ERROR', 'Sesja wygasła. Zaloguj się ponownie.');
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Register a new user
  async register({ commit }, userData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const result = await authService.register(userData);
      commit('SET_AUTH', { user: result.user });
      router.push('/boards');
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.detail 
        || 'Błąd rejestracji. Spróbuj ponownie.';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Login a user
  async login({ commit }, { username, password }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      const result = await authService.login(username, password);
      commit('SET_AUTH', { user: result.user });
      router.push('/boards');
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.error 
        || 'Niepoprawne dane logowania.';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Logout the user
  logout({ commit }) {
    authService.logout();
    commit('CLEAR_AUTH');
    router.push('/login');
  }
};

const mutations = {
  SET_AUTH(state, { user }) {
    state.isAuthenticated = true;
    state.user = user;
    state.error = null;
  },

  CLEAR_AUTH(state) {
    state.isAuthenticated = false;
    state.user = null;
  },

  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};