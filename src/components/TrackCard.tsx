import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '@/types';
import { Users, BookOpen, ArrowRight } from 'lucide-react';
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
      className="
        group relative cursor-pointer
        bg-card/80 backdrop-blur
        border border-border
        rounded-2xl
        p-6
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-xl
        hover:border-primary/30
      "
    >
      {/* subtle hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition pointer-events-none" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Track Icon */}
        <TrackIcon slug={trackSlug} size="lg" showImage />

        <div className="flex-1 min-w-0">
          {/* Track Name */}
          <h3 className="font-extrabold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
            {trackName}
          </h3>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{track.exerciseCount || 0} exercises</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{(track.studentCount || 0).toLocaleString()} learners</span>
            </div>
          </div>
        </div>

        {/* Arrow affordance */}
        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default TrackCard;