
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import HomePage from "./pages/Index";
import EventPage from "./pages/EventPage";
import Dashboard from "./pages/Dashboard";
import OrganizerPanel from "./pages/OrganizerPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { WebSocketProvider } from "@/hooks/WebSocketProvider.tsx";
import React from "react";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WebSocketProvider> {/* ✅ оборачиваем всё */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="event/:id" element={<EventPage />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="organizer" element={<OrganizerPanel />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
