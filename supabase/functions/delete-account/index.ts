import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

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
    // Verify caller identity
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!jwt) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(jwt)
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const userId = user.id

    // 1. List all storage files for this user and delete them
    const { data: storageList, error: listErr } = await supabaseAdmin.storage
      .from('payslips')
      .list(userId)

    if (!listErr && storageList && storageList.length > 0) {
      const paths = storageList.map(f => `${userId}/${f.name}`)
      const { error: rmErr } = await supabaseAdmin.storage
        .from('payslips')
        .remove(paths)
      if (rmErr) console.warn('Storage removal partial error:', rmErr)
    }

    // 2. Delete payslip DB records (profile will be deleted by cascade when auth user is deleted)
    const { error: payslipErr } = await supabaseAdmin
      .from('payslips')
      .delete()
      .eq('user_id', userId)
    if (payslipErr) console.warn('Payslips delete error:', payslipErr)

    // 3. Delete the auth user — this cascades to profiles via foreign key
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteErr) {
      console.error('Auth user delete error:', deleteErr)
      return json({ error: 'Failed to delete account: ' + deleteErr.message }, 500)
    }

    console.log('Account deleted for user:', userId)
    return json({ ok: true })
  } catch (err) {
    console.error('delete-account error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
