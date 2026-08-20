-- ============================================================
-- DEVPATH AI — Catalog Core, Content States, Competencies & Audit
-- Migration: 20260106000000_catalog_and_content_core.sql
-- ============================================================

-- 1. Content State Definition on Courses and Videos
-- States: descoberto, em_analise, aprovado, publicado, pausado, indisponivel, rejeitado
alter table public.courses add column if not exists content_state text not null default 'publicado'
  check (content_state in ('descoberto', 'em_analise', 'aprovado', 'publicado', 'pausado', 'indisponivel', 'rejeitado'));

alter table public.youtube_videos add column if not exists content_state text not null default 'publicado'
  check (content_state in ('descoberto', 'em_analise', 'aprovado', 'publicado', 'pausado', 'indisponivel', 'rejeitado'));

alter table public.courses add column if not exists canonical_url text;
alter table public.courses add column if not exists discovered_at timestamptz default now();
alter table public.courses add column if not exists author_channel text;

alter table public.youtube_videos add column if not exists canonical_url text;
alter table public.youtube_videos add column if not exists discovered_at timestamptz default now();

-- 2. Deduplication Indices
create unique index if not exists idx_unique_external_video_id on public.youtube_videos(youtube_video_id);
create unique index if not exists idx_unique_course_slug on public.courses(slug);
create index if not exists idx_courses_tech_level_status on public.courses(technology, level, status);
create index if not exists idx_courses_content_state on public.courses(content_state);

-- 3. Competencies & Skill Matrix
create table if not exists public.course_competencies (
  id uuid primary key default uuid_generate_v4(),
  course_id text not null references public.courses(id) on delete cascade,
  skill_name text not null,
  proficiency_target text not null default 'Iniciante',
  created_at timestamptz default now(),
  unique(course_id, skill_name)
);

-- 4. Module Prerequisites Graph
create table if not exists public.module_prerequisites (
  id uuid primary key default uuid_generate_v4(),
  module_id text not null references public.modules(id) on delete cascade,
  prerequisite_module_id text not null references public.modules(id) on delete cascade,
  created_at timestamptz default now(),
  unique(module_id, prerequisite_module_id)
);

-- 5. Catalog Audit Log (Histórico Imutável de Alterações no Catálogo)
create table if not exists public.catalog_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null check (action in ('create', 'update', 'delete', 'publish', 'archive', 'deduplicate')),
  target_type text not null check (target_type in ('course', 'module', 'lesson', 'playlist', 'source')),
  target_id text not null,
  target_title text,
  admin_email text not null,
  details text not null,
  changes jsonb default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists idx_catalog_audit_logs_timestamp on public.catalog_audit_logs(timestamp desc);
create index if not exists idx_catalog_audit_logs_target on public.catalog_audit_logs(target_type, target_id);

-- 6. Row Level Security (RLS) for Catalog
alter table public.courses enable row level security;
alter table public.course_competencies enable row level security;
alter table public.catalog_audit_logs enable row level security;

-- Public can view published courses
create policy "Allow public read published courses"
  on public.courses for select
  using (status = 'ativo' or content_state = 'publicado');

-- Public can view course competencies
create policy "Allow public read course competencies"
  on public.course_competencies for select
  using (true);

-- Admins can perform any action
create policy "Allow admins full access to courses"
  on public.courses for all
  using (auth.jwt() ->> 'email' in ('williamdev36@gmail.com') or auth.jwt() ->> 'role' in ('SUPER_ADMIN', 'ADMIN', 'CURATOR'))
  with check (auth.jwt() ->> 'email' in ('williamdev36@gmail.com') or auth.jwt() ->> 'role' in ('SUPER_ADMIN', 'ADMIN', 'CURATOR'));

create policy "Allow admins read catalog audit logs"
  on public.catalog_audit_logs for select
  using (auth.jwt() ->> 'email' in ('williamdev36@gmail.com') or auth.jwt() ->> 'role' in ('SUPER_ADMIN', 'ADMIN'));
