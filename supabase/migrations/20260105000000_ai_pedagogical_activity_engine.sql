-- =============================================================================
-- Migration: AI Pedagogical Activity Engine & Module Completion Criteria
-- Tables: learning_activities, activity_attempts, module_projects,
--         project_submissions, module_reflections, skill_mastery
-- Resilient & Idempotent with ALTER TABLE ADD COLUMN IF NOT EXISTS support
-- =============================================================================

-- 1. Learning Activities Table
CREATE TABLE IF NOT EXISTS public.learning_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  objective TEXT,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'facil',
  status TEXT NOT NULL DEFAULT 'published',
  xp_reward INTEGER NOT NULL DEFAULT 20,
  expected_time_min INTEGER NOT NULL DEFAULT 5,
  course_id TEXT,
  module_id TEXT NOT NULL,
  lesson_id TEXT,
  skill_name TEXT NOT NULL,
  technology TEXT NOT NULL DEFAULT 'JavaScript',
  options JSONB,
  correct_option_index INTEGER,
  code_starter TEXT,
  code_solution TEXT,
  hint TEXT,
  detailed_guidance TEXT,
  explanation TEXT NOT NULL DEFAULT 'Explicação detalhada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist in learning_activities if table pre-existed
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS statement TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'facil';
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 20;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS expected_time_min INTEGER DEFAULT 5;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS module_id TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS lesson_id TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS skill_name TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS technology TEXT DEFAULT 'JavaScript';
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS correct_option_index INTEGER;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS code_starter TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS code_solution TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS hint TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS detailed_guidance TEXT;
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS explanation TEXT DEFAULT 'Explicação detalhada';
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.learning_activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_learning_activities_module ON public.learning_activities (module_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_lesson ON public.learning_activities (lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_skill ON public.learning_activities (skill_name);

-- 2. Activity Attempts Table
CREATE TABLE IF NOT EXISTS public.activity_attempts (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  answer JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT,
  hint_provided TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS activity_id TEXT;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS answer JSONB;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS hint_provided TEXT;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
ALTER TABLE public.activity_attempts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_activity_attempts_user ON public.activity_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_act ON public.activity_attempts (activity_id);

-- 3. Module Practical Projects Table
CREATE TABLE IF NOT EXISTS public.module_projects (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technology TEXT NOT NULL DEFAULT 'JavaScript',
  difficulty TEXT NOT NULL DEFAULT 'medio',
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  rubric JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist in module_projects (fixes: ERROR 42703 column "status" does not exist)
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS module_id TEXT;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS technology TEXT DEFAULT 'JavaScript';
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio';
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.module_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_module_projects_module ON public.module_projects (module_id);

-- 4. Project Submissions & AI Rubric Evaluations Table
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT NOT NULL,
  deploy_url TEXT,
  code_content TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  grade INTEGER,
  feedback TEXT,
  rubric_evaluation JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  evaluated_at TIMESTAMPTZ
);

ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS module_id TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS deploy_url TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS code_content TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS grade INTEGER;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS rubric_evaluation JSONB;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_project_submissions_user_mod ON public.project_submissions (user_id, module_id);

-- 5. Module Pedagogical Reflections Table
CREATE TABLE IF NOT EXISTS public.module_reflections (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  key_learnings TEXT NOT NULL,
  hardest_topic TEXT,
  confidence_rating INTEGER NOT NULL DEFAULT 5,
  prepared_to_advance BOOLEAN NOT NULL DEFAULT true,
  ai_recommendations TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS module_id TEXT;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS key_learnings TEXT;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS hardest_topic TEXT;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS confidence_rating INTEGER DEFAULT 5;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS prepared_to_advance BOOLEAN DEFAULT true;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS ai_recommendations TEXT;
ALTER TABLE public.module_reflections ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_module_reflections_user_mod ON public.module_reflections (user_id, module_id);

-- 6. Student Skill Mastery Ledger Table
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, skill_name)
);

ALTER TABLE public.skill_mastery ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.skill_mastery ADD COLUMN IF NOT EXISTS attempts_count INTEGER DEFAULT 0;
ALTER TABLE public.skill_mastery ADD COLUMN IF NOT EXISTS last_practiced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;

-- 8. Safe Policy Creation (Drop existing before recreate to prevent duplicate/missing errors)
DROP POLICY IF EXISTS "Public read for published activities" ON public.learning_activities;
CREATE POLICY "Public read for published activities" ON public.learning_activities
  FOR SELECT USING (COALESCE(status, 'published') = 'published');

DROP POLICY IF EXISTS "Public read for published projects" ON public.module_projects;
CREATE POLICY "Public read for published projects" ON public.module_projects
  FOR SELECT USING (COALESCE(status, 'published') = 'published');

DROP POLICY IF EXISTS "Users can manage their activity attempts" ON public.activity_attempts;
CREATE POLICY "Users can manage their activity attempts" ON public.activity_attempts
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their project submissions" ON public.project_submissions;
CREATE POLICY "Users can manage their project submissions" ON public.project_submissions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their reflections" ON public.module_reflections;
CREATE POLICY "Users can manage their reflections" ON public.module_reflections
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their skill mastery" ON public.skill_mastery;
CREATE POLICY "Users can manage their skill mastery" ON public.skill_mastery
  FOR ALL USING (auth.uid() = user_id);
