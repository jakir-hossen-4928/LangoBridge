import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { VocabularyProvider } from "@/context/VocabularyContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AnimatePresence } from "framer-motion";

import Index from "./pages/Index";
import VocabularyList from "./pages/VocabularyList";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOverview from "./pages/admin/Overview";
import VocabularyManagement from "./pages/admin/VocabularyManagement";
import WordRequests from "./pages/admin/WordRequests";
import AdminSettings from "./pages/admin/Settings";
import TranslatedRequestWordForm from './components/TranslatedRequestWordForm';
import RequestWordPage from './pages/RequestWordPage';
import Appdownload from './components/Appdownload';
import AppDownloadPage from './pages/AppDownloadPage';
import History from './pages/History';

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter> {/* Moved to the top */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider> {/* Now inside BrowserRouter */}
            <VocabularyProvider>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/vocabulary" element={<VocabularyList />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/request-word" element={<RequestWordPage />} />
                  <Route path="/langobridge-app" element={<AppDownloadPage />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminOverview />} />
                    <Route path="vocabulary" element={<VocabularyManagement />} />
                    <Route path="requests" element={<WordRequests />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Redirect /admin/overview to /admin for cleaner URLs */}
                  <Route path="/admin/overview" element={<Navigate to="/admin" replace />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </VocabularyProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;