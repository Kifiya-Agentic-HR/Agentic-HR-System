// src/otp/interfaces/notification-payload.interface.ts
export interface NotificationPayload {
    to: string;
    otp: string;
    type: 'otp_verification';
    subject: string;
    name: string;
    title: string;
  }