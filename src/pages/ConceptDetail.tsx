import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { conceptsApi } from "@/api/concepts";
import { tracksApi } from "@/api/tracks";
import { ConceptDetail as ConceptDetailType, TrackConfig } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Code2,
} from "lucide-react";
import TrackIcon from "@/components/TrackIcon";
import ExerciseIcon from "@/components/ExerciseIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents, processConceptLinks } from "@/lib/markdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ConceptDetailPage: React.FC = () => {
  const { slug: trackSlug, conceptSlug } = useParams<{
    slug: string;
    conceptSlug: string;
  }>();
  const navigate = useNavigate();
  const [concept, setConcept] = useState<ConceptDetailType | null>(null);
  const [trackConfig, setTrackConfig] = useState<TrackConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConceptData = async () => {
      if (!trackSlug || !conceptSlug) return;

      try {
        setIsLoading(true);
        setError(null);

        const [conceptData, configData] = await Promise.all([
          conceptsApi.getConceptDetail(trackSlug, conceptSlug),
          tracksApi.getTrackConfig(trackSlug),
        ]);

        setConcept(conceptData);
        setTrackConfig(configData);
      } catch (err) {
        console.error("Failed to load concept:", err);
        setError("Failed to load concept details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConceptData();
  }, [trackSlug, conceptSlug]);

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

  const trackName =
    trackConfig?.language || trackSlug?.toUpperCase() || "Unknown";
  const conceptName = conceptSlug?.replace(/-/g, " ") || "Unknown";
  const formattedConceptName =
    conceptName.charAt(0).toUpperCase() + conceptName.slice(1);

  const relatedExercises =
    trackConfig?.exercises?.concept?.filter((ex) =>
      ex.concepts?.includes(conceptSlug || ""),
    ) || [];

  const exerciseCount = relatedExercises.length;
  const featuredExercise = relatedExercises[0] || null;

  const practiceExercises = featuredExercise
    ? relatedExercises.filter((ex) => ex.slug !== featuredExercise.slug)
    : relatedExercises;

  const badgeText =
    (formattedConceptName || "").trim().slice(0, 2).toUpperCase() || "??";

  const processedAbout = processConceptLinks(
    concept?.about || "",
    trackSlug || "",
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <section className="border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/tracks"
                    className="text-muted-foreground hover:text-foreground rounded-full px-3"
                  >
                    Tracks
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/tracks/${trackSlug}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <TrackIcon slug={trackSlug || ""} size="sm" showImage />
                    {trackName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{formattedConceptName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-foreground">
                  {badgeText}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
                    {formattedConceptName}
                  </h1>
                  <span className="text-muted-foreground">in</span>

                  <span className="inline-flex items-center gap-2">
                    <TrackIcon slug={trackSlug || ""} size="sm" showImage />
                    <span className="text-sm text-muted-foreground">
                      {trackName}
                    </span>
                  </span>
                </div>

                <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  <span>↔</span>
                  <span>{exerciseCount} exercises</span>
                </div>
              </div>
            </div>

            {error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {processedAbout && (
                    <section className="bg-background border border-border rounded-2xl p-8 md:p-10 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">
                          About {formattedConceptName}
                        </h2>
                      </div>
                      <div className="prose prose-lg max-w-none text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {processedAbout}
                        </ReactMarkdown>
                      </div>
                    </section>
                  )}

                  {!processedAbout && (
                    <section className="bg-background border border-dashed border-border rounded-2xl p-10">
                      <div className="text-muted-foreground">
                        Content Not Available
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  <section className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-muted border border-border">
                          ⬚
                        </span>
                        Learn {formattedConceptName}
                      </h3>
                    </div>

                    {featuredExercise ? (
                      <Link
                        to={`/tracks/${trackSlug}/exercises/concept/${featuredExercise.slug}`}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <ExerciseIcon slug={featuredExercise.slug} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-base font-semibold text-foreground truncate">
                              {featuredExercise.name}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>

                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs border border-border bg-background text-muted-foreground">
                            Learning Exercise
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No learning exercise available for this concept yet.
                      </div>
                    )}
                  </section>

                  {concept?.links && concept.links.length > 0 && (
                    <section className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary" />
                        Learn More
                      </h3>
                      <div className="space-y-3">
                        {concept.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            {link.icon_url ? (
                              <img
                                src={link.icon_url}
                                alt=""
                                className="w-5 h-5 mt-0.5"
                              />
                            ) : (
                              <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5" />
                            )}
                            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                              {link.description}
                            </span>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {practiceExercises.length > 0 && (
                    <section className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-primary" />
                        Practice Exercises
                      </h3>
                      <div className="space-y-2">
                        {practiceExercises.map((exercise) => (
                          <Link
                            key={exercise.slug}
                            to={`/tracks/${trackSlug}/exercises/concept/${exercise.slug}`}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                          >
                            <ExerciseIcon slug={exercise.slug} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                {exercise.name}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConceptDetailPage;