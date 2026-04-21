import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('Missing stripe-signature', { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.client_reference_id
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null

    if (!userId) {
      console.error('No client_reference_id on session:', session.id)
      return new Response('ok', { status: 200 })
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ has_paid: true, stripe_customer_id: customerId })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile:', error)
      return new Response('DB update failed', { status: 500 })
    }

    console.log('Payment confirmed for user:', userId)
  }

  return new Response('ok', { status: 200 })
})
