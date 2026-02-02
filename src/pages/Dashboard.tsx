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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/40 via-background to-muted/30">
      <Navbar />

      {/* Hero / Welcome */}
      <section className="relative py-12 bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-purple-500/15" />
        <div className="container mx-auto px-4 relative">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-secondary-foreground mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "Learner"} 👋
          </h1>
          <p className="text-secondary-foreground/70 text-lg">
            Continue where you left off and keep building momentum.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Completed",
                value: totalCompleted,
                icon: CheckCircle,
                color: "text-primary",
              },
              {
                label: "In Progress",
                value: totalInProgress,
                icon: Clock,
                color: "text-warning",
              },
              {
                label: "Active Tracks",
                value: activeTracks,
                icon: BookOpen,
                color: "text-info",
              },
              {
                label: "Overall",
                value: `${overallPercentage}%`,
                icon: Trophy,
                color: "text-success",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="bg-card/80 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Track Progress */}
      <section className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold tracking-tight mb-8">
            Your Tracks
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : progressSummary.length > 0 ? (
            <div className="grid gap-5">
              {progressSummary.map((tp) => {
                const track = tracks.find(
                  (t) => t.slug === tp.trackSlug,
                );
                const total = tp.total || track?.exerciseCount || 0;
                const percent =
                  total > 0
                    ? Math.round((tp.completed / total) * 100)
                    : 0;

                return (
                  <Card
                    key={tp.trackSlug}
                    className="bg-card/80 backdrop-blur hover:shadow-xl transition"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <TrackIcon
                          slug={tp.trackSlug}
                          size="lg"
                          showImage
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-semibold text-lg truncate">
                              {track?.name || tp.trackSlug}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {tp.completed}/{total}
                            </span>
                          </div>

                          <Progress
                            value={percent}
                            className="h-2.5 mb-2"
                          />

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {percent}% complete
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/tracks/${tp.trackSlug}/exercises`,
                                )
                              }
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
              })}
            </div>
          ) : (
            <Card className="bg-card/80 backdrop-blur border-dashed">
              <CardContent className="p-10 text-center">
                <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  No tracks joined yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by exploring tracks.
                </p>
                <Button
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-5 py-5 text-sm font-medium rounded-full shadow-xl shadow-black/30 hover:scale-[1.03] transition"
                  onClick={() => navigate("/tracks")}>
                  Browse Tracks
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;