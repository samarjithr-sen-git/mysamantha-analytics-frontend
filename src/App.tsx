import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import Overview from "@/pages/dashboard/Overview";
import Financials from "@/pages/dashboard/Financials";
import Operations from "@/pages/dashboard/Operations";
import UserAnalytics from "@/pages/dashboard/UserAnalytics"; // New Page
import SystemInfra from "@/pages/dashboard/SystemInfra";     // New Page
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="users" element={<UserAnalytics />} />
            <Route path="financials" element={<Financials />} />
            <Route path="operations" element={<Operations />} />
            <Route path="system" element={<SystemInfra />} />
          </Route>
        </Route>

        {/* Fallback & Root Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <Toaster position="top-right" richColors closeButton />
    </Router>
  );
}