import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(`${SOCKET_URL}/notifications`, {
      query: { userId },
      transports: ['polling', 'websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
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
