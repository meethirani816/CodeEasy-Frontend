import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { tracksApi } from "@/api/tracks";
import { Track } from "@/types";
import TrackIcon from "@/components/TrackIcon";
import {
  ArrowRight,
  Grid3X3,
  Code2,
  Sparkles,
  CheckCircle,
  BookOpen,
  Trophy,
} from "lucide-react";

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Show 12 tracks in the hero section (2 rows on large screens)
  const [tracks, setTracks] = useState<Track[]>([]);
  // ✅ total languages count for heading
  const [totalTracks, setTotalTracks] = useState(0);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await tracksApi.getAllTracks();

        setTotalTracks(data.length);
        setTracks(data.slice(0, 12)); // Show first 12 tracks
      } catch (err) {
        console.error("Failed to load tracks:", err);
        setTracks([]);
        setTotalTracks(0);
      }
    };

    fetchTracks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section with Purple Gradient */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 header-pattern opacity-50" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Get <span className="highlight-yellow">really</span> good at
                programming.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
                Develop fluency in{" "}
                <em className="text-foreground font-medium not-italic">
                  {totalTracks || 4} programming languages
                </em>{" "}
                with our unique blend of learning, practice and exercises.
                CodeEasy is fun, effective and{" "}
                <span className="underline decoration-2 underline-offset-2 decoration-primary">
                  100% free, forever
                </span>
                .
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() => navigate("/tracks")}
                    className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-8 py-6 text-lg font-medium rounded-lg shadow-lg shadow-primary/25"
                  >
                    Explore Languages
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/signup")}
                      className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-8 py-6 text-lg font-medium rounded-lg shadow-lg shadow-primary/25"
                    >
                      Sign up for free
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/tracks")}
                      className="border-border text-foreground hover:bg-muted px-8 py-6 text-lg font-medium rounded-lg"
                    >
                      Explore languages
                    </Button>
                  </>
                )}
              </div>

              {/* Info box */}
              <div className="mt-8 flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-white" />
                  </div>
                  <span>CodeEasy</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  is an independent, community focused, not-for-profit
                  organisation.
                </span>
              </div>
            </div>

            {/* Right side - Illustration with track icons */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="w-80 h-80 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full flex items-center justify-center relative">
                {tracks.slice(0, 4).map((track, i) => {
                  const angle = (i * 90 - 45) * (Math.PI / 180);
                  const radius = 120;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <div
                      key={track._id}
                      className="absolute animate-fade-in"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <div className="bg-white rounded-2xl p-3 shadow-xl border border-border hover:scale-110 transition-transform cursor-pointer">
                        <TrackIcon slug={track.slug} size="lg" showImage />
                      </div>
                    </div>
                  );
                })}

                <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

        {/* decorative shapes */}
        <div className="absolute left-10 top-24 h-7 w-7 rotate-45 border-2 border-primary/30 hidden md:block" />
        <div className="absolute right-14 top-28 h-7 w-7 rounded-sm border-2 border-yellow-400/70 hidden md:block" />
        <div className="absolute left-24 top-44 h-2 w-7 rotate-45 bg-primary/30 rounded-full hidden md:block" />
        <div className="absolute right-24 top-56 grid grid-cols-3 gap-1 opacity-40 hidden md:grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-muted-foreground/60"
            />
          ))}
        </div>
        <div className="absolute right-10 top-44 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-primary/30 rotate-12 hidden md:block" />

        <div className="container mx-auto px-4 relative">
          {/* Title */}
          <div className="text-center mb-14">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
              <Grid3X3 className="h-7 w-7 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Explore and get fluent in
              <br />
              <span className="text-foreground">
                {totalTracks || 4} programming languages
              </span>
            </h2>

            {/* small zigzag line under heading (like Exercism) */}
            <div className="mt-6 flex justify-center">
              <div className="h-1.5 w-16 border-t-4 border-primary/50 rounded-full" />
            </div>
          </div>

          {/* Track icons grid (Exercism style) */}
          <div className="mx-auto max-w-6xl">
            {/* 2 cols mobile, 3 sm, 4 md, 6 lg (like Exercism layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-10">
              {tracks.map((track) => (
                <Link
                  key={track._id}
                  to={`/tracks/${track.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  {/* icon */}
                  <div className="transition-transform duration-200 group-hover:-translate-y-1">
                    <TrackIcon slug={track.slug} size="xl" showImage />
                  </div>

                  {/* name */}
                  <div className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {track.name}
                  </div>

                  {/* subtext (replace with students later if you have) */}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {track.exerciseCount
                      ? `${track.exerciseCount.toLocaleString()} exercises`
                      : "Start learning"}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* pill button bottom */}
          <div className="mt-14 flex justify-center">
            <Button
              onClick={() => navigate("/tracks")}
              className="rounded-full px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              See all {totalTracks || 4} Language Tracks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                CodeEasy
              </span>{" "}
              Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Learn programming the right way with our structured approach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">
                Step 1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Learn Concepts
              </h3>
              <p className="text-muted-foreground">
                Each concept teaches you one key programming idea with clear
                explanations and examples.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">
                Step 2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Practice with Exercises
              </h3>
              <p className="text-muted-foreground">
                Apply what you’ve learned through hands-on coding exercises with
                instant feedback.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">
                Step 3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Build Mastery
              </h3>
              <p className="text-muted-foreground">
                Track your progress and build real fluency through consistent
                practice.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/tracks" : "/signup")}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-8 shadow-lg shadow-primary/25"
            >
              Start Learning Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Everything you need to become{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  fluent
                </span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Structured Learning Paths
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Follow carefully designed concept progressions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Hundreds of Exercises
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Practice with real coding challenges
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Instant Feedback
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Get immediate test results on your code
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      100% Free Forever
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      No hidden costs, no premium tiers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code preview mockup */}
            <div className="relative">
              <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3d3d3d]">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-500 text-xs ml-2">
                    solution.js
                  </span>
                </div>

                <pre className="text-sm font-mono p-4 text-gray-100">
                  <code>
                    <span className="text-[#c586c0]">export</span>{" "}
                    <span className="text-[#569cd6]">function</span>{" "}
                    <span className="text-[#dcdcaa]">hello</span>
                    <span className="text-[#d4d4d4]">() {"{"}</span>
                    {"\n  "}
                    <span className="text-[#c586c0]">return</span>{" "}
                    <span className="text-[#ce9178]">{"'Hello, World!'"}</span>
                    <span className="text-[#d4d4d4]">;</span>
                    {"\n"}
                    <span className="text-[#d4d4d4]">{"}"}</span>
                  </code>
                </pre>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All tests passed!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-secondary via-secondary to-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Ready to start your coding journey?
          </h2>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto mb-8">
            Join developers who are improving their skills with CodeEasy. It’s
            100% free.
          </p>

          {!isAuthenticated && (
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-lg px-8 py-6 shadow-lg shadow-primary/25"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;