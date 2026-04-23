-- =============================================================
-- GET MY TAX — Initial Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- =============================================================

-- ── 1. Tables ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id                uuid primary key references auth.users on delete cascade,
  email             text,
  has_paid          boolean default false,
  stripe_customer_id text,
  created_at        timestamp with time zone default now()
);

create table if not exists public.tax_returns (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.profiles(id) on delete cascade,
  tax_year          text default '2024-2025',
  gross_income      numeric,
  tax_withheld      numeric,
  super_paid        numeric,
  deductions        jsonb,
  residency_status  text,
  has_help_debt     boolean,
  calculated_refund numeric,
  payslips_data     jsonb,
  created_at        timestamp with time zone default now()
);

create table if not exists public.payslips (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade,
  tax_return_id    uuid references public.tax_returns(id) on delete set null,
  file_url         text,
  extracted_data   jsonb,
  created_at       timestamp with time zone default now()
);

-- ── 2. Auto-create profile on signup ───────────────────────────────────────
-- Fires immediately when a user signs up (before email confirmation).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 3. Row Level Security ───────────────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.tax_returns enable row level security;
alter table public.payslips    enable row level security;

-- profiles: insert handled by trigger; users read/update their own row only
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- tax_returns: full CRUD on own rows
create policy "tax_returns: select own"
  on public.tax_returns for select
  using (auth.uid() = user_id);

create policy "tax_returns: insert own"
  on public.tax_returns for insert
  with check (auth.uid() = user_id);

create policy "tax_returns: update own"
  on public.tax_returns for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tax_returns: delete own"
  on public.tax_returns for delete
  using (auth.uid() = user_id);

-- payslips: full CRUD on own rows
create policy "payslips: select own"
  on public.payslips for select
  using (auth.uid() = user_id);

create policy "payslips: insert own"
  on public.payslips for insert
  with check (auth.uid() = user_id);

create policy "payslips: update own"
  on public.payslips for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "payslips: delete own"
  on public.payslips for delete
  using (auth.uid() = user_id);

-- ── 4. Storage bucket (run after creating bucket in Dashboard) ─────────────
-- Create a private bucket named "payslips" in Storage → New bucket first,
-- then uncomment and run:

-- create policy "payslips storage: upload own"
--   on storage.objects for insert
--   with check (bucket_id = 'payslips' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- create policy "payslips storage: read own"
--   on storage.objects for select
--   using (bucket_id = 'payslips' and auth.uid()::text = (storage.foldername(name))[1]);
