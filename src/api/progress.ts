import apiClient from './apiClient';

export interface UserProgressItem {
  _id: string;
  user: string;
  trackSlug: string;
  exerciseSlug: string;
  category: string;
  status: 'in_progress' | 'completed';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackProgressSummary {
  trackSlug: string;
  completed: number;
  inProgress: number;
  total: number;
}

export const progressApi = {
  /**
   * Get current user's progress across all tracks
   */
  getMyProgress: async (): Promise<UserProgressItem[]> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: UserProgressItem[];
      }>('/api/progress/my-progress');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      return [];
    }
  },

  /**
   * Mark an exercise as completed
   */
  markCompleted: async (
    trackSlug: string,
    category: string,
    exerciseSlug: string
  ): Promise<UserProgressItem | null> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: UserProgressItem;
      }>('/api/progress/complete', {
        trackSlug,
        category,
        exerciseSlug,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to mark completed:', error);
      return null;
    }
  },

  /**
   * Join a track (create initial progress entry)
   */
  joinTrack: async (trackSlug: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>(`/api/tracks/${trackSlug}/join`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to join track:', error);
      return false;
    }
  },

  /**
   * Check if user has joined a specific track
   */
  hasJoinedTrack: (progress: UserProgressItem[], trackSlug: string): boolean => {
    return progress.some(p => p.trackSlug === trackSlug);
  },

  /**
   * Check if a specific exercise is completed
   */
  isExerciseCompleted: (
    progress: UserProgressItem[],
    trackSlug: string,
    exerciseSlug: string
  ): boolean => {
    return progress.some(
      p => p.trackSlug === trackSlug && 
           p.exerciseSlug === exerciseSlug && 
           p.status === 'completed'
    );
  },

  /**
   * Get progress summary grouped by track
   */
  getProgressSummary: async (
    progress: UserProgressItem[],
    trackExerciseCounts: Record<string, number>
  ): Promise<TrackProgressSummary[]> => {
    const summaryMap: Record<string, TrackProgressSummary> = {};

    for (const item of progress) {
      if (!summaryMap[item.trackSlug]) {
        summaryMap[item.trackSlug] = {
          trackSlug: item.trackSlug,
          completed: 0,
          inProgress: 0,
          total: trackExerciseCounts[item.trackSlug] || 0,
        };
      }

      if (item.status === 'completed') {
        summaryMap[item.trackSlug].completed++;
      } else {
        summaryMap[item.trackSlug].inProgress++;
      }
    }

    return Object.values(summaryMap);
  },
};

export default progressApi;
