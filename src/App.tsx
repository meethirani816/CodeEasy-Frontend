import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Tracks from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import Exercises from "./pages/Exercises";
import ExerciseDetail from "./pages/ExerciseDetail";
import CodeEditor from "./pages/CodeEditor";
import ConceptDetail from "./pages/ConceptDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/tracks/:slug" element={<TrackDetail />} />
            <Route path="/tracks/:slug/exercises" element={<Exercises />} />
            {/* Concept learning routes */}
            <Route path="/tracks/:slug/concepts/:conceptSlug" element={<ConceptDetail />} />
            {/* New exercise routes matching backend structure */}
            <Route path="/tracks/:slug/exercises/:category/:exerciseSlug" element={<ExerciseDetail />} />
            <Route path="/tracks/:slug/exercises/:category/:exerciseSlug/edit" element={<CodeEditor />} />
            {/* Legacy exercise routes for backwards compatibility */}
            <Route path="/exercises/:id" element={<ExerciseDetail />} />
            <Route path="/exercises/:id/edit" element={<CodeEditor />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* Redirect /concepts to /tracks */}
            <Route path="/concepts" element={<Navigate to="/tracks" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;