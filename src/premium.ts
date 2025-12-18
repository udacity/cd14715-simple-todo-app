/**
 * Premium features for todo list application
 *
 * ⚠️ ISSUE: No tests exist for this critical business logic
 */

import { db } from './database';

export interface Subscription {
  userId: string;
  tier: 'free' | 'premium' | 'enterprise';
  validUntil: Date;
  features: string[];
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

/**
 * Processes a premium subscription payment
 * ⚠️ NO TESTS - Critical payment logic without test coverage
 */
export async function processPremiumPayment(
  userId: string,
  payment: PaymentDetails,
  tier: 'premium' | 'enterprise'
): Promise<boolean> {
  // Validate payment details
  if (!validatePaymentDetails(payment)) {
    throw new Error('Invalid payment details');
  }

  // Calculate pricing based on tier
  const amount = calculateSubscriptionPrice(tier);

  if (payment.amount < amount) {
    throw new Error('Insufficient payment amount');
  }

  // Process payment
  const paymentSuccessful = await chargeCard(payment, amount);

  if (!paymentSuccessful) {
    return false;
  }

  // Upgrade user subscription
  await upgradeUserSubscription(userId, tier);

  return true;
}

/**
 * Validates payment card details
 * ⚠️ NO TESTS - Card validation without test coverage
 */
function validatePaymentDetails(payment: PaymentDetails): boolean {
  const { cardNumber, expiryDate, cvv } = payment;

  // Check card number length
  if (cardNumber.length !== 16) {
    return false;
  }

  // Check CVV length
  if (cvv.length !== 3 && cvv.length !== 4) {
    return false;
  }

  // Validate expiry date format (MM/YY)
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiryDate)) {
    return false;
  }

  // Check if card is expired
  const [month, year] = expiryDate.split('/');
  const expiryDateObj = new Date(2000 + parseInt(year), parseInt(month) - 1);

  if (expiryDateObj < new Date()) {
    return false;
  }

  return true;
}

/**
 * Calculates subscription price based on tier
 * ⚠️ NO TESTS - Pricing logic without test coverage
 */
function calculateSubscriptionPrice(tier: 'premium' | 'enterprise'): number {
  const PRICING = {
    premium: 9.99,
    enterprise: 49.99
  };

  const basePrice = PRICING[tier];
  const TAX_RATE = 0.08;
  const PROCESSING_FEE = 0.029;

  const tax = basePrice * TAX_RATE;
  const fee = basePrice * PROCESSING_FEE;

  return basePrice + tax + fee;
}

/**
 * Charges the credit card
 * ⚠️ NO TESTS - Payment processing without test coverage
 */
async function chargeCard(payment: PaymentDetails, amount: number): Promise<boolean> {
  // Simulate payment gateway call
  const query = 'INSERT INTO payments (card_last_four, amount, status) VALUES ($1, $2, $3)';
  const lastFour = payment.cardNumber.slice(-4);

  try {
    await db.query(query, [lastFour, amount, 'completed']);
    return true;
  } catch (error) {
    console.error('Payment failed:', error);
    return false;
  }
}

/**
 * Upgrades user to premium subscription
 * ⚠️ NO TESTS - Subscription upgrade without test coverage
 */
async function upgradeUserSubscription(userId: string, tier: 'premium' | 'enterprise'): Promise<void> {
  const features = tier === 'premium'
    ? ['unlimited_todos', 'priority_support', 'custom_themes']
    : ['unlimited_todos', 'priority_support', 'custom_themes', 'api_access', 'team_collaboration'];

  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const query = 'INSERT INTO subscriptions (user_id, tier, valid_until, features) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET tier = $2, valid_until = $3, features = $4';

  await db.query(query, [userId, tier, validUntil, JSON.stringify(features)]);
}

/**
 * Checks if user has access to a premium feature
 * ⚠️ NO TESTS - Feature access control without test coverage
 */
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const query = 'SELECT features, valid_until FROM subscriptions WHERE user_id = $1';
  const rows = await db.query(query, [userId]);

  if (rows.length === 0) {
    return false;
  }

  const subscription = rows[0];
  const validUntil = new Date(subscription.valid_until);

  // Check if subscription is still valid
  if (validUntil < new Date()) {
    return false;
  }

  // Check if feature is included
  const features = JSON.parse(subscription.features);
  return features.includes(feature);
}

/**
 * Gets user's current subscription
 * ⚠️ NO TESTS - Subscription retrieval without test coverage
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const query = 'SELECT * FROM subscriptions WHERE user_id = $1';
  const rows = await db.query(query, [userId]);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    userId: row.user_id,
    tier: row.tier,
    validUntil: new Date(row.valid_until),
    features: JSON.parse(row.features)
  };
}
