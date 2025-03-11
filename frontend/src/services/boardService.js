// Utwórz nowy plik frontend/src/services/boardService.js

import api from './api';

const boardService = {
  /**
   * Pobierz wszystkie tablice
   * @returns {Promise} Odpowiedź z danymi tablic
   */
  async getBoards() {
    const response = await api.get('/boards/');
    return response.data;
  },

  /**
   * Pobierz określoną tablicę
   * @param {number} id ID tablicy
   * @returns {Promise} Odpowiedź z danymi tablicy
   */
  async getBoard(id) {
    const response = await api.get(`/boards/${id}/`);
    return response.data;
  },

  /**
   * Utwórz nową tablicę
   * @param {Object} data Dane tablicy
   * @returns {Promise} Odpowiedź z utworzoną tablicą
   */
  async createBoard(data) {
    const response = await api.post('/boards/', data);
    return response.data;
  },

  /**
   * Zaktualizuj tablicę
   * @param {number} id ID tablicy
   * @param {Object} data Dane tablicy
   * @returns {Promise} Odpowiedź z zaktualizowaną tablicą
   */
  async updateBoard(id, data) {
    const response = await api.put(`/boards/${id}/`, data);
    return response.data;
  },

  /**
   * Usuń tablicę
   * @param {number} id ID tablicy
   * @returns {Promise} Status odpowiedzi
   */
  async deleteBoard(id) {
    await api.delete(`/boards/${id}/`);
    return true;
  },

  /**
   * Pobierz elementy tablicy
   * @param {number} boardId ID tablicy
   * @returns {Promise} Odpowiedź z danymi elementów
   */
  async getBoardElements(boardId) {
    const response = await api.get(`/boards/${boardId}/elements/`);
    return response.data;
  },

  /**
   * Eksportuj stan tablicy jako JSON
   * @param {number} boardId ID tablicy
   * @returns {Promise} Odpowiedź z serializowanymi danymi tablicy
   */
  async exportBoardState(boardId) {
    const response = await api.get(`/boards/${boardId}/export_state/`);
    return response.data;
  },

  /**
   * Importuj stan tablicy z JSON
   * @param {number} boardId ID tablicy
   * @param {Object} state Dane stanu tablicy
   * @returns {Promise} Status odpowiedzi
   */
  async importBoardState(boardId, state) {
    const response = await api.post(`/boards/${boardId}/import_state/`, state);
    return response.data;
  }
};

export default boardService;