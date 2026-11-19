// Mock API Server with localStorage persistence

import type { MealProvider, Order, CartItem, Meal, Invoice, Notification, User, Address, Coupon, Message, OrderAddOn, MenuAnalysis, OrderTracking, FeedItem, Inquiry, SupportTicket, TicketMessage, Collection, Review, CateringBooking, SubscriptionOrder, Announcement, PlatformKpis, DisputeReason, TicketCategory, TicketStatus, AnalysisResult } from '../types';
import { MealType } from '../types';

const DB_KEY = 'homeplatter_mock_db';

// --- Default Data ---
const MEAL_PROVIDERS_DEFAULT: MealProvider[] = [
  {
    id: 'p1',
    name: "Sarita's Kitchen",
    chefName: 'Sarita Sharma',
    cuisine: 'North Indian',
    rating: 4.8,
    shortDescription: 'Authentic North Indian thalis and curries.',
    longDescription: 'Bringing the taste of my grandmother\'s recipes to your table. Every dish is cooked with love, fresh ingredients, and a blend of traditional spices. Perfect for a hearty and healthy meal.',
    address: 'Sector 22, Gurugram',
    coordinates: { lat: 30, lng: 30 },
    profileImageUrl: 'https://picsum.photos/seed/chef1/100/100',
    bannerImageUrl: 'https://picsum.photos/seed/banner1/1200/400',
    isSetupComplete: true,
    joinDate: new Date('2023-10-26T10:00:00Z').toISOString(),
    isSuspended: false,
    announcements: [],
    subscription: {
        planName: 'Growth Plan',
        monthlyCost: 999,
        nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString(),
    },
    coupons: [],
    galleryImages: [
      'https://picsum.photos/seed/gallery1/500/500',
      'https://picsum.photos/seed/gallery2/500/500',
      'https://picsum.photos/seed/gallery3/500/500',
    ],
    promoVideoUrl: 'https://www.youtube.com/shorts/ar_nS94a2o4',
    isAcceptingOrders: true,
    weeklySchedule: {
        monday: [{ mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '14:00', orderCutoffTime: '10:30' }, { mealType: 'Dinner', servingStartTime: '19:00', servingEndTime: '21:00', orderCutoffTime: '17:30' }],
        tuesday: [{ mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '14:00', orderCutoffTime: '10:30' }, { mealType: 'Dinner', servingStartTime: '19:00', servingEndTime: '21:00', orderCutoffTime: '17:30' }],
        wednesday: [{ mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '14:00', orderCutoffTime: '10:30' }, { mealType: 'Dinner', servingStartTime: '19:00', servingEndTime: '21:00', orderCutoffTime: '17:30' }],
        thursday: [{ mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '14:00', orderCutoffTime: '10:30' }, { mealType: 'Dinner', servingStartTime: '19:00', servingEndTime: '21:00', orderCutoffTime: '17:30' }],
        friday: [{ mealType: 'Lunch', servingStartTime: '12:00', servingEndTime: '14:00', orderCutoffTime: '10:30' }, { mealType: 'Dinner', servingStartTime: '19:00', servingEndTime: '21:00', orderCutoffTime: '17:30' }],
        saturday: [],
        sunday: [],
    },
    orderThresholdDiscount: {
      threshold: 500,
      percentage: 10,
    },
    deliveryIntegrationEnabled: true, // Enable for first provider
    deliveryFee: 50, // Add delivery fee
    cateringEnabled: true,
    cateringEventTypes: ['birthday', 'corporate'],
    cateringGuestCapacity: { min: 10, max: 100 },
    cateringMode: 'simple',
    cateringMaxEventsPerWindow: 1,
    cateringBookings: [],
    earnedBadgeIds: [],
    avgCostForTwo: 450,
    deliveryTime: "25-35 min",
    hasMaxSafety: true,
    menu: [
      { id: 'm1-1', name: 'Shahi Paneer Thali', description: 'Creamy paneer curry, dal makhani, 2 rotis, rice, and salad.', price: 250, type: MealType.VEG, imageUrl: 'https://picsum.photos/seed/meal1/400/300', discountPercentage: 10, category: 'Main Course', isVisible: true, isAvailable: true, stockQuantity: 20, isFeatured: true, featuredAt: new Date('2024-01-01T10:00:00Z').toISOString(), allergenInfo: ['dairy', 'nuts'], isBulkOrderEligible: true, bulkOrderConfig: { minQuantity: 10, leadTimeHours: 24 } },
      { id: 'm1-2', name: 'Butter Chicken Meal', description: 'Classic butter chicken, jeera rice, and a butter naan.', price: 320, type: MealType.NON_VEG, imageUrl: 'https://picsum.photos/seed/meal2/400/300', category: 'Main Course', isVisible: true, isAvailable: true, stockQuantity: 3, allergenInfo: ['dairy'], isBulkOrderEligible: true, bulkOrderConfig: { minQuantity: 10, leadTimeHours: 48 } },
      { id: 'm1-3', name: 'Rajma Chawal Bowl', description: 'A comforting bowl of homestyle rajma with steamed basmati rice.', price: 180, type: MealType.VEG, imageUrl: 'https://picsum.photos/seed/meal3/400/300', category: 'Quick Bites', isVisible: true, isAvailable: true, stockQuantity: -1, dietaryTags: ['gluten-free'] },
    ],
    reviews: [
      { id: 'r1-1', author: 'Ankit G.', rating: 5, comment: 'The best homemade food I have had in a long time!', isVerifiedPurchase: true },
      { id: 'r1-2', author: 'Priya S.', rating: 4, comment: 'Thali was delicious and filling.', providerReply: { text: 'Thank you so much, Priya! We are delighted you enjoyed it.', timestamp: new Date('2024-05-20T14:00:00Z').toISOString() } },
      { id: 'r1-3', userId: 'usr_123', author: 'Ankit Gupta', rating: 3, comment: 'The delivery was a bit late, but the food was good. The paneer could have been softer.', isVerifiedPurchase: true },
      { id: 'r1-4', userId: 'usr_456', author: 'Ravi B.', rating: 5, comment: 'Absolutely amazing! The butter chicken is to die for. Will definitely order again.', isVerifiedPurchase: true },
    ],
  },
  {
    id: 'p2',
    name: "David's Continental Meals",
    chefName: 'David Chen',
    cuisine: 'Continental',
    rating: 4.6,
    shortDescription: 'Healthy salads, pastas, and grilled delights.',
    longDescription: 'Passionate about healthy eating, I create delicious and balanced continental meals using fresh, locally sourced produce. My menu is perfect for those looking for a light yet satisfying meal.',
    address: 'Koramangala, Bengaluru',
    coordinates: { lat: 60, lng: 70 },
    profileImageUrl: 'https://picsum.photos/seed/chef2/100/100',
    bannerImageUrl: 'https://picsum.photos/seed/banner2/1200/400',
    isSetupComplete: true,
    joinDate: new Date('2023-11-15T14:30:00Z').toISOString(),
    isSuspended: false,
    announcements: [],
    subscription: {
        planName: 'Starter Plan',
        monthlyCost: 499,
        nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 12).toISOString(),
    },
    coupons: [],
    galleryImages: [],
    isAcceptingOrders: true,
    weeklySchedule: {},
    deliveryIntegrationEnabled: false,
    cateringEnabled: true,
    cateringEventTypes: ['corporate', 'private'],
    cateringGuestCapacity: { min: 20, max: 200 },
    cateringMode: 'professional',
    cateringProfessionalCapacity: 500,
    cateringBookings: [],
    earnedBadgeIds: [],
    avgCostForTwo: 600,
    deliveryTime: "30-40 min",
    hasMaxSafety: false,
    menu: [
      { id: 'm2-1', name: 'Grilled Chicken Salad', description: 'Juicy grilled chicken breast with exotic veggies and a light vinaigrette.', price: 350, type: MealType.NON_VEG, imageUrl: 'https://picsum.photos/seed/meal4/400/300', category: 'Salads', isVisible: true, isAvailable: true, stockQuantity: 15, dietaryTags: ['gluten-free', 'low-fat'] },
      { id: 'm2-2', name: 'Pesto Pasta (Vegan)', description: 'Whole wheat pasta in a homemade vegan pesto sauce with sun-dried tomatoes.', price: 300, type: MealType.VEGAN, imageUrl: 'https://picsum.photos/seed/meal5/400/300', discountPercentage: 20, category: 'Pastas', isVisible: true, isAvailable: true, stockQuantity: 0, dietaryTags: ['vegan'], allergenInfo: ['nuts'] },
      { id: 'm2-3', name: 'Mushroom Risotto', description: 'Creamy arborio rice cooked with wild mushrooms and parmesan cheese.', price: 380, type: MealType.VEG, imageUrl: 'https://picsum.photos/seed/meal6/400/300', category: 'Pastas', isVisible: true, isAvailable: false, stockQuantity: 10, allergenInfo: ['dairy'] },
    ],
    reviews: [
      { id: 'r2-1', author: 'Rohan M.', rating: 5, comment: 'The salad was so fresh and tasty!', isVerifiedPurchase: true },
      { id: 'r2-2', author: 'Sneha K.', rating: 4.5, comment: 'Great portion size and amazing flavor.' },
    ],
  },
   {
    id: 'p3',
    name: "Amma's South Indian Tiffins",
    chefName: 'Lakshmi Rao',
    cuisine: 'South Indian',
    rating: 4.9,
    shortDescription: 'Traditional South Indian breakfast and meals.',
    longDescription: 'Experience the authentic taste of South India with my home-cooked tiffins. From fluffy idlis to crispy dosas, every dish is prepared with care and traditional recipes passed down through generations.',
    address: 'T. Nagar, Chennai',
    coordinates: { lat: 80, lng: 50 },
    profileImageUrl: 'https://picsum.photos/seed/chef3/100/100',
    bannerImageUrl: 'https://picsum.photos/seed/banner3/1200/400',
    isSetupComplete: true,
    joinDate: new Date('2024-01-10T09:00:00Z').toISOString(),
    isSuspended: false,
    announcements: [],
    subscription: {
        planName: 'Growth Plan',
        monthlyCost: 999,
        nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20).toISOString(),
    },
    coupons: [],
    galleryImages: [],
    isAcceptingOrders: false, // Example of a closed kitchen
    weeklySchedule: {},
    deliveryIntegrationEnabled: false,
    earnedBadgeIds: [],
    menu: [
      { id: 'm3-1', name: 'Idli Sambar (4 pcs)', description: 'Soft, steamed rice cakes served with flavorful lentil sambar and chutney.', price: 120, type: MealType.VEG, imageUrl: 'https://picsum.photos/seed/meal7/400/300', category: 'Tiffins & Breakfast', isVisible: true, isAvailable: true, stockQuantity: -1, dietaryTags: ['gluten-free', 'vegan'] },
      { id: 'm3-2', name: 'Masala Dosa', description: 'Crispy rice crepe filled with a spiced potato filling, served with sambar and chutney.', price: 150, type: MealType.VEG, imageUrl: 'https://picsum.photos/seed/meal8/400/300', category: 'Tiffins & Breakfast', isVisible: true, isAvailable: true, stockQuantity: -1, dietaryTags: ['vegan'], isBulkOrderEligible: false },
    ],
    reviews: [
      { id: 'r3-1', author: 'Vignesh A.', rating: 5, comment: 'Authentic taste, just like my mom makes!', isVerifiedPurchase: true },
    ]
  },
  {
    id: 'p4',
    name: "Maria's Bakery",
    chefName: 'Maria Garcia',
    cuisine: 'Bakery',
    rating: 4.7,
    shortDescription: 'Freshly baked goods and custom cakes.',
    longDescription: 'From sourdough bread to decadent pastries, everything is baked fresh daily with high-quality ingredients. We also take custom orders for cakes and special events.',
    address: 'Bandra, Mumbai',
    coordinates: { lat: 45, lng: 55 },
    profileImageUrl: 'https://picsum.photos/seed/chef4/100/100',
    bannerImageUrl: 'https://picsum.photos/seed/banner4/1200/400',
    isSetupComplete: true,
    joinDate: new Date('2024-02-01T11:00:00Z').toISOString(),
    isSuspended: false,
    announcements: [],
    subscription: { planName: 'Starter Plan', monthlyCost: 499, nextBillingDate: new Date().toISOString() },
    coupons: [],
    galleryImages: [],
    isAcceptingOrders: true,
    weeklySchedule: {},
    orderThresholdDiscount: undefined,
    deliveryIntegrationEnabled: false,
    deliveryFee: undefined,
    cateringEnabled: false,
    cateringEventTypes: [],
    cateringGuestCapacity: { min: 10, max: 50 },
    cateringMode: 'simple',
    cateringMaxEventsPerWindow: 1,
    cateringBookings: [],
    earnedBadgeIds: [],
    menu: [],
    reviews: [],
  },
  {
    id: 'p5',
    name: 'Thai Express Corner',
    chefName: 'Anong Saelim',
    cuisine: 'Thai',
    rating: 4.5,
    shortDescription: 'Authentic Thai street food flavors.',
    longDescription: 'Bringing the vibrant flavors of Bangkok to your home. Our recipes are authentic and use traditional Thai herbs and spices for a truly genuine taste experience.',
    address: 'Hauz Khas, Delhi',
    coordinates: { lat: 75, lng: 25 },
    profileImageUrl: 'https://picsum.photos/seed/chef5/100/100',
    bannerImageUrl: 'https://picsum.photos/seed/banner5/1200/400',
    isSetupComplete: false, // One incomplete provider for testing
    joinDate: new Date('2024-03-10T18:00:00Z').toISOString(),
    isSuspended: false,
    announcements: [],
    subscription: { planName: 'Starter Plan', monthlyCost: 499, nextBillingDate: new Date().toISOString() },
    coupons: [],
    galleryImages: [],
    isAcceptingOrders: true,
    weeklySchedule: {},
    orderThresholdDiscount: undefined,
    deliveryIntegrationEnabled: false,
    deliveryFee: undefined,
    cateringEnabled: false,
    cateringEventTypes: [],
    cateringGuestCapacity: { min: 10, max: 50 },
    cateringMode: 'simple',
    cateringMaxEventsPerWindow: 1,
    cateringBookings: [],
    earnedBadgeIds: [],
    menu: [],
    reviews: [],
  }
];

const USERS_DEFAULT: User[] = [
    { id: 'usr_123', email: 'customer@example.com', name: 'Ankit Gupta', role: 'CUSTOMER', joinDate: new Date('2023-11-01T10:00:00Z').toISOString(), addresses: [], followedProviderIds: [], wishlistMealIds: [], loyaltyPoints: 150, mfaEnabled: false, earnedBadgeIds: [] },
    { id: 'usr_456', email: 'ravi@example.com', name: 'Ravi Kumar', role: 'CUSTOMER', joinDate: new Date('2023-12-05T10:00:00Z').toISOString(), addresses: [], followedProviderIds: [], wishlistMealIds: [], loyaltyPoints: 50, earnedBadgeIds: [] },
    { id: 'prov_p1', email: 'provider@example.com', name: 'Sarita Sharma', role: 'PROVIDER', joinDate: new Date('2023-10-26T10:00:00Z').toISOString(), mfaEnabled: true },
    { id: 'prov_p2', email: 'david@example.com', name: 'David Chen', role: 'PROVIDER', joinDate: new Date('2023-11-15T14:30:00Z').toISOString() },
    { id: 'prov_p3', email: 'lakshmi@example.com', name: 'Lakshmi Rao', role: 'PROVIDER', joinDate: new Date('2024-01-10T09:00:00Z').toISOString() },
    { id: 'prov_p4', email: 'maria@example.com', name: 'Maria Garcia', role: 'PROVIDER', joinDate: new Date('2024-02-01T11:00:00Z').toISOString() },
    { id: 'prov_p5', email: 'anong@example.com', name: 'Anong Saelim', role: 'PROVIDER', joinDate: new Date('2024-03-10T18:00:00Z').toISOString() },
    { id: 'sadmin_001', email: 'admin@homeplatter.com', name: 'Super Admin', role: 'SUPER_ADMIN', joinDate: new Date('2023-01-01T10:00:00Z').toISOString(), mfaEnabled: true },
];

const ORDERS_DEFAULT: Order[] = [];
const NOTIFICATIONS_DEFAULT: Notification[] = [];
const INVOICES_DEFAULT: Invoice[] = [];
const ADDONS_DEFAULT: OrderAddOn[] = [
    { id: 'addon_1', name: 'Extra Roti', price: 20, imageUrl: '' },
    { id: 'addon_2', name: 'Dessert of the Day', price: 80, imageUrl: '' },
    { id: 'addon_3', name: 'Eco-friendly Packaging', price: 15, imageUrl: '' },
];
const INQUIRIES_DEFAULT: Inquiry[] = [];
const SUPPORT_TICKETS_DEFAULT: SupportTicket[] = [];
const COLLECTIONS_DEFAULT: Collection[] = [
    {
        id: 'coll_1',
        userId: 'usr_123', // Ankit Gupta
        name: 'My Weekend Cravings',
        description: 'A list of delicious meals I want to try on the weekend.',
        isPublic: true,
        creatorName: 'Ankit G.',
        mealIds: ['m1-1', 'm2-1', 'm1-2'],
    },
    {
        id: 'coll_2',
        userId: 'usr_456', // Ravi Kumar
        name: 'Healthy & Light',
        description: 'Collection of healthy salads and light meals.',
        isPublic: true,
        creatorName: 'Ravi K.',
        mealIds: ['m2-1', 'm2-3', 'm1-3'],
    },
    {
        id: 'coll_3',
        providerId: 'p1', // Sarita's Kitchen
        name: 'Chef\'s Thali Specials',
        isPublic: true,
        creatorName: 'Sarita Sharma',
        mealIds: ['m1-1'],
    }
];
const SUBSCRIPTION_ORDERS_DEFAULT: SubscriptionOrder[] = [];

// --- DB Initialization ---
const getDb = () => {
  let db: any;
  try {
    const dbString = localStorage.getItem(DB_KEY);
    const parsed = dbString ? JSON.parse(dbString) : null;
    db = (typeof parsed === 'object' && parsed !== null) ? parsed : {};
  } catch (e) {
    console.error('Failed to parse DB from localStorage', e);
    db = {};
  }
  
  // A robust merge strategy that ensures default data is always fresh
  // and overwrites any stale default data in localStorage, while preserving
  // custom/user-generated data.
  const mergeById = (existingData: any[], defaultData: any[]) => {
      const dataMap = new Map((existingData || []).map(item => [item.id, item]));
      defaultData.forEach(item => dataMap.set(item.id, item));
      return Array.from(dataMap.values());
  };

  const finalDb = {
    ...db,
    providers: mergeById(db.providers, MEAL_PROVIDERS_DEFAULT),
    users: mergeById(db.users, USERS_DEFAULT),
    orders: db.orders || ORDERS_DEFAULT,
    notifications: db.notifications || NOTIFICATIONS_DEFAULT,
    invoices: db.invoices || INVOICES_DEFAULT,
    inquiries: db.inquiries || INQUIRIES_DEFAULT,
    supportTickets: db.supportTickets || SUPPORT_TICKETS_DEFAULT,
    collections: db.collections || COLLECTIONS_DEFAULT,
    subscriptionOrders: db.subscriptionOrders || SUBSCRIPTION_ORDERS_DEFAULT,
  };

  saveDb(finalDb);
  return finalDb;
};


const saveDb = (db: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const createSuccessResponse = (body: any, status = 200) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

const createErrorResponse = (status: number, message: string) => {
    return new Response(JSON.stringify({ message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

const createNoContentResponse = () => {
    return new Response(null, { status: 204 });
};

// This is the core of the mock backend. It routes requests to the correct logic.
export const mockApiRouter = async (path: string, options?: RequestInit): Promise<Response> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, Math.random() * 200 + 50));

    const db = getDb();
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.parse(options.body as string) : {};

    // --- PUBLIC ROUTES (NO TOKEN NEEDED) ---

    if (path === '/api/v1/auth/login' && method === 'POST') {
        const { email, password } = body;
        const user = db.users.find((u: User) => u.email === email);
        if (!user) return createErrorResponse(404, 'User not found.');
        
        const providerProfile = user.role === 'PROVIDER' ? db.providers.find((p: MealProvider) => p.id === user.id.replace('prov_','')) : null;
        if (providerProfile?.isSuspended) {
            return createErrorResponse(403, "Your account has been suspended.");
        }

        // In mock, we can use a simple password check.
        if (password !== 'password') return createErrorResponse(401, 'Invalid credentials.');
        
        if (user.mfaEnabled) {
            const mfaToken = `mfa-token-for-${user.id}-${Date.now()}`;
            // Correct Implementation: Return a success response indicating the next step.
            // The authApi handler will see this and throw the specific error the UI needs.
            return createSuccessResponse({ mfaRequired: true, mfaToken });
        }

        const token = `mock-token-for-${user.id}`;
        return createSuccessResponse({ user, token });
    }

    if (path === '/api/v1/auth/signup' && method === 'POST') {
        const { name, email, password, role } = body;
        if (db.users.some((u: User) => u.email === email)) {
            return createErrorResponse(409, 'User with this email already exists.');
        }
        const newUserId = role === 'PROVIDER' ? `prov_p${db.providers.length + 1}` : `usr_${Date.now()}`;
        const newUser: User = { id: newUserId, name, email, role, joinDate: new Date().toISOString() };
        db.users.push(newUser);
        
        if (role === 'PROVIDER') {
            const newProvider: Partial<MealProvider> = {
                id: newUserId.replace('prov_', ''),
                name: `${name}'s Kitchen`,
                chefName: name,
                isSetupComplete: false,
                joinDate: new Date().toISOString(),
                isSuspended: false,
                menu: [],
                reviews: [],
                announcements: [],
                coupons: [],
                galleryImages: [],
                weeklySchedule: {},
                isAcceptingOrders: false,
            };
            db.providers.push(newProvider);
        }

        saveDb(db);
        const token = `mock-token-for-${newUser.id}`;
        return createSuccessResponse({ user: newUser, token });
    }
    
    if (path === '/api/v1/auth/mfa/login-verify' && method === 'POST') {
        const { mfaToken, otp } = body;
        if (otp !== '123456') { // Mock OTP
            return createErrorResponse(400, "Invalid OTP code.");
        }
        const userId = mfaToken.split('-')[3];
        const user = db.users.find((u: User) => u.id === userId);
        if (!user) return createErrorResponse(404, 'User not found for MFA token.');
        
        const token = `mock-token-for-${user.id}`;
        return createSuccessResponse({ user, token });
    }

    if (path === '/api/providers' && method === 'GET') {
        const activeProviders = db.providers.filter((p: MealProvider) => p.isSetupComplete && !p.isSuspended);
        return createSuccessResponse(activeProviders);
    }
    if (path.match(/^\/api\/providers\/([a-zA-Z0-9_]+)$/) && method === 'GET') {
        const providerId = path.split('/').pop()!;
        const provider = db.providers.find((p: MealProvider) => p.id === providerId);
        return provider ? createSuccessResponse(provider) : createErrorResponse(404, 'Provider not found');
    }
     if (path === '/api/collections/public' && method === 'GET') {
        const publicCollections = db.collections.filter((c: Collection) => c.isPublic);
        // Add meal previews for rich display
        publicCollections.forEach((c: Collection) => {
            c.mealPreviews = c.mealIds.map(mealId => {
                for (const p of db.providers) {
                    const meal = p.menu.find((m: Meal) => m.id === mealId);
                    if (meal) return meal;
                }
                return null;
            }).filter((m): m is Meal => m !== null).slice(0, 4);
        });
        return createSuccessResponse(publicCollections);
    }
    if (path.match(/^\/api\/collections\/([a-zA-Z0-9_]+)$/) && method === 'GET') {
        const collectionId = path.split('/').pop()!;
        const collection = db.collections.find((c: Collection) => c.id === collectionId);
        return collection ? createSuccessResponse(collection) : createErrorResponse(404, 'Collection not found');
    }
    if (path === '/api/addons' && method === 'GET') {
        return createSuccessResponse(ADDONS_DEFAULT);
    }

    // --- AUTHENTICATION WALL ---
    // All routes below this point require a valid token.
    const token = options?.headers ? (options.headers as any)['Authorization']?.split(' ')[1] : null;
    const findUserByToken = (t: string | null): User | undefined => {
        if (!t) return undefined;
        const userId = t.replace('mock-token-for-', '');
        return db.users.find((u: User) => u.id === userId);
    };
    const user = findUserByToken(token);

    if (!user) {
         return createErrorResponse(401, "Unauthorized: No or invalid token provided.");
    }
    
    // --- PROTECTED ROUTES ---

    // FIX: Handle Provider Menu Management (CRUD)
    if (path.match(/^\/api\/providers\/([a-zA-Z0-9_]+)\/menu$/) && method === 'POST') {
        const providerId = path.split('/')[3];
        const provider = db.providers.find((p: MealProvider) => p.id === providerId);
        if (!provider) return createErrorResponse(404, 'Provider not found');
        
        const newMeal: Meal = { ...body, id: `m${providerId}_${Date.now()}` };
        provider.menu.push(newMeal);
        saveDb(db);
        return createSuccessResponse(newMeal, 201);
    }
    
    if (path.match(/^\/api\/providers\/([a-zA-Z0-9_]+)\/menu\/([a-zA-Z0-9_-]+)$/) && method === 'PUT') {
        const [,,, providerId,, mealId] = path.split('/');
        const provider = db.providers.find((p: MealProvider) => p.id === providerId);
        if (!provider) return createErrorResponse(404, 'Provider not found');
        
        const mealIndex = provider.menu.findIndex((m: Meal) => m.id === mealId);
        if (mealIndex === -1) return createErrorResponse(404, 'Meal not found');

        provider.menu[mealIndex] = { ...provider.menu[mealIndex], ...body };
        saveDb(db);
        return createSuccessResponse(provider.menu[mealIndex]);
    }

    if (path.match(/^\/api\/providers\/([a-zA-Z0-9_]+)\/menu\/([a-zA-Z0-9_-]+)$/) && method === 'DELETE') {
        const [,,, providerId,, mealId] = path.split('/');
        const provider = db.providers.find((p: MealProvider) => p.id === providerId);
        if (!provider) return createErrorResponse(404, 'Provider not found');
        
        provider.menu = provider.menu.filter((m: Meal) => m.id !== mealId);
        saveDb(db);
        return createNoContentResponse();
    }
    
    // FIX: Handle Admin Dispute Fetching
    if (path === '/api/admin/disputes/open' && method === 'GET') {
        if (user.role !== 'SUPER_ADMIN') return createErrorResponse(403, 'Forbidden');
        const openDisputes: { order: Order; providerName: string }[] = [];
        db.orders.forEach((order: Order) => {
            if (order.dispute?.status === 'OPEN') {
                const provider = db.providers.find((p: MealProvider) => p.id === order.providerId);
                openDisputes.push({
                    order,
                    providerName: provider?.name || 'Unknown Provider',
                });
            }
        });
        return createSuccessResponse(openDisputes);
    }

    if (path.match(/^\/api\/orders\/provider\/([a-zA-Z0-9_]+)$/) && method === 'GET') {
        const providerId = path.split('/').pop()!;
        const providerOrders = db.orders.filter((o: Order) => o.providerId === providerId);
        return createSuccessResponse(providerOrders.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    }
    
    if (path.match(/^\/api\/providers\/([a-zA-Z0-9_]+)\/coupons$/) && method === 'GET') {
        const providerId = path.split('/')[3];
        const provider = db.providers.find((p: MealProvider) => p.id === providerId);
        return createSuccessResponse(provider?.coupons || []);
    }

    if (path.match(/^\/api\/inquiries\/provider\/([a-zA-Z0-9_]+)$/) && method === 'GET') {
        const providerId = path.split('/').pop()!;
        const providerInquiries = db.inquiries.filter((i: Inquiry) => i.providerId === providerId);
        return createSuccessResponse(providerInquiries);
    }
    
    if (path.match(/^\/api\/subscriptions\/provider\/([a-zA-Z0-9_]+)$/) && method === 'GET') {
        const providerId = path.split('/').pop()!;
        const providerSubscriptions = db.subscriptionOrders.filter((s: SubscriptionOrder) => s.providerId === providerId);
        return createSuccessResponse(providerSubscriptions);
    }
    
    if (path.match(/^\/api\/providers\/([a-zA-Z0-9_]+)\/collections$/) && method === 'GET') {
        const providerId = path.split('/')[3];
        const providerCollections = db.collections.filter((c: Collection) => c.providerId === providerId);
        return createSuccessResponse(providerCollections);
    }

    // --- AI Routes ---
    if (path === '/api/ai/chat-stream' && method === 'POST') {
        const responseChunks = [
            `{"text":"Of "}`, `{"text":"course, "}`, `{"text":"I can "}`, `{"text":"help "}`,
            `{"text":"with "}`, `{"text":"that. "}`, `{"text":"This "}`, `{"text":"is a "}`,
            `{"text":"mocked "}`, `{"text":"streaming "}`, `{"text":"response."}`,
        ];

        const stream = new ReadableStream({
            start(controller) {
                let i = 0;
                const push = () => {
                    if (i >= responseChunks.length) {
                        controller.close();
                        return;
                    }
                    const chunk = responseChunks[i] + '\n';
                    controller.enqueue(new TextEncoder().encode(chunk));
                    i++;
                    setTimeout(push, 50); // Simulate network latency between chunks
                };
                push();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'application/x-ndjson' },
        });
    }

    if (path === '/api/ai/analyze-reviews' && method === 'POST') {
        const { reviews } = body;
        if (!reviews || reviews.length < 2) {
            return createErrorResponse(400, "Not enough reviews for analysis.");
        }
        // Simulate AI analysis
        const mockAnalysis: AnalysisResult = {
            strengths: ["Food quality is consistently praised.", "Customers appreciate the authentic taste.", "Portion sizes are generous."],
            areasForImprovement: ["Delivery times can be inconsistent during peak hours.", "Some customers find certain dishes slightly overpriced."],
            overallSentiment: "Overwhelmingly positive feedback on food quality and authenticity, with some concerns about delivery speed and pricing for specific items."
        };
        return createSuccessResponse(mockAnalysis);
    }
    
    if (path === '/api/ai/recommendations' && method === 'POST') {
        const { user: userInfo, allProviders } = body;
        const orderedFromIds = new Set(db.orders.filter((o: Order) => o.userId === userInfo.id).map((o: Order) => o.providerId));
        const followedIds = new Set(userInfo.followedProviderIds || []);

        const recommendedProviders = allProviders.filter((p: MealProvider) => {
            return p.isSetupComplete && !p.isSuspended && !orderedFromIds.has(p.id) && !followedIds.has(p.id);
        }).sort((a: MealProvider, b: MealProvider) => b.rating - a.rating)
        .slice(0, 3);

        return createSuccessResponse(recommendedProviders);
    }
    
    // --- User-Specific Routes ---
    if (path === '/api/users/me/notifications' && method === 'GET') {
        const userNotifications = db.notifications.filter((n: Notification) => n.userId === user.id)
            .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return createSuccessResponse(userNotifications);
    }

    if (path === '/api/users/me/collections' && method === 'GET') {
        const userCollections = db.collections.filter((c: Collection) => c.userId === user.id);
        return createSuccessResponse(userCollections);
    }
    
    if (path.match(/^\/api\/providers\/user\/([a-zA-Z0-9_]+)$/)) {
        const userId = path.split('/').pop()!;
        if (user.id !== userId && user.role !== 'SUPER_ADMIN') return createErrorResponse(403, "Forbidden");
        const provider = db.providers.find((p: MealProvider) => p.id === userId.replace('prov_', ''));
        return provider ? createSuccessResponse(provider) : createErrorResponse(404, 'Provider not found');
    }

    if (path.match(/^\/api\/users\/([a-zA-Z0-9_]+)\/profile$/)) {
        const userId = path.split('/')[3];
        if (user.id !== userId && user.role !== 'SUPER_ADMIN') return createErrorResponse(403, "Forbidden");
        const profile = db.users.find((u: User) => u.id === userId);
        return profile ? createSuccessResponse(profile) : createErrorResponse(404, 'User not found');
    }
    
    if (path === '/api/users/me/feed' && method === 'GET') {
        const feedItems: FeedItem[] = [];
        db.providers.forEach((p: MealProvider) => {
            if (user.followedProviderIds?.includes(p.id)) {
                if(user.notificationPreferences?.promotions ?? true) {
                    p.announcements.forEach((a: Announcement) => feedItems.push({ id: a.id, type: 'ANNOUNCEMENT', timestamp: a.timestamp, providerId: p.id, providerName: p.name, providerProfileImageUrl: p.profileImageUrl, content: { message: a.message } }));
                }
                p.menu.forEach((m: Meal) => {
                    if (m.isFeatured) feedItems.push({ id: `feed_${m.id}`, type: 'FEATURED_MEAL', timestamp: m.featuredAt!, providerId: p.id, providerName: p.name, providerProfileImageUrl: p.profileImageUrl, content: { meal: m } });
                });
            }
        });
        feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return createSuccessResponse(feedItems);
    }
    
    if (path.match(/^\/api\/orders\/user\/([a-zA-Z0-9_]+)$/)) {
        const userId = path.split('/').pop();
        if (!userId) return createErrorResponse(400, 'User ID is missing');
        const userOrders = db.orders.filter((o: Order) => o.userId === userId);
        return createSuccessResponse(userOrders.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    }

    // Fallback for any unhandled routes
    console.error(`Mock API endpoint not found: ${method} ${path}`);
    return createErrorResponse(404, `Mock API endpoint not found: ${method} ${path}`);
};
