import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { exercisesApi } from "@/api/exercises";
import { Exercise } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LayoutGrid, ExternalLink } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import ApiUnavailable from "@/components/ApiUnavailable";
import TrackIcon, { getTrackConfig } from "@/components/TrackIcon";
import ExerciseIcon from "@/components/ExerciseIcon";
import { stripMarkdownHeading, StyledMarkdown } from "@/lib/markdown";

interface ExerciseLink {
  url: string;
  description: string;
}

const ExerciseDetail: React.FC = () => {
  const {
    slug: trackSlug,
    category,
    exerciseSlug,
    id,
  } = useParams<{
    slug?: string;
    category?: string;
    exerciseSlug?: string;
    id?: string;
  }>();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data: Exercise;

        if (trackSlug && category && exerciseSlug) {
          data = await exercisesApi.getExerciseBySlug(
            trackSlug,
            category,
            exerciseSlug
          );
        } else if (id) {
          data = await exercisesApi.getExerciseById(id);
        } else {
          throw new Error("Invalid exercise route");
        }

        setExercise(data);
      } catch (err) {
        console.error(err);
        setExercise(null);
        setError("Failed to load this exercise from your backend API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [trackSlug, category, exerciseSlug, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          {error ? (
            <ApiUnavailable
              description="We couldn't load this exercise from your backend."
              onRetry={() => window.location.reload()}
            />
          ) : (
            <p className="text-muted-foreground">Exercise not found</p>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const currentTrackSlug =
    trackSlug ||
    (typeof exercise.track === "string"
      ? exercise.track
      : exercise.track?.slug) ||
    "unknown";

  const currentCategory =
    category ||
    (typeof exercise.category === "string" ? exercise.category : "exercises");

  const trackName =
    currentTrackSlug === "c"
      ? "C"
      : currentTrackSlug === "javascript"
      ? "JavaScript"
      : currentTrackSlug.charAt(0).toUpperCase() + currentTrackSlug.slice(1);

  const iconConfig = getTrackConfig(currentTrackSlug);

  // Clean markdown content to remove duplicate headings
  const introSource = (exercise as any).introduction || exercise.description;
  const cleanedDescription = stripMarkdownHeading(introSource, 'Introduction');
  const cleanedInstructions = stripMarkdownHeading(exercise.instructions, 'Instructions');

  // Get links from exercise if available (from backend)
  const exerciseLinks: ExerciseLink[] = (exercise as any).links || [];
  
  // Add source link if available
  if ((exercise as any).source_url) {
    exerciseLinks.push({
      url: (exercise as any).source_url,
      description: (exercise as any).source || 'Source'
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/tracks"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Tracks
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/tracks/${currentTrackSlug}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <TrackIcon slug={currentTrackSlug} size="sm" />
                    {trackName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/tracks/${currentTrackSlug}/exercises?category=${currentCategory}`}
                    className="text-muted-foreground hover:text-foreground capitalize"
                  >
                    {currentCategory.replace(/-/g, " ")}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  {exercise.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Header */}
      <section className="border-b py-8">
        <div className="container mx-auto px-4 flex gap-5 items-center">
          <ExerciseIcon slug={exercise.slug} size="lg" />

          <div>
            <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {exercise.exerciseType === "tutorial"
                ? "Tutorial Exercise"
                : "Learning Exercise"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Overview Tab */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg font-medium">
            <LayoutGrid className="w-4 h-4" />
            Overview
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* LEFT – Exercism-style Overview */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              {cleanedDescription?.trim() && (
                <div className="bg-card border rounded-xl p-8 overflow-hidden">
                  <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                  <div className="max-w-none text-muted-foreground leading-relaxed overflow-x-auto">
                    <StyledMarkdown>{cleanedDescription}</StyledMarkdown>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-card border rounded-xl p-8 overflow-hidden">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <div className="max-w-none text-muted-foreground leading-relaxed overflow-x-auto">
                  <StyledMarkdown>
                    {cleanedInstructions ||
                      cleanedDescription ||
                      "No instructions available."}
                  </StyledMarkdown>
                </div>
              </div>

              {/* External Links (from backend) */}
              {exerciseLinks.length > 0 && (
                <div className="bg-card border rounded-xl p-8">
                  <h2 className="text-xl font-semibold mb-4">Learn More</h2>
                  <ul className="space-y-3">
                    {exerciseLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <span>{link.description || link.url}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT – CTA Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border rounded-xl p-6 text-center">
                <div className="flex justify-center gap-2 mb-4">
                  <TrackIcon slug={currentTrackSlug} size="md" />
                  <span className="text-xl text-muted-foreground">+</span>
                  <div className="w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center font-mono">
                    {"{ }"}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-2">
                  Ready to start {exercise.title}?
                </h3>

                <p className="text-sm text-muted-foreground mb-6">
                  Learn and master{" "}
                  <span className="text-primary">{trackName}</span> with
                  hands-on exercises.
                </p>

                {isAuthenticated ? (
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(
                        `/tracks/${currentTrackSlug}/exercises/${currentCategory}/${exercise.slug}/edit`
                      )
                    }
                  >
                    Start Exercise
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full mb-3"
                      onClick={() => navigate("/signup")}
                    >
                      Sign up, it's free
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/login")}
                    >
                      Log in
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExerciseDetail;
