import apiClient from './apiClient';
import { Exercise } from '@/types';

// Response types matching your backend
interface CategoriesResponse {
  track: string;
  categories: string[];
}

interface ExerciseSlugsResponse {
  track: string;
  category: string;
  exercises: string[];
}

interface ExerciseDetailResponse {
  track: string;
  category: string;
  exercise: {
    slug: string;
    title?: string;
    blurb?: string;
    language?: string;
    type?: string;
    authors?: string[];
    source?: string;
    source_url?: string;
    docs?: {
      introduction?: string;
      instructions?: string;
      hints?: string;
    };
    // Can be string OR object for multi-file exercises (C/C++)
    starter_code?: string | Record<string, string>;
    tests?: string;
  };
}

// Helper to parse hints from markdown format
const parseHintsMarkdown = (hintsMarkdown: string): string[] => {
  if (!hintsMarkdown) return [];
  
  const hints: string[] = [];
  
  // Split by ## patterns (e.g., "## General", "## 1.", etc.)
  const sections = hintsMarkdown.split(/(?=^##\s+)/gm);
  
  sections.forEach((section) => {
    const trimmed = section.trim();
    if (!trimmed) return;
    
    // Remove the heading line and get the content
    const lines = trimmed.split('\n');
    const heading = lines[0].replace(/^#+\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    if (content) {
      // Format as "Title - Content" for the hint parser in CodeEditor
      hints.push(`${heading} - ${content}`);
    }
  });
  
  // If no structured hints found, treat entire markdown as one hint
  if (hints.length === 0 && hintsMarkdown.trim()) {
    hints.push(hintsMarkdown.trim());
  }
  
  return hints;
};

// Helper to convert exercise response to Exercise type
const toExercise = (
  data: ExerciseDetailResponse['exercise'],
  trackSlug: string,
  category: string
): Exercise => {
  // Parse hints - can be markdown string or already an array
  let parsedHints: string[] = [];
  if (data.docs?.hints) {
    if (typeof data.docs.hints === 'string') {
      parsedHints = parseHintsMarkdown(data.docs.hints);
    } else if (Array.isArray(data.docs.hints)) {
      parsedHints = data.docs.hints;
    }
  }

  // Handle starter_code which can be string or object (multi-file)
  let starterCode: string | Record<string, string> = '';
  if (data.starter_code) {
    starterCode = data.starter_code;
  }

  return {
    _id: `${trackSlug}-${category}-${data.slug}`,
    title:
      data.title ||
      data.slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    slug: data.slug,
    // Keep list blurb separate from the long-form introduction
    description: data.blurb || '',
    introduction: data.docs?.introduction || '',
    difficulty: 'easy',
    category: category,
    track: trackSlug,
    instructions: data.docs?.instructions || '',
    hints: parsedHints.length > 0 ? parsedHints : undefined,
    starterCode: starterCode,
    exerciseType: data.type === 'concept' ? 'tutorial' : 'learning',
    createdAt: new Date().toISOString(),
    // Store source info for external links
    ...(data.source && { source: data.source }),
    ...(data.source_url && { source_url: data.source_url }),
  };
};

// Helper to create minimal Exercise from slug
const slugToExercise = (slug: string, trackSlug: string, category: string): Exercise => ({
  _id: `${trackSlug}-${category}-${slug}`,
  title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  slug: slug,
  description: `Practice ${slug.replace(/-/g, ' ')} in ${trackSlug}`,
  difficulty: 'easy',
  category: category,
  track: trackSlug,
  instructions: '',
  exerciseType: 'learning',
  createdAt: new Date().toISOString(),
});

export const exercisesApi = {
  // Get categories for a track
  // GET /api/tracks/:trackSlug/exercises → { track, categories: string[] }
  getCategoriesByTrack: async (trackSlug: string): Promise<string[]> => {
    console.log('[Exercises API] Fetching categories for track:', trackSlug);
    try {
      const response = await apiClient.get<CategoriesResponse>(
        `/api/tracks/${trackSlug}/exercises`
      );
      console.log('[Exercises API] Categories response:', response.data);
      return response.data.categories || [];
    } catch (err) {
      console.error('[Exercises API] Failed to fetch categories:', err);
      return [];
    }
  },

  // Get exercise slugs for a category
  // GET /api/tracks/:trackSlug/exercises/:category → { track, category, exercises: string[] }
  getExerciseSlugsByCategory: async (trackSlug: string, category: string): Promise<string[]> => {
    console.log('[Exercises API] Fetching exercises for:', trackSlug, category);
    try {
      const response = await apiClient.get<ExerciseSlugsResponse>(
        `/api/tracks/${trackSlug}/exercises/${category}`
      );
      console.log('[Exercises API] Exercise slugs response:', response.data);
      return response.data.exercises || [];
    } catch (err) {
      console.error('[Exercises API] Failed to fetch exercise slugs:', err);
      return [];
    }
  },

  // Get full exercise detail
  // GET /api/tracks/:trackSlug/exercises/:category/:exerciseSlug → { track, category, exercise: {...} }
  getExerciseBySlug: async (trackSlug: string, category: string, exerciseSlug: string): Promise<Exercise> => {
    console.log('[Exercises API] Fetching exercise:', trackSlug, category, exerciseSlug);
    const response = await apiClient.get<ExerciseDetailResponse>(
      `/api/tracks/${trackSlug}/exercises/${category}/${exerciseSlug}`
    );
    console.log('[Exercises API] Exercise detail response:', response.data);
    return toExercise(response.data.exercise, trackSlug, category);
  },

  // Get all exercises for a track (fetches categories, then all exercises)
  // This is a convenience method that combines multiple API calls
  getExercisesByTrack: async (trackSlug: string): Promise<Exercise[]> => {
    console.log('[Exercises API] Fetching all exercises for track:', trackSlug);
    
    try {
      // First get all categories
      const categories = await exercisesApi.getCategoriesByTrack(trackSlug);
      
      if (!categories.length) {
        console.log('[Exercises API] No categories found for track:', trackSlug);
        return [];
      }
      
      // Then get exercise slugs for each category
      const allExercises: Exercise[] = [];
      
      for (const category of categories) {
        try {
          const slugs = await exercisesApi.getExerciseSlugsByCategory(trackSlug, category);
          // Convert slugs to minimal Exercise objects
          const exercises = slugs.map(slug => slugToExercise(slug, trackSlug, category));
          allExercises.push(...exercises);
        } catch (err) {
          console.warn('[Exercises API] Failed to fetch exercises for category:', category, err);
        }
      }
      
      console.log('[Exercises API] Total exercises loaded:', allExercises.length);
      return allExercises;
    } catch (err) {
      console.error('[Exercises API] Failed to fetch exercises for track:', trackSlug, err);
      throw err;
    }
  },

  // Legacy methods - kept for compatibility but may not work with your backend
  getAllExercises: async (): Promise<Exercise[]> => {
    console.warn('[Exercises API] getAllExercises() may not be supported by your backend');
    try {
      const response = await apiClient.get<{ success: boolean; data: Exercise[] }>('/api/exercises');
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  getExerciseById: async (id: string): Promise<Exercise> => {
    // ID format: trackSlug-category-exerciseSlug
    const parts = id.split('-');
    if (parts.length >= 3) {
      const trackSlug = parts[0];
      const category = parts[1];
      const exerciseSlug = parts.slice(2).join('-');
      return exercisesApi.getExerciseBySlug(trackSlug, category, exerciseSlug);
    }
    
    // Fallback to direct API call (may not work)
    console.warn('[Exercises API] getExerciseById with non-composite ID:', id);
    const response = await apiClient.get<{ success: boolean; data: Exercise }>(`/api/exercises/${id}`);
    return response.data.data;
  },
};
