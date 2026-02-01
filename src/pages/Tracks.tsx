import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { tracksApi } from "@/api/tracks";
import { Track } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  Code2,
} from "lucide-react";
import ApiUnavailable from "@/components/ApiUnavailable";
import TrackCard from "@/components/TrackCard";
import TrackIcon from "@/components/TrackIcon";

const HEADER_TRACKS = [
  "python",
  "csharp",
  "java",
  "elixir",
  "vbnet",
  "crystal",
  "javascript",
  "ruby",
];



const Tracks: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const data = await tracksApi.getAllTracks();
        setTracks(data);
        setFilteredTracks(data);
      } catch (err: any) {
        console.error("Tracks API Error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
        setApiError(err.message || "Failed to load tracks");
        setTracks([]);
        setFilteredTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = (tracks || []).filter(
      (track) =>
        (track.name || "").toLowerCase().includes(q) ||
        (track.description ?? "").toLowerCase().includes(q),
    );
    setFilteredTracks(filtered);
  }, [searchQuery, tracks]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <main className="flex-1">
        <div className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10" />

          <div className="max-w-7xl mx-auto px-6 pt-12 pb-16">
            <div className="flex justify-center gap-4 mb-8 flex-wrap relative z-10">
              {HEADER_TRACKS.map((slug, i) => (
                <div key={slug}>
                  <TrackIcon slug={slug} />
                </div>
              ))}
            </div>

            <svg
              className="absolute left-0 right-0 bottom-0 w-full"
              height="60"
              viewBox="0 0 1440 60"
              preserveAspectRatio="none"
              style={{ transform: "translateY(50%)" }}
            >
              <path
                d="M0,30 Q60,10 120,30 T240,30 T360,30 T480,30 T600,30 T720,30 T840,30 T960,30 T1080,30 T1200,30 T1320,30 T1440,30"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              <path
                d="M60,30 Q120,50 180,30 T300,30 T420,30 T540,30 T660,30 T780,30 T900,30 T1020,30 T1140,30 T1260,30 T1380,30 T1500,30"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />
              <path
                d="M120,30 Q180,10 240,30 T360,30 T480,30 T600,30 T720,30 T840,30 T960,30 T1080,30 T1200,30 T1320,30 T1440,30 T1560,30"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="3"
              />
              <path
                d="M180,30 Q240,50 300,30 T420,30 T540,30 T660,30 T780,30 T900,30 T1020,30 T1140,30 T1260,30 T1380,30 T1500,30"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
              />
              <path
                d="M240,30 Q300,10 360,30 T480,30 T600,30 T720,30 T840,30 T960,30 T1080,30 T1200,30 T1320,30 T1440,30"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />
            </svg>

            <div className="text-center relative z-10">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                {tracks.length} languages for you to master
              </h1>
              <p className="text-lg text-gray-300/90 max-w-3xl mx-auto leading-relaxed">  
                Become fluent in your chosen programming languages by completing
                these tracks created by our{" "}
                <span className="text-purple-400 font-semibold">
                  awesome team of contributors
                </span>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-card/80 backdrop-blur rounded-2xl shadow-md border border-border p-6 mb-10">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border h-12 rounded-full focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 rounded-full">
                  <SlidersHorizontal size={16} />
                  Filter by
                </Button>
                <Button variant="outline" className="gap-2">
                  <ChevronDown size={16} />
                  Sort by last touched
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing all {filteredTracks.length} tracks
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-primary opacity-80" size={48} />
            </div>
          )}

          {!isLoading && apiError && (
            <ApiUnavailable
              description={apiError}
              onRetry={() => window.location.reload()}
            />
          )}

          {!isLoading && !apiError && tracks.length === 0 && (
            <div className="text-center py-20">
              <Code2 className="mx-auto mb-4 text-muted-foreground opacity-80" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tracks available yet
              </h3>
              <p className="text-gray-600">
                Check back later or add some tracks via your backend.
              </p>
            </div>
          )}

          {!isLoading && !apiError && tracks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredTracks.map((track, index) => (
              <div className="hover:-translate-y-1 transition-all">
                <TrackCard key={track.slug || index} track={track} />
                </div>
              ))}
              {filteredTracks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">
                    No tracks found matching your search.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tracks;