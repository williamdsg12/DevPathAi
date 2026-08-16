-- ============================================================
-- DEVPATH AI — Educational Content Layer Reconstruction & Safe Reset Schema
-- Migration: 20260103000000_educational_content_reset_and_schema.sql
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- 1. Content Sources (Canais do YouTube cadastrados pelo Administrador)
create table if not exists public.content_sources (
  id text primary key,
  name text not null,
  source_type text not null default 'youtube_channel' check (source_type in ('youtube_channel', 'curated_channel', 'community')),
  channel_id text unique,
  channel_url text not null,
  handle text,
  channel_thumbnail text default '',
  description text default '',
  priority integer not null default 100,
  is_trusted boolean not null default true,
  is_active boolean not null default true,
  auto_classify boolean not null default true,
  playlists_count integer default 0,
  videos_count integer default 0,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.content_sources add column if not exists source_type text not null default 'youtube_channel';
alter table public.content_sources add column if not exists channel_id text;
alter table public.content_sources add column if not exists handle text;
alter table public.content_sources add column if not exists channel_thumbnail text default '';
alter table public.content_sources add column if not exists priority integer not null default 100;
alter table public.content_sources add column if not exists is_trusted boolean not null default true;
alter table public.content_sources add column if not exists is_active boolean not null default true;
alter table public.content_sources add column if not exists auto_classify boolean not null default true;
alter table public.content_sources add column if not exists playlists_count integer default 0;
alter table public.content_sources add column if not exists videos_count integer default 0;
alter table public.content_sources add column if not exists last_synced_at timestamptz default now();
alter table public.content_sources add column if not exists updated_at timestamptz default now();

-- 2. YouTube Playlists
create table if not exists public.youtube_playlists (
  id text primary key,
  youtube_playlist_id text not null,
  channel_id text,
  channel_title text not null default 'Canal Educacional',
  title text not null,
  description text default '',
  thumbnail_url text,
  youtube_url text not null default '',
  video_count integer default 0,
  item_count integer default 0,
  category text not null default 'Fundamentos da Programação',
  technology text not null default 'Lógica & Programação',
  level text not null default 'iniciante',
  status text not null default 'ativo',
  classification_confidence integer not null default 100,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.youtube_playlists add column if not exists youtube_playlist_id text;
alter table public.youtube_playlists add column if not exists channel_id text;
alter table public.youtube_playlists add column if not exists channel_title text default 'Canal Educacional';
alter table public.youtube_playlists add column if not exists thumbnail_url text;
alter table public.youtube_playlists add column if not exists youtube_url text default '';
alter table public.youtube_playlists add column if not exists video_count integer default 0;
alter table public.youtube_playlists add column if not exists item_count integer default 0;
alter table public.youtube_playlists add column if not exists category text default 'Fundamentos da Programação';
alter table public.youtube_playlists add column if not exists technology text default 'Lógica & Programação';
alter table public.youtube_playlists add column if not exists level text default 'iniciante';
alter table public.youtube_playlists add column if not exists status text default 'ativo';
alter table public.youtube_playlists add column if not exists classification_confidence integer default 100;
alter table public.youtube_playlists add column if not exists last_synced_at timestamptz default now();
alter table public.youtube_playlists add column if not exists updated_at timestamptz default now();

-- 3. Courses (Catálogo Pedagógico Estruturado)
create table if not exists public.courses (
  id text primary key,
  playlist_id text,
  title text not null,
  slug text not null,
  description text not null default '',
  level text not null default 'iniciante',
  technology text not null default 'Lógica & Programação',
  category text not null default 'Fundamentos da Programação',
  thumbnail_url text,
  status text not null default 'ativo',
  channel_title text,
  playlist_url text,
  classification_confidence integer default 100,
  prerequisites text[] default '{}',
  skills text[] default '{}',
  modules_count integer default 1,
  lessons_count integer default 0,
  total_hours integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.courses add column if not exists playlist_id text;
alter table public.courses add column if not exists slug text;
alter table public.courses add column if not exists level text default 'iniciante';
alter table public.courses add column if not exists technology text default 'Lógica & Programação';
alter table public.courses add column if not exists category text default 'Fundamentos da Programação';
alter table public.courses add column if not exists thumbnail_url text;
alter table public.courses add column if not exists status text default 'ativo';
alter table public.courses add column if not exists channel_title text;
alter table public.courses add column if not exists playlist_url text;
alter table public.courses add column if not exists classification_confidence integer default 100;
alter table public.courses add column if not exists prerequisites text[] default '{}';
alter table public.courses add column if not exists skills text[] default '{}';
alter table public.courses add column if not exists modules_count integer default 1;
alter table public.courses add column if not exists lessons_count integer default 0;
alter table public.courses add column if not exists total_hours integer default 1;
alter table public.courses add column if not exists updated_at timestamptz default now();

-- 4. Modules (Tanto public.modules quanto public.course_modules suportados)
create table if not exists public.modules (
  id text primary key,
  course_id text,
  order_index integer not null default 1,
  phase text not null default 'Fundamentos da Programação',
  phase_order integer not null default 1,
  title text not null,
  slug text not null default '',
  description text not null default '',
  objective text not null default '',
  icon text not null default 'code',
  has_project boolean default false,
  has_assessment boolean default true,
  estimated_hours integer default 10,
  skills text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.modules add column if not exists course_id text;
alter table public.modules add column if not exists phase text default 'Fundamentos da Programação';
alter table public.modules add column if not exists phase_order integer default 1;
alter table public.modules add column if not exists objective text default '';
alter table public.modules add column if not exists icon text default 'code';
alter table public.modules add column if not exists has_project boolean default false;
alter table public.modules add column if not exists has_assessment boolean default true;
alter table public.modules add column if not exists estimated_hours integer default 10;
alter table public.modules add column if not exists skills text[] default '{}';
alter table public.modules add column if not exists updated_at timestamptz default now();

create table if not exists public.course_modules (
  id text primary key,
  course_id text,
  order_index integer not null default 1,
  phase text not null default 'Fundamentos da Programação',
  phase_order integer not null default 1,
  title text not null,
  slug text not null default '',
  description text not null default '',
  objective text not null default '',
  icon text not null default 'code',
  has_project boolean default false,
  has_assessment boolean default true,
  estimated_hours integer default 10,
  skills text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.course_modules add column if not exists course_id text;

-- 5. YouTube Videos (Vídeos Únicos)
create table if not exists public.youtube_videos (
  id text primary key,
  youtube_video_id text not null,
  playlist_id text,
  title text not null,
  description text default '',
  channel_id text,
  channel_title text,
  thumbnail_url text,
  duration_seconds integer default 0,
  position integer not null default 1,
  published_at timestamptz,
  youtube_url text not null default '',
  technology text not null default 'Lógica & Programação',
  topic text not null default 'Conceitos Fundamentais',
  level text not null default 'iniciante',
  status text not null default 'ativo',
  is_unavailable boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.youtube_videos add column if not exists youtube_video_id text;
alter table public.youtube_videos add column if not exists playlist_id text;
alter table public.youtube_videos add column if not exists duration_seconds integer default 0;
alter table public.youtube_videos add column if not exists position integer default 1;
alter table public.youtube_videos add column if not exists youtube_url text default '';
alter table public.youtube_videos add column if not exists technology text default 'Lógica & Programação';
alter table public.youtube_videos add column if not exists topic text default 'Conceitos Fundamentais';
alter table public.youtube_videos add column if not exists status text default 'ativo';
alter table public.youtube_videos add column if not exists is_unavailable boolean default false;
alter table public.youtube_videos add column if not exists updated_at timestamptz default now();

-- 6. Lessons (Aulas Reais com external_video_id e ordenação 1..N)
create table if not exists public.lessons (
  id text primary key,
  course_id text,
  module_id text,
  playlist_id text,
  external_video_id text,
  order_index integer not null default 1,
  title text not null,
  slug text not null default '',
  type text not null default 'video',
  duration_min integer not null default 15,
  description text default '',
  video_url text,
  thumbnail_url text,
  source_type text not null default 'youtube',
  source_label text default 'YouTube',
  availability_status text not null default 'available',
  youtube_exists boolean not null default true,
  embed_available boolean not null default true,
  last_checked_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Crucial: Ensure ALL columns exist on public.lessons before creating indexes
alter table public.lessons add column if not exists course_id text;
alter table public.lessons add column if not exists module_id text;
alter table public.lessons add column if not exists playlist_id text;
alter table public.lessons add column if not exists external_video_id text;
alter table public.lessons add column if not exists order_index integer default 1;
alter table public.lessons add column if not exists slug text default '';
alter table public.lessons add column if not exists type text default 'video';
alter table public.lessons add column if not exists duration_min integer default 15;
alter table public.lessons add column if not exists description text default '';
alter table public.lessons add column if not exists video_url text;
alter table public.lessons add column if not exists thumbnail_url text;
alter table public.lessons add column if not exists source_type text default 'youtube';
alter table public.lessons add column if not exists source_label text default 'YouTube';
alter table public.lessons add column if not exists availability_status text default 'available';
alter table public.lessons add column if not exists youtube_exists boolean default true;
alter table public.lessons add column if not exists embed_available boolean default true;
alter table public.lessons add column if not exists last_checked_at timestamptz default now();
alter table public.lessons add column if not exists updated_at timestamptz default now();

-- 7. Import Logs
create table if not exists public.import_logs (
  id uuid primary key default uuid_generate_v4(),
  playlist_id text not null,
  playlist_title text not null,
  channel_title text not null,
  status text not null default 'sucesso',
  videos_found integer not null default 0,
  videos_imported integer not null default 0,
  videos_unavailable integer not null default 0,
  duplicates_ignored integer not null default 0,
  message text,
  created_at timestamptz default now()
);

-- ============================================================
-- Indexes (Guaranteed safe since columns were added above)
-- ============================================================
create index if not exists idx_lessons_course on public.lessons(course_id);
create index if not exists idx_lessons_module on public.lessons(module_id);
create index if not exists idx_lessons_playlist on public.lessons(playlist_id);
create index if not exists idx_lessons_external_video_id on public.lessons(external_video_id);
create index if not exists idx_lessons_order on public.lessons(order_index);
create index if not exists idx_modules_course on public.modules(course_id);
create index if not exists idx_course_modules_course on public.course_modules(course_id);
create index if not exists idx_courses_playlist on public.courses(playlist_id);
create index if not exists idx_youtube_playlists_channel on public.youtube_playlists(channel_id);

-- ============================================================
-- Safe Catalog Reset Function (Preserves auth.users & profiles)
-- ============================================================
create or replace function public.reset_educational_catalog()
returns jsonb
language plpgsql
security definer
as $$
declare
  courses_deleted int := 0;
  modules_deleted int := 0;
  lessons_deleted int := 0;
  playlists_deleted int := 0;
  sources_deleted int := 0;
begin
  -- 1. Count items before deletion for safety report
  if exists (select 1 from information_schema.tables where table_name = 'lessons' and table_schema = 'public') then
    select count(*) into lessons_deleted from public.lessons;
  end if;

  if exists (select 1 from information_schema.tables where table_name = 'modules' and table_schema = 'public') then
    select count(*) into modules_deleted from public.modules;
  end if;

  if exists (select 1 from information_schema.tables where table_name = 'courses' and table_schema = 'public') then
    select count(*) into courses_deleted from public.courses;
  end if;

  if exists (select 1 from information_schema.tables where table_name = 'youtube_playlists' and table_schema = 'public') then
    select count(*) into playlists_deleted from public.youtube_playlists;
  end if;

  if exists (select 1 from information_schema.tables where table_name = 'content_sources' and table_schema = 'public') then
    select count(*) into sources_deleted from public.content_sources;
  end if;

  -- 2. Clear progress records linked to deleted educational content
  if exists (select 1 from information_schema.tables where table_name = 'lesson_progress' and table_schema = 'public') then
    truncate table public.lesson_progress cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'exercise_attempts' and table_schema = 'public') then
    truncate table public.exercise_attempts cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'project_submissions' and table_schema = 'public') then
    truncate table public.project_submissions cascade;
  end if;

  -- 3. Clear educational catalog tables in cascading order
  if exists (select 1 from information_schema.tables where table_name = 'lessons' and table_schema = 'public') then
    truncate table public.lessons cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'course_modules' and table_schema = 'public') then
    truncate table public.course_modules cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'modules' and table_schema = 'public') then
    truncate table public.modules cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'courses' and table_schema = 'public') then
    truncate table public.courses cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'youtube_videos' and table_schema = 'public') then
    truncate table public.youtube_videos cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'youtube_playlists' and table_schema = 'public') then
    truncate table public.youtube_playlists cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'content_sources' and table_schema = 'public') then
    truncate table public.content_sources cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'import_logs' and table_schema = 'public') then
    truncate table public.import_logs cascade;
  end if;

  -- 4. Return safety report (Notice: profiles and auth.users are 100% untouched)
  return jsonb_build_object(
    'success', true,
    'message', 'Catálogo educacional resetado com sucesso. Perfis e usuários foram preservados.',
    'deletedCounts', jsonb_build_object(
      'courses', courses_deleted,
      'modules', modules_deleted,
      'lessons', lessons_deleted,
      'playlists', playlists_deleted,
      'sources', sources_deleted
    ),
    'resetAt', now()
  );
end;
$$;
