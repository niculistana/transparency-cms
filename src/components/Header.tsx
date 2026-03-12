import { useAuthService } from "../services/AuthService";
import { LogoutButton } from "./LogoutButton";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export const Header = () => {
  const isLoggedIn = useAuthService((state) => state.isLoggedIn);
  const currentRole = useAuthService((state) => state.currentRole);

  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
                Transparency CMS
              </h1>
            </Link>
            {isLoggedIn && currentRole && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium">
                {currentRole}
              </span>
            )}
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              {currentRole === "ADMIN" && (
                <Link
                  to="/comments"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Moderate Comments
                </Link>
              )}
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
