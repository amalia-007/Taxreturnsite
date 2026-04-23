const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'GET MY TAX <noreply@getmytax.com.au>'
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://amalia-007.github.io/Taxreturnsite'

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
    const { email } = await req.json()
    if (!email || typeof email !== 'string') return json({ error: 'Missing email' }, 400)

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#00A86B;padding:28px 32px;">
      <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">GET MY TAX</span>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Welcome! Your account is ready.</h1>
      <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
        Thanks for signing up. You're one step away from your 2024–25 tax estimate.
      </p>
      <a href="${SITE_URL}/app/payment.html"
        style="display:inline-block;background:#00A86B;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
        Get started →
      </a>
      <hr style="margin:28px 0;border:none;border-top:1px solid #f3f4f6;" />
      <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;"><strong style="color:#374151;">Important reminder:</strong></p>
      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
        GET MY TAX provides <strong>estimates only</strong>. We are not a registered tax agent.
        You must lodge your tax return yourself via ATO myTax or through a registered tax agent.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        © 2025 GET MY TAX ·
        <a href="${SITE_URL}/legal/privacy.html" style="color:#9ca3af;">Privacy</a> ·
        <a href="${SITE_URL}/legal/terms.html" style="color:#9ca3af;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: 'Welcome to GET MY TAX — your account is ready',
        html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Resend error:', res.status, errText)
      return json({ error: 'Email delivery failed' }, 502)
    }

    return json({ ok: true })
  } catch (err) {
    console.error('send-welcome-email error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
