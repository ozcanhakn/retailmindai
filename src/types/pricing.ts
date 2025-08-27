// Pricing Plans Types
export interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
  limit?: number | string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: PricingFeature[];
  popular?: boolean;
  recommended?: boolean;
  color: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  limits: {
    workspaces: number | 'unlimited';
    fileUploads: number | 'unlimited';
    dataRows: number | 'unlimited';
    exports: number | 'unlimited';
    apiCalls: number | 'unlimited';
  };
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  billingCycle: 'monthly' | 'yearly';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  description: string;
}