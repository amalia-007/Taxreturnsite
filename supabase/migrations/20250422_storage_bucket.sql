-- =============================================================
-- GET MY TAX — Storage bucket for payslip uploads
-- Run in: Supabase Dashboard → SQL Editor → Run
-- =============================================================

-- Create the private payslips bucket (50 MB per file, PDF + images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payslips',
  'payslips',
  false,
  52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
on conflict (id) do nothing;

-- ── Storage RLS policies ──────────────────────────────────────────────────────
-- Each user can only upload/read/delete files inside their own folder
-- Path format: {user_id}/{timestamp}-{filename}

create policy "payslips storage: upload own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payslips'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "payslips storage: read own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payslips'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "payslips storage: delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'payslips'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
