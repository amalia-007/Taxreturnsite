const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('[checkout] STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not set in environment variables.' });
  }
  if (!secretKey.startsWith('sk_')) {
    console.error('[checkout] STRIPE_SECRET_KEY format invalid:', secretKey.slice(0, 8));
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY format is invalid (must start with sk_).' });
  }

  const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://getmytax.vercel.app';

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          unit_amount: 4599,
          product_data: {
            name: 'GET MY TAX — 2024-25 Access',
            description: 'One-time access: instant refund estimate, AI payslip reading, ATO lodgement guide.',
          },
        },
        quantity: 1,
      }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}?paid=true`,
      cancel_url:  siteUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe error:', err.type, err.message);
    // Return the real Stripe error so it's visible in the browser
    return res.status(500).json({
      error: err.message || 'Could not create checkout session. Please try again.',
      type:  err.type  || 'unknown',
    });
  }
};
