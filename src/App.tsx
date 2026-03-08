import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import NetworkStatus from "@/components/NetworkStatus";
import { PageTransition } from "@/components/PageTransition";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";
import ScrollToTop from "@/components/ScrollToTop";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Upload from "./pages/Upload";
import Learn from "./pages/Learn";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Products from "./pages/Products";
import AnalysisHistory from "./pages/AnalysisHistory";
import Portfolio from "./pages/Portfolio";
import Compare from "./pages/Compare";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SharedAnalysis from "./pages/SharedAnalysis";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Animated routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/products/:category" element={<Products />} />
        
        {/* Legal pages - public */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shared/:shareId" element={<SharedAnalysis />} />
        
        {/* Trial-enabled routes - accessible without login, but with limits */}
        <Route path="/chat" element={<Chat />} />
        <Route path="/upload" element={<Upload />} />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <AnalysisHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/compare" 
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <NetworkStatus />
              <Toaster />
              <Sonner />
              {showSplash ? (
                <SplashScreen onComplete={handleSplashComplete} />
              ) : (
                <BrowserRouter>
                  <ScrollToTop />
                  <PWAInstallBanner />
                  <AnimatedRoutes />
                </BrowserRouter>
              )}
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
