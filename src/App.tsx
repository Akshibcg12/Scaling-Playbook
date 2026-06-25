import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Intro from "./pages/Intro";
import AudienceSelect from "./pages/AudienceSelect";
import ChapterList from "./pages/ChapterList";
import SubChapterList from "./pages/SubChapterList";
import ContentView from "./pages/ContentView";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/select" element={<AudienceSelect />} />
          <Route path="/:audience" element={<ChapterList />} />
          <Route path="/:audience/:chapterId" element={<SubChapterList />} />
          <Route path="/:audience/:chapterId/:subId" element={<ContentView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
