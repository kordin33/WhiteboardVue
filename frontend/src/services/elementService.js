// Utwórz nowy plik frontend/src/services/elementService.js

import api from './api';

const elementService = {
  /**
   * Utwórz nowy element
   * @param {number} boardId ID tablicy
   * @param {Object} data Dane elementu
   * @returns {Promise} Odpowiedź z utworzonym elementem
   */
  async createElement(boardId, data) {
    const elementData = {
      ...data,
      board: boardId
    };
    const response = await api.post('/elements/', elementData);
    return response.data;
  },

  /**
   * Zaktualizuj element
   * @param {number} boardId ID tablicy
   * @param {number} elementId ID elementu
   * @param {Object} data Dane elementu
   * @returns {Promise} Odpowiedź z zaktualizowanym elementem
   */
  async updateElement(boardId, elementId, data) {
    const elementData = {
      ...data,
      board: boardId
    };
    const response = await api.put(`/elements/${elementId}/`, elementData);
    return response.data;
  },

  /**
   * Usuń element
   * @param {number} boardId ID tablicy
   * @param {number} elementId ID elementu
   * @returns {Promise} Status odpowiedzi
   */
  async deleteElement(boardId, elementId) {
    await api.delete(`/elements/${elementId}/`);
    return true;
  }
};

export default elementService;