import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket) return;
    
    console.log('[Socket] Connecting to notifications at:', SOCKET_URL);

    this.socket = io(`${SOCKET_URL}/notifications`, {
      query: { userId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to notification service');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Notification connection error:', err.message);
      if (err.message === 'xhr poll error') {
        console.warn('[Socket] XHR Poll Error - This often means Mixed Content (HTTPS -> HTTP) or CORS issues.');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected from notification service:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('notification', callback);
  }

  offNotification() {
    if (!this.socket) return;
    this.socket.off('notification');
  }
}

export const socketService = new SocketService();
