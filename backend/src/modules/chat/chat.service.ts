import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  async getConversations(userId: string, role: string) {
    const query = this.conversationRepository.createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'customer')
      .leftJoinAndSelect('c.admin', 'admin')
      .orderBy('c.last_message_at', 'DESC');

    if (role === 'admin') {
      // Admins see all conversations they are part of or active ones
      return query.getMany();
    } else {
      // Customers see their own conversation
      return query.where('c.customer_id = :userId', { userId }).getMany();
    }
  }

  async getMessages(conversationId: string, user?: any) {
    const messages = await this.messageRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
      relations: ['sender'],
    });

    // If an admin is viewing an unassigned conversation, assign them
    if (user && user.role === 'admin') {
      const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
      if (conversation && !conversation.admin_id) {
        conversation.admin_id = user.id;
        await this.conversationRepository.save(conversation);
      }
    }

    return messages;
  }

  async saveMessage(data: { conversationId?: string; senderId: string; receiverId?: string; content: string }) {
    let conversation: Conversation | null = null;

    if (data.conversationId) {
      conversation = await this.conversationRepository.findOne({ where: { id: data.conversationId } });
    } else if (data.receiverId) {
      // Find or create conversation
      const customerId = data.senderId; // Assuming customer starts
      const adminId = data.receiverId;
      conversation = await this.conversationRepository.findOne({
        where: { customer_id: customerId, admin_id: adminId }
      });

      if (!conversation) {
        const newConversation = this.conversationRepository.create({
          customer_id: customerId,
          admin_id: adminId,
          last_message: data.content,
        });
        conversation = await this.conversationRepository.save(newConversation);
      }
    }

    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.messageRepository.create({
      conversation_id: conversation.id,
      sender_id: data.senderId,
      content: data.content,
    });

    const savedMessage = await this.messageRepository.save(message);
    
    let updated = false;
    // Auto-assign admin if they send the first reply
    if (!conversation.admin_id && data.senderId !== conversation.customer_id) {
      conversation.admin_id = data.senderId;
      updated = true;
    }

    // Update conversation last message
    conversation.last_message = data.content;
    conversation.last_message_at = new Date();
    await this.conversationRepository.save(conversation);

    // Notify Admins if customer sent the message
    if (data.senderId === conversation.customer_id) {
      try {
        const admins = await this.usersService.findAdmins();
        const adminIds = admins.map(a => a.id);
        await this.notificationsService.notifyAdmins(
          'notifications.chat.new_message.title',
          'notifications.chat.new_message.message',
          adminIds,
          { 
            type: 'chat',
            conversationId: conversation.id,
            senderName: (await this.userRepository.findOne({ where: { id: data.senderId } }))?.name || 'Customer'
          }
        );
      } catch (err) {
        console.error('Failed to notify admins of chat message:', err);
      }
    }

    return {
      ...savedMessage,
      conversation: updated ? conversation : undefined // Return conversation if it was updated
    };
  }

  async findOrCreateConversation(customerId: string, adminId?: string) {
    let conversation = await this.conversationRepository.findOne({
      where: { customer_id: customerId },
      relations: ['customer', 'admin']
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        customer_id: customerId,
        admin_id: adminId, // Can be null if generic support
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }
}
