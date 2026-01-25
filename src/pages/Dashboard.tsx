import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { tracksApi } from '@/api/tracks';
import { progressApi, UserProgressItem, TrackProgressSummary } from '@/api/progress';
import { Track } from '@/types';
import TrackIcon from '@/components/TrackIcon';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BookOpen, CheckCircle, Clock, Code, Loader2, Trophy } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [progress, setProgress] = useState<UserProgressItem[]>([]);
  const [progressSummary, setProgressSummary] = useState<TrackProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        
        // Fetch tracks and user progress in parallel
        const [tracksData, progressData] = await Promise.all([
          tracksApi.getAllTracks(),
          progressApi.getMyProgress(),
        ]);

        setTracks(tracksData);
        setProgress(progressData);

        // Build exercise count map
        const exerciseCounts: Record<string, number> = {};
        tracksData.forEach((t) => {
          exerciseCounts[t.slug] = t.exerciseCount || 0;
        });

        // Calculate summary
        const summary = await progressApi.getProgressSummary(progressData, exerciseCounts);
        setProgressSummary(summary);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const totalCompleted = progressSummary.reduce((acc, p) => acc + p.completed, 0);
  const totalInProgress = progressSummary.reduce((acc, p) => acc + p.inProgress, 0);
  const activeTracks = progressSummary.length;
  const totalExercises = progressSummary.reduce((acc, p) => acc + p.total, 0);
  const overallPercentage = totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Welcome Section */}
      <section className="bg-secondary py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
          </h1>
          <p className="text-secondary-foreground/70 text-lg">
            Continue your learning journey and track your progress.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCompleted}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalInProgress}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeTracks}</p>
                    <p className="text-sm text-muted-foreground">Active Tracks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Overall</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Track Progress - Only show joined tracks */}
      <section className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Your Tracks</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Only show tracks that user has progress in */}
              {progressSummary.length > 0 ? (
                progressSummary.map((trackProgress) => {
                  const track = tracks.find((t) => t.slug === trackProgress.trackSlug);
                  const completed = trackProgress.completed;
                  const total = trackProgress.total || track?.exerciseCount || 0;
                  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <Card key={trackProgress.trackSlug} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <TrackIcon slug={trackProgress.trackSlug} size="lg" showImage={true} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{track?.name || trackProgress.trackSlug}</h3>
                              <span className="text-sm text-muted-foreground">
                                {completed} completed / {total} exercises
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2 mb-2" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {percentage}% complete
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/tracks/${trackProgress.trackSlug}/exercises`)}
                              >
                                Continue
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No tracks joined yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey by exploring our language tracks.
                    </p>
                    <Button onClick={() => navigate('/tracks')}>
                      Browse Tracks
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
