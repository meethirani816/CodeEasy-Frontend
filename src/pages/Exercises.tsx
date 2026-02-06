import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { exercisesApi } from "@/api/exercises";
import { tracksApi } from "@/api/tracks";
import { progressApi, UserProgressItem } from "@/api/progress";
import { Exercise, Track } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  Users,
  CheckCircle,
  Clock,
  Circle,
  Lock,
  Plus,
  Info,
  BookOpen,
  Dumbbell,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ApiUnavailable from "@/components/ApiUnavailable";
import TrackIcon from "@/components/TrackIcon";
import ExerciseIcon from "@/components/ExerciseIcon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
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
        const categoryParam = searchParams.get("category");
        if (categoryParam && categoriesData.includes(categoryParam)) {
          setSelectedCategory(categoryParam);
        } else if (categoriesData.includes("practice")) {
          // Default to practice category
          setSelectedCategory("practice");
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
        console.error("Failed to load track/categories:", err);
        setTrack(null);
        setCategories([]);
        setError("Failed to load exercises from your backend API.");
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
        const slugs = await exercisesApi.getExerciseSlugsByCategory(
          slug,
          selectedCategory,
        );

        // Convert slugs to Exercise objects
        const exerciseList: Exercise[] = slugs.map((exSlug) => ({
          _id: `${slug}-${selectedCategory}-${exSlug}`,
          title: exSlug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          slug: exSlug,
          description: `Practice ${exSlug.replace(/-/g, " ")} in ${track?.name || slug}`,
          difficulty: "easy" as const,
          category: selectedCategory,
          track: slug,
          instructions: "",
          exerciseType: "learning" as const,
          createdAt: new Date().toISOString(),
        }));

        setExercises(exerciseList);
        setFilteredExercises(exerciseList);
      } catch (err) {
        console.error(
          "Failed to load exercises for category:",
          selectedCategory,
          err,
        );
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
        (exercise.title?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (exercise.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ),
    );

    // Apply status filter
    if (activeFilter !== "all" && slug) {
      filtered = filtered.filter((exercise) => {
        const isCompleted = progressApi.isExerciseCompleted(
          userProgress,
          slug,
          exercise.slug,
        );
        const isInProgress = userProgress.some((p) => {
          const saved = (p.exerciseSlug || "").split("/").pop();
          const current = (exercise.slug || "").split("/").pop();
          return (
            p.trackSlug === slug &&
            saved === current &&
            p.status === "in_progress"
          );
        });

        switch (activeFilter) {
          case "completed":
            return isCompleted;
          case "progress":
            return isInProgress;
          case "available":
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
      navigate("/signup");
      return;
    }

    if (!slug) return;

    setIsJoining(true);
    try {
      const success = await progressApi.joinTrack(slug);
      if (success) {
        setHasJoined(true);
        toast({
          title: "Track joined!",
          description: `You've successfully joined the ${track?.name} track.`,
        });
      } else {
        toast({
          title: "Failed to join track",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  // Stats based on real progress
  const completedCount = slug
    ? userProgress.filter(
        (p) =>
          p.trackSlug === slug &&
          p.status === "completed" &&
          p.exerciseSlug !== null,
      ).length
    : 0;
  const inProgressCount = slug
    ? userProgress.filter(
        (p) =>
          p.trackSlug === slug &&
          p.status === "in_progress" &&
          p.exerciseSlug !== null,
      ).length
    : 0;
  const availableCount = exercises.length - completedCount - inProgressCount;
  const lockedCount = 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-3">
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
                  <Link
                    to={`/tracks/${slug}`}
                    className="flex items-center gap-2"
                  >
                    <TrackIcon slug={slug || ""} size="sm" showImage />
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left */}
            <div className="flex items-center gap-4">
              <TrackIcon slug={slug || ""} size="xl" showImage />

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {track?.name}
                </h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatNumber(track?.studentCount || 0)} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-4 h-4" />
                    {exercises.length} exercises
                  </span>
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <Button
              onClick={
                hasJoined
                  ? () => navigate(`/tracks/${slug}/exercises`)
                  : handleJoinTrack
              }
              disabled={isJoining}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-4 py-4 text-lg font-medium rounded-full shadow-xl shadow-black/30 hover:scale-[1.03] transition"
            >
              {isJoining ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : hasJoined ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {hasJoined ? "Continue" : "Join Track"}
            </Button>
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
          {/* Search and Filters */}
          <section className="py-0">
            <div className="max-w-7xl mx-auto px-6">
              <section className="sticky top-[64px] z-20 bg-background/90 backdrop-blur border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
                  {/* Category Tabs */}
                  {categories.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-4 py-2 text-sm font-medium rounded-full shadow-xl hover:scale-[1.03] transition"
                  : "border-border text-foreground hover:to-purple-500/90 text-black px-4 py-2 text-sm font-medium rounded-full shadow-xl hover:scale-[1.03] transition"
              }`}
                        >
                          {cat.replace(/-/g, " ")}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search + Status Filters */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Search */}
                    <div className="relative max-w-sm w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search exercises"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-full"
                      />
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-2">
                      {/* All */}
                      <button
                        onClick={() => setActiveFilter("all")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${
                              activeFilter === "all"
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                      >
                        All
                        <Badge variant="outline" className="bg-background/50">
                          {exercises.length}
                        </Badge>
                      </button>

                      {/* Completed */}
                      <button
                        onClick={() => setActiveFilter("completed")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${
                              activeFilter === "completed"
                                ? "bg-green-500/10 text-green-700 border border-green-200"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Completed
                        <Badge variant="outline" className="bg-background/50">
                          {completedCount}
                        </Badge>
                      </button>

                      {/* In Progress */}
                      <button
                        onClick={() => setActiveFilter("progress")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${
                              activeFilter === "progress"
                                ? "bg-blue-500/10 text-blue-700 border border-blue-200"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                      >
                        <Clock className="w-4 h-4 text-blue-500" />
                        In Progress
                        <Badge variant="outline" className="bg-background/50">
                          {inProgressCount}
                        </Badge>
                      </button>

                      {/* Available */}
                      <button
                        onClick={() => setActiveFilter("available")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${
                              activeFilter === "available"
                                ? "bg-muted text-foreground border border-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                      >
                        <Circle className="w-4 h-4" />
                        Available
                        <Badge variant="outline" className="bg-background/50">
                          {availableCount > 0
                            ? availableCount
                            : exercises.length}
                        </Badge>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

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
                    const isCompleted =
                      slug &&
                      progressApi.isExerciseCompleted(
                        userProgress,
                        slug,
                        exercise.slug,
                      );
                    const isInProgress =
                      slug &&
                      userProgress.some((p) => {
                        const saved = (p.exerciseSlug || "").split("/").pop();
                        const current = (exercise.slug || "").split("/").pop();
                        return (
                          p.trackSlug === slug &&
                          saved === current &&
                          p.status === "in_progress"
                        );
                      });

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
                                className={`text-xs font-normal ${
                                  isCompleted
                                    ? "border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-900/20"
                                    : "border-primary/30 text-primary bg-primary/5"
                                }`}
                              >
                                {isCompleted
                                  ? "Completed"
                                  : "Learning Exercise"}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal capitalize"
                              >
                                {exercise.difficulty || "easy"}
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
                          ? "No exercises found in this category."
                          : "Select a category to view exercises."}
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
