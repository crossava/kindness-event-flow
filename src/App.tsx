// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Layout } from "./components/layout/Layout";
import HomePage from "./pages/Index";
import EventPage from "./pages/EventPage";
import Dashboard from "./pages/Dashboard";
import OrganizerPanel from "./pages/OrganizerPanel";
import NotFound from "./pages/NotFound";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { WebSocketProvider } from "@/hooks/WebSocketProvider";
import { UserProvider, useUserContext } from "@/context/UserContext";
import { EventProvider } from "@/context/EventContext";
import PrivateRoute from "@/components/PrivateRoute.tsx";
import {DashboardContext, DashboardProvider} from "@/context/DashboardContext.tsx";
import {OrganizerPanelProvider} from "@/context/OrganizerPanelContext.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <AppWithUserContext />
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppWithUserContext = () => {
  const { isLoading } = useUserContext();

  if (isLoading) return <div>Загрузка пользователя...</div>;

  return (
    <EventProvider>
      <DashboardProvider>
          <OrganizerPanelProvider>
            <WebSocketProvider>
              <Sonner />
              <Toaster />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<HomePage />} />
                      <Route path="event/:id" element={<EventPage />} />
                      <Route
                        path="dashboard"
                        element={
                          <PrivateRoute>
                            <Dashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route
                          path="organizer"
                          element={
                            <PrivateRoute allowedRoles={["organizer", "both"]}>
                              <OrganizerPanel />
                            </PrivateRoute>
                          }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </WebSocketProvider>
            </OrganizerPanelProvider>
      </DashboardProvider>
    </EventProvider>

  );
};


export default App;
