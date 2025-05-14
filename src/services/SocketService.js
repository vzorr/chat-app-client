import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token, onConnect, onDisconnect) {
    if (this.socket && this.connected) return;

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log(`✅ Connected: ${this.socket.id}`);
      this.connected = true;
      if (onConnect) onConnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`❌ Disconnected: ${reason}`);
      this.connected = false;
      if (onDisconnect) onDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`🚨 Connection error: ${error.message}`);
    });
  }

  emit(event, payload) {
    if (!this.connected) return;
    this.socket.emit(event, payload);
  }

  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export default SocketService;
