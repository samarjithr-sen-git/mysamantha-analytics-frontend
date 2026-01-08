import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  // We check for the presence of the auth_token
  const isAuthenticated = !!localStorage.getItem("auth_token");

  if (!isAuthenticated) {
    // Redirect to login if not authenticated, replace history to prevent 'back' loops
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (DashboardLayout, etc.)
  return <Outlet />;
};