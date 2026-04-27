// Vercel serverless function — analyses a payslip with Claude and extracts
// gross salary, PAYG tax withheld, and superannuation.
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
  if (!base64 || !mediaType)  return res.status(400).json({ error: 'Missing base64 or mediaType' });

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
        model:      'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            contentBlock,
            {
              type: 'text',
              text: 'This is an Australian payslip. Extract exactly three values:\n1. gross_salary — total gross earnings before tax (sum for the period shown)\n2. tax_withheld — PAYG withholding tax deducted\n3. superannuation — employer super contributions\n\nReturn ONLY valid JSON with those three keys, values as plain numbers (no $ or commas). Use 0 if a value is not present.',
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
      gross_salary:   Number(extracted.gross_salary)   || 0,
      tax_withheld:   Number(extracted.tax_withheld)   || 0,
      superannuation: Number(extracted.superannuation) || 0,
    });
  } catch (err) {
    console.error('analyze-payslip error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyse payslip' });
  }
};
