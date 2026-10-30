// VORTEX GAMING — Stripe Webhook Processing, Replay Defense & Fulfillment Reconciliation

import fs from 'fs';
import path from 'path';
import {
  markOrderAsPaid,
  reconcileOrderRefund,
  markOrderAsFailed,
} from '../orders/order-store.ts';

const DATA_DIR = path.join(process.cwd(), '.data');
const PROCESSED_WEBHOOKS_FILE = path.join(DATA_DIR, 'processed-webhooks.json');
const FULFILLMENTS_FILE = path.join(DATA_DIR, 'fulfillments.json');

export interface ProcessedWebhookRecord {
  id: string;
  type: string;
  receivedAt: string;
  action: string;
}

export interface FulfillmentRecord {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  status: 'FULFILLED' | 'REFUNDED' | 'FAILED';
  keyDelivered: boolean;
  revokedAt?: string;
  updatedAt: string;
}

export function loadProcessedEventIds(): Set<string> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(PROCESSED_WEBHOOKS_FILE)) {
      fs.writeFileSync(PROCESSED_WEBHOOKS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return new Set();
    }
    const data: ProcessedWebhookRecord[] = JSON.parse(fs.readFileSync(PROCESSED_WEBHOOKS_FILE, 'utf-8'));
    return new Set(data.map((r) => r.id));
  } catch {
    return new Set();
  }
}

export function recordProcessedEvent(record: ProcessedWebhookRecord) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const existing: ProcessedWebhookRecord[] = fs.existsSync(PROCESSED_WEBHOOKS_FILE)
      ? JSON.parse(fs.readFileSync(PROCESSED_WEBHOOKS_FILE, 'utf-8'))
      : [];
    existing.push(record);
    fs.writeFileSync(PROCESSED_WEBHOOKS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Stripe Webhook] Error recording event:', err);
  }
}

export function getFulfillment(orderId: string): FulfillmentRecord | null {
  try {
    if (!fs.existsSync(FULFILLMENTS_FILE)) return null;
    const existing: Record<string, FulfillmentRecord> = JSON.parse(fs.readFileSync(FULFILLMENTS_FILE, 'utf-8'));
    return existing[orderId] || null;
  } catch {
    return null;
  }
}

export function updateFulfillment(orderId: string, data: Partial<FulfillmentRecord>) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const existing: Record<string, FulfillmentRecord> = fs.existsSync(FULFILLMENTS_FILE)
      ? JSON.parse(fs.readFileSync(FULFILLMENTS_FILE, 'utf-8'))
      : {};

    existing[orderId] = {
      ...(existing[orderId] || {
        orderId,
        orderNumber: orderId,
        customerEmail: 'customer@vortexgaming.gg',
        status: 'FULFILLED',
        keyDelivered: true,
        updatedAt: new Date().toISOString(),
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(FULFILLMENTS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Stripe Webhook] Error saving fulfillment:', err);
  }
}

/**
 * Handles a verified Stripe event with idempotent replay protection.
 */
export function handleVerifiedStripeEvent(event: { id: string; type: string; data: { object: any } }): {
  action: string;
  duplicate: boolean;
  orderId?: string;
} {
  const processedIds = loadProcessedEventIds();
  if (processedIds.has(event.id)) {
    return {
      action: 'IGNORED_DUPLICATE_REPLAY',
      duplicate: true,
    };
  }

  const eventRecord: ProcessedWebhookRecord = {
    id: event.id,
    type: event.type,
    receivedAt: new Date().toISOString(),
    action: 'PENDING',
  };

  let affectedOrderId: string = 'order_unknown';

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      affectedOrderId = session.metadata?.orderId || session.client_reference_id || `order_${session.id}`;
      const orderNumber = session.metadata?.orderNumber || 'VX-CONFIRMED';
      const customerEmail = session.customer_email || session.metadata?.customerEmail || 'customer@vortexgaming.gg';

      updateFulfillment(affectedOrderId, {
        orderNumber,
        customerEmail,
        status: 'FULFILLED',
        keyDelivered: true,
      });

      // Synchronize authoritative order store: transition to PAID and allocate keys
      markOrderAsPaid(affectedOrderId, {
        paymentSessionId: session.id,
        paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      });

      eventRecord.action = 'ORDER_FULFILLED_KEYS_ALLOCATED';
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      affectedOrderId = charge.metadata?.orderId || 'order_refund_target';

      updateFulfillment(affectedOrderId, {
        status: 'REFUNDED',
        keyDelivered: false,
        revokedAt: new Date().toISOString(),
      });

      // Synchronize authoritative order store: revoke keys
      reconcileOrderRefund(affectedOrderId, 'Stripe charge refunded');

      eventRecord.action = 'KEY_REVOKED_REFUND_RECONCILED';
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      affectedOrderId = paymentIntent.metadata?.orderId || 'order_failed_target';

      updateFulfillment(affectedOrderId, {
        status: 'FAILED',
        keyDelivered: false,
      });

      // Synchronize authoritative order store: mark FAILED
      markOrderAsFailed(affectedOrderId, 'Stripe payment intent failed');

      eventRecord.action = 'PAYMENT_FAILED_NO_KEYS_ALLOCATED';
      break;
    }

    default:
      eventRecord.action = `UNHANDLED_EVENT_${event.type}`;
      break;
  }

  recordProcessedEvent(eventRecord);

  return {
    action: eventRecord.action,
    duplicate: false,
    orderId: affectedOrderId,
  };
}
