import { Router, type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../db.ts';

export const apiRouter = Router();

interface JwtPayload {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'SUPER_ADMIN';
}

interface AuthedRequest extends Request {
  authUser?: JwtPayload;
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'homeplatter-dev-secret-change-in-production';
}

function signAuthToken(user: JwtPayload): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return;
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.authUser = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
}

function requireSuperAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (req.authUser?.role !== 'SUPER_ADMIN') {
    res.status(403).json({ message: 'Forbidden: Super Admin access required.' });
    return;
  }
  next();
}

// --- Row Mappers ---

function mapUserRow(r: any) {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    joinDate: r.join_date ? new Date(r.join_date).toISOString() : undefined,
    addresses: r.addresses || [],
    followedProviderIds: r.followed_provider_ids || [],
    wishlistMealIds: r.wishlist_meal_ids || [],
    loyaltyPoints: Number(r.loyalty_points ?? 0),
    reEngagementStatus: r.re_engagement_status || {},
    notificationPreferences: r.notification_preferences || { orderUpdates: true, newMessages: true, promotions: true },
    mfaEnabled: Boolean(r.mfa_enabled),
    earnedBadgeIds: r.earned_badge_ids || [],
  };
}

function mapMealRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    type: r.type,
    imageUrl: r.image_url,
    discountPercentage: r.discount_percentage !== null ? Number(r.discount_percentage) : undefined,
    category: r.category ?? undefined,
    isVisible: r.is_visible,
    isAvailable: r.is_available,
    stockQuantity: Number(r.stock_quantity),
    isFeatured: r.is_featured,
    featuredAt: r.featured_at ? new Date(r.featured_at).toISOString() : undefined,
    dietaryTags: r.dietary_tags || [],
    allergenInfo: r.allergen_info || [],
    isBulkOrderEligible: r.is_bulk_order_eligible,
    bulkOrderConfig: r.bulk_order_config ?? undefined,
  };
}

function mapReviewRow(r: any) {
  return {
    id: r.id,
    author: r.author,
    rating: Number(r.rating),
    comment: r.comment,
    userId: r.user_id ?? undefined,
    isVerifiedPurchase: Boolean(r.is_verified_purchase),
    providerReply: r.provider_reply ?? undefined,
    isFlagged: Boolean(r.is_flagged),
    flaggedByUserId: r.flagged_by_user_id ?? undefined,
  };
}

function mapCouponRow(r: any) {
  return {
    id: r.id,
    providerId: r.provider_id,
    code: r.code,
    discountPercentage: Number(r.discount_percentage),
    expiresAt: new Date(r.expires_at).toISOString(),
    isActive: Boolean(r.is_active),
    isSingleUse: Boolean(r.is_single_use),
    claimedByUserId: r.claimed_by_user_id ?? null,
    fundedBy: r.funded_by ?? undefined,
    linkedDisputeId: r.linked_dispute_id ?? undefined,
  };
}

function mapTiffinPlanRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    duration: r.duration,
    price: Number(r.price),
    description: r.description,
    sampleMenu: r.sample_menu ?? undefined,
  };
}

async function hydrateProviders(providerRows: any[]) {
  if (providerRows.length === 0) return [];
  const pool = getPool();
  const ids = providerRows.map((p) => p.id);

  const [mealsRes, reviewsRes, annRes, couponsRes, plansRes] = await Promise.all([
    pool.query('SELECT * FROM meals WHERE provider_id = ANY($1)', [ids]),
    pool.query('SELECT * FROM reviews WHERE provider_id = ANY($1) ORDER BY created_at DESC', [ids]),
    pool.query('SELECT * FROM announcements WHERE provider_id = ANY($1) ORDER BY timestamp DESC', [ids]),
    pool.query('SELECT * FROM coupons WHERE provider_id = ANY($1)', [ids]),
    pool.query('SELECT * FROM tiffin_plans WHERE provider_id = ANY($1)', [ids]),
  ]);

  const byProv = <T extends { provider_id: string }>(rows: T[]) => {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      const list = map.get(row.provider_id) || [];
      list.push(row);
      map.set(row.provider_id, list);
    }
    return map;
  };

  const mealsMap = byProv(mealsRes.rows);
  const reviewsMap = byProv(reviewsRes.rows);
  const annMap = byProv(annRes.rows);
  const couponsMap = byProv(couponsRes.rows);
  const plansMap = byProv(plansRes.rows);

  return providerRows.map((p) => ({
    id: p.id,
    name: p.name,
    chefName: p.chef_name,
    cuisine: p.cuisine,
    rating: Number(p.rating),
    shortDescription: p.short_description,
    longDescription: p.long_description,
    address: p.address,
    profileImageUrl: p.profile_image_url,
    bannerImageUrl: p.banner_image_url,
    isSetupComplete: Boolean(p.is_setup_complete),
    joinDate: new Date(p.join_date).toISOString(),
    isSuspended: Boolean(p.is_suspended),
    subscription: p.subscription || { planName: 'Starter Plan', monthlyCost: 499, nextBillingDate: new Date().toISOString() },
    dashboardLayout: p.dashboard_layout ?? undefined,
    galleryImages: p.gallery_images || [],
    promoVideoUrl: p.promo_video_url ?? undefined,
    isAcceptingOrders: Boolean(p.is_accepting_orders),
    weeklySchedule: p.weekly_schedule || {},
    orderThresholdDiscount: p.order_threshold_discount ?? undefined,
    coordinates: p.coordinates ?? undefined,
    deliveryIntegrationEnabled: Boolean(p.delivery_integration_enabled),
    deliveryFee: p.delivery_fee !== null ? Number(p.delivery_fee) : undefined,
    cateringEnabled: Boolean(p.catering_enabled),
    cateringEventTypes: p.catering_event_types || [],
    cateringGuestCapacity: p.catering_guest_capacity ?? undefined,
    cateringMode: p.catering_mode || 'simple',
    cateringMaxEventsPerWindow: p.catering_max_events_per_window ?? 1,
    cateringProfessionalCapacity: p.catering_professional_capacity ?? undefined,
    cateringBookings: p.catering_bookings || [],
    earnedBadgeIds: p.earned_badge_ids || [],
    avgCostForTwo: p.avg_cost_for_two !== null ? Number(p.avg_cost_for_two) : undefined,
    deliveryTime: p.delivery_time ?? undefined,
    hasMaxSafety: Boolean(p.has_max_safety),
    menu: (mealsMap.get(p.id) || []).map(mapMealRow),
    reviews: (reviewsMap.get(p.id) || []).map(mapReviewRow),
    announcements: (annMap.get(p.id) || []).map((a: any) => ({
      id: a.id,
      providerId: a.provider_id,
      message: a.message,
      timestamp: new Date(a.timestamp).toISOString(),
    })),
    coupons: (couponsMap.get(p.id) || []).map(mapCouponRow),
    tiffinPlans: (plansMap.get(p.id) || []).map(mapTiffinPlanRow),
  }));
}

function mapOrderRow(r: any) {
  return {
    id: r.id,
    userId: r.user_id,
    providerId: r.provider_id,
    items: r.items || [],
    totalAmount: Number(r.total_amount),
    status: r.status,
    orderDate: new Date(r.order_date).toISOString(),
    deliveryWindow: r.delivery_window ?? undefined,
    reviewSubmitted: Boolean(r.review_submitted),
    reviewReminderSent: Boolean(r.review_reminder_sent),
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    messages: r.messages || [],
    lastMessageAt: r.last_message_at ? new Date(r.last_message_at).toISOString() : undefined,
    addOns: r.add_ons || [],
    tracking: r.tracking ?? undefined,
    pointsEarned: Number(r.points_earned ?? 0),
    pointsRedeemed: Number(r.points_redeemed ?? 0),
    deliveryPartner: r.delivery_partner ?? undefined,
    deliveryMethod: r.delivery_method ?? undefined,
    deliveryFeeApplied: r.delivery_fee_applied !== null ? Number(r.delivery_fee_applied) : undefined,
    deliveryCost: r.delivery_cost !== null ? Number(r.delivery_cost) : undefined,
    cateringInquiryId: r.catering_inquiry_id ?? undefined,
    dispute: r.dispute ?? undefined,
  };
}

function mapSubscriptionRow(r: any) {
  return {
    id: r.id,
    userId: r.user_id,
    providerId: r.provider_id,
    planId: r.plan_id,
    planName: r.plan_name,
    duration: r.duration,
    totalAmount: Number(r.total_amount),
    status: r.status,
    startDate: new Date(r.start_date).toISOString(),
    endDate: new Date(r.end_date).toISOString(),
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    pausePeriods: r.pause_periods || [],
  };
}

function mapCollectionRow(r: any) {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    providerId: r.provider_id ?? undefined,
    name: r.name,
    description: r.description ?? undefined,
    isPublic: Boolean(r.is_public),
    mealIds: r.meal_ids || [],
    creatorName: r.creator_name ?? undefined,
  };
}

function mapInquiryRow(r: any) {
  return {
    id: r.id,
    providerId: r.provider_id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    messages: r.messages || [],
    isArchived: Boolean(r.is_archived),
    lastMessageAt: new Date(r.last_message_at).toISOString(),
  };
}

function mapTicketRow(r: any) {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    userRole: r.user_role,
    subject: r.subject,
    category: r.category,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
    messages: r.messages || [],
  };
}

// =====================================================================
// AUTH ROUTES (/api/v1/auth/*)
// =====================================================================

apiRouter.post('/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [String(email || '').trim()]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    const userRow = rows[0];

    const validPassword = await bcrypt.compare(String(password || ''), userRow.password_hash);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    if (userRow.role === 'PROVIDER') {
      const provRes = await pool.query('SELECT is_suspended FROM providers WHERE user_id = $1 OR id = $2', [
        userRow.id,
        userRow.id.replace('prov_', ''),
      ]);
      if (provRes.rows[0]?.is_suspended) {
        res.status(403).json({ message: 'Your account has been suspended.' });
        return;
      }
    }

    if (userRow.mfa_enabled) {
      const mfaToken = jwt.sign({ id: userRow.id, purpose: 'mfa' }, getJwtSecret(), { expiresIn: '10m' });
      res.json({ mfaRequired: true, mfaToken });
      return;
    }

    const user = mapUserRow(userRow);
    const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

apiRouter.post('/v1/auth/mfa/login-verify', async (req, res) => {
  try {
    const { mfaToken, otp } = req.body || {};
    if (String(otp || '').trim().length !== 6) {
      res.status(400).json({ message: 'Invalid OTP code.' });
      return;
    }
    let decoded: { id: string; purpose?: string };
    try {
      decoded = jwt.verify(String(mfaToken || ''), getJwtSecret()) as { id: string; purpose?: string };
    } catch {
      res.status(401).json({ message: 'MFA session expired. Please log in again.' });
      return;
    }
    if (decoded.purpose !== 'mfa') {
      res.status(400).json({ message: 'Invalid MFA token.' });
      return;
    }
    if (String(otp) !== '123456') {
      res.status(400).json({ message: 'Invalid OTP code.' });
      return;
    }

    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    const user = mapUserRow(rows[0]);
    const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user, token });
  } catch (err) {
    console.error('MFA login-verify error:', err);
    res.status(500).json({ message: 'Failed to verify MFA.' });
  }
});

apiRouter.post('/v1/auth/signup', async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { name, email, password, role } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const userRole = role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER';

    if (!cleanEmail || !cleanName || String(password || '').length < 6) {
      res.status(400).json({ message: 'Name, email, and a valid password are required.' });
      return;
    }

    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash(String(password), 10);
    const idSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newUserId = userRole === 'PROVIDER' ? `prov_${idSuffix}` : `usr_${idSuffix}`;

    const userRes = await client.query(
      `INSERT INTO users (id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [newUserId, cleanEmail, passwordHash, cleanName, userRole]
    );

    if (userRole === 'PROVIDER') {
      const providerId = newUserId.replace('prov_', '');
      await client.query(
        `INSERT INTO providers (id, user_id, name, chef_name, is_setup_complete, is_accepting_orders)
         VALUES ($1, $2, $3, $4, FALSE, FALSE)`,
        [providerId, newUserId, `${cleanName}'s Kitchen`, cleanName]
      );
    }

    await client.query('COMMIT');
    const user = mapUserRow(userRes.rows[0]);
    const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed.' });
  } finally {
    client.release();
  }
});

apiRouter.post('/v1/auth/logout', (_req, res) => {
  res.json({ success: true });
});

apiRouter.post('/v1/auth/mfa/setup', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const secret = 'JBSWY3DPEHPK3PXP';
    await getPool().query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [secret, req.authUser!.id]);
    const qrCodeDataUrl =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="#fff"/><rect x="16" y="16" width="44" height="44" fill="#111"/><rect x="100" y="16" width="44" height="44" fill="#111"/><rect x="16" y="100" width="44" height="44" fill="#111"/><rect x="72" y="72" width="16" height="16" fill="#111"/><rect x="104" y="104" width="24" height="24" fill="#111"/></svg>`
      );
    res.json({ secret, qrCodeDataUrl });
  } catch (err) {
    console.error('MFA setup error:', err);
    res.status(500).json({ message: 'MFA setup failed.' });
  }
});

apiRouter.post('/v1/auth/mfa/verify', requireAuth, async (req: AuthedRequest, res) => {
  const { otp } = req.body || {};
  if (String(otp || '').trim().length !== 6) {
    res.status(400).json({ message: 'Invalid OTP code.' });
    return;
  }
  await getPool().query('UPDATE users SET mfa_enabled = TRUE WHERE id = $1', [req.authUser!.id]);
  res.json({ success: true });
});

apiRouter.post('/v1/auth/mfa/disable', requireAuth, async (req: AuthedRequest, res) => {
  await getPool().query('UPDATE users SET mfa_enabled = FALSE, mfa_secret = NULL WHERE id = $1', [req.authUser!.id]);
  res.json({ success: true });
});

// =====================================================================
// PUBLIC CATALOG & COLLECTION ROUTES
// =====================================================================

apiRouter.get('/providers', async (_req, res) => {
  try {
    const { rows } = await getPool().query(
      'SELECT * FROM providers WHERE is_setup_complete = TRUE AND is_suspended = FALSE ORDER BY join_date DESC'
    );
    res.json(await hydrateProviders(rows));
  } catch (err) {
    console.error('Get providers error:', err);
    res.status(500).json({ message: 'Failed to load providers.' });
  }
});

apiRouter.get('/providers/user/:userId', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = String(req.params.userId);
    if (req.authUser!.id !== userId && req.authUser!.role !== 'SUPER_ADMIN') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const { rows } = await getPool().query('SELECT * FROM providers WHERE user_id = $1 OR id = $2', [
      userId,
      userId.replace('prov_', ''),
    ]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }
    const hydrated = await hydrateProviders(rows);
    res.json(hydrated[0]);
  } catch (err) {
    console.error('Get provider by user error:', err);
    res.status(500).json({ message: 'Failed to load provider profile.' });
  }
});

apiRouter.get('/providers/:providerId', async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM providers WHERE id = $1', [req.params.providerId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }
    const hydrated = await hydrateProviders(rows);
    res.json(hydrated[0]);
  } catch (err) {
    console.error('Get provider error:', err);
    res.status(500).json({ message: 'Failed to load provider.' });
  }
});

apiRouter.get('/collections/public', async (_req, res) => {
  try {
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM collections WHERE is_public = TRUE');
    const mealsRes = await pool.query('SELECT * FROM meals');
    const mealMap = new Map(mealsRes.rows.map((m) => [m.id, mapMealRow(m)]));

    const collections = rows.map((c) => {
      const mapped = mapCollectionRow(c);
      return {
        ...mapped,
        mealPreviews: mapped.mealIds
          .map((id: string) => mealMap.get(id))
          .filter(Boolean)
          .slice(0, 4),
      };
    });
    res.json(collections);
  } catch (err) {
    console.error('Get public collections error:', err);
    res.status(500).json({ message: 'Failed to load collections.' });
  }
});

apiRouter.get('/collections/:collectionId', async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM collections WHERE id = $1', [req.params.collectionId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Collection not found' });
      return;
    }
    res.json(mapCollectionRow(rows[0]));
  } catch (err) {
    console.error('Get collection error:', err);
    res.status(500).json({ message: 'Failed to load collection.' });
  }
});

apiRouter.get('/addons', async (_req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM order_addons');
    res.json(rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price), imageUrl: r.image_url })));
  } catch (err) {
    console.error('Get addons error:', err);
    res.status(500).json({ message: 'Failed to load add-ons.' });
  }
});

// =====================================================================
// PROVIDER MANAGEMENT ROUTES
// =====================================================================

apiRouter.put('/providers/:providerId', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const d = req.body || {};
    const pool = getPool();
    const existingRes = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    if (existingRes.rows.length === 0) {
      res.status(404).json({ message: 'Provider not found' });
      return;
    }

    const cur = existingRes.rows[0];
    await pool.query(
      `UPDATE providers SET
        name = $1,
        chef_name = $2,
        cuisine = $3,
        short_description = $4,
        long_description = $5,
        address = $6,
        profile_image_url = $7,
        banner_image_url = $8,
        is_setup_complete = $9,
        gallery_images = $10,
        promo_video_url = $11,
        is_accepting_orders = $12,
        weekly_schedule = $13,
        order_threshold_discount = $14,
        coordinates = $15,
        delivery_integration_enabled = $16,
        delivery_fee = $17,
        catering_enabled = $18,
        catering_event_types = $19,
        catering_guest_capacity = $20,
        catering_mode = $21,
        catering_max_events_per_window = $22,
        catering_professional_capacity = $23,
        catering_bookings = $24,
        avg_cost_for_two = $25,
        delivery_time = $26,
        has_max_safety = $27
      WHERE id = $28`,
      [
        d.name ?? cur.name,
        d.chefName ?? cur.chef_name,
        d.cuisine ?? cur.cuisine,
        d.shortDescription ?? cur.short_description,
        d.longDescription ?? cur.long_description,
        d.address ?? cur.address,
        d.profileImageUrl ?? cur.profile_image_url,
        d.bannerImageUrl ?? cur.banner_image_url,
        d.isSetupComplete ?? cur.is_setup_complete,
        JSON.stringify(d.galleryImages ?? cur.gallery_images ?? []),
        d.promoVideoUrl !== undefined ? d.promoVideoUrl : cur.promo_video_url,
        d.isAcceptingOrders ?? cur.is_accepting_orders,
        JSON.stringify(d.weeklySchedule ?? cur.weekly_schedule ?? {}),
        JSON.stringify(d.orderThresholdDiscount !== undefined ? d.orderThresholdDiscount : cur.order_threshold_discount),
        JSON.stringify(d.coordinates !== undefined ? d.coordinates : cur.coordinates),
        d.deliveryIntegrationEnabled ?? cur.delivery_integration_enabled,
        d.deliveryFee !== undefined ? d.deliveryFee : cur.delivery_fee,
        d.cateringEnabled ?? cur.catering_enabled,
        JSON.stringify(d.cateringEventTypes ?? cur.catering_event_types ?? []),
        JSON.stringify(d.cateringGuestCapacity !== undefined ? d.cateringGuestCapacity : cur.catering_guest_capacity),
        d.cateringMode ?? cur.catering_mode,
        d.cateringMaxEventsPerWindow ?? cur.catering_max_events_per_window,
        d.cateringProfessionalCapacity !== undefined ? d.cateringProfessionalCapacity : cur.catering_professional_capacity,
        JSON.stringify(d.cateringBookings ?? cur.catering_bookings ?? []),
        d.avgCostForTwo !== undefined ? d.avgCostForTwo : cur.avg_cost_for_two,
        d.deliveryTime !== undefined ? d.deliveryTime : cur.delivery_time,
        d.hasMaxSafety ?? cur.has_max_safety,
        providerId,
      ]
    );

    const updated = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    res.json((await hydrateProviders(updated.rows))[0]);
  } catch (err) {
    console.error('Update provider error:', err);
    res.status(500).json({ message: 'Failed to update provider.' });
  }
});

apiRouter.put('/providers/:providerId/dashboard-layout', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { layout } = req.body || {};
    const pool = getPool();
    await pool.query('UPDATE providers SET dashboard_layout = $1 WHERE id = $2', [JSON.stringify(layout || []), providerId]);
    const updated = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    res.json((await hydrateProviders(updated.rows))[0]);
  } catch (err) {
    console.error('Update dashboard layout error:', err);
    res.status(500).json({ message: 'Failed to update dashboard layout.' });
  }
});

// --- Menu CRUD ---

apiRouter.post('/providers/:providerId/menu', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const m = req.body || {};
    const mealId = `m${providerId}_${Date.now()}`;
    const { rows } = await getPool().query(
      `INSERT INTO meals (
        id, provider_id, name, description, price, type, image_url, discount_percentage,
        category, is_visible, is_available, stock_quantity, is_featured, featured_at,
        dietary_tags, allergen_info, is_bulk_order_eligible, bulk_order_config
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        mealId,
        providerId,
        m.name,
        m.description || '',
        Number(m.price || 0),
        m.type || 'VEG',
        m.imageUrl || 'https://picsum.photos/seed/mealnew/400/300',
        m.discountPercentage ?? null,
        m.category ?? null,
        m.isVisible ?? true,
        m.isAvailable ?? true,
        m.stockQuantity ?? -1,
        m.isFeatured ?? false,
        m.isFeatured ? new Date().toISOString() : null,
        JSON.stringify(m.dietaryTags || []),
        JSON.stringify(m.allergenInfo || []),
        m.isBulkOrderEligible ?? false,
        JSON.stringify(m.bulkOrderConfig || null),
      ]
    );
    res.status(201).json(mapMealRow(rows[0]));
  } catch (err) {
    console.error('Add meal error:', err);
    res.status(500).json({ message: 'Failed to add meal.' });
  }
});

apiRouter.put('/providers/:providerId/menu/:mealId', requireAuth, async (req, res) => {
  try {
    const { providerId, mealId } = req.params;
    const m = req.body || {};
    const pool = getPool();
    const curRes = await pool.query('SELECT * FROM meals WHERE id = $1 AND provider_id = $2', [mealId, providerId]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ message: 'Meal not found' });
      return;
    }
    const cur = curRes.rows[0];
    const isFeatured = m.isFeatured ?? cur.is_featured;
    const featuredAt = isFeatured && !cur.featured_at ? new Date().toISOString() : cur.featured_at;

    const { rows } = await pool.query(
      `UPDATE meals SET
        name = $1, description = $2, price = $3, type = $4, image_url = $5,
        discount_percentage = $6, category = $7, is_visible = $8, is_available = $9,
        stock_quantity = $10, is_featured = $11, featured_at = $12,
        dietary_tags = $13, allergen_info = $14, is_bulk_order_eligible = $15, bulk_order_config = $16
      WHERE id = $17 AND provider_id = $18 RETURNING *`,
      [
        m.name ?? cur.name,
        m.description ?? cur.description,
        m.price !== undefined ? Number(m.price) : cur.price,
        m.type ?? cur.type,
        m.imageUrl ?? cur.image_url,
        m.discountPercentage !== undefined ? m.discountPercentage : cur.discount_percentage,
        m.category !== undefined ? m.category : cur.category,
        m.isVisible ?? cur.is_visible,
        m.isAvailable ?? cur.is_available,
        m.stockQuantity !== undefined ? Number(m.stockQuantity) : cur.stock_quantity,
        isFeatured,
        featuredAt,
        JSON.stringify(m.dietaryTags ?? cur.dietary_tags ?? []),
        JSON.stringify(m.allergenInfo ?? cur.allergen_info ?? []),
        m.isBulkOrderEligible ?? cur.is_bulk_order_eligible,
        JSON.stringify(m.bulkOrderConfig !== undefined ? m.bulkOrderConfig : cur.bulk_order_config),
        mealId,
        providerId,
      ]
    );
    res.json(mapMealRow(rows[0]));
  } catch (err) {
    console.error('Update meal error:', err);
    res.status(500).json({ message: 'Failed to update meal.' });
  }
});

apiRouter.delete('/providers/:providerId/menu/:mealId', requireAuth, async (req, res) => {
  try {
    await getPool().query('DELETE FROM meals WHERE id = $1 AND provider_id = $2', [req.params.mealId, req.params.providerId]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete meal error:', err);
    res.status(500).json({ message: 'Failed to delete meal.' });
  }
});

// --- Reviews ---

apiRouter.post('/providers/:providerId/reviews', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { providerId } = req.params;
    const { author, rating, comment, isVerifiedPurchase } = req.body || {};
    const pool = getPool();
    const revId = `r_${Date.now()}`;
    await pool.query(
      `INSERT INTO reviews (id, provider_id, user_id, author, rating, comment, is_verified_purchase)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [revId, providerId, req.authUser!.id, author || 'Customer', Number(rating), comment || '', Boolean(isVerifiedPurchase)]
    );

    const avgRes = await pool.query('SELECT AVG(rating)::numeric(3,2) AS avg_rating FROM reviews WHERE provider_id = $1', [providerId]);
    if (avgRes.rows[0]?.avg_rating) {
      await pool.query('UPDATE providers SET rating = $1 WHERE id = $2', [avgRes.rows[0].avg_rating, providerId]);
    }
    const updated = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    res.status(201).json((await hydrateProviders(updated.rows))[0]);
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Failed to submit review.' });
  }
});

apiRouter.put('/providers/:providerId/reviews/:reviewId/flag', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { rows } = await getPool().query(
      'UPDATE reviews SET is_flagged = TRUE, flagged_by_user_id = $1 WHERE id = $2 AND provider_id = $3 RETURNING *',
      [req.authUser!.id, req.params.reviewId, req.params.providerId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.json(mapReviewRow(rows[0]));
  } catch (err) {
    console.error('Flag review error:', err);
    res.status(500).json({ message: 'Failed to flag review.' });
  }
});

apiRouter.post('/providers/:providerId/reviews/:reviewId/reply', requireAuth, async (req, res) => {
  try {
    const { replyText } = req.body || {};
    const reply = { text: replyText, timestamp: new Date().toISOString() };
    const { rows } = await getPool().query(
      'UPDATE reviews SET provider_reply = $1 WHERE id = $2 AND provider_id = $3 RETURNING *',
      [JSON.stringify(reply), req.params.reviewId, req.params.providerId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.json(mapReviewRow(rows[0]));
  } catch (err) {
    console.error('Reply review error:', err);
    res.status(500).json({ message: 'Failed to post reply.' });
  }
});

// --- Announcements ---

apiRouter.post('/providers/:providerId/announcements', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { message } = req.body || {};
    const id = `ann_${Date.now()}`;
    const { rows } = await getPool().query(
      'INSERT INTO announcements (id, provider_id, message) VALUES ($1,$2,$3) RETURNING *',
      [id, providerId, message]
    );
    res.status(201).json({
      id: rows[0].id,
      providerId: rows[0].provider_id,
      message: rows[0].message,
      timestamp: new Date(rows[0].timestamp).toISOString(),
    });
  } catch (err) {
    console.error('Add announcement error:', err);
    res.status(500).json({ message: 'Failed to create announcement.' });
  }
});

// --- Invoices ---

apiRouter.get('/providers/:providerId/invoices', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM invoices WHERE provider_id = $1 ORDER BY generated_date DESC', [
      req.params.providerId,
    ]);
    res.json(
      rows.map((r) => ({
        id: r.id,
        providerId: r.provider_id,
        providerName: r.provider_name,
        period: r.period,
        amount: Number(r.amount),
        status: r.status,
        aiSummaryNotes: r.ai_summary_notes,
        generatedDate: new Date(r.generated_date).toISOString(),
      }))
    );
  } catch (err) {
    console.error('Get provider invoices error:', err);
    res.status(500).json({ message: 'Failed to load invoices.' });
  }
});

// --- Coupons ---

apiRouter.get('/providers/:providerId/coupons', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM coupons WHERE provider_id = $1', [req.params.providerId]);
    res.json(rows.map(mapCouponRow));
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ message: 'Failed to load coupons.' });
  }
});

apiRouter.post('/providers/:providerId/coupons', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { code, discountPercentage, expiresAt, isSingleUse } = req.body || {};
    const id = `cpn_${Date.now()}`;
    const { rows } = await getPool().query(
      `INSERT INTO coupons (id, provider_id, code, discount_percentage, expires_at, is_active, is_single_use)
       VALUES ($1,$2,$3,$4,$5,TRUE,$6) RETURNING *`,
      [id, providerId, String(code).toUpperCase(), Number(discountPercentage), expiresAt, Boolean(isSingleUse)]
    );
    res.status(201).json(mapCouponRow(rows[0]));
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ message: 'Failed to create coupon.' });
  }
});

apiRouter.post('/providers/:providerId/targeted-coupon', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { discountPercentage, expiresAt, targetUserId } = req.body || {};
    const pool = getPool();
    const id = `cpn_${Date.now()}`;
    const code = `GIFT${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const { rows } = await pool.query(
      `INSERT INTO coupons (id, provider_id, code, discount_percentage, expires_at, is_active, is_single_use, claimed_by_user_id, funded_by)
       VALUES ($1,$2,$3,$4,$5,TRUE,TRUE,$6,'PROVIDER') RETURNING *`,
      [id, providerId, code, Number(discountPercentage), expiresAt, targetUserId]
    );
    await pool.query(
      'INSERT INTO notifications (id, user_id, message) VALUES ($1,$2,$3)',
      [`notif_${Date.now()}`, targetUserId, `You received a ${discountPercentage}% reward coupon! Use code ${code}.`]
    );
    res.status(201).json(mapCouponRow(rows[0]));
  } catch (err) {
    console.error('Targeted coupon error:', err);
    res.status(500).json({ message: 'Failed to create targeted coupon.' });
  }
});

// --- Tiffin Plans ---

apiRouter.post('/providers/:providerId/tiffin-plans', requireAuth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { name, duration, price, description, sampleMenu } = req.body || {};
    const id = `plan_${Date.now()}`;
    const { rows } = await getPool().query(
      `INSERT INTO tiffin_plans (id, provider_id, name, duration, price, description, sample_menu)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, providerId, name, duration, Number(price), description || '', JSON.stringify(sampleMenu || null)]
    );
    res.status(201).json(mapTiffinPlanRow(rows[0]));
  } catch (err) {
    console.error('Create tiffin plan error:', err);
    res.status(500).json({ message: 'Failed to create tiffin plan.' });
  }
});

apiRouter.put('/providers/:providerId/tiffin-plans/:planId', requireAuth, async (req, res) => {
  try {
    const { providerId, planId } = req.params;
    const { name, duration, price, description, sampleMenu } = req.body || {};
    const { rows } = await getPool().query(
      `UPDATE tiffin_plans SET name = $1, duration = $2, price = $3, description = $4, sample_menu = $5
       WHERE id = $6 AND provider_id = $7 RETURNING *`,
      [name, duration, Number(price), description || '', JSON.stringify(sampleMenu || null), planId, providerId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'Tiffin plan not found' });
      return;
    }
    res.json(mapTiffinPlanRow(rows[0]));
  } catch (err) {
    console.error('Update tiffin plan error:', err);
    res.status(500).json({ message: 'Failed to update tiffin plan.' });
  }
});

apiRouter.delete('/providers/:providerId/tiffin-plans/:planId', requireAuth, async (req, res) => {
  try {
    await getPool().query('DELETE FROM tiffin_plans WHERE id = $1 AND provider_id = $2', [
      req.params.planId,
      req.params.providerId,
    ]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete tiffin plan error:', err);
    res.status(500).json({ message: 'Failed to delete tiffin plan.' });
  }
});

apiRouter.post('/reminders/review', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (rows.length > 0) {
      const ord = rows[0];
      await pool.query('UPDATE orders SET review_reminder_sent = TRUE WHERE id = $1', [orderId]);
      await pool.query(
        'INSERT INTO notifications (id, user_id, message, link_to) VALUES ($1,$2,$3,$4)',
        [
          `notif_${Date.now()}`,
          ord.user_id,
          'How was your meal? Leave a quick review to help your neighborhood chef!',
          JSON.stringify({ path: `/provider/${ord.provider_id}` }),
        ]
      );
    }
    res.status(204).send();
  } catch (err) {
    console.error('Review reminder error:', err);
    res.status(500).json({ message: 'Failed to send reminder.' });
  }
});

// =====================================================================
// ORDERS & SUBSCRIPTIONS
// =====================================================================

apiRouter.post('/orders/validate-coupon', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { providerId, code } = req.body || {};
    const { rows } = await getPool().query(
      'SELECT * FROM coupons WHERE provider_id = $1 AND UPPER(code) = UPPER($2) AND is_active = TRUE',
      [providerId, String(code || '').trim()]
    );
    if (rows.length === 0) {
      res.json({ isValid: false, discountPercentage: 0, message: 'Invalid or inactive coupon code.' });
      return;
    }
    const c = mapCouponRow(rows[0]);
    if (new Date(c.expiresAt).getTime() < Date.now()) {
      res.json({ isValid: false, discountPercentage: 0, message: 'This coupon has expired.' });
      return;
    }
    if (c.claimedByUserId && c.claimedByUserId !== req.authUser!.id) {
      res.json({ isValid: false, discountPercentage: 0, message: 'This coupon belongs to another account.' });
      return;
    }
    res.json({
      isValid: true,
      discountPercentage: c.discountPercentage,
      message: `${c.discountPercentage}% discount applied!`,
      coupon: c,
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ message: 'Coupon validation failed.' });
  }
});

apiRouter.post('/orders/checkout', requireAuth, async (req: AuthedRequest, res) => {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { user: bodyUser, cart = [], addOns = [], deliveryMethods = {}, redeemPoints = false, appliedCoupons = {} } = req.body || {};
    const userId = req.authUser!.id;

    const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    const dbUser = userRes.rows[0];

    await client.query('BEGIN');

    // Group cart items by providerId
    const byProvider = new Map<string, any[]>();
    for (const item of cart) {
      const list = byProvider.get(item.providerId) || [];
      list.push(item);
      byProvider.set(item.providerId, list);
    }

    const createdOrders: any[] = [];
    const createdSubscriptions: any[] = [];
    let availablePoints = Number(dbUser.loyalty_points ?? 0);
    let pointsToRedeemRemaining = redeemPoints ? availablePoints : 0;

    for (const [providerId, items] of byProvider.entries()) {
      const provRes = await client.query('SELECT * FROM providers WHERE id = $1', [providerId]);
      const prov = provRes.rows[0];
      const deliveryMethod = deliveryMethods[providerId] || 'PICKUP';
      const deliveryFeeApplied = deliveryMethod === 'DELIVERY' ? Number(prov?.delivery_fee || 0) : 0;
      const coupon = appliedCoupons?.[providerId];

      const mealItems = items.filter((i) => i.itemType !== 'PLAN');
      const planItems = items.filter((i) => i.itemType === 'PLAN');

      if (mealItems.length > 0) {
        let subtotal = mealItems.reduce((sum, item) => {
          const unit = item.discountPercentage ? item.price * (1 - item.discountPercentage / 100) : item.price;
          return sum + unit * item.quantity;
        }, 0);

        const addOnTotal = (addOns || []).reduce((s: number, a: any) => s + Number(a.price || 0), 0);
        subtotal += addOnTotal;

        if (coupon?.discountPercentage) {
          subtotal = subtotal * (1 - Number(coupon.discountPercentage) / 100);
          if (coupon.isSingleUse && coupon.id) {
            await client.query('UPDATE coupons SET is_active = FALSE WHERE id = $1', [coupon.id]);
          }
        }

        const pointsRedeemed = Math.min(pointsToRedeemRemaining, Math.floor(subtotal));
        pointsToRedeemRemaining -= pointsRedeemed;
        const totalAmount = Math.max(0, Math.round(subtotal - pointsRedeemed + deliveryFeeApplied));
        const pointsEarned = Math.floor(totalAmount / 10);

        const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const ordRes = await client.query(
          `INSERT INTO orders (
            id, user_id, provider_id, items, total_amount, status, delivery_window,
            customer_name, customer_email, add_ons, points_earned, points_redeemed,
            delivery_method, delivery_fee_applied
          ) VALUES ($1,$2,$3,$4,$5,'PENDING',$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
          [
            orderId,
            userId,
            providerId,
            JSON.stringify(mealItems),
            totalAmount,
            mealItems[0]?.deliveryWindow || null,
            bodyUser?.name || dbUser.name,
            bodyUser?.email || dbUser.email,
            JSON.stringify(addOns || []),
            pointsEarned,
            pointsRedeemed,
            deliveryMethod,
            deliveryFeeApplied,
          ]
        );
        createdOrders.push(mapOrderRow(ordRes.rows[0]));

        // Update meal stock
        for (const item of mealItems) {
          await client.query(
            `UPDATE meals SET stock_quantity = CASE WHEN stock_quantity > 0 THEN GREATEST(0, stock_quantity - $1) ELSE stock_quantity END WHERE id = $2`,
            [Number(item.quantity || 1), item.id]
          );
        }

        availablePoints = availablePoints - pointsRedeemed + pointsEarned;

        if (prov?.user_id) {
          await client.query(
            'INSERT INTO notifications (id, user_id, message, link_to) VALUES ($1,$2,$3,$4)',
            [
              `notif_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
              prov.user_id,
              `New order #${orderId.slice(-6)} received from ${dbUser.name}!`,
              JSON.stringify({ path: '/dashboard' }),
            ]
          );
        }
      }

      for (const plan of planItems) {
        const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const days = plan.duration === 'MONTHLY' ? 30 : 7;
        const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        const subRes = await client.query(
          `INSERT INTO subscription_orders (
            id, user_id, provider_id, plan_id, plan_name, duration, total_amount,
            status, end_date, customer_name, customer_email
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,'ACTIVE',$8,$9,$10) RETURNING *`,
          [
            subId,
            userId,
            providerId,
            plan.id,
            plan.name,
            plan.duration || 'WEEKLY',
            Number(plan.price) * Number(plan.quantity || 1),
            endDate,
            bodyUser?.name || dbUser.name,
            bodyUser?.email || dbUser.email,
          ]
        );
        createdSubscriptions.push(mapSubscriptionRow(subRes.rows[0]));
      }
    }

    await client.query('UPDATE users SET loyalty_points = $1 WHERE id = $2', [Math.max(0, availablePoints), userId]);

    await client.query('COMMIT');
    res.status(201).json({ createdOrders, createdSubscriptions });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Checkout failed.' });
  } finally {
    client.release();
  }
});

apiRouter.post('/orders/checkout-catering', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { inquiry } = req.body || {};
    const pool = getPool();
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.authUser!.id]);
    const user = userRes.rows[0];
    const quoteMsg = [...(inquiry?.messages || [])].reverse().find((m: any) => m.messageType === 'quote');
    const amount = Number(quoteMsg?.quote?.amount || 0);
    const orderId = `ord_cat_${Date.now()}`;

    const { rows } = await pool.query(
      `INSERT INTO orders (
        id, user_id, provider_id, items, total_amount, status,
        customer_name, customer_email, catering_inquiry_id
      ) VALUES ($1,$2,$3,$4,$5,'CONFIRMED',$6,$7,$8) RETURNING *`,
      [
        orderId,
        req.authUser!.id,
        inquiry.providerId,
        JSON.stringify([
          {
            id: `cat_${inquiry.id}`,
            name: 'Custom Catering Package',
            price: amount,
            quantity: 1,
            providerId: inquiry.providerId,
            providerName: 'Catering Kitchen',
            itemType: 'MEAL',
          },
        ]),
        amount,
        user?.name || inquiry.customerName,
        user?.email || '',
        inquiry.id,
      ]
    );
    res.status(201).json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Checkout catering error:', err);
    res.status(500).json({ message: 'Catering checkout failed.' });
  }
});

apiRouter.get('/orders/user/:userId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC', [
      req.params.userId,
    ]);
    res.json(rows.map(mapOrderRow));
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Failed to load orders.' });
  }
});

apiRouter.get('/orders/provider/:providerId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM orders WHERE provider_id = $1 ORDER BY order_date DESC', [
      req.params.providerId,
    ]);
    res.json(rows.map(mapOrderRow));
  } catch (err) {
    console.error('Get provider orders error:', err);
    res.status(500).json({ message: 'Failed to load provider orders.' });
  }
});

apiRouter.get('/orders/:orderId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM orders WHERE id = $1', [req.params.orderId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Failed to load order.' });
  }
});

apiRouter.put('/orders/:orderId/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    const { rows } = await getPool().query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [
      status,
      req.params.orderId,
    ]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    await getPool().query('INSERT INTO notifications (id, user_id, message, link_to) VALUES ($1,$2,$3,$4)', [
      `notif_${Date.now()}`,
      rows[0].user_id,
      `Your order status has been updated to ${status}.`,
      JSON.stringify({ path: `/track-order/${rows[0].id}` }),
    ]);
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

apiRouter.post('/orders/:orderId/reviewed', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('UPDATE orders SET review_submitted = TRUE WHERE id = $1 RETURNING *', [
      req.params.orderId,
    ]);
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Mark reviewed error:', err);
    res.status(500).json({ message: 'Failed to mark order reviewed.' });
  }
});

apiRouter.post('/orders/:orderId/dispute', requireAuth, async (req, res) => {
  try {
    const { reason, message } = req.body || {};
    const dispute = {
      reason,
      customerMessage: message,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    const { rows } = await getPool().query('UPDATE orders SET dispute = $1 WHERE id = $2 RETURNING *', [
      JSON.stringify(dispute),
      req.params.orderId,
    ]);
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Order dispute error:', err);
    res.status(500).json({ message: 'Failed to report dispute.' });
  }
});

apiRouter.post('/orders/:orderId/messages', requireAuth, async (req, res) => {
  try {
    const { senderId, text } = req.body || {};
    const pool = getPool();
    const curRes = await pool.query('SELECT messages FROM orders WHERE id = $1', [req.params.orderId]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    const messages = curRes.rows[0].messages || [];
    const now = new Date().toISOString();
    messages.push({ id: `msg_${Date.now()}`, senderId, text, timestamp: now });
    const { rows } = await pool.query('UPDATE orders SET messages = $1, last_message_at = $2 WHERE id = $3 RETURNING *', [
      JSON.stringify(messages),
      now,
      req.params.orderId,
    ]);
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Order message error:', err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

apiRouter.post('/orders/:orderId/request-delivery', requireAuth, async (req, res) => {
  try {
    const tracking = {
      startTime: Date.now(),
      path: [
        { lat: 30, lng: 30 },
        { lat: 40, lng: 42 },
        { lat: 52, lng: 56 },
        { lat: 60, lng: 70 },
      ],
      destination: { lat: 60, lng: 70 },
      currentLocation: { lat: 30, lng: 30 },
    };
    const deliveryPartner = { name: 'Vikram Singh', vehicle: 'DL 3S AB 1234', phone: '+91 98765 43210' };
    const { rows } = await getPool().query(
      `UPDATE orders SET status = 'OUT_FOR_DELIVERY', delivery_partner = $1, tracking = $2 WHERE id = $3 RETURNING *`,
      [JSON.stringify(deliveryPartner), JSON.stringify(tracking), req.params.orderId]
    );
    res.json(mapOrderRow(rows[0]));
  } catch (err) {
    console.error('Request delivery error:', err);
    res.status(500).json({ message: 'Failed to request delivery partner.' });
  }
});

apiRouter.post('/orders/:orderId/automated-review-reminder', requireAuth, async (req, res) => {
  try {
    await getPool().query('UPDATE orders SET review_reminder_sent = TRUE WHERE id = $1', [req.params.orderId]);
    res.status(204).send();
  } catch (err) {
    console.error('Automated review reminder error:', err);
    res.status(500).json({ message: 'Failed to send automated reminder.' });
  }
});

apiRouter.get('/customers/provider/:providerId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query(
      `SELECT user_id AS "userId", MAX(customer_name) AS name, MAX(customer_email) AS email, COUNT(*)::int AS "orderCount"
       FROM orders WHERE provider_id = $1 GROUP BY user_id`,
      [req.params.providerId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get provider customers error:', err);
    res.status(500).json({ message: 'Failed to load customers.' });
  }
});

apiRouter.get('/subscriptions/user/:userId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM subscription_orders WHERE user_id = $1 ORDER BY start_date DESC', [
      req.params.userId,
    ]);
    res.json(rows.map(mapSubscriptionRow));
  } catch (err) {
    console.error('Get user subscriptions error:', err);
    res.status(500).json({ message: 'Failed to load subscriptions.' });
  }
});

apiRouter.get('/subscriptions/provider/:providerId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM subscription_orders WHERE provider_id = $1 ORDER BY start_date DESC', [
      req.params.providerId,
    ]);
    res.json(rows.map(mapSubscriptionRow));
  } catch (err) {
    console.error('Get provider subscriptions error:', err);
    res.status(500).json({ message: 'Failed to load subscriptions.' });
  }
});

apiRouter.put('/subscriptions/:subscriptionId/pause', requireAuth, async (req, res) => {
  try {
    const { pauseStartDate, pauseEndDate } = req.body || {};
    const pool = getPool();
    const curRes = await pool.query('SELECT pause_periods FROM subscription_orders WHERE id = $1', [req.params.subscriptionId]);
    if (curRes.rows.length === 0) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }
    const pausePeriods = curRes.rows[0].pause_periods || [];
    pausePeriods.push({ startDate: pauseStartDate, endDate: pauseEndDate });
    const { rows } = await pool.query(
      `UPDATE subscription_orders SET status = 'PAUSED', pause_periods = $1 WHERE id = $2 RETURNING *`,
      [JSON.stringify(pausePeriods), req.params.subscriptionId]
    );
    res.json(mapSubscriptionRow(rows[0]));
  } catch (err) {
    console.error('Pause subscription error:', err);
    res.status(500).json({ message: 'Failed to pause subscription.' });
  }
});

// =====================================================================
// USER ROUTES
// =====================================================================

apiRouter.get('/users/me/notifications', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY timestamp DESC', [
      req.authUser!.id,
    ]);
    res.json(
      rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        message: r.message,
        timestamp: new Date(r.timestamp).toISOString(),
        isRead: Boolean(r.is_read),
        linkTo: r.link_to ?? undefined,
      }))
    );
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Failed to load notifications.' });
  }
});

apiRouter.post('/users/me/notifications/read', requireAuth, async (req: AuthedRequest, res) => {
  try {
    await getPool().query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.authUser!.id]);
    res.status(204).send();
  } catch (err) {
    console.error('Mark notifications read error:', err);
    res.status(500).json({ message: 'Failed to mark notifications read.' });
  }
});

apiRouter.post('/users/me/cart-reminder', requireAuth, async (req: AuthedRequest, res) => {
  try {
    await getPool().query('INSERT INTO notifications (id, user_id, message) VALUES ($1,$2,$3)', [
      `notif_${Date.now()}`,
      req.authUser!.id,
      'You left homemade meals in your cart! Complete your order before serving cutoff.',
    ]);
    res.status(204).send();
  } catch {
    res.status(204).send();
  }
});

apiRouter.post('/users/me/re-engagement-reward', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { providerId } = req.body || {};
    const pool = getPool();
    const { rows } = await pool.query('SELECT re_engagement_status FROM users WHERE id = $1', [req.authUser!.id]);
    const status = rows[0]?.re_engagement_status || {};
    status[providerId] = new Date().toISOString();
    await pool.query('UPDATE users SET re_engagement_status = $1 WHERE id = $2', [JSON.stringify(status), req.authUser!.id]);
    res.status(204).send();
  } catch {
    res.status(204).send();
  }
});

apiRouter.get('/users/me/feed', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const pool = getPool();
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.authUser!.id]);
    const user = mapUserRow(userRes.rows[0]);
    const followed = user.followedProviderIds || [];
    if (followed.length === 0) {
      res.json([]);
      return;
    }

    const provRes = await pool.query('SELECT * FROM providers WHERE id = ANY($1)', [followed]);
    const providers = await hydrateProviders(provRes.rows);
    const feedItems: any[] = [];

    for (const p of providers) {
      if (user.notificationPreferences?.promotions ?? true) {
        for (const a of p.announcements) {
          feedItems.push({
            id: a.id,
            type: 'ANNOUNCEMENT',
            timestamp: a.timestamp,
            providerId: p.id,
            providerName: p.name,
            providerProfileImageUrl: p.profileImageUrl,
            content: { message: a.message },
          });
        }
      }
      for (const m of p.menu) {
        if (m.isFeatured) {
          feedItems.push({
            id: `feed_${m.id}`,
            type: 'FEATURED_MEAL',
            timestamp: m.featuredAt || new Date().toISOString(),
            providerId: p.id,
            providerName: p.name,
            providerProfileImageUrl: p.profileImageUrl,
            content: { meal: m },
          });
        }
      }
    }

    feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(feedItems);
  } catch (err) {
    console.error('Get feed error:', err);
    res.status(500).json({ message: 'Failed to load feed.' });
  }
});

apiRouter.get('/users/me/collections', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM collections WHERE user_id = $1', [req.authUser!.id]);
    res.json(rows.map(mapCollectionRow));
  } catch (err) {
    console.error('Get user collections error:', err);
    res.status(500).json({ message: 'Failed to load collections.' });
  }
});

apiRouter.get('/users/:userId/profile', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { userId } = req.params;
    if (req.authUser!.id !== userId && req.authUser!.role !== 'SUPER_ADMIN') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const { rows } = await getPool().query('SELECT * FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ message: 'Failed to load profile.' });
  }
});

apiRouter.put('/users/:userId/addresses', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('UPDATE users SET addresses = $1 WHERE id = $2 RETURNING *', [
      JSON.stringify(req.body?.addresses || []),
      req.params.userId,
    ]);
    res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error('Update addresses error:', err);
    res.status(500).json({ message: 'Failed to update addresses.' });
  }
});

apiRouter.put('/users/:userId/follows', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('UPDATE users SET followed_provider_ids = $1 WHERE id = $2 RETURNING *', [
      JSON.stringify(req.body?.followedProviderIds || []),
      req.params.userId,
    ]);
    res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error('Update follows error:', err);
    res.status(500).json({ message: 'Failed to update follows.' });
  }
});

apiRouter.put('/users/:userId/wishlist', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('UPDATE users SET wishlist_meal_ids = $1 WHERE id = $2 RETURNING *', [
      JSON.stringify(req.body?.wishlistMealIds || []),
      req.params.userId,
    ]);
    res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error('Update wishlist error:', err);
    res.status(500).json({ message: 'Failed to update wishlist.' });
  }
});

apiRouter.put('/users/:userId/notification-preferences', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('UPDATE users SET notification_preferences = $1 WHERE id = $2 RETURNING *', [
      JSON.stringify(req.body?.preferences || {}),
      req.params.userId,
    ]);
    res.json(mapUserRow(rows[0]));
  } catch (err) {
    console.error('Update notification prefs error:', err);
    res.status(500).json({ message: 'Failed to update preferences.' });
  }
});

// =====================================================================
// COLLECTION MUTATIONS
// =====================================================================

apiRouter.post('/collections', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { name, description, isPublic } = req.body || {};
    const pool = getPool();
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.authUser!.id]);
    const id = `coll_${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO collections (id, user_id, name, description, is_public, creator_name, meal_ids)
       VALUES ($1,$2,$3,$4,$5,$6,'[]'::jsonb) RETURNING *`,
      [id, req.authUser!.id, name, description || null, Boolean(isPublic), userRes.rows[0]?.name || 'Food Lover']
    );
    res.status(201).json(mapCollectionRow(rows[0]));
  } catch (err) {
    console.error('Create collection error:', err);
    res.status(500).json({ message: 'Failed to create collection.' });
  }
});

apiRouter.put('/collections/meal', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { mealId, collectionIds = [] } = req.body || {};
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM collections WHERE user_id = $1', [req.authUser!.id]);
    const targetSet = new Set(collectionIds);

    for (const c of rows) {
      const meals: string[] = Array.isArray(c.meal_ids) ? c.meal_ids : [];
      const has = meals.includes(mealId);
      const shouldHave = targetSet.has(c.id);
      if (has !== shouldHave) {
        const nextMeals = shouldHave ? [...meals, mealId] : meals.filter((id) => id !== mealId);
        await pool.query('UPDATE collections SET meal_ids = $1 WHERE id = $2', [JSON.stringify(nextMeals), c.id]);
      }
    }
    const updated = await pool.query('SELECT * FROM collections WHERE user_id = $1', [req.authUser!.id]);
    res.json(updated.rows.map(mapCollectionRow));
  } catch (err) {
    console.error('Update meal in collections error:', err);
    res.status(500).json({ message: 'Failed to update collections.' });
  }
});

apiRouter.put('/collections/:collectionId', requireAuth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body || {};
    const { rows } = await getPool().query(
      'UPDATE collections SET name = $1, description = $2, is_public = $3 WHERE id = $4 RETURNING *',
      [name, description || null, Boolean(isPublic), req.params.collectionId]
    );
    res.json(mapCollectionRow(rows[0]));
  } catch (err) {
    console.error('Update collection error:', err);
    res.status(500).json({ message: 'Failed to update collection.' });
  }
});

apiRouter.delete('/collections/:collectionId', requireAuth, async (req, res) => {
  try {
    await getPool().query('DELETE FROM collections WHERE id = $1', [req.params.collectionId]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete collection error:', err);
    res.status(500).json({ message: 'Failed to delete collection.' });
  }
});

apiRouter.get('/providers/:providerId/collections', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM collections WHERE provider_id = $1', [req.params.providerId]);
    res.json(rows.map(mapCollectionRow));
  } catch (err) {
    console.error('Get provider collections error:', err);
    res.status(500).json({ message: 'Failed to load provider collections.' });
  }
});

apiRouter.post('/providers/:providerId/collections', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const pool = getPool();
    const provRes = await pool.query('SELECT chef_name FROM providers WHERE id = $1', [req.params.providerId]);
    const id = `pcoll_${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO collections (id, provider_id, name, description, is_public, creator_name, meal_ids)
       VALUES ($1,$2,$3,$4,TRUE,$5,'[]'::jsonb) RETURNING *`,
      [id, req.params.providerId, name, description || null, provRes.rows[0]?.chef_name || 'Chef']
    );
    res.status(201).json(mapCollectionRow(rows[0]));
  } catch (err) {
    console.error('Create provider collection error:', err);
    res.status(500).json({ message: 'Failed to create provider collection.' });
  }
});

apiRouter.put('/providers/:providerId/collections/meal', requireAuth, async (req, res) => {
  try {
    const { mealId, collectionIds = [] } = req.body || {};
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM collections WHERE provider_id = $1', [req.params.providerId]);
    const targetSet = new Set(collectionIds);

    for (const c of rows) {
      const meals: string[] = Array.isArray(c.meal_ids) ? c.meal_ids : [];
      const has = meals.includes(mealId);
      const shouldHave = targetSet.has(c.id);
      if (has !== shouldHave) {
        const nextMeals = shouldHave ? [...meals, mealId] : meals.filter((id) => id !== mealId);
        await pool.query('UPDATE collections SET meal_ids = $1 WHERE id = $2', [JSON.stringify(nextMeals), c.id]);
      }
    }
    const updated = await pool.query('SELECT * FROM collections WHERE provider_id = $1', [req.params.providerId]);
    res.json(updated.rows.map(mapCollectionRow));
  } catch (err) {
    console.error('Update meal in provider collections error:', err);
    res.status(500).json({ message: 'Failed to update provider collections.' });
  }
});

apiRouter.put('/providers/:providerId/collections/:collectionId', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const { rows } = await getPool().query(
      'UPDATE collections SET name = $1, description = $2 WHERE id = $3 AND provider_id = $4 RETURNING *',
      [name, description || null, req.params.collectionId, req.params.providerId]
    );
    res.json(mapCollectionRow(rows[0]));
  } catch (err) {
    console.error('Update provider collection error:', err);
    res.status(500).json({ message: 'Failed to update provider collection.' });
  }
});

apiRouter.delete('/providers/:providerId/collections/:collectionId', requireAuth, async (req, res) => {
  try {
    await getPool().query('DELETE FROM collections WHERE id = $1 AND provider_id = $2', [
      req.params.collectionId,
      req.params.providerId,
    ]);
    res.status(204).send();
  } catch (err) {
    console.error('Delete provider collection error:', err);
    res.status(500).json({ message: 'Failed to delete provider collection.' });
  }
});

// =====================================================================
// INQUIRIES ROUTES
// =====================================================================

apiRouter.post('/inquiries', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { providerId, firstMessage } = req.body || {};
    const pool = getPool();
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.authUser!.id]);
    const now = new Date().toISOString();
    const id = `inq_${Date.now()}`;
    const messages = [{ id: `msg_${Date.now()}`, senderId: firstMessage.senderId, text: firstMessage.text, timestamp: now }];

    const { rows } = await pool.query(
      `INSERT INTO inquiries (id, provider_id, customer_id, customer_name, messages, last_message_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, providerId, req.authUser!.id, userRes.rows[0]?.name || 'Customer', JSON.stringify(messages), now]
    );
    res.status(201).json(mapInquiryRow(rows[0]));
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ message: 'Failed to create inquiry.' });
  }
});

apiRouter.post('/inquiries/:inquiryId/messages', requireAuth, async (req, res) => {
  try {
    const { senderId, text } = req.body || {};
    const pool = getPool();
    const cur = await pool.query('SELECT messages FROM inquiries WHERE id = $1', [req.params.inquiryId]);
    if (cur.rows.length === 0) {
      res.status(404).json({ message: 'Inquiry not found' });
      return;
    }
    const now = new Date().toISOString();
    const messages = cur.rows[0].messages || [];
    messages.push({ id: `msg_${Date.now()}`, senderId, text, timestamp: now });
    const { rows } = await pool.query(
      'UPDATE inquiries SET messages = $1, last_message_at = $2 WHERE id = $3 RETURNING *',
      [JSON.stringify(messages), now, req.params.inquiryId]
    );
    res.json(mapInquiryRow(rows[0]));
  } catch (err) {
    console.error('Add inquiry message error:', err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

apiRouter.post('/inquiries/:inquiryId/quote', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { amount, expiresAt } = req.body || {};
    const pool = getPool();
    const cur = await pool.query('SELECT messages FROM inquiries WHERE id = $1', [req.params.inquiryId]);
    if (cur.rows.length === 0) {
      res.status(404).json({ message: 'Inquiry not found' });
      return;
    }
    const now = new Date().toISOString();
    const messages = cur.rows[0].messages || [];
    messages.push({
      id: `msg_${Date.now()}`,
      senderId: req.authUser!.id,
      text: `Custom catering quote: ₹${amount}`,
      timestamp: now,
      messageType: 'quote',
      quote: { amount: Number(amount), expiresAt },
    });
    const { rows } = await pool.query(
      'UPDATE inquiries SET messages = $1, last_message_at = $2 WHERE id = $3 RETURNING *',
      [JSON.stringify(messages), now, req.params.inquiryId]
    );
    res.json(mapInquiryRow(rows[0]));
  } catch (err) {
    console.error('Send quote error:', err);
    res.status(500).json({ message: 'Failed to send quote.' });
  }
});

apiRouter.get('/inquiries/provider/:providerId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM inquiries WHERE provider_id = $1 ORDER BY last_message_at DESC', [
      req.params.providerId,
    ]);
    res.json(rows.map(mapInquiryRow));
  } catch (err) {
    console.error('Get provider inquiries error:', err);
    res.status(500).json({ message: 'Failed to load inquiries.' });
  }
});

apiRouter.get('/inquiries/customer/:customerId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM inquiries WHERE customer_id = $1 ORDER BY last_message_at DESC', [
      req.params.customerId,
    ]);
    res.json(rows.map(mapInquiryRow));
  } catch (err) {
    console.error('Get customer inquiries error:', err);
    res.status(500).json({ message: 'Failed to load inquiries.' });
  }
});

apiRouter.get('/inquiries/:inquiryId', requireAuth, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM inquiries WHERE id = $1', [req.params.inquiryId]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Inquiry not found' });
      return;
    }
    res.json(mapInquiryRow(rows[0]));
  } catch (err) {
    console.error('Get inquiry error:', err);
    res.status(500).json({ message: 'Failed to load inquiry.' });
  }
});

// =====================================================================
// SUPPORT TICKETS ROUTES
// =====================================================================

apiRouter.post('/support/tickets', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { subject, category, message } = req.body || {};
    const pool = getPool();
    const userRes = await pool.query('SELECT name, role FROM users WHERE id = $1', [req.authUser!.id]);
    const userName = userRes.rows[0]?.name || 'User';
    const userRole = userRes.rows[0]?.role || req.authUser!.role;
    const id = `tkt_${Date.now()}`;
    const now = new Date().toISOString();
    const messages = [{ id: `tmsg_${Date.now()}`, senderId: req.authUser!.id, senderName: userName, text: message, timestamp: now }];

    const { rows } = await pool.query(
      `INSERT INTO support_tickets (id, user_id, user_name, user_role, subject, category, status, created_at, updated_at, messages)
       VALUES ($1,$2,$3,$4,$5,$6,'OPEN',$7,$7,$8) RETURNING *`,
      [id, req.authUser!.id, userName, userRole, subject, category, now, JSON.stringify(messages)]
    );
    res.status(201).json(mapTicketRow(rows[0]));
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ message: 'Failed to create ticket.' });
  }
});

apiRouter.get('/support/tickets/user', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC', [
      req.authUser!.id,
    ]);
    res.json(rows.map(mapTicketRow));
  } catch (err) {
    console.error('Get user tickets error:', err);
    res.status(500).json({ message: 'Failed to load tickets.' });
  }
});

apiRouter.get('/support/tickets', requireAuth, requireSuperAdmin, async (_req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM support_tickets ORDER BY updated_at DESC');
    res.json(rows.map(mapTicketRow));
  } catch (err) {
    console.error('Get all tickets error:', err);
    res.status(500).json({ message: 'Failed to load tickets.' });
  }
});

apiRouter.post('/support/tickets/:ticketId/messages', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { text } = req.body || {};
    const pool = getPool();
    const cur = await pool.query('SELECT messages FROM support_tickets WHERE id = $1', [req.params.ticketId]);
    if (cur.rows.length === 0) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.authUser!.id]);
    const now = new Date().toISOString();
    const messages = cur.rows[0].messages || [];
    messages.push({
      id: `tmsg_${Date.now()}`,
      senderId: req.authUser!.id,
      senderName: userRes.rows[0]?.name || 'User',
      text,
      timestamp: now,
    });
    const { rows } = await pool.query(
      'UPDATE support_tickets SET messages = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [JSON.stringify(messages), now, req.params.ticketId]
    );
    res.json(mapTicketRow(rows[0]));
  } catch (err) {
    console.error('Add ticket message error:', err);
    res.status(500).json({ message: 'Failed to send reply.' });
  }
});

apiRouter.put('/support/tickets/:ticketId/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body || {};
    const { rows } = await getPool().query(
      'UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.ticketId]
    );
    res.json(mapTicketRow(rows[0]));
  } catch (err) {
    console.error('Update ticket status error:', err);
    res.status(500).json({ message: 'Failed to update ticket status.' });
  }
});

// =====================================================================
// SUPER ADMIN ROUTES
// =====================================================================

apiRouter.get('/admin/providers', requireAuth, requireSuperAdmin, async (_req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM providers ORDER BY join_date DESC');
    res.json(await hydrateProviders(rows));
  } catch (err) {
    console.error('Admin get providers error:', err);
    res.status(500).json({ message: 'Failed to load providers.' });
  }
});

apiRouter.get('/admin/kpis', requireAuth, requireSuperAdmin, async (_req, res) => {
  try {
    const pool = getPool();
    const [ordRes, provRes, custRes] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total_amount),0)::numeric AS rev, COUNT(*)::int AS cnt FROM orders'),
      pool.query('SELECT COUNT(*)::int AS cnt FROM providers'),
      pool.query("SELECT COUNT(*)::int AS cnt FROM users WHERE role = 'CUSTOMER'"),
    ]);
    res.json({
      totalRevenue: Number(ordRes.rows[0].rev),
      totalOrders: ordRes.rows[0].cnt,
      totalProviders: provRes.rows[0].cnt,
      totalCustomers: custRes.rows[0].cnt,
    });
  } catch (err) {
    console.error('Admin KPIs error:', err);
    res.status(500).json({ message: 'Failed to load KPIs.' });
  }
});

apiRouter.get('/admin/users', requireAuth, requireSuperAdmin, async (_req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM users ORDER BY join_date DESC');
    res.json(rows.map(mapUserRow));
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Failed to load users.' });
  }
});

apiRouter.put('/admin/providers/:providerId/approve', requireAuth, requireSuperAdmin, async (req, res) => {
  const pool = getPool();
  await pool.query('UPDATE providers SET is_setup_complete = TRUE WHERE id = $1', [req.params.providerId]);
  const { rows } = await pool.query('SELECT * FROM providers WHERE id = $1', [req.params.providerId]);
  res.json((await hydrateProviders(rows))[0]);
});

apiRouter.put('/admin/providers/:providerId/suspend', requireAuth, requireSuperAdmin, async (req, res) => {
  const pool = getPool();
  await pool.query('UPDATE providers SET is_suspended = TRUE WHERE id = $1', [req.params.providerId]);
  const { rows } = await pool.query('SELECT * FROM providers WHERE id = $1', [req.params.providerId]);
  res.json((await hydrateProviders(rows))[0]);
});

apiRouter.put('/admin/providers/:providerId/reactivate', requireAuth, requireSuperAdmin, async (req, res) => {
  const pool = getPool();
  await pool.query('UPDATE providers SET is_suspended = FALSE WHERE id = $1', [req.params.providerId]);
  const { rows } = await pool.query('SELECT * FROM providers WHERE id = $1', [req.params.providerId]);
  res.json((await hydrateProviders(rows))[0]);
});

apiRouter.get('/admin/invoices', requireAuth, requireSuperAdmin, async (_req, res) => {
  const { rows } = await getPool().query('SELECT * FROM invoices ORDER BY generated_date DESC');
  res.json(
    rows.map((r) => ({
      id: r.id,
      providerId: r.provider_id,
      providerName: r.provider_name,
      period: r.period,
      amount: Number(r.amount),
      status: r.status,
      aiSummaryNotes: r.ai_summary_notes,
      generatedDate: new Date(r.generated_date).toISOString(),
    }))
  );
});

apiRouter.post('/admin/invoices', requireAuth, requireSuperAdmin, async (req, res) => {
  const pool = getPool();
  const { providerId } = req.body || {};
  const provRes = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
  if (provRes.rows.length === 0) {
    res.status(404).json({ message: 'Provider not found' });
    return;
  }
  const prov = provRes.rows[0];
  const amount = Number(prov.subscription?.monthlyCost || 499);
  const period = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const id = `inv_${Date.now()}`;
  const { rows } = await pool.query(
    `INSERT INTO invoices (id, provider_id, provider_name, period, amount, status, ai_summary_notes)
     VALUES ($1,$2,$3,$4,$5,'SENT',$6) RETURNING *`,
    [id, providerId, prov.name, period, amount, `Monthly subscription billing for ${prov.subscription?.planName || 'Starter Plan'}.`]
  );
  const r = rows[0];
  res.status(201).json({
    id: r.id,
    providerId: r.provider_id,
    providerName: r.provider_name,
    period: r.period,
    amount: Number(r.amount),
    status: r.status,
    aiSummaryNotes: r.ai_summary_notes,
    generatedDate: new Date(r.generated_date).toISOString(),
  });
});

apiRouter.get('/admin/reviews/flagged', requireAuth, requireSuperAdmin, async (_req, res) => {
  const { rows } = await getPool().query(
    `SELECT r.*, p.name AS provider_name FROM reviews r JOIN providers p ON r.provider_id = p.id WHERE r.is_flagged = TRUE`
  );
  res.json(
    rows.map((r) => ({
      review: mapReviewRow(r),
      providerId: r.provider_id,
      providerName: r.provider_name,
    }))
  );
});

apiRouter.put('/admin/reviews/resolve', requireAuth, requireSuperAdmin, async (req, res) => {
  const { reviewId, action } = req.body || {};
  const pool = getPool();
  if (action === 'delete') {
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
  } else {
    await pool.query('UPDATE reviews SET is_flagged = FALSE WHERE id = $1', [reviewId]);
  }
  res.status(204).send();
});

apiRouter.get('/admin/providers/at-risk', requireAuth, requireSuperAdmin, async (_req, res) => {
  const { rows } = await getPool().query('SELECT * FROM providers WHERE rating < 4.5 OR is_suspended = TRUE');
  const hydrated = await hydrateProviders(rows);
  res.json(
    hydrated.map((p) => ({
      provider: p,
      reason: p.rating < 4.5 ? 'Low Average Rating' : 'Account Flagged',
      metric: `${p.rating} ★`,
    }))
  );
});

apiRouter.get('/admin/disputes/open', requireAuth, requireSuperAdmin, async (_req, res) => {
  const { rows } = await getPool().query(
    `SELECT o.*, p.name AS provider_name FROM orders o JOIN providers p ON o.provider_id = p.id WHERE o.dispute->>'status' = 'OPEN'`
  );
  res.json(
    rows.map((r) => ({
      order: mapOrderRow(r),
      providerName: r.provider_name,
    }))
  );
});

apiRouter.put('/admin/disputes/:orderId/resolve', requireAuth, requireSuperAdmin, async (req, res) => {
  const pool = getPool();
  const cur = await pool.query('SELECT dispute FROM orders WHERE id = $1', [req.params.orderId]);
  if (cur.rows.length === 0) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  const dispute = { ...(cur.rows[0].dispute || {}), status: 'RESOLVED' };
  const { rows } = await pool.query('UPDATE orders SET dispute = $1 WHERE id = $2 RETURNING *', [
    JSON.stringify(dispute),
    req.params.orderId,
  ]);
  res.json(mapOrderRow(rows[0]));
});

apiRouter.post('/admin/compensate', requireAuth, requireSuperAdmin, async (req, res) => {
  const { orderId, customerId, discountPercentage, expiresAt } = req.body || {};
  const pool = getPool();
  const ordRes = await pool.query('SELECT provider_id FROM orders WHERE id = $1', [orderId]);
  const providerId = ordRes.rows[0]?.provider_id || 'p1';
  const id = `cpn_comp_${Date.now()}`;
  const code = `CARE${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const { rows } = await pool.query(
    `INSERT INTO coupons (id, provider_id, code, discount_percentage, expires_at, is_active, is_single_use, claimed_by_user_id, funded_by, linked_dispute_id)
     VALUES ($1,$2,$3,$4,$5,TRUE,TRUE,$6,'PLATFORM',$7) RETURNING *`,
    [id, providerId, code, Number(discountPercentage), expiresAt, customerId, orderId]
  );
  await pool.query('INSERT INTO notifications (id, user_id, message) VALUES ($1,$2,$3)', [
    `notif_${Date.now()}`,
    customerId,
    `Compensation coupon issued for your order: use ${code} for ${discountPercentage}% off!`,
  ]);
  res.status(201).json(mapCouponRow(rows[0]));
});
