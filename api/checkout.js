// Vercel serverless function — creates a Stripe Checkout session
// Env vars required: STRIPE_SECRET_KEY
// Optional:         STRIPE_PRICE_ID  (if set, uses a pre-created Stripe Price; otherwise uses price_data)
//                   SITE_URL         (e.g. https://getmytax.vercel.app)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe not configured' });

  const siteUrl = process.env.SITE_URL ||
    `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  const priceId = process.env.STRIPE_PRICE_ID;
  const lineItem = priceId
    ? new URLSearchParams({
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
      })
    : new URLSearchParams({
        'line_items[0][price_data][currency]': 'aud',
        'line_items[0][price_data][unit_amount]': '4599',
        'line_items[0][price_data][product_data][name]': 'Tax Estimator Access — 2024-25',
        'line_items[0][price_data][product_data][description]':
          'One-time lifetime access. All features, no subscription.',
        'line_items[0][quantity]': '1',
      });

  const body = new URLSearchParams({
    mode: 'payment',
    'payment_method_types[0]': 'card',
    success_url: siteUrl + '?paid=true',
    cancel_url: siteUrl,
  });

  lineItem.forEach((v, k) => body.append(k, v));

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data.error?.message || 'Checkout failed' });
    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error('checkout error:', err);
    return res.status(500).json({ error: 'Could not create checkout session. Please try again.' });
  }
};
