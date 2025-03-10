import api from '@/services/api';

const state = {
  boards: [],
  currentBoard: null,
  sharedBoards: [],
  loading: false,
  error: null
};

const getters = {
  allBoards: state => state.boards,
  sharedBoards: state => state.sharedBoards,
  ownedBoards: state => state.boards.filter(board => board.user_permission === 'owner'),
  currentBoard: state => state.currentBoard,
  isLoading: state => state.loading,
  error: state => state.error
};

const actions = {
  // Fetch all boards for current user
  async fetchBoards({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get('/boards/');
      commit('SET_BOARDS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to load boards');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Fetch a specific board
  async fetchBoard({ commit }, boardId) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get(`/boards/${boardId}/`);
      commit('SET_CURRENT_BOARD', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to load board');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Create a new board
  async createBoard({ commit, dispatch }, boardData) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post('/boards/', boardData);
      dispatch('fetchBoards');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to create board');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Update a board
  async updateBoard({ commit, dispatch }, { boardId, boardData }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.put(`/boards/${boardId}/`, boardData);

      // Update current board if we're updating it
      if (state.currentBoard && state.currentBoard.id === boardId) {
        commit('SET_CURRENT_BOARD', response.data);
      }

      // Refresh the board list
      dispatch('fetchBoards');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to update board');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Delete a board
  async deleteBoard({ commit, dispatch }, boardId) {
    commit('SET_LOADING', true);
    try {
      await api.delete(`/boards/${boardId}/`);

      // If we're deleting the current board, clear it
      if (state.currentBoard && state.currentBoard.id === boardId) {
        commit('SET_CURRENT_BOARD', null);
      }

      // Refresh the board list
      dispatch('fetchBoards');
      return true;
    } catch (error) {
      commit('SET_ERROR', 'Failed to delete board');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Share a board with another user
  async shareBoard({ commit, dispatch }, { boardId, userId, permissionType }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post(`/boards/${boardId}/permissions/`, {
        board: boardId,
        user_id: userId,
        permission_type: permissionType
      });
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to share board');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Get board permissions
  async getBoardPermissions({ commit }, boardId) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get(`/boards/${boardId}/permissions/`);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to load board permissions');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_BOARDS(state, boards) {
    state.boards = boards;
    // Separate owned and shared boards
    state.sharedBoards = boards.filter(board => board.user_permission !== 'owner');
  },

  SET_CURRENT_BOARD(state, board) {
    state.currentBoard = board;
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