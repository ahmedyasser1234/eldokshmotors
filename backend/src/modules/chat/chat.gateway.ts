import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, OnModuleInit, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
  transports: ['polling', 'websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, string> = new Map(); 
  private connectedAdmins: Set<string> = new Set<string>();

  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
  ) {
    this.logger.log('ChatGateway initialized in constructor');
  }

  onModuleInit() {
    this.logger.log('ChatGateway initialized in onModuleInit');
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const clientIp = client.handshake.address;
    this.logger.log(`[Socket] Connection attempt: userId=${userId}, IP=${clientIp}, transport=${client.conn.transport.name}`);

    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`[Chat] User connected: ${userId} (Socket: ${client.id}, IP: ${clientIp})`);
      
      // Check if user is admin
      try {
        const user = await this.usersService.findOne(userId);
        if (user && user.role === 'admin') {
          this.connectedAdmins.add(userId);
          this.server.emit('supportStatusChanged', { status: 'online' });
          this.logger.log(`[Chat] Admin recognized: ${userId}. Total online support: ${this.connectedAdmins.size}`);
        }
      } catch (err) {
        this.logger.error(`[Chat] Error checking user role for ${userId}:`, err);
      }

      this.server.emit('userStatusChanged', { userId, status: 'online' });
    } else {
      this.logger.warn(`[Chat] Connection attempt without userId from IP: ${clientIp}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        
        if (this.connectedAdmins.has(userId)) {
          this.connectedAdmins.delete(userId);
          if (this.connectedAdmins.size === 0) {
            this.server.emit('supportStatusChanged', { status: 'offline' });
          }
          console.log(`[Chat] Admin disconnected: ${userId}.`);
        }

        console.log(`[Chat] User disconnected: ${userId}`);
        this.server.emit('userStatusChanged', { userId, status: 'offline' });
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; senderId: string; receiverId: string; content: string; tempId?: string }
  ) {
    try {
      console.log(`[Chat] Saving message from ${data.senderId} to conversation ${data.conversationId}`);
      const message = await this.chatService.saveMessage(data);

      // Broadcast to all in the conversation room (including sender)
      this.server.to(`conversation_${data.conversationId}`).emit('receiveMessage', {
        ...message,
        tempId: data.tempId // Pass back the tempId to help sender deduplicate
      });
      console.log(`[Chat] Broadcasted message to room: conversation_${data.conversationId}`);

      return message;
    } catch (error) {
      console.error('[Chat] Error in handleMessage:', error);
      client.emit('error', { message: 'Failed to send message' });
      return { error: error.message };
    }
  }

  @SubscribeMessage('checkUserStatus')
  handleCheckStatus(client: Socket, userId: string) {
    const isOnline = this.connectedUsers.has(userId);
    return { userId, status: isOnline ? 'online' : 'offline' };
  }

  @SubscribeMessage('getSupportStatus')
  handleGetSupportStatus() {
    return { status: this.connectedAdmins.size > 0 ? 'online' : 'offline' };
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(`conversation_${conversationId}`);
    return { status: 'joined', conversationId };
  }
}
