import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { conceptsApi } from '@/api/concepts';
import { tracksApi } from '@/api/tracks';
import { ConceptDetail as ConceptDetailType, TrackConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, BookOpen, ExternalLink, ChevronRight, Lightbulb, Code2 } from 'lucide-react';
import TrackIcon from '@/components/TrackIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents, processConceptLinks } from '@/lib/markdown';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const ConceptDetailPage: React.FC = () => {
  const { slug: trackSlug, conceptSlug } = useParams<{ slug: string; conceptSlug: string }>();
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

        // Fetch concept detail and track config in parallel
        const [conceptData, configData] = await Promise.all([
          conceptsApi.getConceptDetail(trackSlug, conceptSlug),
          tracksApi.getTrackConfig(trackSlug),
        ]);

        setConcept(conceptData);
        setTrackConfig(configData);
      } catch (err) {
        console.error('Failed to load concept:', err);
        setError('Failed to load concept details.');
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

  const trackName = trackConfig?.language || trackSlug?.toUpperCase() || 'Unknown';
  const conceptName = conceptSlug?.replace(/-/g, ' ') || 'Unknown';
  const formattedConceptName = conceptName.charAt(0).toUpperCase() + conceptName.slice(1);

  // Find related concept exercises
  const relatedExercises = trackConfig?.exercises?.concept?.filter(
    ex => ex.concepts?.includes(conceptSlug || '')
  ) || [];

  // Process markdown content for concept links
  const processedIntroduction = processConceptLinks(concept?.introduction || '', trackSlug || '');
  const processedAbout = processConceptLinks(concept?.about || '', trackSlug || '');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/tracks" className="text-muted-foreground hover:text-foreground">Tracks</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/tracks/${trackSlug}`} className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <TrackIcon slug={trackSlug || ''} size="sm" showImage />
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

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/tracks/${trackSlug}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {trackName}
              </Button>
            </div>

            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{formattedConceptName}</h1>
                <p className="text-muted-foreground">
                  Learn about {formattedConceptName.toLowerCase()} in {trackName}
                </p>
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
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Introduction Section
                  {processedIntroduction && (
                    <section className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Introduction</h2>
                      </div>
                      <div className="prose-container text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {processedIntroduction}
                        </ReactMarkdown>
                      </div>
                    </section>
                  )} */}

                  {/* About Section */}
                  {processedAbout && (
                    <section className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        {/* <Lightbulb className="w-5 h-5 text-primary" /> */}
                      </div>
                      <div className="prose-container text-foreground">
                        <h1 style={{ fontWeight: 'bold' }}>About</h1>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {processedAbout}
                        </ReactMarkdown>
                      </div>
                    </section>
                  )}

                  {/* No content fallback - check if backend returned empty */}
                  {!processedIntroduction && !processedAbout && (
                    <section className="bg-card border border-border rounded-xl p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
                          <Lightbulb className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Content Not Available</h3>
                          <p className="text-muted-foreground mb-4">
                            The documentation for this concept hasn't been loaded from the backend yet.
                          </p>
                          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                            <p className="font-medium mb-2">Backend should return:</p>
                            <code className="text-xs bg-background px-2 py-1 rounded block mb-2">
                              GET /api/tracks/{trackSlug}/concepts/{conceptSlug}
                            </code>
                            <p className="text-xs">
                              Response should include: <code className="bg-background px-1 rounded">about</code>, <code className="bg-background px-1 rounded">introduction</code>, and <code className="bg-background px-1 rounded">links</code> fields.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Learn More Links */}
                  {concept?.links && concept.links.length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-5">
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
                              <img src={link.icon_url} alt="" className="w-5 h-5 mt-0.5" />
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

                  {/* Related Exercises */}
                  {relatedExercises.length > 0 && (
                    <section className="bg-card border border-border rounded-xl p-5">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-primary" />
                        Practice Exercises
                      </h3>
                      <div className="space-y-2">
                        {relatedExercises.map((exercise) => (
                          <Link
                            key={exercise.slug}
                            to={`/tracks/${trackSlug}/exercises/concept/${exercise.slug}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Code2 className="w-4 h-4 text-primary" />
                            </div>
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

                  {/* Quick Actions */}
                  <section className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-3">Ready to practice?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Apply what you've learned with hands-on exercises.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-purple-500 text-white"
                      onClick={() => navigate(`/tracks/${trackSlug}/exercises`)}
                    >
                      Start Practicing
                    </Button>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConceptDetailPage;
