import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import FeaturesPage from "./pages/FeaturesPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { RequireAuth } from "./components/app/RequireAuth";
import Dashboard from "./pages/app/Dashboard";
import Agenda from "./pages/app/Agenda";
import Tasks from "./pages/app/Tasks";
import History from "./pages/app/History";
import Profile from "./pages/app/Profile";
import { EmergencyButton } from "./components/app/EmergencyButton";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const isAppPage = location.pathname.startsWith("/app");
  const isDashboard = location.pathname === "/app/dashboard";

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isAppPage && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected App Routes */}
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } />
          <Route path="/app/agenda" element={
            <RequireAuth>
              <Agenda />
            </RequireAuth>
          } />
          <Route path="/app/tasks" element={
            <RequireAuth>
              <Tasks />
            </RequireAuth>
          } />
          <Route path="/app/history" element={
            <RequireAuth>
              <History />
            </RequireAuth>
          } />
          <Route path="/app/profile" element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && !isAppPage && <Footer />}
      {isDashboard && <EmergencyButton />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
