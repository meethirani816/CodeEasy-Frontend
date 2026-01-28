import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '@/types';
import { Users, BookOpen } from 'lucide-react';
import TrackIcon from './TrackIcon';

interface TrackCardProps {
  track: Track;
}

const TRACK_NAMES: Record<string, string> = {
  c: 'C',
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
};

const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const navigate = useNavigate();
  const trackSlug = track?.slug?.toLowerCase() || '';
  const derivedName = TRACK_NAMES[trackSlug] || (trackSlug ? trackSlug.charAt(0).toUpperCase() + trackSlug.slice(1) : 'Unknown');
  const trackName = track?.name && track.name !== 'Unknown' ? track.name : derivedName;

  return (
    <div
      onClick={() => navigate(`/tracks/${track.slug || track._id}`)}
      className="bg-card rounded-xl p-6 shadow-md cursor-pointer hover:shadow-lg hover:border-primary/30 border border-border group transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Track Icon */}
        <TrackIcon slug={trackSlug} size="lg" showImage={true} />

        <div className="flex-1 min-w-0">
          {/* Track Name - Always visible */}
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {trackName}
          </h3>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{track.exerciseCount || 0} exercises</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{(track.studentCount || 0).toLocaleString()} students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
