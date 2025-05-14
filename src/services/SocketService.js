import io from 'socket.io-client';
import { SERVER_URL } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token, onConnect, onDisconnect) {
    console.log ("connecting to" + SERVER_URL );
    this.socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      onDisconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default SocketService;
