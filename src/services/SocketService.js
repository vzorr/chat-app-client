import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.currentToken = null;
  }

  connect(token, onConnect, onDisconnect) {
    if (this.socket && this.connected) return;
    
    this.currentToken = token;
    
    // Decode token to see which user is connecting
    try {
      const tokenPayload = this.decodeToken(token);
      console.log(`🔌 Connecting socket for user: ${tokenPayload.name} (${tokenPayload.id})`);
    } catch (e) {
      console.log('🔌 Connecting socket with token:', token.substring(0, 20) + '...');
    }

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log(`✅ Socket connected: ${this.socket.id}`);
      this.connected = true;
      
      // Verify which user is connected
      try {
        const tokenPayload = this.decodeToken(this.currentToken);
        console.log(`✅ User ${tokenPayload.name} successfully connected`);
      } catch (e) {
        console.log('✅ Connected with token');
      }
      
      if (onConnect) onConnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`❌ Socket disconnected: ${reason}`);
      this.connected = false;
      if (onDisconnect) onDisconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`🚨 Connection error: ${error.message}`);
      
      // Check if it's an authentication error
      if (error.type === 'UnauthorizedError' || error.message.includes('auth')) {
        console.error('🔐 Authentication failed - token may be invalid or expired');
      }
    });
  }

  emit(event, payload) {
    if (!this.connected) {
      console.warn(`⚠️ Cannot emit '${event}' - not connected`);
      return;
    }
    
    // Add user context to certain events for debugging
    if (['send_message', 'typing', 'get_online_users'].includes(event)) {
      try {
        const tokenPayload = this.decodeToken(this.currentToken);
        console.log(`📤 ${tokenPayload.name} emitting: ${event}`, payload);
      } catch (e) {
        console.log(`📤 Emitting: ${event}`, payload);
      }
    }
    
    this.socket.emit(event, payload);
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        const tokenPayload = this.decodeToken(this.currentToken);
        console.log(`👋 Disconnecting ${tokenPayload.name}`);
      } catch (e) {
        console.log('👋 Disconnecting socket');
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentToken = null;
    }
  }
  
  isConnected() {
    return this.connected;
  }
  
  reconnect() {
    if (this.currentToken) {
      this.connect(this.currentToken);
    }
  }
  
  // Helper method to decode JWT token
  decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      throw error;
    }
  }
}

export default SocketService;