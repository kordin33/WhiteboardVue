// modules/main.js
export default {
  namespaced: true,
  state: {
    user: null,
    isAuthenticated: false,
    boards: []
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    boards: state => state.boards
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    setBoards(state, boards) {
      state.boards = boards;
    },
    addBoard(state, board) {
      state.boards.push(board);
    },
    updateBoard(state, updatedBoard) {
      const index = state.boards.findIndex(board => board.id === updatedBoard.id);
      if (index !== -1) {
        state.boards.splice(index, 1, updatedBoard);
      }
    },
    deleteBoard(state, boardId) {
      state.boards = state.boards.filter(board => board.id !== boardId);
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user);
    },
    logout({ commit }) {
      commit('setUser', null);
    },
    fetchBoards({ commit }, boards) {
      commit('setBoards', boards);
    }
  }
};
