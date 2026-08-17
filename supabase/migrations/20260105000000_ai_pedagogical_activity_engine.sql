-- =============================================================================
-- Migration: AI Pedagogical Activity Engine & Module Completion Criteria
-- Tables: learning_activities, activity_attempts, module_projects,
--         project_submissions, module_reflections, skill_mastery
-- =============================================================================

-- 1. Learning Activities Table (Zero empty statements enforced via constraint)
CREATE TABLE IF NOT EXISTS public.learning_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  statement TEXT NOT NULL CHECK (char_length(trim(statement)) >= 10),
  objective TEXT,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  xp_reward INTEGER NOT NULL DEFAULT 20,
  expected_time_min INTEGER NOT NULL DEFAULT 5,
  course_id TEXT,
  module_id TEXT NOT NULL,
  lesson_id TEXT,
  skill_name TEXT NOT NULL,
  technology TEXT NOT NULL,
  options JSONB,
  correct_option_index INTEGER,
  code_starter TEXT,
  code_solution TEXT,
  hint TEXT,
  detailed_guidance TEXT,
  explanation TEXT NOT NULL CHECK (char_length(trim(explanation)) >= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_learning_activities_module ON public.learning_activities (module_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_lesson ON public.learning_activities (lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_activities_skill ON public.learning_activities (skill_name);

-- 2. Activity Attempts Table (Tracks progressive hint stages and scores)
CREATE TABLE IF NOT EXISTS public.activity_attempts (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES public.learning_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT,
  hint_provided TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activity_attempts_user ON public.activity_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_attempts_act ON public.activity_attempts (activity_id);

-- 3. Module Practical Projects Table (With weighted rubrics)
CREATE TABLE IF NOT EXISTS public.module_projects (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(trim(description)) >= 20),
  technology TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  rubric JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_module_projects_module ON public.module_projects (module_id);

-- 4. Project Submissions & AI Rubric Evaluations
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT NOT NULL,
  deploy_url TEXT,
  code_content TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'changes_requested')),
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  rubric_evaluation JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  evaluated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_submissions_user_mod ON public.project_submissions (user_id, module_id);

-- 5. Module Pedagogical Reflections
CREATE TABLE IF NOT EXISTS public.module_reflections (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  key_learnings TEXT NOT NULL,
  hardest_topic TEXT,
  confidence_rating INTEGER NOT NULL CHECK (confidence_rating >= 1 AND confidence_rating <= 5),
  prepared_to_advance BOOLEAN NOT NULL DEFAULT true,
  ai_recommendations TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_module_reflections_user_mod ON public.module_reflections (user_id, module_id);

-- 6. Student Skill Mastery Ledger
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  attempts_count INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, skill_name)
);

-- Enable RLS
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;

-- Read policies for published learning content
CREATE POLICY "Public read for published activities" ON public.learning_activities
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read for published projects" ON public.module_projects
  FOR SELECT USING (status = 'published');

-- User policies for personal submissions, attempts and reflections
CREATE POLICY "Users can manage their activity attempts" ON public.activity_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their project submissions" ON public.project_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their reflections" ON public.module_reflections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their skill mastery" ON public.skill_mastery
  FOR ALL USING (auth.uid() = user_id);
