import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Code2 } from 'lucide-react';

interface ExerciseIconProps {
  slug: string;
  trackSlug?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

// Normalize exercise slug to match CDN naming
const normalizeSlug = (slug: string): string => {
  // Common slug transformations for CDN
  return slug
    .toLowerCase()
    .replace(/_/g, '-')  // underscores to dashes
    .replace(/\s+/g, '-'); // spaces to dashes
};

export const ExerciseIcon: React.FC<ExerciseIconProps> = ({ 
  slug, 
  trackSlug,
  size = 'md', 
  className,
}) => {
  const [imageError, setImageError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const normalizedSlug = normalizeSlug(slug);
  
  // Primary: CDN for exercise icons
  const exercismIconUrl = `https://assets.exercism.org/exercises/${normalizedSlug}.svg`;
  // Fallback: Try with original slug
  const fallbackIconUrl = `https://assets.exercism.org/exercises/${slug}.svg`;

  const handleError = () => {
    if (!triedFallback && normalizedSlug !== slug) {
      // Try the original slug as fallback
      setTriedFallback(true);
    } else {
      setImageError(true);
    }
  };

  if (!imageError) {
    return (
      <div className={cn(
        'rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-border',
        sizeClasses[size],
        className
      )}>
        <img
          src={triedFallback ? fallbackIconUrl : exercismIconUrl}
          alt={slug}
          className="w-3/4 h-3/4 object-contain"
          onError={handleError}
        />
      </div>
    );
  }

  // Fallback to code icon with exercise initial
  const initial = slug.charAt(0).toUpperCase();
  
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-primary/20',
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('font-bold text-primary', size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-sm')}>
        {initial}
      </span>
    </div>
  );
};

export default ExerciseIcon;