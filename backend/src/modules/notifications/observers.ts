import { NotificationObserver } from './notifications.service';

export class EmailObserver implements NotificationObserver {
  update(title: string, message: string, userId: string): void {
    console.log(`[Email Notification] To User ${userId}: ${title} - ${message}`);
    // Real email sending logic would go here (e.g., using nodemailer or SendGrid)
  }
}

export class SMSObserver implements NotificationObserver {
  update(title: string, message: string, userId: string): void {
    console.log(`[SMS Notification] To User ${userId}: ${title} - ${message}`);
    // Real SMS sending logic would go here (e.g., using Twilio)
  }
}

export class InAppObserver implements NotificationObserver {
  update(title: string, message: string, userId: string): void {
    console.log(`[In-App Notification] To User ${userId}: ${title} - ${message}`);
    // In-app notifications are already handled by saving to the DB in the service
  }
}
