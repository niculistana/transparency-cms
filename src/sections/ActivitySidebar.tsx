import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, X } from "lucide-react";
import { useActivityService } from "../services/activity/ActivityService";
import { useDashboardService } from "../services/dashboard/DashboardService";

export function ActivitySidebar() {
  const isOpen = useDashboardService((state) => state.isActivitySidebarOpen);
  const setActivitySidebarOpen = useDashboardService(
    (state) => state.setActivitySidebarOpen,
  );
  const activities = useActivityService((state) => state.activities);
  const loading = useActivityService((state) => state.loading);
  const error = useActivityService((state) => state.error);
  const fetchActivities = useActivityService((state) => state.fetchActivities);
  const dismissActivity = useActivityService((state) => state.dismissActivity);

  useEffect(() => {
    fetchActivities();
    // Poll for new activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "comment":
        return "💬";
      case "document":
        return "📄";
      case "submission":
        return "📋";
      default:
        return "✨";
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-green-600 bg-green-50";
      case "updated":
        return "text-blue-600 bg-blue-50";
      case "deleted":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getDocumentId = (activity: any): string | null => {
    try {
      if (!activity.details) return null;

      const details =
        typeof activity.details === "string"
          ? JSON.parse(activity.details)
          : activity.details;

      return details.document_id ? String(details.document_id) : null;
    } catch (error) {
      return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
            </div>
            <button
              onClick={() => setActivitySidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close activity feed"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && activities.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Loading activities...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-sm">
                Error: {error}
              </div>
            ) : activities.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No activities yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.slice(0, 50).map((activity) => {
                  const documentId = getDocumentId(activity);

                  const handleDismiss = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dismissActivity(activity.activity_id);
                  };

                  const ActivityContent = (
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getActivityIcon(activity.entity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {activity.user_email}
                            </span>
                            <span className="text-sm text-gray-600 ml-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getActivityColor(activity.action)}`}
                              >
                                {activity.action}
                              </span>
                            </span>
                            <span className="text-sm text-gray-600 ml-1">
                              {activity.entity_type}
                            </span>
                          </div>
                          <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                            aria-label="Dismiss activity"
                            title="Dismiss"
                          >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        {activity.details && (
                          <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {typeof activity.details === "string"
                              ? JSON.parse(activity.details).text_preview ||
                                JSON.stringify(activity.details)
                              : activity.details.text_preview ||
                                JSON.stringify(activity.details)}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-400">
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  );

                  return documentId ? (
                    <Link
                      key={activity.activity_id}
                      to={`/documents/${documentId}`}
                      onClick={() => setActivitySidebarOpen(false)}
                      className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {ActivityContent}
                    </Link>
                  ) : (
                    <div
                      key={activity.activity_id}
                      className="p-4 hover:bg-gray-50"
                    >
                      {ActivityContent}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
