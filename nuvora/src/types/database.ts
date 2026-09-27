// Hand-written types mirroring supabase/migrations/0001_nuvora_phase1_schema.sql.
// If you change the schema, update this file (or regenerate with the Supabase CLI:
// `supabase gen types typescript --project-id <id> --schema nuvora`).

export type Level = "beginner" | "intermediate" | "advanced";
export type TimeCommitment = "20min" | "30min" | "1hr" | "2hr_plus";
export type LessonType = "text" | "video" | "interactive" | "quiz" | "project";
export type EnrollmentStatus = "active" | "completed" | "paused";
export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  onboarding_completed: boolean;
  learning_goal: string | null;
  current_level: Level | null;
  time_commitment: TimeCommitment | null;
  learning_style: string | null;
  username: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Skill {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface LearningPath {
  id: string;
  skill_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  level: Level | null;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  learning_path_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  level: Level | null;
  estimated_hours: number | null;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface LessonContentBlock {
  type: "paragraph" | "code" | "list" | "image" | "callout";
  text?: string;
  language?: string;
  code?: string;
  items?: string[];
  src?: string;
  alt?: string;
}

export interface LessonContent {
  blocks?: LessonContentBlock[];
  note?: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  lesson_type: LessonType;
  content: LessonContent;
  estimated_minutes: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at: string | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  last_position: Record<string, unknown> | null;
  completed_at: string | null;
  updated_at: string;
}

export interface LearningGoal {
  id: string;
  user_id: string;
  goal_text: string;
  target_skill_id: string | null;
  daily_time_minutes: number | null;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string | null;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type AIMessageRole = "user" | "assistant" | "system";

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: AIMessageRole;
  content: string;
  created_at: string;
}

// Minimal Supabase Database interface for the `nuvora` schema, enough for
// createClient<Database, "nuvora"> to type `.from(...)` calls end to end.
export interface Database {
  nuvora: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      skill_categories: { Row: SkillCategory; Insert: Partial<SkillCategory>; Update: Partial<SkillCategory> };
      skills: { Row: Skill; Insert: Partial<Skill>; Update: Partial<Skill> };
      learning_paths: { Row: LearningPath; Insert: Partial<LearningPath>; Update: Partial<LearningPath> };
      courses: { Row: Course; Insert: Partial<Course>; Update: Partial<Course> };
      course_modules: { Row: CourseModule; Insert: Partial<CourseModule>; Update: Partial<CourseModule> };
      lessons: { Row: Lesson; Insert: Partial<Lesson>; Update: Partial<Lesson> };
      enrollments: { Row: Enrollment; Insert: Partial<Enrollment>; Update: Partial<Enrollment> };
      lesson_progress: { Row: LessonProgress; Insert: Partial<LessonProgress>; Update: Partial<LessonProgress> };
      learning_goals: { Row: LearningGoal; Insert: Partial<LearningGoal>; Update: Partial<LearningGoal> };
      ai_conversations: { Row: AIConversation; Insert: Partial<AIConversation>; Update: Partial<AIConversation> };
      ai_messages: { Row: AIMessage; Insert: Partial<AIMessage>; Update: Partial<AIMessage> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
