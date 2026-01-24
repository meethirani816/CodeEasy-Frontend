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
      className={`bg-card rounded-lg p-4 border border-border transition-all duration-200 ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-md hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className="shrink-0">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-muted-foreground" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-card-foreground">{exercise.title}</h4>
            <Badge
              variant="outline"
              className={`text-xs ${difficultyColors[exercise.difficulty]}`}
            >
              {exercise.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {exercise.description}
          </p>
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
