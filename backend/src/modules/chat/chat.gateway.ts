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
import { Injectable, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
  transports: ['polling', 'websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); 

  constructor(private chatService: ChatService) { }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      console.log(`[Chat] User connected: ${userId} (Socket: ${client.id})`);
      // Broadcast status change
      this.server.emit('userStatusChanged', { userId, status: 'online' });
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`[Chat] User disconnected: ${userId}`);
        // Broadcast status change
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

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(`conversation_${conversationId}`);
    return { status: 'joined', conversationId };
  }
}
