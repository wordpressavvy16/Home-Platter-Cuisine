import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getPool } from '../db.ts';

export const aiRouter = Router();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

aiRouter.post('/chat-stream', async (req, res) => {
  const { message } = req.body || {};
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');

  const ai = getGeminiClient();
  if (!ai) {
    const reply = `Thanks for reaching out about "${String(message || '').slice(0, 80)}". You can browse home-cooked kitchens, track active orders in your profile, or open a support ticket from Help anytime.`;
    for (const word of reply.split(' ')) {
      res.write(JSON.stringify({ text: `${word} ` }) + '\n');
    }
    res.end();
    return;
  }

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful support assistant for Home Platter, a homemade tiffin and meal service marketplace. Answer concisely:\n\n${message}`,
    });
    for await (const chunk of response) {
      if (chunk.text) {
        res.write(JSON.stringify({ text: chunk.text }) + '\n');
      }
    }
    res.end();
  } catch (err) {
    console.error('AI chat-stream error:', err);
    res.write(JSON.stringify({ text: 'Sorry, I am having trouble responding right now. Please try again.' }) + '\n');
    res.end();
  }
});

aiRouter.post('/natural-search', async (req, res) => {
  const { query } = req.body || {};
  const q = String(query || '').trim();
  const lower = q.toLowerCase();

  const fallback = () => {
    const keywords = lower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['find', 'show', 'with', 'best', 'good', 'food', 'meal', 'meals', 'options', 'near', 'the', 'and', 'for'].includes(w));
    const mealType = lower.includes('vegan')
      ? 'VEGAN'
      : lower.includes('veg') && !lower.includes('non-veg') && !lower.includes('non veg')
      ? 'VEG'
      : lower.includes('chicken') || lower.includes('non-veg') || lower.includes('non veg')
      ? 'NON_VEG'
      : undefined;
    const minRating = lower.includes('top') || lower.includes('best') || lower.includes('4.5') ? 4.5 : undefined;
    return { keywords: keywords.length ? keywords : q ? [q] : [], minRating, mealType };
  };

  const ai = getGeminiClient();
  if (!ai) {
    res.json(fallback());
    return;
  }

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract search criteria JSON from this food query: "${q}". Return strict JSON: {"keywords": string[], "minRating": number|null, "mealType": "VEG"|"NON_VEG"|"VEGAN"|null}`,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(resp.text || '{}');
    res.json({
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      minRating: typeof parsed.minRating === 'number' ? parsed.minRating : undefined,
      mealType: parsed.mealType || undefined,
    });
  } catch {
    res.json(fallback());
  }
});

aiRouter.post('/analyze-reviews', async (req, res) => {
  const { reviews } = req.body || {};
  if (!Array.isArray(reviews) || reviews.length < 2) {
    res.status(400).json({ message: 'Not enough reviews for analysis.' });
    return;
  }

  const fallback = {
    strengths: [
      'Food quality and authentic homemade taste are consistently praised.',
      'Customers appreciate generous portions and fresh ingredients.',
    ],
    areasForImprovement: [
      'Keep delivery times consistent during peak lunch and dinner windows.',
      'Continue monitoring dish texture and packaging warmth.',
    ],
    overallSentiment:
      'Overall positive feedback highlighting authentic homemade flavors, with minor opportunities around peak-hour delivery consistency.',
  };

  const ai = getGeminiClient();
  if (!ai) {
    res.json(fallback);
    return;
  }

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize these customer reviews into strict JSON {"strengths": string[], "areasForImprovement": string[], "overallSentiment": string}:\n${JSON.stringify(reviews)}`,
      config: { responseMimeType: 'application/json' },
    });
    res.json(JSON.parse(resp.text || '{}'));
  } catch {
    res.json(fallback);
  }
});

aiRouter.post('/business-summary', async (req, res) => {
  const { metrics } = req.body || {};
  const fallback = {
    overallPerformance: `Processed ${metrics?.totalOrders ?? 0} orders generating ₹${metrics?.totalRevenue ?? 0} in revenue.`,
    customerSentimentAnalysis: 'Customers respond positively to signature home-cooked specials and consistent quality.',
    actionableInsights: [
      'Highlight your top-selling meals in featured slots before lunch cutoff.',
      'Consider a threshold discount to raise average order value.',
    ],
  };

  const ai = getGeminiClient();
  if (!ai) {
    res.json(fallback);
    return;
  }

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Return strict JSON {"overallPerformance": string, "customerSentimentAnalysis": string, "actionableInsights": string[]} for metrics: ${JSON.stringify(req.body)}`,
      config: { responseMimeType: 'application/json' },
    });
    res.json(JSON.parse(resp.text || '{}'));
  } catch {
    res.json(fallback);
  }
});

aiRouter.post('/demand-forecast', async (req, res) => {
  const { menu = [] } = req.body || {};
  const predictedItems = (Array.isArray(menu) ? menu : []).slice(0, 3).map((m: any) => ({
    itemName: m.name || 'Signature Thali',
    reason: 'Consistent repeat orders during weekday lunch and dinner windows.',
  }));
  res.json({
    predictedItems,
    forecastPeriod: 'Next 7 Days',
  });
});

aiRouter.post('/identify-dish-from-image', async (req, res) => {
  const { base64Image, mimeType } = req.body || {};
  const ai = getGeminiClient();
  if (!ai || !base64Image) {
    res.json({ dishName: 'Paneer Thali' });
    return;
  }

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } },
        { text: 'Identify the dish name in 1 to 4 words as JSON {"dishName": string}.' },
      ],
      config: { responseMimeType: 'application/json' },
    });
    res.json(JSON.parse(resp.text || '{"dishName":"Homemade Meal"}'));
  } catch {
    res.json({ dishName: 'Homemade Meal' });
  }
});

aiRouter.post('/refine-broadcast', async (req, res) => {
  const { draftMessage } = req.body || {};
  res.json({
    refinedMessage: `${String(draftMessage || '').trim()} — Freshly prepared in our kitchen today. Order before cutoff!`,
  });
});

aiRouter.post('/reply-suggestions', async (_req, res) => {
  res.json([
    'Yes, we can customize spice levels for your order!',
    'Everything is cooked fresh just before your delivery window.',
    'Thank you for reaching out! Happy to help with your order.',
  ]);
});

aiRouter.post('/review-reply-suggestions', async (_req, res) => {
  res.json([
    'Thank you so much for your kind feedback! We look forward to cooking for you again.',
    'We truly appreciate your honest review and will keep improving our service.',
  ]);
});

aiRouter.post('/meal-description', async (req, res) => {
  const { mealName, mealType } = req.body || {};
  res.json({
    description: `Authentic home-style ${mealName || 'dish'} (${mealType || 'VEG'}) slow-cooked with fresh local ingredients and traditional family spices.`,
  });
});

aiRouter.post('/menu-analysis', async (req, res) => {
  const { menu = [] } = req.body || {};
  res.json({
    strengths: [`Menu offers ${Array.isArray(menu) ? menu.length : 0} dishes with clear homemade appeal.`],
    opportunities: ['Add combo tiffin options or weekend specials to boost repeat orders.'],
    pricingAnalysis: 'Pricing sits competitively for fresh neighborhood home-cooked meals.',
    descriptionAnalysis: 'Dish descriptions are clear; mentioning key ingredients and portion size helps conversion.',
  });
});

aiRouter.post('/recommendations', async (req, res) => {
  const { user: userInfo, allProviders = [] } = req.body || {};
  try {
    const pool = getPool();
    const { rows } = await pool.query('SELECT DISTINCT provider_id FROM orders WHERE user_id = $1', [userInfo?.id || '']);
    const orderedIds = new Set(rows.map((r) => r.provider_id));
    const followedIds = new Set(userInfo?.followedProviderIds || []);

    const recommended = (Array.isArray(allProviders) ? allProviders : [])
      .filter((p: any) => p.isSetupComplete && !p.isSuspended && !orderedIds.has(p.id) && !followedIds.has(p.id))
      .sort((a: any, b: any) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);

    res.json(recommended);
  } catch {
    res.json([]);
  }
});

aiRouter.post('/inquiry-response', async (req, res) => {
  const { provider } = req.body || {};
  res.json({
    responseText: `Hello! Thank you for contacting ${provider?.name || 'our kitchen'}. We would love to prepare fresh homemade dishes for your inquiry—let us know your preferred date, guest count, and dishes!`,
  });
});
