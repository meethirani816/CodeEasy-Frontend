export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin' | string;
  createdAt?: string;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}


export interface Track {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  exerciseCount?: number;
  studentCount?: number;
  conceptCount?: number;
  tags?: string[];
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  track: string;
  exerciseCount?: number;
  order?: number;
  createdAt: string;
}

export interface Exercise {
  _id: string;
  title: string;
  slug: string;
  /** Short blurb/summary shown in lists */
  description: string;
  /** Optional long-form introduction shown above instructions */
  introduction?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string | Category;
  track: string | Track;
  instructions: string;
  hints?: string[];
  /** Can be string for single file or Record<string, string> for multi-file exercises */
  starterCode?: string | Record<string, string>;
  solution?: string;
  testCases?: TestCase[];
  exerciseType?: 'tutorial' | 'learning' | 'practice';
  order?: number;
  createdAt: string;
  /** External source attribution */
  source?: string;
  source_url?: string;
  /** External links for learning more */
  links?: { url: string; description: string }[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface Submission {
  _id: string;
  user: string;
  exercise: string;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  result?: SubmissionResult;
  createdAt: string;
}

export interface SubmissionResult {
  passed: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memory?: number;
  testResults?: TestResult[];
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface UserProgress {
  _id: string;
  user: string;
  track: string | Track;
  completedExercises: string[];
  currentExercise?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Track config from backend config.json
export interface TrackConfig {
  language: string;
  slug: string;
  blurb: string;
  version: number;
  status?: {
    concept_exercises: boolean;
    test_runner: boolean;
    representer: boolean;
    analyzer: boolean;
  };
  online_editor?: {
    indent_style: string;
    indent_size: number;
  };
  exercises?: {
    concept: ConceptExerciseConfig[];
    practice: PracticeExerciseConfig[];
  };
  concepts?: ConceptConfig[];
  key_features?: KeyFeature[];
  tags?: string[];
}

export interface ConceptExerciseConfig {
  slug: string;
  name: string;
  uuid: string;
  concepts: string[];
  prerequisites: string[];
  status?: string;
}

export interface PracticeExerciseConfig {
  slug: string;
  name: string;
  uuid: string;
  practices: string[];
  prerequisites: string[];
  difficulty: number;
  topics?: string[];
  status?: string;
}

export interface ConceptConfig {
  uuid: string;
  slug: string;
  name: string;
}

export interface KeyFeature {
  title: string;
  content: string;
  icon: string;
}

// Concept detail from backend
export interface ConceptDetail {
  track: string;
  concept: string;
  about: string;
  introduction: string;
  links: ConceptLink[];
}

export interface ConceptLink {
  url: string;
  description: string;
  icon_url?: string;
}