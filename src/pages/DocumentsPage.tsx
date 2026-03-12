import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { host } from "../services/shared/Config";
import type { Document } from "../types/Document";
import { FileText } from "lucide-react";

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${host}/documents`);
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        setDocuments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Published Documents
        </h1>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-serif">No documents available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((document) => (
              <Link
                key={document.document_id}
                to={`/documents/${document.document_id}`}
                className="block p-6 bg-white shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold font-serif text-gray-900 mb-2">
                        Document #{document.document_id}
                      </h3>
                      <p className="text-sm text-gray-600 font-serif truncate mb-2">
                        {document.external_link}
                      </p>
                      {document.created_at && (
                        <p className="text-xs text-gray-500 font-serif">
                          Published:{" "}
                          {new Date(document.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
