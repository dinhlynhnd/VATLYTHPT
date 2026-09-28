-- VATLYTHPT GitHub/Vercel + Windows Processor V2
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor → Run.
create extension if not exists pgcrypto;

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(), lesson_id text not null, lesson_title text,
  grade int, chapter int, lesson_number int, original_name text not null, mime_type text,
  size_bytes bigint default 0, storage_path text not null, status text default 'uploading',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.processing_jobs (
  id uuid primary key default gen_random_uuid(), source_id uuid references public.source_documents(id) on delete cascade,
  lesson_id text not null, lesson_title text, grade int, chapter int, lesson_number int,
  status text not null default 'uploading', stage text default 'upload', stage_label text,
  progress int default 0 check(progress between 0 and 100), message text, options jsonb default '{}'::jsonb,
  requested_publish_path text, worker_name text, claimed_at timestamptz,
  report jsonb default '{}'::jsonb, issues jsonb default '[]'::jsonb,
  review_count int default 0, blocking_issues int default 0,
  preview_path text, preview_url text, result_json_path text, pdf_path text,
  published boolean default false, publish_url text, storage_url text, error_detail text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.review_items (
  id uuid primary key default gen_random_uuid(), job_id uuid references public.processing_jobs(id) on delete cascade,
  severity text default 'warning', type text, category text, message text not null, source_ref text,
  preview_url text, sort_order int default 0, resolved boolean default false, resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.lessons (
  lesson_id text primary key, title text not null, grade int, chapter int, lesson_number int,
  published boolean default false, publish_url text, storage_url text, preview_url text,
  current_job_id uuid, updated_at timestamptz not null default now()
);
create table if not exists public.processor_workers (
  worker_name text primary key, host_name text, version text, current_job_id uuid,
  note text, last_seen_at timestamptz not null default now()
);
create index if not exists idx_jobs_status_created on public.processing_jobs(status,created_at);
create index if not exists idx_jobs_lesson on public.processing_jobs(lesson_id,created_at desc);
create index if not exists idx_review_job on public.review_items(job_id,resolved);

-- Không cấp quyền trực tiếp từ browser. Vercel Functions dùng service-role key.
alter table public.source_documents enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.review_items enable row level security;
alter table public.lessons enable row level security;
alter table public.processor_workers enable row level security;

-- Storage buckets: originals private; lesson-public chỉ đọc công khai.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('lesson-originals','lesson-originals',false,104857600,null)
on conflict (id) do update set public=false,file_size_limit=104857600,allowed_mime_types=null;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('lesson-public','lesson-public',true,157286400,null)
on conflict (id) do update set public=true,file_size_limit=157286400,allowed_mime_types=null;

-- Public chỉ được SELECT object trong bucket lesson-public. Không cho upload trực tiếp.
drop policy if exists "vatly public lesson read" on storage.objects;
create policy "vatly public lesson read" on storage.objects for select to public using (bucket_id='lesson-public');
