import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Req() req) {
    return this.chatService.getConversations(req.user.id, req.user.role);
  }

  @Get('messages/:conversationId')
  async getMessages(@Req() req, @Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId, req.user);
  }

  @Post('start')
  async startConversation(@Req() req, @Body() body: { adminId?: string }) {
    return this.chatService.findOrCreateConversation(req.user.id, body.adminId);
  }

  @Post('send')
  async sendMessage(@Req() req, @Body() body: { conversationId: string; content: string }) {
    return this.chatService.saveMessage({
      conversationId: body.conversationId,
      senderId: req.user.id,
      content: body.content,
    });
  }
}
