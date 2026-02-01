import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { exercisesApi } from '@/api/exercises';
import { tracksApi } from '@/api/tracks';
import { progressApi, UserProgressItem } from '@/api/progress';
import { Exercise, Track } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Users, CheckCircle, Clock, Circle, Lock, Plus, Info, BookOpen, Dumbbell, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ApiUnavailable from '@/components/ApiUnavailable';
import TrackIcon from '@/components/TrackIcon';
import ExerciseIcon from '@/components/ExerciseIcon';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const Exercises: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [track, setTrack] = useState<Track | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressItem[]>([]);

  // Initial load: track + categories + progress
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch track info
        const trackData = await tracksApi.getTrackBySlug(slug);
        setTrack(trackData);

        // Fetch categories - include both concept and practice
        const categoriesData = await exercisesApi.getCategoriesByTrack(slug);
        // Keep all categories (concept and practice)
        setCategories(categoriesData);

        // Check URL for category param
        const categoryParam = searchParams.get('category');
        if (categoryParam && categoriesData.includes(categoryParam)) {
          setSelectedCategory(categoryParam);
        } else if (categoriesData.includes('practice')) {
          // Default to practice category
          setSelectedCategory('practice');
        } else if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }

        // Fetch user progress if authenticated
        if (isAuthenticated) {
          try {
            const progress = await progressApi.getMyProgress();
            setUserProgress(progress);
            setHasJoined(progressApi.hasJoinedTrack(progress, slug));
          } catch {
            setUserProgress([]);
            setHasJoined(false);
          }
        }
      } catch (err) {
        console.error('Failed to load track/categories:', err);
        setTrack(null);
        setCategories([]);
        setError('Failed to load exercises from your backend API.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, searchParams, isAuthenticated]);

  // Load exercises when category changes
  useEffect(() => {
    const fetchExercises = async () => {
      if (!slug || !selectedCategory) {
        setExercises([]);
        setFilteredExercises([]);
        return;
      }

      try {
        setIsLoadingExercises(true);
        const slugs = await exercisesApi.getExerciseSlugsByCategory(slug, selectedCategory);

        // Convert slugs to Exercise objects
        const exerciseList: Exercise[] = slugs.map(exSlug => ({
          _id: `${slug}-${selectedCategory}-${exSlug}`,
          title: exSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: exSlug,
          description: `Practice ${exSlug.replace(/-/g, ' ')} in ${track?.name || slug}`,
          difficulty: 'easy' as const,
          category: selectedCategory,
          track: slug,
          instructions: '',
          exerciseType: 'learning' as const,
          createdAt: new Date().toISOString(),
        }));

        setExercises(exerciseList);
        setFilteredExercises(exerciseList);
      } catch (err) {
        console.error('Failed to load exercises for category:', selectedCategory, err);
        setExercises([]);
        setFilteredExercises([]);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, [slug, selectedCategory, track?.name]);

  // Filter exercises by search and status
  useEffect(() => {
    let filtered = exercises.filter(
      (exercise) =>
        (exercise.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (exercise.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (activeFilter !== 'all' && slug) {
      filtered = filtered.filter(exercise => {
        const isCompleted = progressApi.isExerciseCompleted(userProgress, slug, exercise.slug);
        const isInProgress = userProgress.some(
          p => p.trackSlug === slug && p.exerciseSlug === exercise.slug && p.status === 'in_progress'
        );

        switch (activeFilter) {
          case 'completed':
            return isCompleted;
          case 'progress':
            return isInProgress;
          case 'available':
            return !isCompleted && !isInProgress;
          default:
            return true;
        }
      });
    }

    setFilteredExercises(filtered);
  }, [searchQuery, exercises, activeFilter, userProgress, slug]);

  const handleJoinTrack = async () => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    if (!slug) return;

    setIsJoining(true);
    try {
      const success = await progressApi.joinTrack(slug);
      if (success) {
        setHasJoined(true);
        toast({
          title: 'Track joined!',
          description: `You've successfully joined the ${track?.name} track.`,
        });
      } else {
        toast({
          title: 'Failed to join track',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  // Stats based on real progress
  const completedCount = slug
    ? userProgress.filter(p => p.trackSlug === slug && p.status === 'completed' && p.exerciseSlug !== '_joined').length
    : 0;
  const inProgressCount = slug
    ? userProgress.filter(p => p.trackSlug === slug && p.status === 'in_progress' && p.exerciseSlug !== '_joined').length
    : 0;
  const availableCount = exercises.length - completedCount - inProgressCount;
  const lockedCount = 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/tracks">Tracks</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/tracks/${slug}`} className="flex items-center gap-2">
                    <TrackIcon slug={slug || ''} size="sm" showImage />
                    <span>{track?.name || slug}</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Exercises</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Track Header */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrackIcon slug={slug || ''} size="lg" showImage />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{track?.name || slug}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(track?.studentCount || 0)} students</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 bg-muted rounded-full border-2 border-background" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">Contributors</div>
                <div>{categories.length} concepts</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex-1 flex justify-center items-center py-12 px-4">
          <ApiUnavailable
            description="We couldn't load the exercises list for this track from your backend."
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Join Track Banner */}
          <section className="bg-muted border-b border-border">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TrackIcon slug={slug || ''} size="lg" showImage />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Practice exercises in {track?.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Learn and practice {track?.name} by completing exercises that explore different concepts and ideas.
                    </p>
                  </div>
                </div>
                {hasJoined ? (
                  <Button disabled variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Joined
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinTrack}
                    disabled={isJoining}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isJoining ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Join The {track?.name} Track
                  </Button>
                )}
              </div>
            </div>
          </section>


          {/* Search and Filters */}
          <section className="py-6">
            <div className="max-w-7xl mx-auto px-6">
              {/* Category tabs */}
              {categories.length > 1 && (
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all capitalize ${selectedCategory === cat
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                    >
                      {cat.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative max-w-lg mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-background border-border focus-visible:ring-primary"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`stats-tab ${activeFilter === 'all' ? 'stats-tab-active' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  All Exercises
                  <Badge variant="secondary" className="ml-2 bg-muted">{exercises.length}</Badge>
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`stats-tab ${activeFilter === 'completed' ? 'stats-tab-active' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completed
                  <Badge variant="secondary" className="ml-2 bg-muted">{completedCount}</Badge>
                </button>
                <button
                  onClick={() => setActiveFilter('progress')}
                  className={`stats-tab ${activeFilter === 'progress' ? 'stats-tab-active' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Clock className="w-4 h-4 text-blue-500" />
                  In Progress
                  <Badge variant="secondary" className="ml-2 bg-muted">{inProgressCount}</Badge>
                </button>
                <button
                  onClick={() => setActiveFilter('available')}
                  className={`stats-tab ${activeFilter === 'available' ? 'stats-tab-active' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Circle className="w-4 h-4" />
                  Available
                  <Badge variant="secondary" className="ml-2 bg-muted">{availableCount > 0 ? availableCount : exercises.length}</Badge>
                </button>
              </div>

              {/* Loading exercises */}
              {isLoadingExercises && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Exercises Grid */}
              {!isLoadingExercises && (
                <div className="grid md:grid-cols-2 gap-5">
                  {filteredExercises.map((exercise) => {
                    const isCompleted = slug && progressApi.isExerciseCompleted(userProgress, slug, exercise.slug);
                    const isInProgress = slug && userProgress.some(
                      p => p.trackSlug === slug && p.exerciseSlug === exercise.slug && p.status === 'in_progress'
                    );

                    return (
                      <Link
                        key={exercise._id}
                        to={`/tracks/${slug}/exercises/${selectedCategory}/${exercise.slug}`}
                        className="bg-background border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all group relative"
                      >
                        {/* Completion indicator */}
                        {isCompleted && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                        {isInProgress && !isCompleted && (
                          <div className="absolute top-4 right-4">
                            <Clock className="w-5 h-5 text-blue-500" />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          {/* Exercise icon */}
                          <ExerciseIcon
                            slug={exercise.slug}
                            trackSlug={slug}
                            size="md"
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-6">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {exercise.title}
                            </h3>

                            {/* Exercise type badge */}
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <Badge
                                variant="outline"
                                className={`text-xs font-normal ${isCompleted
                                  ? 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-900/20'
                                  : 'border-primary/30 text-primary bg-primary/5'
                                  }`}
                              >
                                {isCompleted ? 'Completed' : 'Learning Exercise'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs font-normal capitalize">
                                {exercise.difficulty || 'easy'}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {exercise.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  {filteredExercises.length === 0 && !isLoadingExercises && (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-muted-foreground">
                        {selectedCategory
                          ? 'No exercises found in this category.'
                          : 'Select a category to view exercises.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Exercises;