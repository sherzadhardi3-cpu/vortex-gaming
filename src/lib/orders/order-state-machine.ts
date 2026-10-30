// VORTEX GAMING — Strict Order & Fulfillment State Machine
// Decouples payment lifecycle from inventory fulfillment.
// Disallows customer-side state modifications and illegal state transitions.

export type PaymentState = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type FulfillmentState = 'NOT_STARTED' | 'RESERVED' | 'COMPLETED' | 'FAILED' | 'REVOKED';

export const VALID_PAYMENT_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  PENDING: ['PROCESSING', 'PAID', 'FAILED'],
  PROCESSING: ['PAID', 'FAILED'],
  PAID: ['REFUNDED'],
  FAILED: [],
  REFUNDED: [],
};

export const VALID_FULFILLMENT_TRANSITIONS: Record<FulfillmentState, FulfillmentState[]> = {
  NOT_STARTED: ['RESERVED', 'FAILED'],
  RESERVED: ['COMPLETED', 'FAILED'],
  COMPLETED: ['REVOKED'],
  FAILED: [],
  REVOKED: [],
};

/**
 * Validates whether a payment state transition is logically permitted.
 */
export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  if (from === to) return true;
  return VALID_PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validates whether a fulfillment state transition is logically permitted.
 */
export function canTransitionFulfillment(from: FulfillmentState, to: FulfillmentState): boolean {
  if (from === to) return true;
  return VALID_FULFILLMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validates whether a game activation key can be legally released and revealed to the buyer.
 * CRITICAL RULE: Both payment must be verified ('PAID') AND fulfillment must be 'COMPLETED'.
 */
export function canRevealActivationKey(paymentState: PaymentState, fulfillmentState: FulfillmentState): boolean {
  return paymentState === 'PAID' && fulfillmentState === 'COMPLETED';
}
