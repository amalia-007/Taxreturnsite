import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:8080'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
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
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, has_paid')
      .eq('id', user.id)
      .single()

    if (profile?.has_paid) return json({ error: 'Already paid' }, 400)

    // Create or reuse Stripe customer
    let customerId = profile?.stripe_customer_id ?? null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
      client_reference_id: user.id,
      success_url: `${SITE_URL}/app/dashboard.html?payment=success`,
      cancel_url: `${SITE_URL}/app/payment.html`,
    })

    return json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
