import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, CheckCircle } from "lucide-react";
import { useDashboardService } from "../services/dashboard/DashboardService";

export function ApprovedDocumentsSection() {
  const documents = useDashboardService((state) => state.documents);
  const loading = useDashboardService((state) => state.loading);
  const error = useDashboardService((state) => state.error);
  const fetchDocuments = useDashboardService((state) => state.fetchDocuments);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter for approved documents
  const approvedDocuments = documents.filter(
    (doc) => doc.submission?.status === "approved",
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Approved Documents
          </h2>
        </div>
        <div className="text-gray-600">Loading approved documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Approved Documents
          </h2>
        </div>
        <div className="text-red-600 font-serif">Error: {error}</div>
      </div>
    );
  }

  if (approvedDocuments.length === 0) {
    return null; // Don't show section if there are no approved documents
  }

  return (
    <div className="w-full bg-green-50 border-b border-green-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Approved Documents
          </h2>
          <span className="ml-2 px-3 py-1 bg-green-200 text-green-800 text-sm font-semibold rounded-full">
            {approvedDocuments.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {approvedDocuments.map((document) => (
            <Link
              key={document.document_id}
              to={`/documents/${document.document_id}`}
              className="block p-6 bg-white shadow hover:shadow-md transition-shadow duration-200 border-l-4 border-green-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <FileText className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold font-serif text-gray-900 mb-2">
                        {document.title || `Document #${document.document_id}`}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Ready to Publish
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-serif truncate mb-2">
                      {document.external_link}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 font-serif">
                      {document.submission?.reviewed_at && (
                        <p>
                          Approved:{" "}
                          {new Date(
                            document.submission.reviewed_at,
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {document.submission?.reviewed_by && (
                        <p>By: {document.submission.reviewed_by}</p>
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
