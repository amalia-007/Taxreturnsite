const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

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
    const { job } = await req.json()
    if (!job || typeof job !== 'string' || job.trim().length === 0) {
      return json({ error: 'Missing job field' }, 400)
    }

    const prompt = `List the most common ATO-accepted tax deductions for a ${job.trim()} working in Australia. Return a JSON array:
[
  {"category": string, "description": string, "typical_range_aud": string}
]
Only include deductions explicitly allowed by the ATO. Max 8 items. Return ONLY valid JSON with no extra text or markdown.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1024,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Claude API error:', res.status, errText)
      return json({ error: 'AI service unavailable' }, 502)
    }

    const body    = await res.json()
    const rawText = body.content?.[0]?.text ?? ''
    const clean   = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim()

    let deductions: unknown[]
    try {
      deductions = JSON.parse(clean)
      if (!Array.isArray(deductions)) throw new Error('Not an array')
    } catch {
      console.error('Claude output not valid JSON array:', rawText)
      return json({ error: 'Unexpected AI response format' }, 422)
    }

    return json({ deductions })
  } catch (err) {
    console.error('suggest-deductions error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
