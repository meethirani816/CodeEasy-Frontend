import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { progressApi, UserProgressItem, TrackProgressSummary } from '@/api/progress';
import { tracksApi } from '@/api/tracks';
import { Track } from '@/types';
import TrackIcon from '@/components/TrackIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Loader2,
  Trophy,
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
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
        const [tracksData, progressData] = await Promise.all([
          tracksApi.getAllTracks(),
          progressApi.getMyProgress(),
        ]);

        setTracks(tracksData);

        const exerciseCounts: Record<string, number> = {};
        tracksData.forEach((t) => {
          exerciseCounts[t.slug] = t.exerciseCount || 0;
        });

        const summary = await progressApi.getProgressSummary(progressData, exerciseCounts);
        setProgressSummary(summary);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalCompleted = progressSummary.reduce((acc, p) => acc + p.completed, 0);
  const activeTracks = progressSummary.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-muted/40 via-background to-muted/30">
      <Navbar />

      <section className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-5xl space-y-10">
          {/* Header */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2 capitalize">{user?.role || "user"}</Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card/80 backdrop-blur shadow-md">
              <CardContent className="pt-6 text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">{totalCompleted}</p>
                <p className="text-sm text-muted-foreground">
                  Exercises Completed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur shadow-md">
              <CardContent className="pt-6 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold">
                  {progressSummary.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active Tracks
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur shadow-md">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-lg font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" },
                    )
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Member Since
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Learning Progress */}
          <Card className="bg-card/80 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Learning Progress
              </CardTitle>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : progressSummary.length > 0 ? (
                <div className="space-y-5">
                  {progressSummary.map((p) => {
                    const track = tracks.find(
                      (t) => t.slug === p.trackSlug,
                    );
                    const percent =
                      p.total > 0
                        ? Math.round((p.completed / p.total) * 100)
                        : 0;

                    return (
                      <div
                        key={p.trackSlug}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:shadow-md transition"
                      >
                        <TrackIcon
                          slug={p.trackSlug}
                          size="md"
                          showImage
                        />

                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">
                              {track?.name || p.trackSlug}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {p.completed}/{p.total}
                            </span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate(
                              `/tracks/${p.trackSlug}/exercises`,
                            )
                          }
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">
                    No progress yet. Start learning!
                  </p>
                  <Button
                    className="bg-gradient-to-br from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-5 py-5 text-sm font-medium rounded-full shadow-xl shadow-black/30 hover:scale-[1.03] transition"
                    onClick={() => navigate("/tracks")}>
                    Browse Tracks
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-card/80 backdrop-blur shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="capitalize font-medium">
                    {user?.role || "user"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3"> <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p> <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', }) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout}
                className=" to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white px-5 py-5 text-sm font-medium rounded-full shadow-xl shadow-black/30 hover:scale-[1.03] transition"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Profile;