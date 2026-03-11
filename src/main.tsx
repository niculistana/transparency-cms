import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { MarketingPage } from "./pages/MarketingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginAs } from "./admin/LoginAs";
import { LogoutPage } from "./pages/LogoutPage";
import { useAuthService } from "./services/AuthService";

function HomePage() {
  const isLoggedIn = useAuthService((state) => state.isLoggedIn);
  return isLoggedIn ? <DashboardPage /> : <MarketingPage />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginAs />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
