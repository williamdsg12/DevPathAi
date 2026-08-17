-- ============================================================
-- DEVPATH AI — PostgreSQL / Supabase Schema & Row Level Security (RLS)
-- Migration: 20260101000000_devpath_schema.sql
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_url text,
  bio text default '',
  github text default '',
  linkedin text default '',
  desired_role text default 'Desenvolvedor Full Stack Júnior',
  target_technologies text[] default '{}',
  onboarded boolean default false,
  placement_done boolean default false,
  is_admin boolean default false,
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  last_active_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Onboarding Profiles
create table if not exists public.onboarding_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  current_knowledge text not null,
  goal text not null,
  area text not null,
  technologies text[] not null default '{}',
  hours_per_day text not null,
  days_per_week integer not null default 5,
  has_computer boolean not null default true,
  known_topics text[] default '{}',
  biggest_goal text,
  biggest_difficulty text,
  learning_style text default 'misto',
  created_at timestamptz default now()
);

-- 3. Learning Paths
create table if not exists public.learning_paths (
  id text primary key,
  title text not null,
  slug text not null unique,
  goal text not null,
  area text not null,
  description text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. Modules
create table if not exists public.modules (
  id text primary key,
  order_index integer not null,
  phase text not null,
  phase_order integer not null,
  title text not null,
  slug text not null unique,
  description text not null,
  objective text not null,
  icon text not null default 'code',
  has_project boolean default false,
  has_assessment boolean default true,
  estimated_hours integer default 10,
  skills text[] default '{}',
  created_at timestamptz default now()
);

-- 5. Learning Path Modules (junction)
create table if not exists public.learning_path_modules (
  path_id text not null references public.learning_paths(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  order_index integer not null,
  primary key (path_id, module_id)
);

-- 6. Module Prerequisites
create table if not exists public.module_prerequisites (
  module_id text not null references public.modules(id) on delete cascade,
  prerequisite_module_id text not null references public.modules(id) on delete cascade,
  primary key (module_id, prerequisite_module_id)
);

-- 7. Lessons
create table if not exists public.lessons (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  order_index integer not null,
  title text not null,
  slug text not null,
  type text not null check (type in ('video', 'reading', 'external', 'pdf')),
  duration_min integer not null default 15,
  description text,
  video_id text, -- YouTube embed ID
  source_label text,
  content_markdown text,
  pdf_url text,
  created_at timestamptz default now()
);

-- 8. Lesson Progress
create table if not exists public.lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  completed boolean default false,
  watched_seconds integer default 0,
  last_position_seconds integer default 0,
  notes text,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- 9. Exercises
create table if not exists public.exercises (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  type text not null check (type in ('multiple-choice', 'true-false', 'code', 'fill-code', 'written')),
  prompt text not null,
  options jsonb default '[]'::jsonb,
  correct_index integer,
  correct_answer text,
  code_starter text,
  code_solution text,
  explanation text not null,
  difficulty text not null check (difficulty in ('facil', 'medio', 'dificil')),
  points integer default 20,
  created_at timestamptz default now()
);

-- 10. Exercise Attempts
create table if not exists public.exercise_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  user_answer text,
  is_correct boolean not null,
  time_spent_seconds integer default 0,
  score integer default 0,
  created_at timestamptz default now()
);

-- 11. Module Projects
create table if not exists public.module_projects (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade unique,
  title text not null,
  description text not null,
  requirements text[] default '{}',
  deliverables text[] default '{}',
  evaluation_criteria text[] default '{}',
  created_at timestamptz default now()
);

-- 12. Project Submissions
create table if not exists public.project_submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  module_project_id text not null references public.module_projects(id) on delete cascade,
  title text not null,
  description text not null,
  github_url text not null,
  deploy_url text,
  screenshot_urls text[] default '{}',
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'approved', 'rejected')),
  grade integer,
  feedback text,
  submitted_at timestamptz default now(),
  evaluated_at timestamptz
);

-- 13. Assessments
create table if not exists public.assessments (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade unique,
  title text not null,
  description text,
  min_score integer default 70,
  time_limit_min integer default 20,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 14. Assessment Questions
create table if not exists public.assessment_questions (
  id text primary key,
  assessment_id text not null references public.assessments(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null,
  explanation text,
  topic text not null,
  points integer default 20,
  created_at timestamptz default now()
);

-- 15. Assessment Attempts
create table if not exists public.assessment_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id text not null references public.assessments(id) on delete cascade,
  module_id text not null references public.modules(id) on delete cascade,
  score numeric not null,
  passed boolean not null,
  total_questions integer not null,
  correct_answers integer not null,
  feedback text,
  weak_topics text[] default '{}',
  strong_topics text[] default '{}',
  recovery_plan jsonb default '{}'::jsonb,
  completed_at timestamptz default now()
);

-- 16. Assessment Answers
create table if not exists public.assessment_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id text not null references public.assessment_questions(id) on delete cascade,
  selected_index integer not null,
  is_correct boolean not null
);

-- 17. Skills
create table if not exists public.skills (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  created_at timestamptz default now()
);

-- 18. User Skills
create table if not exists public.user_skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  proficiency_level integer default 1,
  xp integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, skill_id)
);

-- 19. User Difficulties
create table if not exists public.user_difficulties (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  count integer not null default 1,
  severity text default 'medio',
  last_encountered_at timestamptz default now(),
  resolved boolean default false,
  unique(user_id, topic)
);

-- 20. Study Sessions
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id text references public.modules(id) on delete set null,
  session_type text default 'mixed',
  minutes_spent integer not null default 0,
  started_at timestamptz default now(),
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- 21. Study Plans
create table if not exists public.study_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_date date not null default current_date,
  daily_target_minutes integer default 90,
  plan_breakdown jsonb default '[]'::jsonb,
  completed boolean default false,
  created_at timestamptz default now()
);

-- 22. Study Reviews (Spaced Repetition)
create table if not exists public.study_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  module_id text references public.modules(id) on delete set null,
  interval_step integer not null default 1, -- 1: today, 2: +2d, 3: +7d, 4: +14d, 5: +30d
  next_review_at timestamptz not null default now(),
  repetitions integer default 0,
  ease_factor numeric default 2.5,
  last_performance text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 23. Achievements
create table if not exists public.achievements (
  id text primary key,
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null default 'trophy',
  xp_reward integer default 100,
  category text default 'geral',
  created_at timestamptz default now()
);

-- 24. User Achievements
create table if not exists public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- 25. User Projects
create table if not exists public.user_projects (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  tech text[] default '{}',
  github text,
  deploy text,
  image_url text,
  status text not null default 'em-desenvolvimento' check (status in ('ideia', 'em-desenvolvimento', 'concluido', 'publicado')),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 26. Certificates
create table if not exists public.certificates (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  path_id text not null references public.learning_paths(id) on delete cascade,
  title text not null,
  recipient_name text not null,
  completion_date date not null default current_date,
  average_grade numeric not null,
  validation_code text not null unique,
  is_revoked boolean default false,
  created_at timestamptz default now()
);

-- 27. AI Conversations
create table if not exists public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'Mentoria',
  context_module_id text references public.modules(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 28. AI Messages
create table if not exists public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens integer default 0,
  created_at timestamptz default now()
);

-- 29. External Courses
create table if not exists public.external_courses (
  id text primary key,
  title text not null,
  platform text not null,
  url text not null,
  thumbnail_url text,
  technology text,
  level text,
  created_at timestamptz default now()
);

-- 30. External Lessons
create table if not exists public.external_lessons (
  id text primary key,
  course_id text not null references public.external_courses(id) on delete cascade,
  title text not null,
  url text not null,
  duration_min integer default 15,
  order_index integer not null,
  created_at timestamptz default now()
);

-- 31. Daily Goals
create table if not exists public.daily_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  target_minutes integer default 60,
  studied_minutes integer default 0,
  completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 32. Notifications
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'streak', 'achievement', 'review')),
  read boolean default false,
  action_url text,
  created_at timestamptz default now()
);

-- 33. User Settings
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text default 'dark',
  email_notifications boolean default true,
  daily_reminder boolean default true,
  reminder_time text default '20:00',
  privacy_level text default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 34. Interview Sessions
create table if not exists public.interview_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_title text not null,
  seniority text not null default 'Júnior',
  status text not null default 'in-progress' check (status in ('in-progress', 'completed', 'abandoned')),
  overall_score numeric,
  summary_feedback text,
  strengths text[] default '{}',
  improvements text[] default '{}',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 35. Interview Answers
create table if not exists public.interview_answers (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_text text not null,
  user_answer text not null,
  score numeric,
  feedback text,
  suggested_improvements text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.onboarding_profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.project_submissions enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.user_skills enable row level security;
alter table public.user_difficulties enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_plans enable row level security;
alter table public.study_reviews enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_projects enable row level security;
alter table public.certificates enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.daily_goals enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_answers enable row level security;

-- Public read tables (Content catalog)
alter table public.learning_paths enable row level security;
alter table public.modules enable row level security;
alter table public.learning_path_modules enable row level security;
alter table public.module_prerequisites enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.module_projects enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.skills enable row level security;
alter table public.achievements enable row level security;
alter table public.external_courses enable row level security;
alter table public.external_lessons enable row level security;

-- Public content read policy
drop policy if exists "Public content is viewable by authenticated users" on public.learning_paths;
create policy "Public content is viewable by authenticated users" on public.learning_paths for select using (true);

drop policy if exists "Public modules are viewable by all" on public.modules;
create policy "Public modules are viewable by all" on public.modules for select using (true);

drop policy if exists "Public path modules are viewable by all" on public.learning_path_modules;
create policy "Public path modules are viewable by all" on public.learning_path_modules for select using (true);

drop policy if exists "Public module prerequisites are viewable by all" on public.module_prerequisites;
create policy "Public module prerequisites are viewable by all" on public.module_prerequisites for select using (true);

drop policy if exists "Public lessons are viewable by all" on public.lessons;
create policy "Public lessons are viewable by all" on public.lessons for select using (true);

drop policy if exists "Public exercises are viewable by all" on public.exercises;
create policy "Public exercises are viewable by all" on public.exercises for select using (true);

drop policy if exists "Public module projects are viewable by all" on public.module_projects;
create policy "Public module projects are viewable by all" on public.module_projects for select using (true);

drop policy if exists "Public assessments are viewable by all" on public.assessments;
create policy "Public assessments are viewable by all" on public.assessments for select using (true);

drop policy if exists "Public assessment questions are viewable by all" on public.assessment_questions;
create policy "Public assessment questions are viewable by all" on public.assessment_questions for select using (true);

drop policy if exists "Public skills are viewable by all" on public.skills;
create policy "Public skills are viewable by all" on public.skills for select using (true);

drop policy if exists "Public achievements are viewable by all" on public.achievements;
create policy "Public achievements are viewable by all" on public.achievements for select using (true);

drop policy if exists "Public external courses are viewable by all" on public.external_courses;
create policy "Public external courses are viewable by all" on public.external_courses for select using (true);

drop policy if exists "Public external lessons are viewable by all" on public.external_lessons;
create policy "Public external lessons are viewable by all" on public.external_lessons for select using (true);

-- User-specific Isolation Policies
drop policy if exists "Users can view and update own profile" on public.profiles;
create policy "Users can view and update own profile" on public.profiles
  for all using (auth.uid() = id);

drop policy if exists "Users can view and manage own onboarding" on public.onboarding_profiles;
create policy "Users can view and manage own onboarding" on public.onboarding_profiles
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own lesson progress" on public.lesson_progress;
create policy "Users can view and manage own lesson progress" on public.lesson_progress
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own exercise attempts" on public.exercise_attempts;
create policy "Users can view and manage own exercise attempts" on public.exercise_attempts
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own project submissions" on public.project_submissions;
create policy "Users can view and manage own project submissions" on public.project_submissions
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own assessment attempts" on public.assessment_attempts;
create policy "Users can view and manage own assessment attempts" on public.assessment_attempts
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view own assessment answers" on public.assessment_answers;
create policy "Users can view own assessment answers" on public.assessment_answers
  for all using (
    exists (
      select 1 from public.assessment_attempts
      where assessment_attempts.id = assessment_answers.attempt_id
      and assessment_attempts.user_id = auth.uid()
    )
  );

drop policy if exists "Users can view and manage own skills" on public.user_skills;
create policy "Users can view and manage own skills" on public.user_skills
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own difficulties" on public.user_difficulties;
create policy "Users can view and manage own difficulties" on public.user_difficulties
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own study sessions" on public.study_sessions;
create policy "Users can view and manage own study sessions" on public.study_sessions
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own study plans" on public.study_plans;
create policy "Users can view and manage own study plans" on public.study_plans
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own study reviews" on public.study_reviews;
create policy "Users can view and manage own study reviews" on public.study_reviews
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own achievements" on public.user_achievements;
create policy "Users can view and manage own achievements" on public.user_achievements
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own projects" on public.user_projects;
create policy "Users can view and manage own projects" on public.user_projects
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view own certificates" on public.certificates;
create policy "Users can view own certificates" on public.certificates
  for select using (auth.uid() = user_id or is_revoked = false);

drop policy if exists "Users can manage own AI conversations" on public.ai_conversations;
create policy "Users can manage own AI conversations" on public.ai_conversations
  for all using (auth.uid() = user_id);

drop policy if exists "Users can manage own AI messages" on public.ai_messages;
create policy "Users can manage own AI messages" on public.ai_messages
  for all using (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

drop policy if exists "Users can view and manage own daily goals" on public.daily_goals;
create policy "Users can view and manage own daily goals" on public.daily_goals
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own notifications" on public.notifications;
create policy "Users can view and manage own notifications" on public.notifications
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own settings" on public.user_settings;
create policy "Users can view and manage own settings" on public.user_settings
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own interview sessions" on public.interview_sessions;
create policy "Users can view and manage own interview sessions" on public.interview_sessions
  for all using (auth.uid() = user_id);

drop policy if exists "Users can view and manage own interview answers" on public.interview_answers;
create policy "Users can view and manage own interview answers" on public.interview_answers
  for all using (
    exists (
      select 1 from public.interview_sessions
      where interview_sessions.id = interview_answers.session_id
      and interview_sessions.user_id = auth.uid()
    )
  );

-- Profile trigger on new auth.user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
