import { toast } from 'vue3-toastify';
import tokenUtils from '@/utils/tokenUtils';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
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
      console.log('WebSocket already connected or connecting');
      return;
    }

    const token = tokenUtils.getAccessToken();
    if (!token) {
      console.error('No auth token available for WebSocket connection');
      return;
    }

    // Użyj adresu backendu bezpośrednio zamiast window.location
    // Zmień poniższy URL na adres twojego backendu - potencjalnie bez portu 4200
    const backendHost = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Opcja 1: Użyj tego samego hosta ale bez portu 4200 (jeśli backend jest na porcie 80/443)
    const wsUrl = `${protocol}//${backendHost}/ws/boards/${boardId}/?token=${token}`;

    // Opcja 2: Jeśli backend działa na innym porcie (np. 8000), odkomentuj poniższą linię
    // const wsUrl = `${protocol}//${backendHost}:8000/ws/boards/${boardId}/?token=${token}`;

    // Opcja 3: Użyj pełnego, jawnego adresu backendu
    // const wsUrl = `wss://f74c5e62-798b-40db-a09f-0799fb00bfe0-00-1p14hehymb2qj.janeway.replit.dev/ws/boards/${boardId}/?token=${token}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this._onOpen.bind(this);
      this.socket.onmessage = this._onMessage.bind(this);
      this.socket.onclose = this._onClose.bind(this);
      this.socket.onerror = this._onError.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      toast.error('Błąd połączenia WebSocket', { autoClose: 3000 });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
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
      console.error('WebSocket not connected, cannot send message');
      toast.error('Błąd połączenia WebSocket. Odświerz stronę.', { autoClose: 3000 });
      return false;
    }
  }

  addListener(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].push(callback);
    } else {
      console.warn(`Unknown event type: ${eventType}`);
    }
  }

  removeListener(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        cb => cb !== callback
      );
    }
  }

  // Private methods
  _onOpen(event) {
    console.log('WebSocket connected successfully');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this._notifyListeners('connection_status', { connected: true });
  }

  _onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);

      // Notify specific action listeners
      if (data.action && this.listeners[data.action]) {
        this._notifyListeners(data.action, data);
      }

      // Notify general message listeners
      this._notifyListeners('message', data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  _onClose(event) {
    this.isConnected = false;
    console.log(`WebSocket disconnected: Code ${event.code} - ${event.reason}`);
    this._notifyListeners('connection_status', { 
      connected: false,
      code: event.code,
      reason: event.reason
    });

    // Attempt reconnection if not a normal closure
    if (event.code !== 1000 && event.code !== 1001) {
      this._attemptReconnect();
    }
  }

  _onError(error) {
    console.error('WebSocket error:', error);
    toast.error('Błąd połączenia WebSocket', { autoClose: 3000 });
  }

  _attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        // Extract boardId from the previous connection URL
        const url = this.socket.url;
        const match = url.match(/\/ws\/boards\/(\d+)\//);
        if (match && match[1]) {
          const boardId = match[1];
          this.connect(boardId);
        } else {
          console.error('Could not extract boardId for reconnection');
        }
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      toast.error('Nie można połączyć z serwerem. Odśwież stronę.', { autoClose: 3000 });
    }
  }

  _notifyListeners(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;