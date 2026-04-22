import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)

async function sendReceiptEmail(email: string, amountAud: string, receiptUrl: string | null) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-payment-receipt`, {
      method: 'POST',
      headers: {
        // Use service key so the function accepts the call without a user JWT
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, amountAud, receiptUrl }),
    })
  } catch (err) {
    // Non-fatal — log and continue so Stripe gets its 200
    console.warn('Receipt email failed (non-fatal):', err)
  }
}

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

    const userId     = session.client_reference_id
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null

    if (!userId) {
      console.error('No client_reference_id on session:', session.id)
      return new Response('ok', { status: 200 })
    }

    // Update profile
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ has_paid: true, stripe_customer_id: customerId })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile:', error)
      return new Response('DB update failed', { status: 500 })
    }

    console.log('Payment confirmed for user:', userId)

    // Send receipt email (best-effort — failures don't affect webhook response)
    const customerEmail = session.customer_details?.email ?? null
    if (customerEmail) {
      const amountTotal  = session.amount_total ?? 1900
      const amountAud    = (amountTotal / 100).toFixed(2)
      const receiptUrl   = session.payment_intent
        ? null // receipt URL comes from payment_intent; Stripe sends it separately
        : null
      await sendReceiptEmail(customerEmail, amountAud, receiptUrl)
    }
  }

  return new Response('ok', { status: 200 })
})
