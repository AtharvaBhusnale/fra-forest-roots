import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "./pages/Home";
import Atlas from "./pages/Atlas";
import DSS from "./pages/DSS";
import Dashboard from "./pages/Dashboard";
import Digitization from "./pages/Digitization";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AuthPage from "./components/auth/AuthPage";
import ClaimApplication from "./pages/ClaimApplication";
import MyClaims from "./pages/MyClaims";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Protected routes for super admins only */}
                <Route path="/admin" element={
                  <ProtectedRoute requireRole="super_admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes for officials only */}
                <Route path="/atlas" element={
                  <ProtectedRoute requireRole="official">
                    <Atlas />
                  </ProtectedRoute>
                } />
                <Route path="/dss" element={
                  <ProtectedRoute requireRole="official">
                    <DSS />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute requireRole="official">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/digitization" element={
                  <ProtectedRoute requireRole="official">
                    <Digitization />
                  </ProtectedRoute>
                } />
                
                {/* Protected routes for citizens only */}
                <Route path="/apply-claim" element={
                  <ProtectedRoute requireRole="citizen">
                    <ClaimApplication />
                  </ProtectedRoute>
                } />
                <Route path="/my-claims" element={
                  <ProtectedRoute requireRole="citizen">
                    <MyClaims />
                  </ProtectedRoute>
                } />
                
                {/* Public routes */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;