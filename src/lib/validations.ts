// VORTEX GAMING — Input Validation Schemas
// All validation is done server-side. Client-side validation is convenience only.

import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform(v => v.toLowerCase().trim()),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

// ─── Product Schemas ─────────────────────────────────────────────────────────

export const productSearchSchema = z.object({
  query: z.string().max(200).optional(),
  platform: z.string().max(50).optional(),
  genre: z.string().max(50).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  region: z.string().max(20).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popularity', 'discount']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const productCreateSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1).max(10000),
  shortDescription: z.string().max(500).optional(),
  coverImage: z.string().url().or(z.string().startsWith('/')),
  platformId: z.string().cuid(),
  publisher: z.string().max(200).optional(),
  developer: z.string().max(200).optional(),
  genre: z.array(z.string().max(50)).max(10),
  tags: z.array(z.string().max(50)).max(20).default([]),
  priceUSD: z.number().int().min(0),
  priceIQD: z.number().int().min(0),
  originalPriceUSD: z.number().int().min(0).optional(),
  originalPriceIQD: z.number().int().min(0).optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  activationRegion: z.string().max(20).default('GLOBAL'),
  activationType: z.enum(['KEY', 'CODE', 'GIFT_CARD', 'SUBSCRIPTION']).default('KEY'),
  productType: z.enum(['GAME', 'DLC', 'GIFT_CARD', 'SUBSCRIPTION', 'BUNDLE']).default('GAME'),
  refundEligible: z.boolean().default(true),
});

// ─── Cart Schemas ────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(10), // 0 = remove
});

// ─── Checkout Schemas ────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  currency: z.enum(['USD', 'IQD']).default('USD'),
  paymentProvider: z.enum([
    'stripe',
    'fib',
    'fastpay',
    'qi_card',
    'vortex_wallet',
    'iraqi_cards',
    'international_cards',
  ]),
  couponCode: z.string().max(50).optional(),
});

// ─── Coupon Schemas ──────────────────────────────────────────────────────────

export const couponApplySchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50)
    .transform(v => v.toUpperCase().trim()),
});

export const couponCreateSchema = z.object({
  code: z.string().min(1).max(50).transform(v => v.toUpperCase().trim()),
  description: z.string().max(500).optional(),
  discountType: z.enum(['percentage', 'fixed_usd', 'fixed_iqd']),
  discountValue: z.number().int().min(1),
  minOrderAmount: z.number().int().min(0).optional(),
  maxUses: z.number().int().min(1).optional(),
  maxUsesPerUser: z.number().int().min(1).default(1),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

// ─── Review Schemas ──────────────────────────────────────────────────────────

export const reviewCreateSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().max(2000).optional(),
});

// ─── Support Schemas ─────────────────────────────────────────────────────────

export const supportTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  category: z.enum(['order', 'payment', 'activation', 'refund', 'account', 'other']),
  orderId: z.string().cuid().optional(),
  message: z.string().min(1).max(5000),
});

export const ticketMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// ─── Game Key Import Schema ──────────────────────────────────────────────────

export const gameKeyImportSchema = z.object({
  productId: z.string().cuid(),
  keys: z
    .array(z.string().min(1).max(500))
    .min(1, 'At least one key is required')
    .max(1000, 'Maximum 1000 keys per import'),
});

// ─── Admin User Management ───────────────────────────────────────────────────

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['CUSTOMER', 'SUPPORT_AGENT', 'PRODUCT_MANAGER', 'ADMIN']),
  // Note: SUPER_ADMIN can only be assigned by direct database modification
});

// ─── Settings Schema ─────────────────────────────────────────────────────────

export const settingUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
  group: z.enum(['general', 'payment', 'email', 'security']).default('general'),
});

// ─── Types derived from schemas ──────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewCreateSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type GameKeyImportInput = z.infer<typeof gameKeyImportSchema>;
