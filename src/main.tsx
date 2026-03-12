import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { MarketingPage } from "./pages/MarketingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { DocumentCreationPage } from "./pages/DocumentCreationPage";
import { DocumentEditPage } from "./pages/DocumentEditPage";
import { SubmissionEditPage } from "./pages/SubmissionEditPage";
import { CommentModerationPage } from "./pages/CommentModerationPage";
import { LoginAs } from "./admin/LoginAs";
import { LogoutPage } from "./pages/LogoutPage";
import { useAuthService } from "./services/AuthService";
import { Header } from "./components/Header";

function HomePage() {
  const isLoggedIn = useAuthService((state) => state.isLoggedIn);
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <MarketingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthService((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const isLoggedIn = useAuthService((state) => state.isLoggedIn);
  const currentRole = useAuthService((state) => state.currentRole);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-700 mb-4">
            You do not have permission to access this page.
          </p>
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginAs />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/create"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "AUTHOR"]}>
              <div className="w-full min-h-screen bg-gray-50">
                <Header />
                <DocumentCreationPage />
              </div>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <div className="w-full min-h-screen bg-gray-50">
                <Header />
                <DocumentDetailPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "AUTHOR", "EDIT"]}>
              <div className="w-full min-h-screen bg-gray-50">
                <Header />
                <DocumentEditPage />
              </div>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/documents/:id/submission/edit"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "AUTHOR", "EDIT"]}>
              <div className="w-full min-h-screen bg-gray-50">
                <Header />
                <SubmissionEditPage />
              </div>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/comments"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <div className="w-full min-h-screen bg-gray-50">
                <Header />
                <CommentModerationPage />
              </div>
            </RoleProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
