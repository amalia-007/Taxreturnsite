'use strict';

// ── URL helpers ────────────────────────────────────────────────────────────
// Works for both localhost and GitHub Pages subdirectory deployment.

function siteUrl(path) {
  const base = window.location.pathname.replace(/\/(auth|app)(\/.*)?$/, '');
  return window.location.origin + base + path;
}

// ── Session helpers ────────────────────────────────────────────────────────

async function getSession() {
  const { data: { session } } = await window.sb.auth.getSession();
  return session;
}

async function getProfile(userId) {
  const { data, error } = await window.sb.from('profiles')
    .select('has_paid, email, stripe_customer_id')
    .eq('id', userId)
    .single();
  if (error) console.error('getProfile error:', error);
  return data;
}

// ── Route guards ───────────────────────────────────────────────────────────

// Requires a valid session. Redirects to login otherwise.
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.replace(siteUrl('/auth/login.html'));
    return null;
  }
  return session;
}

// Requires a valid session AND has_paid = true. Redirects accordingly.
async function requirePaid() {
  const session = await requireAuth();
  if (!session) return null;
  const profile = await getProfile(session.user.id);
  if (!profile?.has_paid) {
    window.location.replace(siteUrl('/app/payment.html'));
    return null;
  }
  return { session, profile };
}

// ── Auth actions ───────────────────────────────────────────────────────────

async function signOut() {
  await window.sb.auth.signOut();
  window.location.replace(siteUrl('/auth/login.html'));
}

// Expose globally for inline onclick handlers
window.signOut = signOut;
