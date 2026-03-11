import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthService } from "../services/AuthService";

export function LogoutPage() {
  const navigate = useNavigate();
  const logout = useAuthService((state) => state.logout);

  useEffect(() => {
    // Clear authentication
    logout();

    // Redirect to home after logout
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  }, [navigate, logout]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Logging out...
        </h1>
        <p className="text-gray-600">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
