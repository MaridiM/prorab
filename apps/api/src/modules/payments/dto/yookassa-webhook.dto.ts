export interface YooKassaWebhookDto {
  type: string;
  event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
    | 'refund.succeeded';
  object: {
    id: string;
    status: string;
    paid: boolean;
    amount: {
      value: string;
      currency: string;
    };
    metadata?: Record<string, any>;
    cancellation_details?: {
      party: string;
      reason: string;
    };
    payment_id?: string; // For refund events - ID of original payment
  };
}
