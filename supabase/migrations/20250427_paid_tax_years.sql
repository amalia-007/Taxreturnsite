-- Add paid_tax_years to track which financial years a user has purchased access for.
-- Each entry is a string like '2024-2025'. The stripe-webhook function appends to this
-- array when a checkout.session.completed event is received.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS paid_tax_years text[] DEFAULT '{}';
