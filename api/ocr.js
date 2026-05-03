// Vercel serverless function — analyses a payslip with Claude vision and extracts
// income and tax data.
// Env var required: ANTHROPIC_API_KEY

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Anthropic API not configured' });

  const { base64, mediaType } = req.body || {};
  if (!base64 || !mediaType) return res.status(400).json({ error: 'Missing base64 or mediaType' });

  const isPdf = mediaType === 'application/pdf';

  const contentBlock = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image',    source: { type: 'base64', media_type: mediaType, data: base64 } };

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            contentBlock,
            {
              type: 'text',
              text: 'This is an Australian payslip. Extract exactly five values:\n1. gross_income — gross earnings for this pay period\n2. tax_withheld — PAYG withholding tax deducted this period\n3. super — employer superannuation contribution this period\n4. ytd_gross — year-to-date gross earnings (0 if not shown)\n5. ytd_tax_withheld — year-to-date PAYG tax withheld (0 if not shown)\n\nReturn ONLY valid JSON with those five keys, values as plain numbers (no $ or commas). Use 0 if a value is not present.',
            },
          ],
        }],
      }),
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || 'Claude API error');

    const text  = (data.content?.[0]?.text || '').trim();
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('Could not parse JSON from response');

    const extracted = JSON.parse(match[0]);
    return res.status(200).json({
      gross_income:     Number(extracted.gross_income)     || 0,
      tax_withheld:     Number(extracted.tax_withheld)     || 0,
      super:            Number(extracted.super)            || 0,
      ytd_gross:        Number(extracted.ytd_gross)        || 0,
      ytd_tax_withheld: Number(extracted.ytd_tax_withheld) || 0,
    });
  } catch (err) {
    console.error('ocr error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyse payslip' });
  }
};
