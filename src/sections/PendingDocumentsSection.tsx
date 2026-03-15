import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock } from "lucide-react";
import { useDashboardService } from "../services/dashboard/DashboardService";

export function PendingDocumentsSection() {
  const pendingDocuments = useDashboardService(
    (state) => state.pendingDocuments,
  );
  const loading = useDashboardService((state) => state.loading);
  const error = useDashboardService((state) => state.error);
  const fetchPendingDocuments = useDashboardService(
    (state) => state.fetchPendingDocuments,
  );

  useEffect(() => {
    fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Documents
          </h2>
        </div>
        <div className="text-gray-600">Loading pending documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Documents
          </h2>
        </div>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (pendingDocuments.length === 0) {
    return null; // Don't show section if there are no pending documents
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-6 w-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Documents
          </h2>
          <span className="ml-2 px-3 py-1 bg-amber-200 text-amber-800 text-sm font-semibold rounded-full">
            {pendingDocuments.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pendingDocuments.map((document) => (
            <Link
              key={document.document_id}
              to={`/documents/${document.document_id}`}
              className="block p-6 bg-white shadow hover:shadow-md transition-shadow duration-200 border-l-4 border-amber-400"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <FileText className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold font-serif text-gray-900 mb-2">
                        {document.title || `Document #${document.document_id}`}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 font-serif truncate mb-2">
                      {document.external_link}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 font-serif">
                      {document.submission?.submitted_at && (
                        <p>
                          Submitted:{" "}
                          {new Date(
                            document.submission.submitted_at,
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {document.submission?.submitted_by && (
                        <p>By: {document.submission.submitted_by}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
