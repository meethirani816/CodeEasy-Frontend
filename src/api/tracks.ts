import apiClient from './apiClient';
import { Track, Category, TrackConfig, ConceptConfig } from '@/types';

// Track name mapping - All popular Exercism languages
const TRACK_NAMES: Record<string, string> = {
  c: 'C',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
  csharp: 'C#',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  ruby: 'Ruby',
  scala: 'Scala',
  elixir: 'Elixir',
  haskell: 'Haskell',
  lua: 'Lua',
  r: 'R',
  julia: 'Julia',
  perl: 'Perl',
  clojure: 'Clojure',
  fsharp: 'F#',
  ocaml: 'OCaml',
  erlang: 'Erlang',
  zig: 'Zig',
  nim: 'Nim',
  crystal: 'Crystal',
  dart: 'Dart',
  bash: 'Bash',
  powershell: 'PowerShell',
};

// Backend track response format
interface BackendTrack {
  slug: string;
  name?: string;
  language?: string;
  blurb?: string;
  description?: string;
  active?: boolean;
  conceptCount?: number;
  exerciseCount?: number;
  studentCount?: number;
  tags?: string[];
  key_features?: { title: string; content: string; icon: string }[];
}

// Helper to convert backend track to frontend Track type
const backendTrackToTrack = (data: BackendTrack | string, index: number): Track => {
  // Handle string slugs
  if (typeof data === 'string') {
    return {
      _id: `track-${data}-${index}`,
      name: TRACK_NAMES[data] || data.charAt(0).toUpperCase() + data.slice(1),
      slug: data,
      description: `Learn ${TRACK_NAMES[data] || data} programming`,
      exerciseCount: 0,
      studentCount: 0,
      tags: [],
      createdAt: new Date().toISOString(),
    };
  }

  // Handle object format from backend
  return {
    _id: `track-${data.slug}-${index}`,
    name: data.name || data.language || TRACK_NAMES[data.slug] || data.slug.charAt(0).toUpperCase() + data.slug.slice(1),
    slug: data.slug,
    description: data.blurb || data.description || `Learn ${data.name || data.slug} programming`,
    exerciseCount: data.exerciseCount || 0,
    studentCount: data.studentCount || 0,
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
  };
};

export const tracksApi = {
  getAllTracks: async (): Promise<Track[]> => {
    console.log('[Tracks API] Fetching /api/tracks...');
    
    const response = await apiClient.get('/api/tracks');
    
    console.log('[Tracks API] Response:', {
      status: response.status,
      data: response.data,
    });

    // Handle multiple backend response shapes
    const rawData = response.data;
    let tracks: Track[] = [];

    // Check for { success: true, tracks: [...] } format
    if (rawData?.success && rawData?.tracks) {
      tracks = rawData.tracks.map((item: BackendTrack | string, i: number) => 
        backendTrackToTrack(item, i)
      );
    }
    // Check for direct array
    else if (Array.isArray(rawData)) {
      tracks = rawData.map((item, i) => backendTrackToTrack(item, i));
    }
    // Check for { data: [...] } format
    else if (rawData?.data && Array.isArray(rawData.data)) {
      tracks = rawData.data.map((item: BackendTrack | string, i: number) => 
        backendTrackToTrack(item, i)
      );
    }
    // Check for { tracks: [...] } format without success
    else if (rawData?.tracks && Array.isArray(rawData.tracks)) {
      tracks = rawData.tracks.map((item: BackendTrack | string, i: number) => 
        backendTrackToTrack(item, i)
      );
    }
    else {
      console.warn('[Tracks API] Unexpected response shape:', rawData);
      tracks = [];
    }

    console.log('[Tracks API] Parsed tracks:', tracks.length, 'items');
    return tracks;
  },

  getTrackBySlug: async (slug: string): Promise<Track> => {
    // First try to get track config for more details
    try {
      const config = await tracksApi.getTrackConfig(slug);
      if (config) {
        const exerciseCount = 
          (config.exercises?.concept?.length || 0) + 
          (config.exercises?.practice?.length || 0);
        
        return {
          _id: `track-${slug}`,
          name: config.language || TRACK_NAMES[slug] || slug,
          slug: slug,
          description: config.blurb || `Learn ${config.language || slug} programming`,
          exerciseCount: exerciseCount,
          studentCount: 0,
          tags: config.tags || [],
          createdAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[Tracks API] Could not fetch config for track:', slug);
    }

    // Fallback: fetch all tracks and filter by slug
    const tracks = await tracksApi.getAllTracks();
    const track = tracks.find(t => t.slug === slug);
    
    if (!track) {
      // Return a minimal track object
      return {
        _id: `track-${slug}`,
        name: TRACK_NAMES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
        slug: slug,
        description: `Learn ${TRACK_NAMES[slug] || slug} programming`,
        exerciseCount: 0,
        studentCount: 0,
        tags: [],
        createdAt: new Date().toISOString(),
      };
    }
    
    return track;
  },

  getTrackCategories: async (trackId: string): Promise<Category[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Category[] }>(
        `/api/categories/track/${trackId}`
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Get track config.json with full details
   */
  getTrackConfig: async (slug: string): Promise<TrackConfig | null> => {
    console.log(`[Tracks API] Fetching config for: ${slug}`);
    
    try {
      const response = await apiClient.get(`/api/tracks/${slug}/config`);
      const config = response.data.config || response.data;
      
      console.log('[Tracks API] Config response:', config);
      return config;
    } catch (error) {
      console.warn('[Tracks API] Could not fetch config:', error);
      return null;
    }
  },

  /**
   * Get track ABOUT.md content
   */
  getTrackAbout: async (slug: string): Promise<string> => {
    console.log(`[Tracks API] Fetching about for: ${slug}`);
    
    try {
      const response = await apiClient.get(`/api/tracks/${slug}/about`);
      return response.data.about || '';
    } catch (error) {
      console.warn('[Tracks API] Could not fetch about:', error);
      return '';
    }
  },

  /**
   * Get concepts list from track config
   */
  getConcepts: async (slug: string): Promise<ConceptConfig[]> => {
    console.log(`[Tracks API] Fetching concepts for: ${slug}`);
    
    try {
      const config = await tracksApi.getTrackConfig(slug);
      return config?.concepts || [];
    } catch (error) {
      console.warn('[Tracks API] Could not fetch concepts:', error);
      return [];
    }
  },

  /**
   * Get concept exercises from track config
   */
  getConceptExercises: async (slug: string): Promise<{ slug: string; name: string; concepts: string[] }[]> => {
    console.log(`[Tracks API] Fetching concept exercises for: ${slug}`);
    
    try {
      const config = await tracksApi.getTrackConfig(slug);
      return config?.exercises?.concept?.map(ex => ({
        slug: ex.slug,
        name: ex.name,
        concepts: ex.concepts || [],
      })) || [];
    } catch (error) {
      console.warn('[Tracks API] Could not fetch concept exercises:', error);
      return [];
    }
  },
};
