-- ============================================================
-- NUVORA — consolidated schema migration
-- Dedicated `nuvora` schema inside the shared Supabase project,
-- isolated from other apps' schemas (brainova, chatbi, noir_estate,
-- researchflow, public). Safe to re-run on a fresh project.
-- ============================================================
create schema if not exists nuvora;
grant usage on schema nuvora to anon, authenticated;

create or replace function nuvora.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table nuvora.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  is_admin boolean not null default false,
  onboarding_completed boolean not null default false,
  learning_goal text,
  current_level text check (current_level in ('beginner','intermediate','advanced')),
  time_commitment text check (time_commitment in ('20min','30min','1hr','2hr_plus')),
  learning_style text,
  username text unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at before update on nuvora.profiles
  for each row execute function nuvora.set_updated_at();

create or replace function nuvora.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into nuvora.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_nuvora on auth.users;
create trigger on_auth_user_created_nuvora after insert on auth.users
  for each row execute function nuvora.handle_new_user();

-- ---------- skill taxonomy ----------
create table nuvora.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text, icon text,
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create table nuvora.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references nuvora.skill_categories(id) on delete cascade,
  name text not null, slug text not null unique, description text, icon text,
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create index skills_category_idx on nuvora.skills(category_id);

-- ---------- learning hierarchy ----------
create table nuvora.learning_paths (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references nuvora.skills(id) on delete set null,
  title text not null, slug text not null unique, description text,
  level text check (level in ('beginner','intermediate','advanced')),
  is_published boolean not null default false, sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger learning_paths_set_updated_at before update on nuvora.learning_paths
  for each row execute function nuvora.set_updated_at();
create index learning_paths_skill_idx on nuvora.learning_paths(skill_id);

create table nuvora.courses (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid references nuvora.learning_paths(id) on delete cascade,
  title text not null, slug text not null unique, description text,
  level text check (level in ('beginner','intermediate','advanced')),
  estimated_hours numeric(5,1), is_published boolean not null default false, sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger courses_set_updated_at before update on nuvora.courses
  for each row execute function nuvora.set_updated_at();
create index courses_path_idx on nuvora.courses(learning_path_id);

create table nuvora.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references nuvora.courses(id) on delete cascade,
  title text not null, description text, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index course_modules_course_idx on nuvora.course_modules(course_id);

create table nuvora.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references nuvora.course_modules(id) on delete cascade,
  title text not null, slug text not null,
  lesson_type text not null default 'text' check (lesson_type in ('text','video','interactive','quiz','project')),
  content jsonb not null default '{}'::jsonb, estimated_minutes int, sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(module_id, slug)
);
create trigger lessons_set_updated_at before update on nuvora.lessons
  for each row execute function nuvora.set_updated_at();
create index lessons_module_idx on nuvora.lessons(module_id);

-- ---------- enrollment & progress ----------
create table nuvora.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references nuvora.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','paused')),
  enrolled_at timestamptz not null default now(), completed_at timestamptz,
  unique(user_id, course_id)
);
create index enrollments_user_idx on nuvora.enrollments(user_id);

create table nuvora.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references nuvora.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  last_position jsonb, completed_at timestamptz, updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);
create trigger lesson_progress_set_updated_at before update on nuvora.lesson_progress
  for each row execute function nuvora.set_updated_at();
create index lesson_progress_user_idx on nuvora.lesson_progress(user_id);

create table nuvora.learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_text text not null, target_skill_id uuid references nuvora.skills(id) on delete set null,
  daily_time_minutes int, created_at timestamptz not null default now()
);
create index learning_goals_user_idx on nuvora.learning_goals(user_id);

-- ---------- AI tutor foundation ----------
create table nuvora.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text, context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger ai_conversations_set_updated_at before update on nuvora.ai_conversations
  for each row execute function nuvora.set_updated_at();
create index ai_conversations_user_idx on nuvora.ai_conversations(user_id);

create table nuvora.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references nuvora.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null, created_at timestamptz not null default now()
);
create index ai_messages_conversation_idx on nuvora.ai_messages(conversation_id);

-- ---------- quiz engine ----------
create table nuvora.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references nuvora.lessons(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'single_choice' check (question_type in ('single_choice','multiple_choice','true_false')),
  explanation text, sort_order int not null default 0, created_at timestamptz not null default now()
);
create index quiz_questions_lesson_idx on nuvora.quiz_questions(lesson_id);

create table nuvora.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references nuvora.quiz_questions(id) on delete cascade,
  option_text text not null, is_correct boolean not null default false, sort_order int not null default 0
);
create index quiz_options_question_idx on nuvora.quiz_options(question_id);

create table nuvora.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references nuvora.lessons(id) on delete cascade,
  score int not null default 0, total int not null default 0,
  completed_at timestamptz not null default now()
);
create index quiz_attempts_user_idx on nuvora.quiz_attempts(user_id);
create index quiz_attempts_lesson_idx on nuvora.quiz_attempts(lesson_id);

create table nuvora.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references nuvora.quiz_attempts(id) on delete cascade,
  question_id uuid not null references nuvora.quiz_questions(id) on delete cascade,
  selected_option_id uuid references nuvora.quiz_options(id) on delete set null,
  is_correct boolean not null default false
);
create index quiz_answers_attempt_idx on nuvora.quiz_answers(attempt_id);

-- ---------- knowledge vault ----------
create table nuvora.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references nuvora.lessons(id) on delete set null,
  title text not null default 'Untitled note', content text not null default '',
  tags text[] not null default '{}', is_pinned boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger notes_set_updated_at before update on nuvora.notes
  for each row execute function nuvora.set_updated_at();
create index notes_user_idx on nuvora.notes(user_id);

-- ---------- spaced repetition ----------
create table nuvora.review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references nuvora.lessons(id) on delete cascade,
  interval_days int not null default 1, ease numeric(3,2) not null default 2.5,
  due_at timestamptz not null default now(), last_reviewed_at timestamptz,
  created_at timestamptz not null default now(), unique(user_id, lesson_id)
);
create index review_items_due_idx on nuvora.review_items(user_id, due_at);

-- ---------- project-based learning ----------
create table nuvora.projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references nuvora.courses(id) on delete cascade,
  title text not null, description text, requirements text[] not null default '{}',
  is_published boolean not null default false, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index projects_course_idx on nuvora.projects(course_id);

create table nuvora.project_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references nuvora.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_url text, notes text,
  status text not null default 'submitted' check (status in ('submitted','reviewed')),
  feedback text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create trigger project_submissions_set_updated_at before update on nuvora.project_submissions
  for each row execute function nuvora.set_updated_at();
create index project_submissions_user_idx on nuvora.project_submissions(user_id);
create index project_submissions_project_idx on nuvora.project_submissions(project_id);

-- ---------- career mode ----------
create table nuvora.careers (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique, description text,
  sort_order int not null default 0, created_at timestamptz not null default now()
);
create table nuvora.career_skills (
  id uuid primary key default gen_random_uuid(),
  career_id uuid not null references nuvora.careers(id) on delete cascade,
  skill_id uuid not null references nuvora.skills(id) on delete cascade,
  sort_order int not null default 0, unique(career_id, skill_id)
);
create index career_skills_career_idx on nuvora.career_skills(career_id);

create table nuvora.user_career_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_id uuid not null references nuvora.careers(id) on delete cascade,
  created_at timestamptz not null default now(), unique(user_id, career_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table nuvora.profiles enable row level security;
alter table nuvora.skill_categories enable row level security;
alter table nuvora.skills enable row level security;
alter table nuvora.learning_paths enable row level security;
alter table nuvora.courses enable row level security;
alter table nuvora.course_modules enable row level security;
alter table nuvora.lessons enable row level security;
alter table nuvora.enrollments enable row level security;
alter table nuvora.lesson_progress enable row level security;
alter table nuvora.learning_goals enable row level security;
alter table nuvora.ai_conversations enable row level security;
alter table nuvora.ai_messages enable row level security;
alter table nuvora.quiz_questions enable row level security;
alter table nuvora.quiz_options enable row level security;
alter table nuvora.quiz_attempts enable row level security;
alter table nuvora.quiz_answers enable row level security;
alter table nuvora.notes enable row level security;
alter table nuvora.review_items enable row level security;
alter table nuvora.projects enable row level security;
alter table nuvora.project_submissions enable row level security;
alter table nuvora.careers enable row level security;
alter table nuvora.career_skills enable row level security;
alter table nuvora.user_career_goals enable row level security;

create policy "profiles_select_own" on nuvora.profiles for select using (auth.uid() = id);
create policy "profiles_read_public" on nuvora.profiles for select using (is_public = true);
create policy "profiles_update_own" on nuvora.profiles for update using (auth.uid() = id);

create policy "skill_categories_read" on nuvora.skill_categories for select using (true);
create policy "skills_read" on nuvora.skills for select using (true);
create policy "learning_paths_read_published" on nuvora.learning_paths for select using (is_published = true or created_by = auth.uid());
create policy "courses_read_published" on nuvora.courses for select using (is_published = true or created_by = auth.uid());
create policy "course_modules_read" on nuvora.course_modules for select using (
  exists (select 1 from nuvora.courses c where c.id = course_modules.course_id and (c.is_published = true or c.created_by = auth.uid()))
);
create policy "lessons_read_published" on nuvora.lessons for select using (
  is_published = true and exists (
    select 1 from nuvora.course_modules m join nuvora.courses c on c.id = m.course_id
    where m.id = lessons.module_id and c.is_published = true
  )
);

create policy "skill_categories_admin_write" on nuvora.skill_categories for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "skills_admin_write" on nuvora.skills for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "learning_paths_admin_write" on nuvora.learning_paths for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "courses_admin_write" on nuvora.courses for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "course_modules_admin_write" on nuvora.course_modules for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "lessons_admin_write" on nuvora.lessons for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));

create policy "enrollments_owner" on nuvora.enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "enrollments_read_public" on nuvora.enrollments for select using (
  status = 'completed' and exists (select 1 from nuvora.profiles p where p.id = enrollments.user_id and p.is_public = true)
);
create policy "lesson_progress_owner" on nuvora.lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "learning_goals_owner" on nuvora.learning_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_conversations_owner" on nuvora.ai_conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_messages_owner" on nuvora.ai_messages for all
  using (exists (select 1 from nuvora.ai_conversations c where c.id = ai_messages.conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from nuvora.ai_conversations c where c.id = ai_messages.conversation_id and c.user_id = auth.uid()));

create policy "quiz_questions_read_published" on nuvora.quiz_questions for select using (
  exists (select 1 from nuvora.lessons l join nuvora.course_modules m on m.id = l.module_id join nuvora.courses c on c.id = m.course_id
    where l.id = quiz_questions.lesson_id and l.is_published = true and c.is_published = true)
);
create policy "quiz_options_read_published" on nuvora.quiz_options for select using (
  exists (select 1 from nuvora.quiz_questions q join nuvora.lessons l on l.id = q.lesson_id
    join nuvora.course_modules m on m.id = l.module_id join nuvora.courses c on c.id = m.course_id
    where q.id = quiz_options.question_id and l.is_published = true and c.is_published = true)
);
create policy "quiz_questions_admin_write" on nuvora.quiz_questions for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "quiz_options_admin_write" on nuvora.quiz_options for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "quiz_attempts_owner" on nuvora.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quiz_answers_owner" on nuvora.quiz_answers for all
  using (exists (select 1 from nuvora.quiz_attempts a where a.id = quiz_answers.attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from nuvora.quiz_attempts a where a.id = quiz_answers.attempt_id and a.user_id = auth.uid()));
create policy "notes_owner" on nuvora.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review_items_owner" on nuvora.review_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_read_published" on nuvora.projects for select using (is_published = true);
create policy "projects_admin_write" on nuvora.projects for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "project_submissions_owner" on nuvora.project_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "careers_read" on nuvora.careers for select using (true);
create policy "career_skills_read" on nuvora.career_skills for select using (true);
create policy "careers_admin_write" on nuvora.careers for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "career_skills_admin_write" on nuvora.career_skills for all
  using (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from nuvora.profiles p where p.id = auth.uid() and p.is_admin));
create policy "user_career_goals_owner" on nuvora.user_career_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Grants (RLS still governs row visibility; these grants only allow
-- PostgREST to route the request through to the table at all)
-- ============================================================
grant select, insert, update, delete on all tables in schema nuvora to authenticated;
grant select on nuvora.skill_categories, nuvora.skills, nuvora.learning_paths, nuvora.courses,
  nuvora.course_modules, nuvora.lessons, nuvora.quiz_questions, nuvora.quiz_options,
  nuvora.projects, nuvora.careers, nuvora.career_skills, nuvora.profiles, nuvora.enrollments to anon;

-- ============================================================
-- Admin platform stats — SECURITY DEFINER, checks admin status itself
-- rather than widening table RLS (same pattern used elsewhere in this project)
-- ============================================================
create or replace function nuvora.get_admin_platform_stats()
returns table (
  total_users bigint, total_enrollments bigint, total_lessons_completed bigint,
  total_published_courses bigint, total_notes bigint, total_ai_conversations bigint
)
language plpgsql
security definer
set search_path = nuvora, pg_catalog
as $$
begin
  if not exists (select 1 from nuvora.profiles where id = auth.uid() and is_admin = true) then
    raise exception 'not authorized';
  end if;
  return query select
    (select count(*) from nuvora.profiles),
    (select count(*) from nuvora.enrollments),
    (select count(*) from nuvora.lesson_progress where status = 'completed'),
    (select count(*) from nuvora.courses where is_published = true),
    (select count(*) from nuvora.notes),
    (select count(*) from nuvora.ai_conversations);
end;
$$;
revoke all on function nuvora.get_admin_platform_stats() from public, anon;
grant execute on function nuvora.get_admin_platform_stats() to authenticated;
