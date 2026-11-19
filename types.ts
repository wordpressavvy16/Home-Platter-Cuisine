import React from 'react';

// The 'Route' type has been deprecated in favor of a string-based path system
// managed by the router in App.tsx. This simplifies navigation calls and
// supports dynamic, SEO-friendly URLs.
// Example: navigate('PROFILE') becomes navigate('/profile')

export enum MealType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  VEGAN = 'VEGAN',
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  type: MealType;
  imageUrl: string;
  discountPercentage?: number;
  category?: string; // New field for menu organization
  isVisible?: boolean; // New for visibility control
  isAvailable?: boolean; // New for availability control
  stockQuantity?: number; // New for inventory management. -1 for unlimited.
  isFeatured?: boolean; // New for featured meals
  featuredAt?: string; // New for featured meals
  dietaryTags?: string[]; // New for dietary info
  allergenInfo?: string[]; // New for allergen info
  isBulkOrderEligible?: boolean; // New for bulk orders
  bulkOrderConfig?: { minQuantity: number; leadTimeHours: number; }; // New for bulk orders
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  userId?: string;
  isVerifiedPurchase?: boolean; // New for trust badge
  providerReply?: { text: string; timestamp: string; }; // New for provider replies
  isFlagged?: boolean; // New for moderation
  flaggedByUserId?: string; // New for moderation
}

export interface Announcement {
  id: string;
  providerId: string;
  message: string;
  timestamp: string;
}

// New type for Provider Subscription
export interface Subscription {
  planName: string;
  monthlyCost: number;
  nextBillingDate: string;
}

// New type for Coupons
export interface Coupon {
  id: string;
  providerId: string;
  code: string;
  discountPercentage: number;
  expiresAt: string;
  isActive: boolean;
  isSingleUse?: boolean; // New for targeted rewards
  claimedByUserId?: string | null; // New for targeted rewards
  fundedBy?: 'PLATFORM' | 'PROVIDER'; // New for compensation
  linkedDisputeId?: string; // New for compensation
}

// New type for Service Windows
export interface ServiceWindow {
  mealType: string; // e.g., "Lunch", "Dinner"
  servingStartTime: string; // "HH:MM"
  servingEndTime: string; // "HH:MM"
  orderCutoffTime: string; // "HH:MM"
}

// --- New Catering Booking Type for Story 2.20 ---
export interface CateringBooking {
  inquiryId: string;
  eventDate: string; // "YYYY-MM-DD"
  serviceWindow: string; // e.g., "Lunch"
  guestCount: number;
}

// --- New Types for Tiffin Plan System (Story 20.1) ---
export interface SampleMenuItem {
  lunch?: string;
  dinner?: string;
}

export type SampleMenu = {
  [day: string]: SampleMenuItem; // e.g., 'monday', 'tuesday'
};

export interface TiffinPlan {
  id: string;
  name: string;
  duration: 'WEEKLY' | 'MONTHLY';
  price: number;
  description: string;
  sampleMenu?: SampleMenu;
}

export interface MealProvider {
  id:string;
  name: string;
  chefName: string;
  cuisine: string;
  rating: number;
  shortDescription: string;
  longDescription: string;
  address: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  menu: Meal[];
  reviews: Review[];
  announcements: Announcement[];
  isSetupComplete: boolean;
  joinDate: string; // <-- New for admin panel
  isSuspended?: boolean; // <-- New for admin panel
  subscription: Subscription; // <-- New for billing panel
  dashboardLayout?: string[]; // <-- New for customizable dashboard
  coupons?: Coupon[]; // <-- New for coupon management
  galleryImages?: string[]; // <-- New for photo gallery
  promoVideoUrl?: string; // <-- New for short-form video
  isAcceptingOrders?: boolean; // <-- New for scheduling
  weeklySchedule?: { [day: string]: ServiceWindow[] }; // <-- New for scheduling
  orderThresholdDiscount?: { threshold: number; percentage: number; }; // <-- New for volume discounts
  coordinates?: { lat: number; lng: number; }; // <-- New for map view
  deliveryIntegrationEnabled?: boolean; // New for delivery integration
  deliveryFee?: number; // New for delivery options
  tiffinPlans?: TiffinPlan[]; // <-- New for Tiffin Plan System
  // --- New Catering Fields ---
  cateringEnabled?: boolean;
  cateringEventTypes?: string[]; // e.g., 'birthday', 'corporate'
  cateringGuestCapacity?: { min: number; max: number; };
  // --- New Scalable Catering Fields for Story 2.20 ---
  cateringMode?: 'simple' | 'professional';
  cateringMaxEventsPerWindow?: number;
  cateringProfessionalCapacity?: number; // Max concurrent guests
  cateringBookings?: CateringBooking[];
  earnedBadgeIds?: string[]; // New for provider gamification
  // --- New fields for Story 22.4 ---
  avgCostForTwo?: number;
  deliveryTime?: string;
  hasMaxSafety?: boolean;
}

// New interface for saved addresses
export interface Address {
  id: string;
  name: string; // e.g., "Home", "Work"
  street: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface User {
  id:string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'SUPER_ADMIN';
  joinDate?: string; // <-- New for admin CRM
  addresses?: Address[]; // <-- New for saved addresses
  followedProviderIds?: string[]; // <-- New for favorite kitchens
  wishlistMealIds?: string[]; // New for wishlist
  loyaltyPoints?: number; // New for loyalty program
  reEngagementStatus?: { [providerId: string]: string }; // New for re-engagement
  notificationPreferences?: {
    orderUpdates: boolean;
    newMessages: boolean;
    promotions: boolean;
  };
  mfaEnabled?: boolean;
  mfaSecret?: string; // Stored encrypted on a real backend
  earnedBadgeIds?: string[]; // New for gamification
}

export type CartItemType = 'MEAL' | 'PLAN';

export interface CartItem {
  id: string; // Can be meal id or plan id
  name: string;
  price: number;
  quantity: number;
  providerId: string;
  providerName: string;
  itemType: CartItemType;
  deliveryWindow?: string; // New for pre-order system
  
  // Meal-specific (optional)
  description?: string;
  type?: MealType; 
  imageUrl?: string;
  discountPercentage?: number;

  // Plan-specific (optional)
  duration?: 'WEEKLY' | 'MONTHLY';
}

// New interface for direct messaging
export interface Message {
  id: string;
  senderId: string; // "usr_..." or "prov_..." or "ai_..."
  text: string;
  timestamp: string;
  messageType?: 'text' | 'quote'; // New for Story 2.21
  quote?: { // New for Story 2.21
    amount: number;
    expiresAt?: string;
    isAccepted?: boolean;
  };
}

// New interface for optional add-ons
export interface OrderAddOn {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

// New interface for order tracking
export interface OrderTracking {
  startTime: number;
  path: { lat: number; lng: number }[];
  destination: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
}

// --- New Types for Order Dispute System ---
export type DisputeReason = 'WRONG_ITEM' | 'QUALITY_ISSUE' | 'NOT_DELIVERED' | 'OTHER';

export interface OrderDispute {
  reason: DisputeReason;
  customerMessage: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface Order {
  id:string;
  userId: string;
  providerId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  deliveryWindow?: string; // New for pre-order system
  reviewSubmitted?: boolean;
  reviewReminderSent?: boolean;
  customerName: string;
  customerEmail: string;
  messages?: Message[]; // <-- New for messaging
  lastMessageAt?: string; // <-- New for sorting conversations
  addOns?: OrderAddOn[]; // <-- New for add-ons
  tracking?: OrderTracking; // <-- New for real-time tracking
  pointsEarned?: number; // New for loyalty program
  pointsRedeemed?: number; // New for loyalty program
  deliveryPartner?: { name: string; vehicle: string; phone: string; }; // New for delivery integration
  deliveryMethod?: 'PICKUP' | 'DELIVERY'; // New for delivery options
  deliveryFeeApplied?: number; // New for delivery options
  deliveryCost?: number; // New for delivery cost tracking
  cateringInquiryId?: string; // New for Story 2.21
  dispute?: OrderDispute; // New for dispute resolution
}

// New type for Tiffin Plan subscriptions (Story 20.3)
export interface SubscriptionOrder {
  id: string;
  userId: string;
  providerId: string;
  planId: string;
  planName: string;
  duration: 'WEEKLY' | 'MONTHLY';
  totalAmount: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  pausePeriods?: { startDate: string; endDate: string }[];
}

// New interface for pre-order Q&A
export interface Inquiry {
  id: string;
  providerId: string;
  customerId: string;
  customerName: string;
  messages: Message[];
  isArchived?: boolean;
  lastMessageAt: string;
}

export interface AnalysisResult {
  strengths: string[];
  areasForImprovement: string[];
  overallSentiment: string;
}

export interface PerformanceMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDay: { date: string; sales: number }[];
  topSellingItems: { name:string; quantity: number; }[];
}

export interface BusinessSummary {
  overallPerformance: string;
  customerSentimentAnalysis: string;
  actionableInsights: string[];
}

// New types for Demand Forecasting
export interface ForecastedItem {
    itemName: string;
    reason: string;
}

export interface DemandForecastResult {
    predictedItems: ForecastedItem[];
    forecastPeriod: string;
}

// New type for AI Menu Analysis
export interface MenuAnalysis {
    strengths: string[];
    opportunities: string[];
    pricingAnalysis: string;
    descriptionAnalysis: string;
}

// New type for AI Support Chatbot
export interface ChatMessage {
    id: string;
    text: string;
    role: 'USER' | 'MODEL' | 'SYSTEM';
}

// New type for Admin KPIs
export interface PlatformKpis {
  totalRevenue: number;
  totalOrders: number;
  totalProviders: number;
  totalCustomers: number;
}

// New type for Admin Invoicing
export interface Invoice {
  id: string;
  providerId: string;
  providerName: string;
  period: string; // e.g., "July 2024"
  amount: number;
  status: 'DRAFT' | 'SENT';
  aiSummaryNotes: string;
  generatedDate: string;
}

// New type for Notifications
export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkTo?: {
    path: string; // Changed from route: Route to string
    params?: Record<string, string>;
  };
}

// New type for Coupon Validation
export interface CouponValidationResponse {
  isValid: boolean;
  discountPercentage: number;
  message: string;
  coupon?: Coupon;
}

// --- New Types for Support Ticketing System ---
export interface TicketMessage {
  id: string;
  senderId: string; // 'user' or 'admin' or the actual userId/adminId
  senderName: string;
  text: string;
  timestamp: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'PAYMENT_ISSUE' | 'ORDER_PROBLEM' | 'TECHNICAL_GLITCH' | 'ACCOUNT_QUESTION' | 'OTHER';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: User['role'];
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

// --- New Type for Personalized Feed ---
export interface FeedItem {
  id: string;
  type: 'ANNOUNCEMENT' | 'FEATURED_MEAL';
  timestamp: string;
  providerId: string;
  providerName: string;
  providerProfileImageUrl: string;
  content: {
    message?: string; // For ANNOUNCEMENT
    meal?: Meal;      // For FEATURED_MEAL
  };
}

// --- New Type for Curated Collections ---
export interface Collection {
  id: string;
  userId?: string; // For user collections
  providerId?: string; // For provider collections
  name: string;
  description?: string;
  isPublic?: boolean; // For user collections, providers' are always public on their page
  mealIds: string[];
  creatorName?: string; // Added for public display
  mealPreviews?: Meal[]; // For rich display on cards
}

// --- New Type for Gamification ---
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{className?: string}>;
}