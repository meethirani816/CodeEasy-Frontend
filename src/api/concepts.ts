import apiClient from './apiClient';
import { ConceptDetail } from '@/types';

export const conceptsApi = {
  /**
   * Get concept detail including about.md, introduction.md, and links.json
   */
  getConceptDetail: async (trackSlug: string, conceptSlug: string): Promise<ConceptDetail> => {
    console.log(`[Concepts API] Fetching concept: ${trackSlug}/${conceptSlug}`);
    
    try {
      const response = await apiClient.get(`/api/tracks/${trackSlug}/concepts/${conceptSlug}`);
      console.log('[Concepts API] Response:', response.data);
      
      return {
        track: trackSlug,
        concept: conceptSlug,
        about: response.data.about || '',
        introduction: response.data.introduction || '',
        links: response.data.links || [],
      };
    } catch (error) {
      console.error('[Concepts API] Error fetching concept:', error);
      // Return empty concept detail on error
      return {
        track: trackSlug,
        concept: conceptSlug,
        about: '',
        introduction: '',
        links: [],
      };
    }
  },

  /**
   * Get all concepts for a track from config
   */
  getConceptsByTrack: async (trackSlug: string): Promise<{ slug: string; name: string }[]> => {
    console.log(`[Concepts API] Fetching concepts for track: ${trackSlug}`);
    
    try {
      const response = await apiClient.get(`/api/tracks/${trackSlug}/config`);
      const config = response.data.config || response.data;
      
      // Return concepts from config
      if (config.concepts && Array.isArray(config.concepts)) {
        return config.concepts.map((c: { slug: string; name: string }) => ({
          slug: c.slug,
          name: c.name,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('[Concepts API] Error fetching concepts:', error);
      return [];
    }
  },
};
