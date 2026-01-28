import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const trackColors: Record<string, { bg: string; text: string; letter: string }> = {
  c: { bg: 'bg-[#5C8DBC]', text: 'text-white', letter: 'C' },
  javascript: { bg: 'bg-[#F0DB4F]', text: 'text-black', letter: 'JS' },
  python: { bg: 'bg-[#3776AB]', text: 'text-white', letter: 'Py' },
  java: { bg: 'bg-[#ED8B00]', text: 'text-white', letter: 'Ja' },
  rust: { bg: 'bg-[#DEA584]', text: 'text-black', letter: 'Rs' },
  go: { bg: 'bg-[#00ADD8]', text: 'text-white', letter: 'Go' },
  cpp: { bg: 'bg-[#00599C]', text: 'text-white', letter: 'C++' },
  typescript: { bg: 'bg-[#3178C6]', text: 'text-white', letter: 'TS' },
};

interface TrackIconProps {
  slug: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showImage?: boolean;
}

const sizeClasses = {
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export const TrackIcon: React.FC<TrackIconProps> = ({ 
  slug, 
  size = 'md', 
  className,
  showImage = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const config = trackColors[slug?.toLowerCase()] || { 
    bg: 'bg-primary', 
    text: 'text-primary-foreground', 
    letter: slug?.charAt(0).toUpperCase() || '?' 
  };

  // Try Exercism CDN first, then local fallback
  const exercismIconUrl = `https://assets.exercism.org/tracks/${slug}.svg`;

  if (showImage && !imageError) {
    return (
      <div className={cn('relative overflow-hidden hexagon', sizeClasses[size], className)}>
        <img
          src={exercismIconUrl}
          alt={slug}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        config.bg,
        config.text,
        'hexagon flex items-center justify-center font-bold shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {config.letter}
    </div>
  );
};

export const getTrackConfig = (slug: string) => {
  return trackColors[slug?.toLowerCase()] || { 
    bg: 'bg-primary', 
    text: 'text-primary-foreground', 
    letter: slug?.charAt(0).toUpperCase() || '?' 
  };
};

export default TrackIcon;
