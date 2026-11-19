import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

let poolInstance: Pool | null = null;

export function getPool(): Pool {
  if (poolInstance) return poolInstance;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  poolInstance = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

  return poolInstance;
}

export async function initDatabase(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'PROVIDER', 'SUPER_ADMIN')),
      join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
      followed_provider_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      wishlist_meal_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      re_engagement_status JSONB NOT NULL DEFAULT '{}'::jsonb,
      notification_preferences JSONB NOT NULL DEFAULT '{"orderUpdates":true,"newMessages":true,"promotions":true}'::jsonb,
      mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      mfa_secret TEXT,
      earned_badge_ids JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      chef_name TEXT NOT NULL,
      cuisine TEXT NOT NULL DEFAULT 'Home Cooked',
      rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
      short_description TEXT NOT NULL DEFAULT '',
      long_description TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      profile_image_url TEXT NOT NULL DEFAULT '',
      banner_image_url TEXT NOT NULL DEFAULT '',
      is_setup_complete BOOLEAN NOT NULL DEFAULT FALSE,
      join_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
      subscription JSONB NOT NULL DEFAULT '{"planName":"Starter Plan","monthlyCost":499,"nextBillingDate":""}'::jsonb,
      dashboard_layout JSONB,
      gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
      promo_video_url TEXT,
      is_accepting_orders BOOLEAN NOT NULL DEFAULT TRUE,
      weekly_schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
      order_threshold_discount JSONB,
      coordinates JSONB,
      delivery_integration_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      delivery_fee NUMERIC(10,2),
      catering_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      catering_event_types JSONB NOT NULL DEFAULT '[]'::jsonb,
      catering_guest_capacity JSONB,
      catering_mode TEXT DEFAULT 'simple',
      catering_max_events_per_window INTEGER DEFAULT 1,
      catering_professional_capacity INTEGER,
      catering_bookings JSONB NOT NULL DEFAULT '[]'::jsonb,
      earned_badge_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      avg_cost_for_two NUMERIC(10,2),
      delivery_time TEXT,
      has_max_safety BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(10,2) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('VEG', 'NON_VEG', 'VEGAN')),
      image_url TEXT NOT NULL DEFAULT '',
      discount_percentage NUMERIC(5,2),
      category TEXT,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      stock_quantity INTEGER NOT NULL DEFAULT -1,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      featured_at TIMESTAMPTZ,
      dietary_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      allergen_info JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_bulk_order_eligible BOOLEAN NOT NULL DEFAULT FALSE,
      bulk_order_config JSONB
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      user_id TEXT,
      author TEXT NOT NULL,
      rating NUMERIC(3,2) NOT NULL,
      comment TEXT NOT NULL,
      is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
      provider_reply JSONB,
      is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
      flagged_by_user_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      discount_percentage NUMERIC(5,2) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_single_use BOOLEAN NOT NULL DEFAULT FALSE,
      claimed_by_user_id TEXT,
      funded_by TEXT,
      linked_dispute_id TEXT
    );

    CREATE TABLE IF NOT EXISTS tiffin_plans (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      duration TEXT NOT NULL CHECK (duration IN ('WEEKLY', 'MONTHLY')),
      price NUMERIC(10,2) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sample_menu JSONB
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_amount NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      delivery_window TEXT,
      review_submitted BOOLEAN NOT NULL DEFAULT FALSE,
      review_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      messages JSONB NOT NULL DEFAULT '[]'::jsonb,
      last_message_at TIMESTAMPTZ,
      add_ons JSONB NOT NULL DEFAULT '[]'::jsonb,
      tracking JSONB,
      points_earned INTEGER NOT NULL DEFAULT 0,
      points_redeemed INTEGER NOT NULL DEFAULT 0,
      delivery_partner JSONB,
      delivery_method TEXT,
      delivery_fee_applied NUMERIC(10,2),
      delivery_cost NUMERIC(10,2),
      catering_inquiry_id TEXT,
      dispute JSONB
    );

    CREATE TABLE IF NOT EXISTS subscription_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      duration TEXT NOT NULL CHECK (duration IN ('WEEKLY', 'MONTHLY')),
      total_amount NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      end_date TIMESTAMPTZ NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      pause_periods JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      provider_id TEXT REFERENCES providers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      meal_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      creator_name TEXT
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      messages JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_archived BOOLEAN NOT NULL DEFAULT FALSE,
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      messages JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      link_to JSONB
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      provider_name TEXT NOT NULL,
      period TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      ai_summary_notes TEXT NOT NULL DEFAULT '',
      generated_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_addons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      image_url TEXT NOT NULL DEFAULT ''
    );
  `);

  await seedDatabaseIfEmpty();
}

async function seedDatabaseIfEmpty(): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM users');
  if (rows[0].cnt > 0) {
    return;
  }

  const defaultPasswordHash = await bcrypt.hash('password', 10);

  const defaultUsers = [
    { id: 'usr_123', email: 'customer@example.com', name: 'Ankit Gupta', role: 'CUSTOMER', joinDate: '2023-11-01T10:00:00Z', loyaltyPoints: 150, mfaEnabled: false },
    { id: 'usr_456', email: 'ravi@example.com', name: 'Ravi Kumar', role: 'CUSTOMER', joinDate: '2023-12-05T10:00:00Z', loyaltyPoints: 50, mfaEnabled: false },
    { id: 'prov_p1', email: 'provider@example.com', name: 'Sarita Sharma', role: 'PROVIDER', joinDate: '2023-10-26T10:00:00Z', loyaltyPoints: 0, mfaEnabled: true },
    { id: 'prov_p2', email: 'david@example.com', name: 'David Chen', role: 'PROVIDER', joinDate: '2023-11-15T14:30:00Z', loyaltyPoints: 0, mfaEnabled: false },
    { id: 'prov_p3', email: 'lakshmi@example.com', name: 'Lakshmi Rao', role: 'PROVIDER', joinDate: '2024-01-10T09:00:00Z', loyaltyPoints: 0, mfaEnabled: false },
    { id: 'prov_p4', email: 'maria@example.com', name: 'Maria Garcia', role: 'PROVIDER', joinDate: '2024-02-01T11:00:00Z', loyaltyPoints: 0, mfaEnabled: false },
    { id: 'prov_p5', email: 'anong@example.com', name: 'Anong Saelim', role: 'PROVIDER', joinDate: '2024-03-10T18:00:00Z', loyaltyPoints: 0, mfaEnabled: false },
    { id: 'sadmin_001', email: 'admin@homeplatter.com', name: 'Super Admin', role: 'SUPER_ADMIN', joinDate: '2023-01-01T10:00:00Z', loyaltyPoints: 0, mfaEnabled: true },
  ];

  for (const u of defaultUsers) {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, join_date, loyalty_points, mfa_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.email, defaultPasswordHash, u.name, u.role, u.joinDate, u.loyaltyPoints, u.mfaEnabled]
    );
  }

  const nextBilling = (day: number) =>
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, day).toISOString();

  const defaultProviders = [
    {
      id: 'p1',
      userId: 'prov_p1',
      name: "Sarita's Kitchen",
      chefName: 'Sarita Sharma',
      cuisine: 'North Indian',
      rating: 4.8,
      shortDescription: 'Authentic North Indian thalis and curries.',
      longDescription:
        "Bringing the taste of my grandmother's recipes to your table. Every dish is cooked with love, fresh ingredients, and a blend of traditional spices. Perfect for a hearty and healthy meal.",
      address: 'Sector 22, Gurugram',
      coordinates: { lat: 30, lng: 30 },
      profileImageUrl: 'https://picsum.photos/seed/chef1/100/100',
      bannerImageUrl: 'https://picsum.photos/seed/banner1/1200/400',
      isSetupComplete: true,
      joinDate: '2023-10-26T10:00:00Z',
      subscription: { planName: 'Growth Plan', monthlyCost: 999, nextBillingDate: nextBilling(15) },
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
      orderThresholdDiscount: { threshold: 500, percentage: 10 },
      deliveryIntegrationEnabled: true,
      deliveryFee: 50,
      cateringEnabled: true,
      cateringEventTypes: ['birthday', 'corporate'],
      cateringGuestCapacity: { min: 10, max: 100 },
      cateringMode: 'simple',
      cateringMaxEventsPerWindow: 1,
      avgCostForTwo: 450,
      deliveryTime: '25-35 min',
      hasMaxSafety: true,
    },
    {
      id: 'p2',
      userId: 'prov_p2',
      name: "David's Continental Meals",
      chefName: 'David Chen',
      cuisine: 'Continental',
      rating: 4.6,
      shortDescription: 'Healthy salads, pastas, and grilled delights.',
      longDescription:
        'Passionate about healthy eating, I create delicious and balanced continental meals using fresh, locally sourced produce. My menu is perfect for those looking for a light yet satisfying meal.',
      address: 'Koramangala, Bengaluru',
      coordinates: { lat: 60, lng: 70 },
      profileImageUrl: 'https://picsum.photos/seed/chef2/100/100',
      bannerImageUrl: 'https://picsum.photos/seed/banner2/1200/400',
      isSetupComplete: true,
      joinDate: '2023-11-15T14:30:00Z',
      subscription: { planName: 'Starter Plan', monthlyCost: 499, nextBillingDate: nextBilling(12) },
      galleryImages: [],
      isAcceptingOrders: true,
      weeklySchedule: {},
      deliveryIntegrationEnabled: false,
      cateringEnabled: true,
      cateringEventTypes: ['corporate', 'private'],
      cateringGuestCapacity: { min: 20, max: 200 },
      cateringMode: 'professional',
      cateringProfessionalCapacity: 500,
      avgCostForTwo: 600,
      deliveryTime: '30-40 min',
      hasMaxSafety: false,
    },
    {
      id: 'p3',
      userId: 'prov_p3',
      name: "Amma's South Indian Tiffins",
      chefName: 'Lakshmi Rao',
      cuisine: 'South Indian',
      rating: 4.9,
      shortDescription: 'Traditional South Indian breakfast and meals.',
      longDescription:
        'Experience the authentic taste of South India with my home-cooked tiffins. From fluffy idlis to crispy dosas, every dish is prepared with care and traditional recipes passed down through generations.',
      address: 'T. Nagar, Chennai',
      coordinates: { lat: 80, lng: 50 },
      profileImageUrl: 'https://picsum.photos/seed/chef3/100/100',
      bannerImageUrl: 'https://picsum.photos/seed/banner3/1200/400',
      isSetupComplete: true,
      joinDate: '2024-01-10T09:00:00Z',
      subscription: { planName: 'Growth Plan', monthlyCost: 999, nextBillingDate: nextBilling(20) },
      galleryImages: [],
      isAcceptingOrders: false,
      weeklySchedule: {},
      deliveryIntegrationEnabled: false,
      cateringEnabled: false,
      cateringEventTypes: [],
      hasMaxSafety: true,
      avgCostForTwo: 300,
      deliveryTime: '20-30 min',
    },
    {
      id: 'p4',
      userId: 'prov_p4',
      name: "Maria's Bakery",
      chefName: 'Maria Garcia',
      cuisine: 'Bakery',
      rating: 4.7,
      shortDescription: 'Freshly baked goods and custom cakes.',
      longDescription:
        'From sourdough bread to decadent pastries, everything is baked fresh daily with high-quality ingredients. We also take custom orders for cakes and special events.',
      address: 'Bandra, Mumbai',
      coordinates: { lat: 45, lng: 55 },
      profileImageUrl: 'https://picsum.photos/seed/chef4/100/100',
      bannerImageUrl: 'https://picsum.photos/seed/banner4/1200/400',
      isSetupComplete: true,
      joinDate: '2024-02-01T11:00:00Z',
      subscription: { planName: 'Starter Plan', monthlyCost: 499, nextBillingDate: nextBilling(10) },
      galleryImages: [],
      isAcceptingOrders: true,
      weeklySchedule: {},
      deliveryIntegrationEnabled: false,
      cateringEnabled: false,
      cateringEventTypes: [],
      cateringGuestCapacity: { min: 10, max: 50 },
      hasMaxSafety: false,
    },
    {
      id: 'p5',
      userId: 'prov_p5',
      name: 'Thai Express Corner',
      chefName: 'Anong Saelim',
      cuisine: 'Thai',
      rating: 4.5,
      shortDescription: 'Authentic Thai street food flavors.',
      longDescription:
        'Bringing the vibrant flavors of Bangkok to your home. Our recipes are authentic and use traditional Thai herbs and spices for a truly genuine taste experience.',
      address: 'Hauz Khas, Delhi',
      coordinates: { lat: 75, lng: 25 },
      profileImageUrl: 'https://picsum.photos/seed/chef5/100/100',
      bannerImageUrl: 'https://picsum.photos/seed/banner5/1200/400',
      isSetupComplete: false,
      joinDate: '2024-03-10T18:00:00Z',
      subscription: { planName: 'Starter Plan', monthlyCost: 499, nextBillingDate: nextBilling(5) },
      galleryImages: [],
      isAcceptingOrders: true,
      weeklySchedule: {},
      deliveryIntegrationEnabled: false,
      cateringEnabled: false,
      cateringEventTypes: [],
      cateringGuestCapacity: { min: 10, max: 50 },
      hasMaxSafety: false,
    },
  ];

  for (const p of defaultProviders) {
    await pool.query(
      `INSERT INTO providers (
        id, user_id, name, chef_name, cuisine, rating, short_description, long_description,
        address, coordinates, profile_image_url, banner_image_url, is_setup_complete, join_date,
        subscription, gallery_images, promo_video_url, is_accepting_orders, weekly_schedule,
        order_threshold_discount, delivery_integration_enabled, delivery_fee, catering_enabled,
        catering_event_types, catering_guest_capacity, catering_mode, catering_max_events_per_window,
        catering_professional_capacity, avg_cost_for_two, delivery_time, has_max_safety
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31
      ) ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.userId,
        p.name,
        p.chefName,
        p.cuisine,
        p.rating,
        p.shortDescription,
        p.longDescription,
        p.address,
        JSON.stringify(p.coordinates || null),
        p.profileImageUrl,
        p.bannerImageUrl,
        p.isSetupComplete,
        p.joinDate,
        JSON.stringify(p.subscription),
        JSON.stringify(p.galleryImages || []),
        p.promoVideoUrl || null,
        p.isAcceptingOrders,
        JSON.stringify(p.weeklySchedule || {}),
        JSON.stringify(p.orderThresholdDiscount || null),
        p.deliveryIntegrationEnabled || false,
        p.deliveryFee ?? null,
        p.cateringEnabled || false,
        JSON.stringify(p.cateringEventTypes || []),
        JSON.stringify(p.cateringGuestCapacity || null),
        p.cateringMode || 'simple',
        p.cateringMaxEventsPerWindow ?? 1,
        p.cateringProfessionalCapacity ?? null,
        p.avgCostForTwo ?? null,
        p.deliveryTime ?? null,
        p.hasMaxSafety || false,
      ]
    );
  }

  const defaultMeals = [
    { id: 'm1-1', providerId: 'p1', name: 'Shahi Paneer Thali', description: 'Creamy paneer curry, dal makhani, 2 rotis, rice, and salad.', price: 250, type: 'VEG', imageUrl: 'https://picsum.photos/seed/meal1/400/300', discountPercentage: 10, category: 'Main Course', isVisible: true, isAvailable: true, stockQuantity: 20, isFeatured: true, featuredAt: '2024-01-01T10:00:00Z', allergenInfo: ['dairy', 'nuts'], isBulkOrderEligible: true, bulkOrderConfig: { minQuantity: 10, leadTimeHours: 24 } },
    { id: 'm1-2', providerId: 'p1', name: 'Butter Chicken Meal', description: 'Classic butter chicken, jeera rice, and a butter naan.', price: 320, type: 'NON_VEG', imageUrl: 'https://picsum.photos/seed/meal2/400/300', category: 'Main Course', isVisible: true, isAvailable: true, stockQuantity: 3, allergenInfo: ['dairy'], isBulkOrderEligible: true, bulkOrderConfig: { minQuantity: 10, leadTimeHours: 48 } },
    { id: 'm1-3', providerId: 'p1', name: 'Rajma Chawal Bowl', description: 'A comforting bowl of homestyle rajma with steamed basmati rice.', price: 180, type: 'VEG', imageUrl: 'https://picsum.photos/seed/meal3/400/300', category: 'Quick Bites', isVisible: true, isAvailable: true, stockQuantity: -1, dietaryTags: ['gluten-free'] },
    { id: 'm2-1', providerId: 'p2', name: 'Grilled Chicken Salad', description: 'Juicy grilled chicken breast with exotic veggies and a light vinaigrette.', price: 350, type: 'NON_VEG', imageUrl: 'https://picsum.photos/seed/meal4/400/300', category: 'Salads', isVisible: true, isAvailable: true, stockQuantity: 15, dietaryTags: ['gluten-free', 'low-fat'] },
    { id: 'm2-2', providerId: 'p2', name: 'Pesto Pasta (Vegan)', description: 'Whole wheat pasta in a homemade vegan pesto sauce with sun-dried tomatoes.', price: 300, type: 'VEGAN', imageUrl: 'https://picsum.photos/seed/meal5/400/300', discountPercentage: 20, category: 'Pastas', isVisible: true, isAvailable: true, stockQuantity: 0, dietaryTags: ['vegan'], allergenInfo: ['nuts'] },
    { id: 'm2-3', providerId: 'p2', name: 'Mushroom Risotto', description: 'Creamy arborio rice cooked with wild mushrooms and parmesan cheese.', price: 380, type: 'VEG', imageUrl: 'https://picsum.photos/seed/meal6/400/300', category: 'Pastas', isVisible: true, isAvailable: false, stockQuantity: 10, allergenInfo: ['dairy'] },
    { id: 'm3-1', providerId: 'p3', name: 'Idli Sambar (4 pcs)', description: 'Soft, steamed rice cakes served with flavorful lentil sambar and chutney.', price: 120, type: 'VEG', imageUrl: 'https://picsum.photos/seed/meal7/400/300', category: 'Tiffins & Breakfast', isVisible: true, isAvailable: true, stockQuantity: -1, dietaryTags: ['gluten-free', 'vegan'] },
    { id: 'm3-2', providerId: 'p3', name: 'Masala Dosa', description: 'Crispy rice crepe filled with a spiced potato filling, served with sambar and chutney.', price: 150, type: 'VEG', imageUrl: 'https://picsum.photos/seed/meal8/400/300', category: 'Tiffins & Breakfast', isVisible: true, isAvailable: true, stockQuantity: -1, dietaryTags: ['vegan'], isBulkOrderEligible: false },
  ];

  for (const m of defaultMeals) {
    await pool.query(
      `INSERT INTO meals (
        id, provider_id, name, description, price, type, image_url, discount_percentage,
        category, is_visible, is_available, stock_quantity, is_featured, featured_at,
        dietary_tags, allergen_info, is_bulk_order_eligible, bulk_order_config
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      ON CONFLICT (id) DO NOTHING`,
      [
        m.id,
        m.providerId,
        m.name,
        m.description,
        m.price,
        m.type,
        m.imageUrl,
        m.discountPercentage ?? null,
        m.category ?? null,
        m.isVisible ?? true,
        m.isAvailable ?? true,
        m.stockQuantity ?? -1,
        m.isFeatured ?? false,
        m.featuredAt ?? null,
        JSON.stringify(m.dietaryTags || []),
        JSON.stringify(m.allergenInfo || []),
        m.isBulkOrderEligible ?? false,
        JSON.stringify(m.bulkOrderConfig || null),
      ]
    );
  }

  const defaultReviews = [
    { id: 'r1-1', providerId: 'p1', author: 'Ankit G.', rating: 5, comment: 'The best homemade food I have had in a long time!', isVerifiedPurchase: true },
    { id: 'r1-2', providerId: 'p1', author: 'Priya S.', rating: 4, comment: 'Thali was delicious and filling.', providerReply: { text: 'Thank you so much, Priya! We are delighted you enjoyed it.', timestamp: '2024-05-20T14:00:00Z' } },
    { id: 'r1-3', providerId: 'p1', userId: 'usr_123', author: 'Ankit Gupta', rating: 3, comment: 'The delivery was a bit late, but the food was good. The paneer could have been softer.', isVerifiedPurchase: true },
    { id: 'r1-4', providerId: 'p1', userId: 'usr_456', author: 'Ravi B.', rating: 5, comment: 'Absolutely amazing! The butter chicken is to die for. Will definitely order again.', isVerifiedPurchase: true },
    { id: 'r2-1', providerId: 'p2', author: 'Rohan M.', rating: 5, comment: 'The salad was so fresh and tasty!', isVerifiedPurchase: true },
    { id: 'r2-2', providerId: 'p2', author: 'Sneha K.', rating: 4.5, comment: 'Great portion size and amazing flavor.' },
    { id: 'r3-1', providerId: 'p3', author: 'Vignesh A.', rating: 5, comment: 'Authentic taste, just like my mom makes!', isVerifiedPurchase: true },
  ];

  for (const r of defaultReviews) {
    await pool.query(
      `INSERT INTO reviews (id, provider_id, user_id, author, rating, comment, is_verified_purchase, provider_reply)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.providerId, r.userId || null, r.author, r.rating, r.comment, !!r.isVerifiedPurchase, JSON.stringify(r.providerReply || null)]
    );
  }

  const defaultAddons = [
    { id: 'addon_1', name: 'Extra Roti', price: 20, imageUrl: '' },
    { id: 'addon_2', name: 'Dessert of the Day', price: 80, imageUrl: '' },
    { id: 'addon_3', name: 'Eco-friendly Packaging', price: 15, imageUrl: '' },
  ];

  for (const a of defaultAddons) {
    await pool.query(
      `INSERT INTO order_addons (id, name, price, image_url) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [a.id, a.name, a.price, a.imageUrl]
    );
  }

  const defaultCollections = [
    { id: 'coll_1', userId: 'usr_123', providerId: null, name: 'My Weekend Cravings', description: 'A list of delicious meals I want to try on the weekend.', isPublic: true, creatorName: 'Ankit G.', mealIds: ['m1-1', 'm2-1', 'm1-2'] },
    { id: 'coll_2', userId: 'usr_456', providerId: null, name: 'Healthy & Light', description: 'Collection of healthy salads and light meals.', isPublic: true, creatorName: 'Ravi K.', mealIds: ['m2-1', 'm2-3', 'm1-3'] },
    { id: 'coll_3', userId: null, providerId: 'p1', name: "Chef's Thali Specials", description: null, isPublic: true, creatorName: 'Sarita Sharma', mealIds: ['m1-1'] },
  ];

  for (const c of defaultCollections) {
    await pool.query(
      `INSERT INTO collections (id, user_id, provider_id, name, description, is_public, creator_name, meal_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO NOTHING`,
      [c.id, c.userId, c.providerId, c.name, c.description, c.isPublic, c.creatorName, JSON.stringify(c.mealIds)]
    );
  }
}
