-- ============================================================
-- DEVPATH AI — YouTube Course Catalog & Educational Sources Schema
-- Migration: 20260102000000_youtube_catalog_schema.sql
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- 1. Content Sources (Canais e Fontes Confiáveis do YouTube)
create table if not exists public.content_sources (
  id text primary key,
  name text not null,
  source_type text not null default 'youtube_channel' check (source_type in ('youtube_channel', 'curated_channel', 'community')),
  channel_id text,
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

alter table public.content_sources add column if not exists channel_thumbnail text default '';
alter table public.content_sources add column if not exists auto_classify boolean not null default true;
alter table public.content_sources add column if not exists playlists_count integer default 0;
alter table public.content_sources add column if not exists videos_count integer default 0;
alter table public.content_sources add column if not exists last_synced_at timestamptz default now();

-- 2. YouTube Playlists (Unidades Pedagógicas de Cursos)
create table if not exists public.youtube_playlists (
  id text primary key,
  youtube_playlist_id text not null unique,
  channel_id text,
  channel_title text not null,
  title text not null,
  description text default '',
  thumbnail_url text,
  youtube_url text not null,
  video_count integer default 0,
  item_count integer default 0,
  category text not null default 'Fundamentos da Programação',
  technology text not null default 'Lógica & Programação',
  level text not null default 'iniciante' check (level in ('iniciante-absoluto', 'iniciante', 'basico', 'intermediario', 'avancado')),
  status text not null default 'ativo' check (status in ('ativo', 'em_revisao', 'inativo')),
  classification_confidence integer not null default 100,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.youtube_playlists add column if not exists category text not null default 'Fundamentos da Programação';
alter table public.youtube_playlists add column if not exists technology text not null default 'Lógica & Programação';
alter table public.youtube_playlists add column if not exists level text not null default 'iniciante';
alter table public.youtube_playlists add column if not exists status text not null default 'ativo';
alter table public.youtube_playlists add column if not exists classification_confidence integer not null default 100;
alter table public.youtube_playlists add column if not exists last_synced_at timestamptz default now();

-- 3. YouTube Videos (Aulas com IDs Reais, Únicos e Contextualizados)
create table if not exists public.youtube_videos (
  id text primary key,
  youtube_video_id text not null unique,
  playlist_id text references public.youtube_playlists(id) on delete set null,
  title text not null,
  description text default '',
  channel_id text,
  channel_title text,
  thumbnail_url text,
  duration_seconds integer default 0,
  position integer not null default 1,
  published_at timestamptz,
  youtube_url text not null,
  technology text not null default 'Lógica & Programação',
  topic text not null default 'Conceitos Fundamentais',
  level text not null default 'iniciante' check (level in ('iniciante-absoluto', 'iniciante', 'basico', 'intermediario', 'avancado')),
  status text not null default 'ativo' check (status in ('ativo', 'indisponivel')),
  is_unavailable boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.youtube_videos add column if not exists technology text not null default 'Lógica & Programação';
alter table public.youtube_videos add column if not exists topic text not null default 'Conceitos Fundamentais';
alter table public.youtube_videos add column if not exists level text not null default 'iniciante';
alter table public.youtube_videos add column if not exists status text not null default 'ativo';
alter table public.youtube_videos add column if not exists is_unavailable boolean default false;
alter table public.youtube_videos add column if not exists duration_seconds integer default 0;
alter table public.youtube_videos add column if not exists position integer not null default 1;

-- 4. Playlist Videos Junction (Relação N:N para evitar duplicação física de vídeos)
create table if not exists public.playlist_videos (
  id uuid primary key default uuid_generate_v4(),
  playlist_id text not null references public.youtube_playlists(id) on delete cascade,
  video_id text not null references public.youtube_videos(id) on delete cascade,
  position integer not null default 1,
  created_at timestamptz default now(),
  unique(playlist_id, video_id)
);

-- 5. Courses (Catálogo Pedagógico Estruturado)
create table if not exists public.courses (
  id text primary key,
  title text not null,
  slug text not null unique,
  description text not null,
  level text not null default 'iniciante' check (level in ('iniciante-absoluto', 'iniciante', 'basico', 'intermediario', 'avancado')),
  technology text not null default 'Lógica & Programação',
  category text not null default 'Fundamentos da Programação',
  thumbnail_url text,
  status text not null default 'ativo' check (status in ('ativo', 'rascunho', 'arquivado')),
  source_id text references public.content_sources(id) on delete set null,
  source_playlist_id text,
  playlist_id text references public.youtube_playlists(id) on delete set null,
  playlist_url text,
  channel_title text,
  classification_confidence integer default 100,
  prerequisites text[] default '{}',
  skills text[] default '{}',
  modules_count integer default 1,
  lessons_count integer default 1,
  total_hours integer default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.courses add column if not exists technology text not null default 'Lógica & Programação';
alter table public.courses add column if not exists category text not null default 'Fundamentos da Programação';
alter table public.courses add column if not exists level text not null default 'iniciante';
alter table public.courses add column if not exists status text not null default 'ativo';
alter table public.courses add column if not exists source_id text references public.content_sources(id) on delete set null;
alter table public.courses add column if not exists source_playlist_id text;
alter table public.courses add column if not exists playlist_id text references public.youtube_playlists(id) on delete set null;
alter table public.courses add column if not exists playlist_url text;
alter table public.courses add column if not exists channel_title text;
alter table public.courses add column if not exists classification_confidence integer default 100;
alter table public.courses add column if not exists prerequisites text[] default '{}';
alter table public.courses add column if not exists skills text[] default '{}';
alter table public.courses add column if not exists modules_count integer default 1;
alter table public.courses add column if not exists lessons_count integer default 1;
alter table public.courses add column if not exists total_hours integer default 10;

-- 6. Course Sources (Fontes e Prioridades de Conteúdo)
create table if not exists public.course_sources (
  id uuid primary key default uuid_generate_v4(),
  course_id text not null references public.courses(id) on delete cascade,
  playlist_id text not null references public.youtube_playlists(id) on delete cascade,
  priority integer not null default 100,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 7. Technology Sources (Mapeamento de Fontes Prioritárias por Tecnologia)
create table if not exists public.technology_sources (
  id text primary key,
  technology text not null unique,
  primary_playlist_id text not null,
  primary_playlist_url text not null,
  channel_title text not null,
  fallback_playlist_ids text[] default '{}',
  status text not null default 'ativo' check (status in ('ativo', 'em_revisao', 'inativo')),
  updated_at timestamptz default now()
);

alter table public.technology_sources add column if not exists technology text not null default 'Lógica & Programação';
alter table public.technology_sources add column if not exists primary_playlist_id text not null default '';
alter table public.technology_sources add column if not exists primary_playlist_url text not null default '';
alter table public.technology_sources add column if not exists channel_title text not null default '';
alter table public.technology_sources add column if not exists fallback_playlist_ids text[] default '{}';
alter table public.technology_sources add column if not exists status text not null default 'ativo';

-- 8. Import & Sync Logs (Histórico de Operações da API)
create table if not exists public.import_logs (
  id uuid primary key default uuid_generate_v4(),
  playlist_id text not null,
  playlist_title text not null,
  channel_title text not null,
  status text not null default 'sucesso' check (status in ('sucesso', 'erro', 'parcial')),
  videos_found integer not null default 0,
  videos_imported integer not null default 0,
  videos_unavailable integer not null default 0,
  duplicates_ignored integer not null default 0,
  message text,
  created_at timestamptz default now()
);

-- ============================================================
-- Indexes for High Performance Querying
-- ============================================================
create index if not exists idx_content_sources_trusted on public.content_sources(is_trusted, is_active);
create index if not exists idx_youtube_videos_video_id on public.youtube_videos(youtube_video_id);
create index if not exists idx_youtube_videos_tech on public.youtube_videos(technology);
create index if not exists idx_youtube_playlists_playlist_id on public.youtube_playlists(youtube_playlist_id);
create index if not exists idx_youtube_playlists_tech on public.youtube_playlists(technology);
create index if not exists idx_playlist_videos_playlist on public.playlist_videos(playlist_id);
create index if not exists idx_playlist_videos_position on public.playlist_videos(position);
create index if not exists idx_courses_slug on public.courses(slug);
create index if not exists idx_courses_tech on public.courses(technology);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.content_sources enable row level security;
alter table public.youtube_playlists enable row level security;
alter table public.youtube_videos enable row level security;
alter table public.playlist_videos enable row level security;
alter table public.courses enable row level security;
alter table public.course_sources enable row level security;
alter table public.technology_sources enable row level security;
alter table public.import_logs enable row level security;

-- Public read for educational catalog
drop policy if exists "Public content sources are viewable by all" on public.content_sources;
create policy "Public content sources are viewable by all" on public.content_sources for select using (true);

drop policy if exists "Public youtube playlists are viewable by all" on public.youtube_playlists;
create policy "Public youtube playlists are viewable by all" on public.youtube_playlists for select using (true);

drop policy if exists "Public youtube videos are viewable by all" on public.youtube_videos;
create policy "Public youtube videos are viewable by all" on public.youtube_videos for select using (true);

drop policy if exists "Public playlist videos are viewable by all" on public.playlist_videos;
create policy "Public playlist videos are viewable by all" on public.playlist_videos for select using (true);

drop policy if exists "Public courses are viewable by all" on public.courses;
create policy "Public courses are viewable by all" on public.courses for select using (true);

drop policy if exists "Public course sources are viewable by all" on public.course_sources;
create policy "Public course sources are viewable by all" on public.course_sources for select using (true);

drop policy if exists "Public tech sources are viewable by all" on public.technology_sources;
create policy "Public tech sources are viewable by all" on public.technology_sources for select using (true);

drop policy if exists "Public import logs are viewable by all" on public.import_logs;
create policy "Public import logs are viewable by all" on public.import_logs for select using (true);

-- Admin full management policies
drop policy if exists "Admins can manage content sources" on public.content_sources;
create policy "Admins can manage content sources" on public.content_sources
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can manage youtube playlists" on public.youtube_playlists;
create policy "Admins can manage youtube playlists" on public.youtube_playlists
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can manage youtube videos" on public.youtube_videos;
create policy "Admins can manage youtube videos" on public.youtube_videos
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can manage playlist videos" on public.playlist_videos;
create policy "Admins can manage playlist videos" on public.playlist_videos
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses" on public.courses
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can manage course sources" on public.course_sources;
create policy "Admins can manage course sources" on public.course_sources
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can manage tech sources" on public.technology_sources;
create policy "Admins can manage tech sources" on public.technology_sources
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can view import logs" on public.import_logs;
create policy "Admins can view import logs" on public.import_logs
  for all using (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
