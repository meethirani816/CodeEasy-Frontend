import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Lock, ChevronRight } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted?: boolean;
  isLocked?: boolean;
}

const difficultyColors = {
  easy: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  hard: 'bg-destructive/10 text-destructive border-destructive/20',
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isCompleted = false, isLocked = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/exercises/${exercise._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-card rounded-xl p-6 border border-border transition-all duration-200
        ${isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5'
        }`}
    >
      <div className="flex items-start gap-4">
        {/* Left Status Icon */}
        <div className="mt-1 shrink-0">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-muted-foreground" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
            {exercise.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {exercise.description}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs capitalize ${
                difficultyColors[exercise.difficulty]
              }`}
            >
              {exercise.difficulty}
            </Badge>

            {isCompleted && (
              <Badge className="bg-green-500/10 text-green-600 text-xs">
                Completed
              </Badge>
            )}

            {!isCompleted && !isLocked && (
              <Badge className="bg-blue-500/10 text-blue-600 text-xs">
                Available
              </Badge>
            )}

            {isLocked && (
              <Badge className="bg-muted text-muted-foreground text-xs">
                Locked
              </Badge>
            )}
          </div>
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ChevronRight className="w-5 h-5 text-muted-foreground mt-2 shrink-0 group-hover:text-primary transition-colors" />
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;