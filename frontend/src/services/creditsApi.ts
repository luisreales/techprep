import { ApiResponse } from '@/types/api';
import { api } from './api';

// Credits and Plans Types
export interface CreditBalance {
  userId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
  tier: SubscriptionTier;
  nextResetDate?: string;
  monthlyAllowance: number;
  rolloverCredits: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'earned' | 'spent' | 'refund' | 'expired' | 'bonus';
  amount: number;
  balance: number;
  description: string;
  sourceType: 'session' | 'purchase' | 'referral' | 'promotion' | 'subscription' | 'admin';
  sourceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  type: 'free' | 'starter' | 'professional' | 'enterprise';
  description: string;
  features: TierFeature[];
  pricing: TierPricing;
  limits: TierLimits;
  isActive: boolean;
  isPopular?: boolean;
  trialDays?: number;
}

export interface TierFeature {
  name: string;
  description: string;
  enabled: boolean;
  limit?: number;
}

export interface TierPricing {
  monthly: number;
  yearly: number;
  currency: string;
  discount?: number; // yearly discount percentage
}

export interface TierLimits {
  monthlyCredits: number;
  maxRolloverCredits: number;
  maxGroupMembers: number;
  maxCustomTemplates: number;
  maxConcurrentSessions: number;
  analyticsRetentionDays: number;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  features: {
    proctoring: boolean;
    certificates: boolean;
    analytics: boolean;
    api: boolean;
    whiteLabel: boolean;
    sso: boolean;
    webhooks: boolean;
    customDomain: boolean;
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  tierId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired' | 'trial' | 'suspended';
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  amount: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonus?: number; // bonus credits
  description: string;
  isPopular?: boolean;
  validityDays?: number; // how long credits last
  features?: string[];
}

export interface TopUpRequest {
  packageId: string;
  paymentMethodId?: string;
  promoCode?: string;
}

export interface SubscriptionChangeRequest {
  tierId: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId?: string;
  promoCode?: string;
}

export interface UsageStats {
  currentPeriod: {
    creditsUsed: number;
    creditsRemaining: number;
    sessionsCompleted: number;
    questionsAnswered: number;
    certificatesIssued: number;
  };
  lastPeriod: {
    creditsUsed: number;
    sessionsCompleted: number;
    questionsAnswered: number;
    certificatesIssued: number;
  };
  historical: {
    totalCreditsEarned: number;
    totalCreditsSpent: number;
    totalSessions: number;
    accountAge: number; // days
  };
  projections: {
    estimatedMonthlyUsage: number;
    recommendedTier?: string;
    costSaving?: number;
  };
}

export interface PromoCode {
  code: string;
  type: 'credits' | 'subscription_discount' | 'free_upgrade';
  value: number; // credits or discount percentage
  description: string;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  restrictions?: {
    newUsersOnly?: boolean;
    minPurchase?: number;
    maxDiscount?: number;
    applicableTiers?: string[];
  };
}

export interface BillingHistory {
  id: string;
  type: 'subscription' | 'credits' | 'refund';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  invoiceUrl?: string;
  date: string;
}

// API Functions
export const creditsApi = {
  // Credit Balance
  async getCreditBalance(): Promise<ApiResponse<CreditBalance>> {
    return api.get('/api/credits/balance');
  },

  async getCreditTransactions(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    transactions: CreditTransaction[];
    totalCount: number;
  }>> {
    return api.get(`/api/credits/transactions?page=${page}&limit=${limit}`);
  },

  // Subscription Tiers
  async getSubscriptionTiers(): Promise<ApiResponse<SubscriptionTier[]>> {
    return api.get('/api/subscriptions/tiers');
  },

  async getCurrentSubscription(): Promise<ApiResponse<UserSubscription>> {
    return api.get('/api/subscriptions/current');
  },

  async changeSubscription(request: SubscriptionChangeRequest): Promise<ApiResponse<UserSubscription>> {
    return api.post('/api/subscriptions/change', request);
  },

  async cancelSubscription(reason?: string): Promise<ApiResponse<void>> {
    return api.post('/api/subscriptions/cancel', { reason });
  },

  async renewSubscription(): Promise<ApiResponse<UserSubscription>> {
    return api.post('/api/subscriptions/renew');
  },

  // Credit Packages & Top-ups
  async getCreditPackages(): Promise<ApiResponse<CreditPackage[]>> {
    return api.get('/api/credits/packages');
  },

  async purchaseCredits(request: TopUpRequest): Promise<ApiResponse<{
    transactionId: string;
    creditsAdded: number;
    newBalance: number;
  }>> {
    return api.post('/api/credits/purchase', request);
  },

  // Payment Methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return api.get('/api/payments/methods');
  },

  async addPaymentMethod(token: string): Promise<ApiResponse<PaymentMethod>> {
    return api.post('/api/payments/methods', { token });
  },

  async deletePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return api.delete(`/api/payments/methods/${methodId}`);
  },

  async setDefaultPaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return api.put(`/api/payments/methods/${methodId}/default`);
  },

  // Usage & Analytics
  async getUsageStats(): Promise<ApiResponse<UsageStats>> {
    return api.get('/api/credits/usage');
  },

  async getBillingHistory(page: number = 1): Promise<ApiResponse<{
    history: BillingHistory[];
    totalCount: number;
  }>> {
    return api.get(`/api/billing/history?page=${page}`);
  },

  // Promo Codes
  async validatePromoCode(code: string): Promise<ApiResponse<PromoCode>> {
    return api.post('/api/promo/validate', { code });
  },

  async applyPromoCode(code: string, context: 'credits' | 'subscription'): Promise<ApiResponse<{
    applied: boolean;
    discount: number;
    newTotal: number;
  }>> {
    return api.post('/api/promo/apply', { code, context });
  },

  // Admin Functions
  async addCreditsToUser(userId: string, amount: number, reason: string): Promise<ApiResponse<void>> {
    return api.post('/api/admin/credits/add', { userId, amount, reason });
  },

  async removeCreditsFromUser(userId: string, amount: number, reason: string): Promise<ApiResponse<void>> {
    return api.post('/api/admin/credits/remove', { userId, amount, reason });
  },

  async getUserSubscriptions(page: number = 1): Promise<ApiResponse<{
    subscriptions: UserSubscription[];
    totalCount: number;
  }>> {
    return api.get(`/api/admin/subscriptions?page=${page}`);
  },

  async createPromoCode(promo: Partial<PromoCode>): Promise<ApiResponse<PromoCode>> {
    return api.post('/api/admin/promo', promo);
  },

  // Webhooks & Notifications
  async getNotificationPreferences(): Promise<ApiResponse<{
    lowBalance: boolean;
    beforeExpiry: boolean;
    planChanges: boolean;
    billingUpdates: boolean;
  }>> {
    return api.get('/api/notifications/preferences');
  },

  async updateNotificationPreferences(preferences: {
    lowBalance?: boolean;
    beforeExpiry?: boolean;
    planChanges?: boolean;
    billingUpdates?: boolean;
  }): Promise<ApiResponse<void>> {
    return api.put('/api/notifications/preferences', preferences);
  },

  // Cost Calculator
  async calculateCosts(usage: {
    expectedSessions: number;
    averageQuestionsPerSession: number;
    certificatesNeeded: number;
    groupSize?: number;
  }): Promise<ApiResponse<{
    recommendedTier: string;
    estimatedMonthlyCost: number;
    estimatedCreditsNeeded: number;
    alternatives: Array<{
      tierId: string;
      tierName: string;
      monthlyCost: number;
      creditsIncluded: number;
      additionalCreditsNeeded: number;
      totalCost: number;
      savings?: number;
    }>;
  }>> {
    return api.post('/api/credits/calculate', usage);
  }
};