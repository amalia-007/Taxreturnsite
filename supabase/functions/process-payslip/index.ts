import { createClient } from 'jsr:@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

const OCR_PROMPT = `Extract the following from this Australian payslip and return ONLY valid JSON with no extra text or markdown:
{
  "employer_name": string,
  "pay_period_start": "YYYY-MM-DD",
  "pay_period_end": "YYYY-MM-DD",
  "gross_income": number,
  "tax_withheld": number,
  "super": number,
  "net_pay": number,
  "ytd_gross": number or null,
  "ytd_tax_withheld": number or null
}
If any field is missing or unreadable, use null. Do not guess values.
IMPORTANT: Only extract data you can clearly read. If this does not appear to be a payslip, return {"error": "not_a_payslip"}.`

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg'])
const OCR_TIMEOUT_MS = 25_000

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'png') return 'image/png'
  return 'image/jpeg'
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const body = await req.json()
    const { path } = body
    if (!path || typeof path !== 'string') return json({ error: 'Missing path' }, 400)

    // Ensure file belongs to this user
    if (!path.startsWith(user.id + '/')) return json({ error: 'Forbidden' }, 403)

    // Validate file extension
    const ext = path.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return json({ error: 'Unsupported file type. Upload PDF, JPG, or PNG.' }, 400)
    }

    // Download from Supabase Storage
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from('payslips')
      .download(path)

    if (dlErr) {
      console.error('Storage download error:', dlErr)
      return json({ error: 'Could not retrieve file. It may have been deleted.' }, 404)
    }
    if (!blob) return json({ error: 'File not found' }, 404)

    const buffer = await blob.arrayBuffer()
    const bytes  = new Uint8Array(buffer)
    const mimeType = mimeFromPath(path)

    // Size guard: 5 MB for images, 32 MB for PDFs
    const maxBytes = mimeType === 'application/pdf' ? 32 * 1024 * 1024 : 5 * 1024 * 1024
    if (bytes.length > maxBytes) {
      return json({
        error: `File too large (max ${mimeType === 'application/pdf' ? '32 MB' : '5 MB'}). Please compress or crop the image and try again.`,
      }, 400)
    }

    // Zero-byte guard
    if (bytes.length === 0) {
      return json({ error: 'The uploaded file appears to be empty or corrupted.' }, 400)
    }

    const base64Data = encodeBase64(bytes)
    const isPdf = mimeType === 'application/pdf'

    const contentItem = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }
      : { type: 'image',    source: { type: 'base64', media_type: mimeType,           data: base64Data } }

    const claudeHeaders: Record<string, string> = {
      'x-api-key':          ANTHROPIC_API_KEY,
      'anthropic-version':  '2023-06-01',
      'content-type':       'application/json',
    }
    if (isPdf) claudeHeaders['anthropic-beta'] = 'pdfs-2024-09-25'

    // Race the Claude call against a timeout so we can surface a clear error
    const claudeRes = await Promise.race([
      fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: claudeHeaders,
        body: JSON.stringify({
          model:      'claude-sonnet-4-6',
          max_tokens: 1024,
          messages:   [{ role: 'user', content: [contentItem, { type: 'text', text: OCR_PROMPT }] }],
        }),
      }),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('OCR_TIMEOUT')), OCR_TIMEOUT_MS)
      ),
    ]).catch((err: Error) => {
      if (err.message === 'OCR_TIMEOUT') throw err
      throw err
    })

    if (!claudeRes.ok) {
      const errText = await claudeRes.text()
      console.error('Claude API error:', claudeRes.status, errText)
      return json({
        error: 'AI extraction service is temporarily unavailable. Enter values manually.',
        fallback: true,
      }, 502)
    }

    const claudeBody = await claudeRes.json()
    const rawText = claudeBody.content?.[0]?.text ?? ''

    let extracted: Record<string, unknown>
    try {
      const clean = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim()
      extracted = JSON.parse(clean)
    } catch {
      console.error('Claude output not valid JSON:', rawText)
      return json({
        error: 'AI could not read this file. Please enter values manually.',
        fallback: true,
      }, 422)
    }

    // Detected non-payslip
    if ((extracted as { error?: string }).error === 'not_a_payslip') {
      return json({
        error: 'This file does not appear to be a payslip. Please upload a valid payslip for the 2024–25 financial year.',
        fallback: true,
      }, 422)
    }

    return json({ data: extracted })
  } catch (err) {
    const isTimeout = err instanceof Error && err.message === 'OCR_TIMEOUT'
    if (isTimeout) {
      console.error('process-payslip: Claude OCR timed out')
      return json({
        error: 'AI extraction timed out. Please enter your payslip values manually.',
        fallback: true,
      }, 504)
    }
    console.error('process-payslip error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
