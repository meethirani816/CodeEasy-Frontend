import apiClient from './apiClient';
import { Submission, SubmissionResult } from '@/types';

// Judge0 language IDs - All popular Exercism languages
const LANGUAGE_IDS: Record<string, number> = {
  c: 50,           // C (GCC 9.2.0)
  cpp: 54,         // C++ (GCC 9.2.0)
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  python: 71,      // Python 3
  java: 62,        // Java (OpenJDK 13.0.1)
  ruby: 72,        // Ruby (2.7.0)
  typescript: 74,  // TypeScript (3.7.4)
  go: 60,          // Go (1.13.5)
  rust: 73,        // Rust (1.40.0)
  csharp: 51,      // C# (Mono 6.6.0.161)
  php: 68,         // PHP (7.4.1)
  swift: 83,       // Swift (5.2.3)
  kotlin: 78,      // Kotlin (1.3.70)
  scala: 81,       // Scala (2.13.2)
  elixir: 57,      // Elixir (1.9.4)
  haskell: 61,     // Haskell (GHC 8.8.1)
  lua: 64,         // Lua (5.3.5)
  r: 80,           // R (4.0.0)
  perl: 85,        // Perl (5.28.1)
  clojure: 86,     // Clojure (1.10.1)
  fsharp: 87,      // F# (.NET Core SDK 3.1.202)
  ocaml: 65,       // OCaml (4.09.0)
  erlang: 58,      // Erlang (OTP 22.2)
  dart: 90,        // Dart (2.19.2)
  bash: 46,        // Bash (5.0.0)
  // Languages without direct Judge0 support - use closest alternative or custom
  julia: 71,       // Fallback to Python for now
  zig: 50,         // Fallback to C for now
  nim: 50,         // Fallback to C for now
  crystal: 72,     // Fallback to Ruby for now
  powershell: 46,  // Fallback to Bash for now
};

export interface Judge0Response {
  message: string;
  submission: {
    _id: string;
    result: {
      status: string;
      stdout: string | null;
      stderr: string | null;
      compileOutput: string | null;
      time: string;
      memory: number;
    };
    passed: boolean;
  };
}

export const submissionsApi = {
  /**
   * Submit code to Judge0 backend
   */
  submitCode: async (
    track: string,
    category: string,
    exerciseSlug: string,
    sourceCode: string,
    language: string
  ): Promise<{ submission: Submission; result: SubmissionResult }> => {
    const languageId = LANGUAGE_IDS[language] || 63;

    try {
      const response = await apiClient.post<Judge0Response>('/api/submissions', {
        track,
        category,
        exerciseSlug,
        sourceCode,
        languageId,
      });

      const { submission } = response.data;
      const passed = submission.passed;
      const result = submission.result;

      // Normalize to our frontend types
      const normalizedResult: SubmissionResult = {
        passed,
        output: result.stdout || '',
        error: result.stderr || result.compileOutput || undefined,
        executionTime: parseFloat(result.time) || 0,
        memory: result.memory,
        testResults: [
          {
            input: 'Submission',
            expectedOutput: 'Accepted',
            actualOutput: result.status,
            passed,
          },
        ],
      };

      const normalizedSubmission: Submission = {
        _id: submission._id,
        user: '',
        exercise: exerciseSlug,
        code: sourceCode,
        language,
        status: passed ? 'passed' : 'failed',
        result: normalizedResult,
        createdAt: new Date().toISOString(),
      };

      return { submission: normalizedSubmission, result: normalizedResult };
    } catch (error: any) {
      // Handle errors gracefully
      const errorMessage = error.response?.data?.error || error.message || 'Submission failed';
      throw new Error(errorMessage);
    }
  },

  getUserSubmissions: async (userId: string): Promise<Submission[]> => {
    const response = await apiClient.get<{ success: boolean; data: Submission[] }>(
      `/api/submissions/user/${userId}`
    );
    return response.data.data || [];
  },

  getExerciseSubmissions: async (exerciseId: string): Promise<Submission[]> => {
    const response = await apiClient.get<{ success: boolean; data: Submission[] }>(
      `/api/submissions/exercise/${exerciseId}`
    );
    return response.data.data || [];
  },
};
