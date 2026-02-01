import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { tracksApi } from "@/api/tracks";
import { exercisesApi } from "@/api/exercises";
import { progressApi } from "@/api/progress";
import { Track, TrackConfig, ConceptConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Loader2,
  Plus,
  Info,
  BookOpen,
  Dumbbell,
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  Globe,
  Cpu,
  Code2,
  FileCode,
  Lock,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ApiUnavailable from "@/components/ApiUnavailable";
import TrackIcon from "@/components/TrackIcon";
import ExerciseIcon from "@/components/ExerciseIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/markdown";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SAMPLE_CODE: Record<string, { code: JSX.Element; raw: string }> = {
  c: {
    raw: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    code: (
      <>
        <span className="text-[#569cd6]">#include</span>{" "}
        <span className="text-[#ce9178]">&lt;stdio.h&gt;</span>
        {"\n\n"}
        <span className="text-[#569cd6]">int</span>{" "}
        <span className="text-[#dcdcaa]">main</span>
        <span className="text-[#d4d4d4]">() {"{"}</span>
        {"\n    "}
        <span className="text-[#dcdcaa]">printf</span>
        <span className="text-[#d4d4d4]">(</span>
        <span className="text-[#ce9178]">"Hello, World!\n"</span>
        <span className="text-[#d4d4d4]">);</span>
        {"\n    "}
        <span className="text-[#c586c0]">return</span>{" "}
        <span className="text-[#b5cea8]">0</span>
        <span className="text-[#d4d4d4]">;</span>
        {"\n"}
        <span className="text-[#d4d4d4]">{"}"}</span>
      </>
    ),
  },
  javascript: {
    raw: "export function hello() {\n  return 'Hello, World!';\n}",
    code: (
      <>
        <span className="text-[#c586c0]">export</span>{" "}
        <span className="text-[#569cd6]">function</span>{" "}
        <span className="text-[#dcdcaa]">hello</span>
        <span className="text-[#d4d4d4]">() {"{"}</span>
        {"\n  "}
        <span className="text-[#c586c0]">return</span>{" "}
        <span className="text-[#ce9178]">'Hello, World!'</span>
        <span className="text-[#d4d4d4]">;</span>
        {"\n"}
        <span className="text-[#d4d4d4]">{"}"}</span>
      </>
    ),
  },
  python: {
    raw: 'def hello():\n    return "Hello, World!"',
    code: (
      <>
        <span className="text-[#569cd6]">def</span>{" "}
        <span className="text-[#dcdcaa]">hello</span>
        <span className="text-[#d4d4d4]">():</span>
        {"\n    "}
        <span className="text-[#c586c0]">return</span>{" "}
        <span className="text-[#ce9178]">"Hello, World!"</span>
      </>
    ),
  },
  java: {
    raw: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    code: (
      <>
        <span className="text-[#569cd6]">public class</span>{" "}
        <span className="text-[#4ec9b0]">HelloWorld</span>{" "}
        <span className="text-[#d4d4d4]">{"{"}</span>
        {"\n    "}
        <span className="text-[#569cd6]">public static void</span>{" "}
        <span className="text-[#dcdcaa]">main</span>
        <span className="text-[#d4d4d4]">(</span>
        <span className="text-[#4ec9b0]">String</span>
        <span className="text-[#d4d4d4]">[] args) {"{"}</span>
        {"\n        "}
        <span className="text-[#d4d4d4]">System.out.</span>
        <span className="text-[#dcdcaa]">println</span>
        <span className="text-[#d4d4d4]">(</span>
        <span className="text-[#ce9178]">"Hello, World!"</span>
        <span className="text-[#d4d4d4]">);</span>
        {"\n    "}
        <span className="text-[#d4d4d4]">{"}"}</span>
        {"\n"}
        <span className="text-[#d4d4d4]">{"}"}</span>
      </>
    ),
  },
  cpp: {
    raw: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    code: (
      <>
        <span className="text-[#569cd6]">#include</span>{" "}
        <span className="text-[#ce9178]">&lt;iostream&gt;</span>
        {"\n\n"}
        <span className="text-[#569cd6]">int</span>{" "}
        <span className="text-[#dcdcaa]">main</span>
        <span className="text-[#d4d4d4]">() {"{"}</span>
        {"\n    "}
        <span className="text-[#d4d4d4]">std::cout &lt;&lt;</span>{" "}
        <span className="text-[#ce9178]">"Hello, World!"</span>{" "}
        <span className="text-[#d4d4d4]">&lt;&lt; std::endl;</span>
        {"\n    "}
        <span className="text-[#c586c0]">return</span>{" "}
        <span className="text-[#b5cea8]">0</span>
        <span className="text-[#d4d4d4]">;</span>
        {"\n"}
        <span className="text-[#d4d4d4]">{"}"}</span>
      </>
    ),
  },
};

const TRACK_FEATURES: Record<
  string,
  { icon: React.ReactNode; label: string; desc: string }[]
> = {
  javascript: [
    {
      icon: <Globe className="w-5 h-5" />,
      label: "Web Native",
      desc: "Built for browsers and servers",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Dynamic",
      desc: "Flexible type system",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      label: "Multi-Paradigm",
      desc: "OOP and functional",
    },
    {
      icon: <FileCode className="w-5 h-5" />,
      label: "NPM Ecosystem",
      desc: "Largest package registry",
    },
  ],
  python: [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Readable",
      desc: "Clean and intuitive syntax",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      label: "Versatile",
      desc: "AI, web, scripting",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Batteries Included",
      desc: "Rich standard library",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: "Community",
      desc: "Large ecosystem",
    },
  ],
  c: [
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Fast",
      desc: "Near hardware performance",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Low-Level",
      desc: "Direct memory access",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      label: "Portable",
      desc: "Runs everywhere",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      label: "Foundational",
      desc: "Basis for many languages",
    },
  ],
  cpp: [
    {
      icon: <Zap className="w-5 h-5" />,
      label: "High Performance",
      desc: "System-level speed",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Type Safe",
      desc: "Strong static typing",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      label: "Systems",
      desc: "OS and game dev",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      label: "OOP + Generic",
      desc: "Multiple paradigms",
    },
  ],
  java: [
    {
      icon: <Globe className="w-5 h-5" />,
      label: "Cross-Platform",
      desc: "Write once, run anywhere",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Type Safe",
      desc: "Strong static typing",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      label: "Enterprise",
      desc: "Built for scale",
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      label: "OOP",
      desc: "Pure object-oriented",
    },
  ],
};

const TrackDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [track, setTrack] = useState<Track | null>(null);
  const [trackConfig, setTrackConfig] = useState<TrackConfig | null>(null);
  const [aboutContent, setAboutContent] = useState<string>("");
  const [concepts, setConcepts] = useState<ConceptConfig[]>([]);
  const [conceptExercises, setConceptExercises] = useState<
    { slug: string; name: string; concepts: string[] }[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [practiceExercises, setPracticeExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchTrackData = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        const [trackData, configData, aboutData, conceptsData, conceptExData] =
          await Promise.all([
            tracksApi.getTrackBySlug(slug),
            tracksApi.getTrackConfig(slug),
            tracksApi.getTrackAbout(slug),
            tracksApi.getConcepts(slug),
            tracksApi.getConceptExercises(slug),
          ]);

        setTrack(trackData);
        setTrackConfig(configData);

        const aboutText =
          (aboutData as any)?.about ??
          (typeof aboutData === "string" ? aboutData : "") ??
          "";
        setAboutContent(aboutText);

        setConcepts(conceptsData);
        setConceptExercises(conceptExData);

        if (configData) {
          setTrack((prev) =>
            prev
              ? {
                  ...prev,
                  name: configData.language || prev.name,
                  description: configData.blurb || prev.description,
                }
              : prev,
          );
        }

        try {
          const categoriesData = await exercisesApi.getCategoriesByTrack(slug);
          const practiceCategories = categoriesData.filter(
            (c) => c !== "concept" && c !== "concepts",
          );
          setCategories(practiceCategories);

          if (practiceCategories.length > 0) {
            try {
              const practiceSlugs =
                await exercisesApi.getExerciseSlugsByCategory(
                  slug,
                  practiceCategories[0],
                );
              setPracticeExercises(practiceSlugs.slice(0, 5));
            } catch {
              setPracticeExercises([]);
            }
          }
        } catch {
          setCategories([]);
        }

        if (isAuthenticated) {
          try {
            const progress = await progressApi.getMyProgress();
            setHasJoined(progressApi.hasJoinedTrack(progress, slug));
          } catch {
            setHasJoined(false);
          }
        }
      } catch {
        setTrack(null);
        setError("Failed to load this track from your backend API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackData();
  }, [slug, isAuthenticated]);

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
        navigate(`/tracks/${slug}/exercises`);
      } else {
        toast({
          title: "Failed to join track",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

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

  if (!track) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          {error ? (
            <ApiUnavailable
              description="We couldn't load this track from your backend."
              onRetry={() => window.location.reload()}
            />
          ) : (
            <p className="text-muted-foreground">Track not found</p>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const trackName = trackConfig?.language || track.name;
  const trackBlurb = trackConfig?.blurb || track.description;

  const exerciseCount =
    (trackConfig?.exercises?.concept?.length || 0) +
      (trackConfig?.exercises?.practice?.length || 0) ||
    track.exerciseCount ||
    20;

  const conceptCount = concepts.length || trackConfig?.concepts?.length || 15;
  const studentCount = track.studentCount || 0;

  const sampleCode = SAMPLE_CODE[track.slug] || SAMPLE_CODE.javascript;
  const features = TRACK_FEATURES[track.slug] || TRACK_FEATURES.javascript;

  const formatNumber = (num: number) => num.toLocaleString();

  const rawAbout = aboutContent || trackBlurb || "";
  const cleanedAbout = rawAbout
    .replace(/^\s*#\s*about\s*.*\n+/i, "")
    .replace(/^\s*##\s*about\s*.*\n+/i, "")
    .replace(/^\s*about\s*\n+/i, "")
    .trim();

  const codeExt =
    track.slug === "python"
      ? "py"
      : track.slug === "c"
        ? "c"
        : track.slug === "cpp"
          ? "cpp"
          : track.slug === "java"
            ? "java"
            : "js";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <section className="border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/tracks"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Tracks
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <TrackIcon slug={track.slug} size="sm" showImage />
                  {trackName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrackIcon slug={track.slug} size="lg" showImage />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  {trackName}
                </h1>
                <div className="flex items-center gap-5 text-sm text-muted-foreground mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(studentCount)} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{conceptCount} concepts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    <span>{exerciseCount} exercises</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full border-2 border-background flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">Contributors</div>
                <div>Building {trackName}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0 gap-1">
              <TabsTrigger
                value="about"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-4 text-muted-foreground data-[state=active]:text-foreground"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
              <TabsTrigger
                value="learn"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-4 text-muted-foreground data-[state=active]:text-foreground"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learn
              </TabsTrigger>
              <TabsTrigger
                value="practice"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-5 py-4 text-muted-foreground data-[state=active]:text-foreground"
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Practice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-0">
              <section className="flex-1">
               <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border">
                  <div
                    className="relative"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
                      backgroundSize: "22px 22px",
                    }}
                  >
                    <div className="max-w-7xl mx-auto px-6 pt-6 pb-10">
                      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
                        <div className="space-y-6">
                          <div>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                              Want to learn and master{" "}
                              <span className="text-primary">{trackName}</span>?
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                              Join CodeEasy&apos;s {trackName} Track for access
                              to{" "}
                              <span className="text-foreground font-semibold">
                                {exerciseCount} exercises
                              </span>{" "}
                              grouped into {conceptCount} Concepts, with
                              automatic analysis of your code, all{" "}
                              <span className="font-semibold">100% free</span>.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {hasJoined ? (
                              <Button
                                size="lg"
                                onClick={() =>
                                  navigate(`/tracks/${slug}/exercises`)
                                }
                                className="border-border text-foreground hover:bg-muted rounded-full"
                              >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Continue Learning
                              </Button>
                            ) : (
                              <Button
                                size="lg"
                                onClick={handleJoinTrack}
                                disabled={isJoining}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 rounded-full shadow-lg shadow-primary/25"
                              >
                                {isJoining ? (
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                  <Plus className="w-5 h-5 mr-2" />
                                )}
                                Start Learning
                              </Button>
                            )}

                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() => setActiveTab("learn")}
                              className="border-border text-foreground hover:bg-muted"
                            >
                              Explore concepts
                            </Button>
                          </div>

                          <div className="bg-background rounded-2xl border border-border p-8 shadow-sm">
                            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                              About {trackName}
                            </h3>
                            <div className="mt-3 prose-container text-muted-foreground">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {cleanedAbout || trackBlurb || ""}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>

                        <div className="relative w-full">
                          <div className="relative h-[380px] md:h-[420px] lg:h-[460px] bg-transparent rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 opacity-70" />
                            <div className="absolute left-6 top-7 h-3 w-3 rounded-sm border border-border bg-background/80" />
                            <div className="absolute left-10 top-12 h-3 w-3 rounded-full border border-border bg-background/80" />
                            <div className="absolute left-16 top-16 h-3 w-3 rotate-12 rounded-sm border border-border bg-background/80" />
                            <div className="absolute left-14 top-28 h-5 w-1 rotate-45 rounded-full bg-border/60" />
                            <div className="absolute left-20 top-40 h-3 w-3 rotate-45 rounded-sm border-2 border-primary/40 bg-background/80" />

                            <div className="absolute right-8 top-10 h-3 w-3 rotate-12 rounded-sm border-2 border-yellow-500/70 bg-background/80" />
                            <div className="absolute right-12 top-24 h-2 w-2 rounded-sm border border-border bg-background/80" />
                            <div className="absolute right-20 top-44 h-4 w-4 rotate-12 rounded-sm border-2 border-emerald-500/60 bg-background/80" />
                            <div className="absolute right-28 bottom-14 h-4 w-4 rotate-12 rounded-sm border-2 border-primary/40 bg-background/80" />

                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2.1] md:scale-[2.3]">
                              <TrackIcon
                                slug={track.slug}
                                size="lg"
                                showImage
                              />
                            </div>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                      Key features
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                      Key Features of {trackName}
                    </h3>
                    <p className="text-muted-foreground mt-3">
                      A quick overview of what makes {trackName} special.
                    </p>
                  </div>

                  <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-primary opacity-90">
                            {feature.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {feature.label}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {feature.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="learn" className="mt-0">
              <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center py-6 mb-10">
                  <h2 className="text-3xl font-bold mb-4 text-foreground">
                    {trackName} Concepts
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Master {trackName} through {conceptCount} concept lessons.
                  </p>
                </div>

                {concepts.length > 0 ? (
                  <div className="space-y-3">
                    {concepts.map((concept) => (
                      <Link
                        key={concept.slug}
                        to={`/tracks/${slug}/concepts/${concept.slug}`}
                        className="block bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {concept.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Learn about {concept.name.toLowerCase()} in{" "}
                              {trackName}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                              Concept
                            </span>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : conceptExercises.length > 0 ? (
                  <div className="space-y-3">
                    {conceptExercises.map((exercise, index) => (
                      <Link
                        key={exercise.slug}
                        to={`/tracks/${slug}/exercises/concept/${exercise.slug}`}
                        className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {exercise.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Learn:{" "}
                              {exercise.concepts?.join(", ") || "Core concepts"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full font-medium">
                              Exercise
                            </span>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-background border border-border rounded-xl shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Concepts Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      We&apos;re working on concept lessons for {trackName}. In
                      the meantime, explore practice exercises.
                    </p>
                    <Button
                      onClick={() => setActiveTab("practice")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      View Practice Exercises
                    </Button>
                  </div>
                )}

                {(concepts.length > 0 || conceptExercises.length > 0) && (
                  <div className="text-center mt-10">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                      onClick={() => {
                        if (concepts.length > 0) {
                          navigate(
                            `/tracks/${slug}/concepts/${concepts[0].slug}`,
                          );
                        } else if (conceptExercises.length > 0) {
                          navigate(
                            `/tracks/${slug}/exercises/concept/${conceptExercises[0].slug}`,
                          );
                        }
                      }}
                    >
                      Start Learning Path
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="mt-0">
              <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Practice Exercises
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {exerciseCount} exercises to strengthen your {trackName}{" "}
                      skills
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/tracks/${slug}/exercises`)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    View All Exercises
                  </Button>
                </div>

                {trackConfig?.exercises?.practice &&
                trackConfig.exercises.practice.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trackConfig.exercises.practice
                      .slice(0, 9)
                      .map((exercise) => (
                        <Link
                          key={exercise.slug}
                          to={`/tracks/${slug}/exercises/practice/${exercise.slug}`}
                          className="bg-background border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <ExerciseIcon slug={exercise.slug} size="md" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {exercise.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    exercise.difficulty <= 3
                                      ? "bg-green-500/10 text-green-600"
                                      : exercise.difficulty <= 6
                                        ? "bg-yellow-500/10 text-yellow-600"
                                        : "bg-red-500/10 text-red-600"
                                  }`}
                                >
                                  {exercise.difficulty <= 3
                                    ? "Easy"
                                    : exercise.difficulty <= 6
                                      ? "Medium"
                                      : "Hard"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : categories.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        to={`/tracks/${slug}/exercises?category=${category}`}
                        className="bg-background border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Code2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground capitalize group-hover:text-primary transition-colors">
                              {category.replace(/-/g, " ")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Explore exercises
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No practice exercises available yet.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackDetail;