// src/otp/interfaces/application-invite-payload.interface.ts
export interface ApplicationInvitePayload {
    to: string;
    title: string;
    type: 'application_invite';
    /**
     * This will default to:
     * "We would like to invite you to apply to {title} at Kifiya Financial Technologies"
     */
    subject?: string;
    name: string;
    apply_link: string;
  }
  