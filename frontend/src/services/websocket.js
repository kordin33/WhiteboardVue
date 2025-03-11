// Zastąp zawartość pliku frontend/src/services/websocket.js

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 sekundy
    this.listeners = {
      create_element: [],
      update_element: [],
      delete_element: [],
      message: [],
      connection_status: []
    };
  }

  connect(boardId) {
    if (this.socket && this.socket.readyState < 2) {
      console.log('WebSocket już połączony lub łączący się');
      return;
    }

    // Użyj adresu backendu bezpośrednio
    const backendHost = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Prosty URL WebSocket bez tokena uwierzytelniania
    const wsUrl = `${protocol}//${backendHost}/ws/boards/${boardId}/`;

    console.log(`Łączenie z WebSocket: ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this._onOpen.bind(this);
      this.socket.onmessage = this._onMessage.bind(this);
      this.socket.onclose = this._onClose.bind(this);
      this.socket.onerror = this._onError.bind(this);
    } catch (error) {
      console.error('Błąd tworzenia WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Rozłączanie WebSocket');
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this._notifyListeners('connection_status', { connected: false });
    }
  }

  send(action, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        action,
        ...data
      });
      this.socket.send(message);
      return true;
    } else {
      console.error('WebSocket nie połączony, nie można wysłać wiadomości');
      return false;
    }
  }

  addListener(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].push(callback);
    } else {
      console.warn(`Nieznany typ zdarzenia: ${eventType}`);
    }
  }

  removeListener(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        cb => cb !== callback
      );
    }
  }

  // Metody pomocnicze dla często wykonywanych operacji
  sendElementCreated(element) {
    return this.send('create_element', { element });
  }

  sendElementUpdated(element) {
    return this.send('update_element', { element });
  }

  sendElementDeleted(elementId) {
    return this.send('delete_element', { element_id: elementId });
  }

  // Metody prywatne
  _onOpen(event) {
    console.log('WebSocket połączony pomyślnie');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this._notifyListeners('connection_status', { connected: true });
  }

  _onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('Otrzymano wiadomość WebSocket:', data);

      // Powiadom specyficzne nasłuchiwacze akcji
      if (data.action && this.listeners[data.action]) {
        this._notifyListeners(data.action, data);
      }

      // Powiadom ogólnych nasłuchiwaczy wiadomości
      this._notifyListeners('message', data);
    } catch (error) {
      console.error('Błąd parsowania wiadomości WebSocket:', error);
    }
  }

  _onClose(event) {
    this.isConnected = false;
    console.log(`WebSocket rozłączony: Kod ${event.code} - ${event.reason}`);
    this._notifyListeners('connection_status', { 
      connected: false,
      code: event.code,
      reason: event.reason
    });

    // Próba ponownego połączenia, jeśli nie jest to normalne zamknięcie
    if (event.code !== 1000 && event.code !== 1001) {
      this._attemptReconnect();
    }
  }

  _onError(error) {
    console.error('Błąd WebSocket:', error);
  }

  _attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Próba ponownego połączenia WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        // Wyodrębnij boardId z poprzedniego URL połączenia
        const url = this.socket.url;
        const match = url.match(/\/ws\/boards\/(\d+)\//);
        if (match && match[1]) {
          const boardId = match[1];
          this.connect(boardId);
        } else {
          console.error('Nie można wyodrębnić boardId do ponownego połączenia');
        }
      }, this.reconnectInterval);
    } else {
      console.error('Osiągnięto maksymalną liczbę prób ponownego połączenia');
    }
  }

  _notifyListeners(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Błąd w nasłuchiwaczu ${eventType}:`, error);
        }
      });
    }
  }
}

// Utwórz instancję singletona
const websocketService = new WebSocketService();
export default websocketService;