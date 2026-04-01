import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, OnModuleInit, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
  transports: ['polling', 'websocket'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor() {
    this.logger.log('NotificationsGateway initialized in constructor');
  }

  onModuleInit() {
    this.logger.log('NotificationsGateway initialized in onModuleInit');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const clientIp = client.handshake.address;
    this.logger.log(`[Socket] Connection attempt: userId=${userId}, IP=${clientIp}, transport=${client.conn.transport.name}`);

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`[Notification] User connected: ${userId} (Socket: ${client.id}, IP: ${clientIp})`);
    } else {
      this.logger.warn(`[Notification] Connection attempt without userId from IP: ${clientIp}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  }

  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  broadcastToAdmins(admins: string[], event: string, data: any) {
    admins.forEach((adminId) => {
      this.sendToUser(adminId, event, data);
    });
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any) {
    return { event: 'pong', data };
  }
}
