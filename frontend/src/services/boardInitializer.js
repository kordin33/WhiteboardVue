// Dodaj ten plik jako frontend/src/services/boardInitializer.js

import api from './api';

/**
 * Inicjalizuje tablicę, sprawdzając czy istnieje, a jeśli nie - tworzy ją
 * @returns {Promise<number>} ID tablicy
 */
export async function initializeBoard() {
  try {
    // Najpierw sprawdźmy czy istnieje tablica o ID=1
    try {
      const response = await api.get('/boards/1/');
      console.log('Znaleziono istniejącą tablicę:', response.data);
      return response.data.id;
    } catch (error) {
      // Jeśli tablica o ID=1 nie istnieje, spróbujemy pobrać wszystkie tablice
      console.log('Nie znaleziono tablicy o ID=1, sprawdzam wszystkie tablice...');
      const allBoardsResponse = await api.get('/boards/');

      if (allBoardsResponse.data && allBoardsResponse.data.length > 0) {
        // Używamy pierwszej dostępnej tablicy
        console.log('Znaleziono alternatywną tablicę:', allBoardsResponse.data[0]);
        return allBoardsResponse.data[0].id;
      } else {
        // Jeśli nie ma żadnej tablicy, tworzymy nową
        console.log('Brak istniejących tablic, tworzenie nowej...');
        const createResponse = await api.post('/boards/', {
          title: 'Whiteboard'
        });
        console.log('Utworzono nową tablicę:', createResponse.data);
        return createResponse.data.id;
      }
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji tablicy:', error);
    throw error;
  }
}