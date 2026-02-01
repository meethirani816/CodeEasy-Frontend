import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { exercisesApi } from "@/api/exercises";
import { submissionsApi } from "@/api/submissions";
import { progressApi } from "@/api/progress";
import { Exercise, SubmissionResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  cleanExerciseMarkdown,
  darkMarkdownComponents,
  processConceptLinks,
} from "@/lib/markdown";
import { getTrackConfig } from "@/components/TrackIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  FileCode,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Send,
  BookOpen,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea as EditorScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Monaco editor language mappings for all supported tracks
const languageMap: Record<string, string> = {
  c: "c",
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
  ruby: "ruby",
  typescript: "typescript",
  go: "go",
  rust: "rust",
  csharp: "csharp",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  elixir: "elixir",
  haskell: "haskell",
  lua: "lua",
  r: "r",
  julia: "julia",
  perl: "perl",
  clojure: "clojure",
  fsharp: "fsharp",
  ocaml: "ocaml",
  erlang: "erlang",
  zig: "zig",
  nim: "nim",
  crystal: "ruby", // Crystal syntax is similar to Ruby
  dart: "dart",
  bash: "shell",
  powershell: "powershell",
};

// Helper to extract code string from starterCode (can be string or object with multiple files)
// For C/C++ tracks with multiple files (.c, .h), we handle them appropriately
const getStarterCodeString = (
  starterCode: string | Record<string, string> | undefined,
  track?: string,
): string | undefined => {
  if (!starterCode) return undefined;
  if (typeof starterCode === "string") return starterCode;

  // For object format (multiple files like C/C++ with .c and .h files)
  const entries = Object.entries(starterCode);
  if (entries.length === 0) return undefined;

  // For C/C++, show only the .c file (solution file) in editor
  // The .h file is typically provided but not edited
  if (track === "c" || track === "cpp") {
    // Find the main solution file (.c for C, .cpp for C++)
    const solutionExt = track === "c" ? ".c" : ".cpp";
    const solutionEntry = entries.find(
      ([filename]) =>
        filename.endsWith(solutionExt) && !filename.includes("test"),
    );
    if (solutionEntry) {
      return solutionEntry[1];
    }
    // Fallback: find any .c or .cpp file
    const cEntry = entries.find(
      ([filename]) => filename.endsWith(".c") || filename.endsWith(".cpp"),
    );
    if (cEntry) {
      return cEntry[1];
    }
  }

  // For other languages, return the first file's content
  return entries[0][1];
};

// Parse hints from markdown format
interface ParsedHint {
  title: string;
  content: string;
}

const parseHintsFromMarkdown = (hintsMarkdown: string): ParsedHint[] => {
  if (!hintsMarkdown) return [];

  const hints: ParsedHint[] = [];

  // Split by ## Hint patterns or numbered patterns
  const sections = hintsMarkdown.split(
    /(?=##\s*(?:Hint\s*)?\d+[.:]?|(?=\n\d+\.\s+))/gi,
  );

  sections.forEach((section, index) => {
    const trimmed = section.trim();
    if (!trimmed) return;

    // Extract title from first line
    const lines = trimmed.split("\n");
    let title = lines[0]
      .replace(/^#+\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();
    let content = lines.slice(1).join("\n").trim();

    // If no clear title, create one
    if (!title || title.toLowerCase().startsWith("hint")) {
      const match = title.match(/hint\s*(\d+)/i);
      const hintNum = match ? match[1] : (hints.length + 1).toString();
      title = `Hint ${hintNum}`;
    }

    // Clean up content
    content = content.replace(/^[-–—]\s*/, "");

    if (content) {
      hints.push({ title, content });
    }
  });

  return hints;
};

// Parse hints from array format
const parseHintsFromArray = (hints: string[]): ParsedHint[] => {
  return hints
    .filter((h) => h && h.trim())
    .map((hint, index) => {
      // Check if hint has a title pattern like "## 1. Title - Content"
      const match = hint.match(
        /^(?:##?\s*)?(\d+\.?\s*)?(.+?)(?:\s*[-–—]\s*)(.+)$/s,
      );

      if (match) {
        const [, , title, content] = match;
        return {
          title: title?.trim() || `Hint ${index + 1}`,
          content: content?.trim() || hint,
        };
      }

      // Simple hint without title
      return {
        title: `Hint ${index + 1}`,
        content: hint.trim(),
      };
    });
};

const CodeEditorPage: React.FC = () => {
  // Support both new route format and legacy format
  const {
    slug: trackSlug,
    category,
    exerciseSlug,
    id,
  } = useParams<{
    slug?: string;
    category?: string;
    exerciseSlug?: string;
    id?: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<Record<string, string>>({}); // Multi-file support
  const [activeFile, setActiveFile] = useState<string>(""); // Active file tab
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [openHints, setOpenHints] = useState<string[]>([]);
  const hintsRef = useRef<HTMLDivElement | null>(null);

  // Use TrackIcon helper for consistent icons
  const getTrackIconConfig = (slug: string) => getTrackConfig(slug);

  useEffect(() => {
    const fetchExercise = async () => {
      // Build exercise ID from route params
      const exerciseId =
        trackSlug && category && exerciseSlug
          ? `${trackSlug}-${category}-${exerciseSlug}`
          : id;

      if (!exerciseId && !trackSlug) return;

      try {
        setIsLoading(true);
        let data: Exercise;

        if (trackSlug && category && exerciseSlug) {
          // New route format
          data = await exercisesApi.getExerciseBySlug(
            trackSlug,
            category,
            exerciseSlug,
          );
        } else if (exerciseId) {
          // Legacy format
          data = await exercisesApi.getExerciseById(exerciseId);
        } else {
          throw new Error("Invalid route params");
        }

        setExercise(data);
        const currentTrackSlug =
          typeof data.track === "string"
            ? data.track
            : data.track?.slug || "javascript";

        // Handle multi-file exercises (like C/C++ with .c and .h files)
        if (data.starterCode && typeof data.starterCode === "object") {
          const filesObj = data.starterCode as Record<string, string>;
          setFiles(filesObj);
          // Set first file as active
          const fileNames = Object.keys(filesObj);
          if (fileNames.length > 0) {
            // Prefer solution file over header file
            const solutionFile = fileNames.find(
              (f) =>
                f.endsWith(".c") ||
                f.endsWith(".cpp") ||
                f.endsWith(".py") ||
                f.endsWith(".js") ||
                f.endsWith(".ts"),
            );
            setActiveFile(solutionFile || fileNames[0]);
            setCode(filesObj[solutionFile || fileNames[0]]);
          }
        } else {
          // Single file exercise
          const starterCode =
            getStarterCodeString(data.starterCode, currentTrackSlug) ||
            getDefaultCode(currentTrackSlug);
          setCode(starterCode);
          setFiles({});
          setActiveFile("");
        }
      } catch (err) {
        const currentTrack = trackSlug || "javascript";
        const fallbackExercise: Exercise = {
          _id: exerciseId || `${trackSlug}-${category}-${exerciseSlug}`,
          title: "Hello World",
          slug: "hello-world",
          description:
            'The classical introductory exercise. Just say "Hello, World!"',
          difficulty: "easy",
          category: category || "1",
          track: currentTrack,
          instructions: `## Instructions

The classical introductory exercise. Just say "Hello, World!".

### Task

Create a function called \`hello\` that returns the string "Hello, World!".

### Example

\`\`\`javascript
hello();
// => "Hello, World!"
\`\`\`
`,
          hints: [
            "Think about what a function that takes no arguments looks like.",
            "Remember to return the string, not just log it.",
          ],
          starterCode: `//
// This is only a STUB for writing your solution.
//
export function hello() {
  // Your code here
  return "Hello, World!";
}`,
          createdAt: new Date().toISOString(),
        };
        setExercise(fallbackExercise);
        setCode(
          getStarterCodeString(fallbackExercise.starterCode, currentTrack) ||
            getDefaultCode(currentTrack),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [trackSlug, category, exerciseSlug, id]);

  const getDefaultCode = (track: string): string => {
    const defaults: Record<string, string> = {
      c: `#include "exercise.h"

// Your solution code here
`,
      cpp: `#include "exercise.h"

// Your solution code here
`,
      javascript: `//
// This is only a STUB file. Write your solution here.
//
export function solution() {
  // Your code here
}`,
      typescript: `//
// This is only a STUB file. Write your solution here.
//
export function solution(): void {
  // Your code here
}`,
      python: `def solution():
    # Your code here
    pass`,
      ruby: `class Solution
  def self.call
    # Your code here
  end
end`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
      go: `package main

func solution() {
	// Your code here
}`,
      rust: `pub fn solution() {
    // Your code here
}`,
      csharp: `using System;

public class Solution
{
    public static void Main()
    {
        // Your code here
    }
}`,
      php: `<?php
function solution() {
    // Your code here
}`,
      swift: `func solution() {
    // Your code here
}`,
      kotlin: `fun solution() {
    // Your code here
}`,
      scala: `object Solution {
  def main(args: Array[String]): Unit = {
    // Your code here
  }
}`,
      elixir: `defmodule Solution do
  def call do
    # Your code here
  end
end`,
      haskell: `module Solution where

solution :: IO ()
solution = do
  -- Your code here
  return ()`,
      lua: `function solution()
    -- Your code here
end`,
      r: `solution <- function() {
  # Your code here
}`,
      julia: `function solution()
    # Your code here
end`,
      perl: `sub solution {
    # Your code here
}`,
      clojure: `(defn solution []
  ;; Your code here
  )`,
      fsharp: `let solution () =
    // Your code here
    ()`,
      ocaml: `let solution () =
  (* Your code here *)
  ()`,
      erlang: `-module(solution).
-export([solution/0]).

solution() ->
    % Your code here
    ok.`,
      dart: `void solution() {
  // Your code here
}`,
      bash: `#!/bin/bash
# Your code here`,
      powershell: `# Your code here`,
    };
    return defaults[track] || "// Your code here";
  };

  // Handle file tab change
  const handleFileChange = (fileName: string) => {
    // Save current file content
    if (activeFile && files[activeFile] !== undefined) {
      setFiles((prev) => ({ ...prev, [activeFile]: code }));
    }
    setActiveFile(fileName);
    setCode(files[fileName] || "");
  };

  // Update code and sync to files
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    if (activeFile) {
      setFiles((prev) => ({ ...prev, [activeFile]: newCode }));
    }
  };

  const getLanguage = (): string => {
    const langTrackSlug =
      typeof exercise?.track === "string"
        ? exercise.track
        : exercise?.track?.slug || "javascript";
    return languageMap[langTrackSlug] || "javascript";
  };

  const handleRun = async () => {
    if (!exercise) return;

    setIsRunning(true);
    setResult(null);

    const currentTrack =
      typeof exercise.track === "string"
        ? exercise.track
        : exercise.track?.slug || "javascript";
    const currentCat =
      category ||
      (typeof exercise.category === "string" ? exercise.category : "practice");
    const currentExSlug = exerciseSlug || exercise.slug;

    try {
      const response = await submissionsApi.submitCode(
        currentTrack,
        currentCat,
        currentExSlug,
        code,
        getLanguage(),
      );
      setResult(response.result);

      if (response.result.passed) {
        // Mark exercise as completed
        await progressApi.markCompleted(
          currentTrack,
          currentCat,
          currentExSlug,
        );

        toast({
          title: "All tests passed!",
          description: "Great job! Your solution is correct.",
        });
      } else {
        toast({
          title: "Some tests failed",
          description: response.result.error || "Check the output for details.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Submission failed";
      toast({
        title: "Submission error",
        description: errorMessage,
        variant: "destructive",
      });

      // Show error in result panel
      setResult({
        passed: false,
        output: "",
        error: errorMessage,
        testResults: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    const currentTrack =
      typeof exercise?.track === "string"
        ? exercise.track
        : exercise?.track?.slug || "javascript";
    if (exercise?.starterCode && typeof exercise.starterCode === "object") {
      // Multi-file: reset all files
      const filesObj = exercise.starterCode as Record<string, string>;
      setFiles(filesObj);
      const fileNames = Object.keys(filesObj);
      const solutionFile = fileNames.find(
        (f) =>
          f.endsWith(".c") ||
          f.endsWith(".cpp") ||
          f.endsWith(".py") ||
          f.endsWith(".js") ||
          f.endsWith(".ts"),
      );
      const firstFile = solutionFile || fileNames[0];
      setActiveFile(firstFile);
      setCode(filesObj[firstFile] || getDefaultCode(currentTrack));
    } else if (exercise?.starterCode) {
      setCode(
        getStarterCodeString(exercise.starterCode, currentTrack) ||
          getDefaultCode(currentTrack),
      );
    } else {
      setCode(getDefaultCode(currentTrack));
    }
    setResult(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <p className="text-gray-400">Exercise not found</p>
      </div>
    );
  }

  const currentTrackSlug =
    typeof exercise.track === "string"
      ? exercise.track
      : exercise.track?.slug || "javascript";
  const trackName =
    currentTrackSlug === "c"
      ? "C"
      : currentTrackSlug === "javascript"
        ? "JavaScript"
        : currentTrackSlug.toUpperCase();
  const iconConfig = getTrackIconConfig(currentTrackSlug);

  // Parse hints - support both array and markdown string formats
  let parsedHints: ParsedHint[] = [];
  if (exercise.hints) {
    if (Array.isArray(exercise.hints)) {
      parsedHints = parseHintsFromArray(exercise.hints);
    } else if (typeof exercise.hints === "string") {
      parsedHints = parseHintsFromMarkdown(exercise.hints);
    }
  }
  const hasHints = parsedHints.length > 0;

  // Extract introduction and instructions from exercise data
  // Look for introduction in exercise data or extract from instructions
  let introduction = "";
  let instructions = exercise.instructions || "";

  // Check if exercise has separate introduction field
  if ((exercise as any).introduction) {
    introduction = (exercise as any).introduction;
  } else {
    // Try to extract introduction from instructions markdown
    const introMatch = instructions.match(
      /^#*\s*Introduction\s*\n([\s\S]*?)(?=\n#|$)/i,
    );
    if (introMatch) {
      introduction = introMatch[1].trim();
      // Remove introduction from instructions
      instructions = instructions
        .replace(/^#*\s*Introduction\s*\n[\s\S]*?(?=\n#|$)/i, "")
        .trim();
    }
  }

  // Clean the instructions markdown
  const cleanedInstructions = cleanExerciseMarkdown(instructions);

  // Process coancept links
  const processedIntroduction = processConceptLinks(
    introduction,
    currentTrackSlug,
  );
  const processedInstructions = processConceptLinks(
    cleanedInstructions,
    currentTrackSlug,
  );

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header - Dark theme like Exercism editor */}
      <header className="bg-[#2d2d2d] border-b border-[#3d3d3d] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const backCategory = category || exercise?.category || "practice";
              const backExerciseSlug = exerciseSlug || exercise?.slug || "";
              navigate(
                `/tracks/${currentTrackSlug}/exercises/${backCategory}/${backExerciseSlug}`,
              );
            }}
            className="text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="h-5 w-px bg-[#3d3d3d]" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-5 h-5 ${iconConfig.bg} hexagon flex items-center justify-center ${iconConfig.text} text-[8px] font-bold`}
            >
              {iconConfig.letter}
            </div>
            <span className="text-gray-400">{trackName}</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-white font-medium">{exercise.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!hasHints) return;
              // Reveal the first hint and scroll to the hints section
              setOpenHints((prev) =>
                prev.includes("hint-0") ? prev : [...prev, "hint-0"],
              );
              // allow layout to paint before scrolling
              requestAnimationFrame(() =>
                hintsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              );
            }}
            className="text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
            disabled={!hasHints}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Stuck? Get help
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-300 hover:text-white hover:bg-[#3d3d3d]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Instructions (Exercism-style single pane) */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col bg-[#252526] overflow-hidden">
            <EditorScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                {/* Introduction */}
                {processedIntroduction?.trim() && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Introduction
                        </h2>
                        <p className="text-sm text-gray-400">Start here</p>
                      </div>
                    </div>
                    <div className="prose-container break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={darkMarkdownComponents}
                      >
                        {processedIntroduction}
                      </ReactMarkdown>
                    </div>
                  </section>
                )}

                {/* Instructions */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Instructions
                      </h2>
                      <p className="text-sm text-gray-400">{exercise.title}</p>
                    </div>
                  </div>
                  <div className="prose-container break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={darkMarkdownComponents}
                    >
                      {processedInstructions || "No instructions available."}
                    </ReactMarkdown>
                  </div>
                </section>

                {/* Hints */}
                {hasHints && (
                  <section ref={hintsRef}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Hints</h2>
                        <p className="text-sm text-gray-400">
                          Reveal one at a time
                        </p>
                      </div>
                    </div>

                    <Accordion
                      type="multiple"
                      value={openHints}
                      onValueChange={setOpenHints}
                      className="space-y-3"
                    >
                      {parsedHints.map((hint, index) => (
                        <AccordionItem
                          key={index}
                          value={`hint-${index}`}
                          className="bg-[#1e1e1e] rounded-lg border border-[#3d3d3d] overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-[#2a2a2a] hover:no-underline">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-full flex items-center justify-center text-sm text-yellow-400 font-semibold">
                                {index + 1}
                              </span>
                              <span className="text-gray-200 text-sm font-medium text-left">
                                {hint.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-0 border-t border-[#3d3d3d]">
                            <div className="pt-4 pl-10 prose-container">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={darkMarkdownComponents}
                              >
                                {processConceptLinks(
                                  hint.content,
                                  currentTrackSlug,
                                )}
                              </ReactMarkdown>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                )}
              </div>
            </EditorScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-[#3d3d3d] hover:bg-primary/50 transition-colors" />

        {/* Right Panel - Editor & Output */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            {/* Code Editor with File Tabs */}
            <ResizablePanel defaultSize={70} minSize={30}>
              <div className="h-full flex flex-col">
                {/* File Tabs (only shown for multi-file exercises) */}
                {Object.keys(files).length > 1 && (
                  <div className="flex bg-[#252526] border-b border-[#3d3d3d] overflow-x-auto shrink-0">
                    {Object.keys(files).map((fileName) => (
                      <button
                        key={fileName}
                        onClick={() => handleFileChange(fileName)}
                        className={`px-4 py-2 text-sm font-mono flex items-center gap-2 border-r border-[#3d3d3d] transition-colors ${
                          activeFile === fileName
                            ? "bg-[#1e1e1e] text-white border-t-2 border-t-primary"
                            : "bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d] hover:text-gray-200"
                        }`}
                      >
                        <FileCode className="w-4 h-4" />
                        {fileName}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={getLanguage()}
                    value={code}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                      padding: { top: 16 },
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="h-1 bg-[#3d3d3d] hover:bg-primary/50 transition-colors" />

            {/* Output Panel */}
            <ResizablePanel defaultSize={30} minSize={15}>
              <div className="h-full bg-[#1e1e1e] flex flex-col overflow-hidden">
                <div className="px-4 py-2 border-b border-[#3d3d3d] flex items-center justify-between bg-[#252526] shrink-0">
                  <span className="font-medium text-sm text-gray-300">
                    Test Results
                  </span>
                  {result && (
                    <Badge
                      className={`text-xs ${
                        result.passed
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {result.passed ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          All Tests Passed
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Tests Failed
                        </>
                      )}
                    </Badge>
                  )}
                </div>
                <EditorScrollArea className="flex-1">
                  <div className="p-4">
                    {result ? (
                      <div className="space-y-3">
                        {result.error && (
                          <div className="rounded-lg p-3 text-sm border bg-red-500/10 border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="font-medium text-red-400">
                                Error
                              </span>
                            </div>
                            <pre className="text-xs text-red-300 whitespace-pre-wrap break-words font-mono">
                              {result.error}
                            </pre>
                          </div>
                        )}
                        {result.output && !result.error && (
                          <div className="rounded-lg p-3 text-sm border bg-[#252526] border-[#3d3d3d]">
                            <div className="text-xs text-gray-400 mb-2">
                              Output:
                            </div>
                            <pre className="text-gray-200 whitespace-pre-wrap break-words font-mono text-xs">
                              {result.output}
                            </pre>
                          </div>
                        )}
                        {result.testResults?.map((test, index) => (
                          <div
                            key={index}
                            className={`rounded-lg p-3 text-sm border ${
                              test.passed
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-red-500/10 border-red-500/20"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {test.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <span className="font-medium text-gray-200">
                                Test {index + 1}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs font-mono">
                              {test.input && (
                                <div className="text-gray-400">
                                  <span className="text-gray-500">Input: </span>
                                  <span className="text-gray-300">
                                    {typeof test.input === "object"
                                      ? JSON.stringify(test.input)
                                      : test.input}
                                  </span>
                                </div>
                              )}
                              {test.expectedOutput && (
                                <div className="text-gray-400">
                                  <span className="text-gray-500">
                                    Expected:{" "}
                                  </span>
                                  <span className="text-green-400">
                                    {typeof test.expectedOutput === "object"
                                      ? JSON.stringify(test.expectedOutput)
                                      : test.expectedOutput}
                                  </span>
                                </div>
                              )}
                              {test.actualOutput && (
                                <div className="text-gray-400">
                                  <span className="text-gray-500">
                                    Actual:{" "}
                                  </span>
                                  <span
                                    className={
                                      test.passed
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }
                                  >
                                    {typeof test.actualOutput === "object"
                                      ? JSON.stringify(test.actualOutput)
                                      : test.actualOutput}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {result.executionTime && (
                          <div className="text-xs text-gray-500 pt-2">
                            Execution time: {result.executionTime}s
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-gray-500 text-sm">
                          Click "Run Tests" to see the output
                        </p>
                      </div>
                    )}
                  </div>
                </EditorScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default CodeEditorPage;