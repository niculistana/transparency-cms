import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { MarketingPage } from "./pages/MarketingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
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
          path="/comments"
          element={
            <ProtectedRoute>
              <div className="w-full min-h-screen bg-gray-50">
                <Header />
                <CommentModerationPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
