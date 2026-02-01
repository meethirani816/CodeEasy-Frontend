import apiClient from "./apiClient";
import { Submission, SubmissionResult } from "@/types";

// Piston language IDs (same as Judge0 for compatibility)
const LANGUAGE_IDS: Record<string, number> = {
  c: 50, // C (GCC)
  cpp: 54, // C++ (GCC)
  javascript: 63, // JavaScript (Node.js)
  python: 71, // Python 3
  java: 62, // Java (OpenJDK)
  ruby: 72, // Ruby
  typescript: 74, // TypeScript
  go: 60, // Go
  rust: 73, // Rust
  csharp: 51, // C#
  php: 68, // PHP
  swift: 83, // Swift
  kotlin: 78, // Kotlin
  scala: 81, // Scala
  elixir: 57, // Elixir
  haskell: 61, // Haskell
  lua: 64, // Lua
  r: 80, // R
  perl: 85, // Perl
  clojure: 86, // Clojure (fallback to Python)
  fsharp: 87, // F# (fallback to C#)
  ocaml: 65, // OCaml (fallback to Haskell)
  erlang: 58, // Erlang (fallback to Elixir)
  dart: 90, // Dart
  bash: 46, // Bash
  julia: 71, // Julia (fallback to Python)
  zig: 50, // Zig (fallback to C)
  nim: 50, // Nim (fallback to C)
  crystal: 72, // Crystal (fallback to Ruby)
  powershell: 46, // PowerShell (fallback to Bash)
};

export interface PistonResponse {
  success: boolean;
  submission: {
    _id?: string;
    result: {
      status: string;
      stdout: string | null;
      stderr: string | null;
      compileOutput: string | null;
      time: string;
      memory: number;
    };
    passed: boolean;
    testResults?: Array<{
      input: string;
      expectedOutput: string;
      actualOutput: string;
      passed: boolean;
    }>;
  };
}

export const submissionsApi = {
  /**
   * Submit code to Piston backend
   */
  submitCode: async (
    track: string,
    category: string,
    exerciseSlug: string,
    sourceCode: string,
    language: string,
  ): Promise<{ submission: Submission; result: SubmissionResult }> => {
    const languageId = LANGUAGE_IDS[language] || 63;

    try {
      const response = await apiClient.post<PistonResponse>(
        "/api/submissions",
        {
          track,
          category,
          exerciseSlug,
          sourceCode,
          languageId,
        },
      );

      const { submission } = response.data;
      const passed = submission.passed;
      const result = submission.result;

      // Normalize to our frontend types
      const normalizedResult: SubmissionResult = {
        passed,
        output: result.stdout || "",
        error: result.stderr || result.compileOutput || undefined,
        executionTime: parseFloat(result.time) || 0,
        testResults: submission.testResults || [
          {
            input: "Submission",
            expectedOutput: "Accepted",
            actualOutput: result.status,
            passed,
          },
        ],
      };

      const normalizedSubmission: Submission = {
        _id: submission._id || Date.now().toString(),
        user: "",
        exercise: exerciseSlug,
        code: sourceCode,
        language,
        status: passed ? "passed" : "failed",
        result: normalizedResult,
        createdAt: new Date().toISOString(),
      };

      return { submission: normalizedSubmission, result: normalizedResult };
    } catch (error: any) {
      // Handle errors gracefully
      const errorMessage =
        error.response?.data?.error || error.message || "Submission failed";
      throw new Error(errorMessage);
    }
  },

  getUserSubmissions: async (userId: string): Promise<Submission[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Submission[];
    }>(`/api/submissions/user/${userId}`);
    return response.data.data || [];
  },

  getExerciseSubmissions: async (exerciseId: string): Promise<Submission[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Submission[];
    }>(`/api/submissions/exercise/${exerciseId}`);
    return response.data.data || [];
  },
};