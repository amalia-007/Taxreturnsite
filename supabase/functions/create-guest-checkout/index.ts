import Stripe from 'npm:stripe@14'

const stripe   = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:8080'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          unit_amount: 4000,
          product_data: {
            name: 'Tax Estimator Access — 2024-25',
            description: 'One-time lifetime access to the GET MY TAX estimator.',
          },
        },
        quantity: 1,
      }],
      success_url: `${SITE_URL}?paid=true`,
      cancel_url:  `${SITE_URL}`,
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('create-guest-checkout error:', err)
    return json({ error: 'Could not create checkout session. Please try again.' }, 500)
  }
})
