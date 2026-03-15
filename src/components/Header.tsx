import { useAuthService } from "../services/AuthService";
import { useDashboardService } from "../services/dashboard/DashboardService";
import { useActivityService } from "../services/activity/ActivityService";
import { HeaderActions } from "./HeaderActions";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

export const Header = () => {
  const isLoggedIn = useAuthService((state) => state.isLoggedIn);
  const currentRole = useAuthService((state) => state.currentRole);
  const toggleActivitySidebar = useDashboardService(
    (state) => state.toggleActivitySidebar,
  );
  const setActivitySidebarOpen = useDashboardService(
    (state) => state.setActivitySidebarOpen,
  );
  const activities = useActivityService((state) => state.activities);
  const unreadCount = activities.length;
  const navigate = useNavigate();
  const location = useLocation();

  const handleNotificationClick = () => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
      // Use setTimeout to ensure navigation completes before opening sidebar
      setTimeout(() => {
        setActivitySidebarOpen(true);
      }, 100);
    } else {
      toggleActivitySidebar();
    }
  };

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
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Toggle activity feed"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <HeaderActions />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
