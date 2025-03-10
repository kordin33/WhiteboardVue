import api from '@/services/api';
import websocketService from '@/services/websocket';

const state = {
  elements: [],
  selectedElement: null,
  loading: false,
  error: null
};

const getters = {
  allElements: state => state.elements,
  selectedElement: state => state.selectedElement,
  isLoading: state => state.loading,
  error: state => state.error,

  // Get elements by type
  getElementsByType: state => type => {
    return state.elements.filter(el => el.element_type === type);
  },

  // Get element by id
  getElementById: state => id => {
    return state.elements.find(el => el.id === id);
  }
};

const actions = {
  // Initialize WebSocket listeners
  initWebSocketListeners({ commit, dispatch }) {
    // Add listeners for WebSocket events
    websocketService.addListener('create_element', data => {
      commit('ADD_ELEMENT', data.element);
    });

    websocketService.addListener('update_element', data => {
      commit('UPDATE_ELEMENT', data.element);
    });

    websocketService.addListener('delete_element', data => {
      commit('REMOVE_ELEMENT', data.element_id);
    });
  },

  // Fetch all elements for a board
  async fetchElements({ commit }, boardId) {
    commit('SET_LOADING', true);
    try {
      const response = await api.get(`/elements/?board_id=${boardId}`);
      commit('SET_ELEMENTS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to load elements');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Create a new element
  async createElement({ commit }, elementData) {
    commit('SET_LOADING', true);
    try {
      const response = await api.post('/elements/', elementData);
      commit('ADD_ELEMENT', response.data);

      // Send WebSocket notification
      websocketService.send('create_element', { element: response.data });

      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to create element');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Update an element
  async updateElement({ commit }, { elementId, elementData }) {
    commit('SET_LOADING', true);
    try {
      const response = await api.put(`/elements/${elementId}/`, elementData);
      commit('UPDATE_ELEMENT', response.data);

      // Send WebSocket notification
      websocketService.send('update_element', { element: response.data });

      return response.data;
    } catch (error) {
      commit('SET_ERROR', 'Failed to update element');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Delete an element
  async deleteElement({ commit }, elementId) {
    commit('SET_LOADING', true);
    try {
      await api.delete(`/elements/${elementId}/`);
      commit('REMOVE_ELEMENT', elementId);

      // Send WebSocket notification
      websocketService.send('delete_element', { element_id: elementId });

      return true;
    } catch (error) {
      commit('SET_ERROR', 'Failed to delete element');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Select an element
  selectElement({ commit }, element) {
    commit('SET_SELECTED_ELEMENT', element);
  },

  // Clear element selection
  clearSelection({ commit }) {
    commit('SET_SELECTED_ELEMENT', null);
  }
};

const mutations = {
  SET_ELEMENTS(state, elements) {
    state.elements = elements;
  },

  ADD_ELEMENT(state, element) {
    // Avoid duplicates
    const index = state.elements.findIndex(el => el.id === element.id);
    if (index === -1) {
      state.elements.push(element);
    } else {
      // If it already exists, update it
      state.elements.splice(index, 1, element);
    }
  },

  UPDATE_ELEMENT(state, element) {
    const index = state.elements.findIndex(el => el.id === element.id);
    if (index !== -1) {
      state.elements.splice(index, 1, element);

      // Update selected element if it's the one being updated
      if (state.selectedElement && state.selectedElement.id === element.id) {
        state.selectedElement = element;
      }
    }
  },

  REMOVE_ELEMENT(state, elementId) {
    state.elements = state.elements.filter(el => el.id !== elementId);

    // Clear selection if the selected element was deleted
    if (state.selectedElement && state.selectedElement.id === elementId) {
      state.selectedElement = null;
    }
  },

  SET_SELECTED_ELEMENT(state, element) {
    state.selectedElement = element;
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