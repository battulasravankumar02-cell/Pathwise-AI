-- ============================================================
-- PathWise AI — Supabase PostgreSQL Database Schema
-- "Forge Your Skills. Build Your Future."
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES / STUDENT PROFILES
create table if not exists public.student_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null,
  email text not null,
  course text,
  stream text,
  college text,
  year text,
  semester text,
  graduation_year text,
  interests text[] default '{}',
  skills text[] default '{}',
  onboarding_complete boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CAREER GOALS
create table if not exists public.career_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  has_goal boolean default true,
  job_role text,
  specialization text,
  country text,
  industry text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. FUTUREFORGE ROADMAPS
create table if not exists public.roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  goal text not null,
  country text not null,
  total_steps int default 0,
  completed_steps int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ROADMAP STEPS / STAGES
create table if not exists public.roadmap_steps (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid references public.roadmaps(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  step_order int not null,
  title text not null,
  description text,
  skills text[] default '{}',
  status text default 'locked' check (status in ('completed', 'active', 'in_progress', 'upcoming', 'locked')),
  progress int default 0,
  estimated_weeks int default 2,
  concept_details text,
  practice_task text,
  why_it_matters text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. LEARNING TARGETS (Daily, Weekly, Monthly, Yearly)
create table if not exists public.learning_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text default 'daily' check (type in ('daily', 'weekly', 'monthly', 'yearly')),
  title text not null,
  description text,
  course text,
  difficulty text default 'Medium',
  estimated_duration int default 45, -- in minutes
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'skipped')),
  target_date date default current_date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. STUDY SESSIONS (Stopwatch / Timer Logs)
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  activity text default 'Study',
  duration int not null, -- in seconds
  session_date date default current_date not null,
  start_time text,
  end_time text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. STREAKS & HABITS
create table if not exists public.streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  current_streak int default 0,
  longest_streak int default 0,
  total_active_days int default 0,
  last_active_date date,
  activity_dates date[] default '{}',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ASSIGNMENTS
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  subject text,
  difficulty int default 3,
  estimated_hours numeric default 2.0,
  deadline date not null,
  importance int default 3,
  priority_score int default 50,
  priority_category text default 'MEDIUM' check (priority_category in ('HIGH', 'MEDIUM', 'LOW')),
  status text default 'pending' check (status in ('pending', 'completed')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 9. EXAMS
create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  exam_type text default 'Internal/Mid Exam',
  subject text,
  exam_date date not null,
  syllabus text,
  prep_progress int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. UNIFIED CALENDAR EVENTS
create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null check (event_type in ('assignment', 'exam', 'target', 'custom')),
  reference_id uuid,
  title text not null,
  event_date date not null,
  detail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. SKILL QUIZ ATTEMPTS
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  quiz_id text not null,
  topic text not null,
  score int not null,
  correct int not null,
  total int not null,
  strong_topics text[] default '{}',
  weak_topics text[] default '{}',
  recommendation text,
  attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. STUDY VAULT RESOURCES
create table if not exists public.study_vault_resources (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text,
  resource_type text default 'Notes',
  subject text,
  skill text,
  notes text,
  storage_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. ACADEMIC ATTENDANCE
create table if not exists public.attendance_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  total_working_days int default 0,
  present_days int default 0,
  required_percentage int default 75,
  subject_data jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can only access their own records
-- ============================================================

alter table public.student_profiles enable row level security;
alter table public.career_goals enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_steps enable row level security;
alter table public.learning_targets enable row level security;
alter table public.study_sessions enable row level security;
alter table public.streaks enable row level security;
alter table public.assignments enable row level security;
alter table public.exams enable row level security;
alter table public.calendar_events enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.study_vault_resources enable row level security;
alter table public.attendance_records enable row level security;

-- Policy helper: user owns row
create policy "Users can manage own profile" on public.student_profiles for all using (auth.uid() = user_id);
create policy "Users can manage own career goal" on public.career_goals for all using (auth.uid() = user_id);
create policy "Users can manage own roadmaps" on public.roadmaps for all using (auth.uid() = user_id);
create policy "Users can manage own roadmap steps" on public.roadmap_steps for all using (auth.uid() = user_id);
create policy "Users can manage own targets" on public.learning_targets for all using (auth.uid() = user_id);
create policy "Users can manage own study sessions" on public.study_sessions for all using (auth.uid() = user_id);
create policy "Users can manage own streaks" on public.streaks for all using (auth.uid() = user_id);
create policy "Users can manage own assignments" on public.assignments for all using (auth.uid() = user_id);
create policy "Users can manage own exams" on public.exams for all using (auth.uid() = user_id);
create policy "Users can manage own calendar events" on public.calendar_events for all using (auth.uid() = user_id);
create policy "Users can manage own quiz attempts" on public.quiz_attempts for all using (auth.uid() = user_id);
create policy "Users can manage own study resources" on public.study_vault_resources for all using (auth.uid() = user_id);
create policy "Users can manage own attendance" on public.attendance_records for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
create index if not exists idx_roadmap_steps_roadmap on public.roadmap_steps(roadmap_id);
create index if not exists idx_targets_user_date on public.learning_targets(user_id, target_date);
create index if not exists idx_sessions_user_date on public.study_sessions(user_id, session_date);
create index if not exists idx_calendar_user_date on public.calendar_events(user_id, event_date);
create index if not exists idx_assignments_user_deadline on public.assignments(user_id, deadline);
