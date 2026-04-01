import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { EmailObserver, SMSObserver, InAppObserver } from './observers';
import { NotificationsGateway } from './notifications.gateway';

export interface NotificationObserver {
  update(title: string, message: string, userId: string): void;
}

@Injectable()
export class NotificationsService {
  private observers: NotificationObserver[] = [];

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {
    this.addObserver(new EmailObserver());
    this.addObserver(new SMSObserver());
    this.addObserver(new InAppObserver());
  }

  addObserver(observer: NotificationObserver) {
    this.observers.push(observer);
  }

  async notify(title: string, message: string, userId: string, data?: any) {
    // Save to database
    const notification = this.notificationRepository.create({
      title,
      message,
      data,
      user: { id: userId },
    });
    const savedNotification = await this.notificationRepository.save(notification);

    // Real-time WebSocket emission
    this.notificationsGateway.sendToUser(userId, 'notification', savedNotification);

    // Notify observers (e.g., Email, SMS)
    this.observers.forEach((observer) => observer.update(title, message, userId));
  }

  async notifyAdmins(title: string, message: string, adminIds: string[], data?: any) {
    for (const adminId of adminIds) {
      await this.notify(title, message, adminId, data);
    }
  }

  async findForUser(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    return this.notificationRepository.update(id, { is_read: true });
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.update(
      { user: { id: userId }, is_read: false },
      { is_read: true }
    );
  }

  async getUnreadCounts(userId: string) {
    const unread = await this.notificationRepository.find({
      where: { user: { id: userId }, is_read: false }
    });

    const counts = {
      sale: 0,
      purchase_request: 0,
      chat: 0,
      manual_payment: 0
    };

    unread.forEach(n => {
      if (n.data?.type === 'sale') {
        if (n.data?.is_receipt) counts.manual_payment++;
        else counts.sale++;
      } else if (n.data?.type === 'purchase_request') {
        counts.purchase_request++;
      } else if (n.data?.type === 'chat') {
        counts.chat++;
      }
    });

    return counts;
  }

  async markTypeAsRead(userId: string, type: string) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId }, is_read: false }
    });
    
    for (const n of notifications) {
      if (n.data?.type === type) {
        await this.notificationRepository.update(n.id, { is_read: true });
      }
    }
  }
}
