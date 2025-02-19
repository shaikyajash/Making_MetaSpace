// client/src/services/websocket.js
class WebSocketService {
    constructor() {
      this.ws = null;
      this.callbacks = new Map();
    }
  
    connect() {
      this.ws = new WebSocket('ws://localhost:8080');
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (this.callbacks.has(data.type)) {
          this.callbacks.get(data.type)(data);
        }
      };
  
      return new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      });
    }
  
    on(type, callback) {
      this.callbacks.set(type, callback);
    }
  
    send(data) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data));
      }
    }
  
    disconnect() {
      if (this.ws) {
        this.ws.close();
      }
    }
  }
  
  export default new WebSocketService();