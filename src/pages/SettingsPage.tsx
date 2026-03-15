import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuthService } from "../services/AuthService";
import { LogoutButton } from "../components/LogoutButton";
import { ArrowLeft } from "lucide-react";

export function SettingsPage() {
  const currentRole = useAuthService((state) => state.currentRole);

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-600 font-serif">
            Manage your application settings and preferences
          </p>
        </div>

        <div className="bg-white shadow border border-gray-200">
          {/* Admin Settings Section */}
          {currentRole === "ADMIN" && (
            <div className="border-b border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">
                  Admin Tools
                </h2>
                <div className="space-y-3">
                  <Link
                    to="/comments"
                    className="flex items-center justify-between p-4 border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">
                          Moderate Comments
                        </h3>
                        <p className="text-sm text-gray-600">
                          Review, flag, and manage comments across all documents
                        </p>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400 group-hover:text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* General Settings Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">
              Logout
            </h2>
            <div className="text-gray-600 font-serif">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
