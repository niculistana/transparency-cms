import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Document } from "../types/Document";
import { FileText, Plus, Search, ArrowUpDown, Calendar } from "lucide-react";
import { useAuthService } from "../services/AuthService";
import { useDashboardService } from "../services/dashboard/DashboardService";

export function DocumentsPage() {
  const documents = useDashboardService((state) => state.documents);
  const loading = useDashboardService((state) => state.loading);
  const error = useDashboardService((state) => state.error);
  const fetchDocuments = useDashboardService((state) => state.fetchDocuments);

  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const currentRole = useAuthService((state) => state.currentRole);

  const canCreateDocument =
    currentRole && ["ADMIN", "AUTHOR"].includes(currentRole);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((document) => {
        const title = document.title?.toLowerCase() || "";
        const externalLink = document.external_link?.toLowerCase() || "";
        const id = document.document_id?.toString() || "";
        return (
          title.includes(query) ||
          externalLink.includes(query) ||
          id.includes(query)
        );
      });
    }

    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter((document) => {
        if (!document.created_at) return false;
        return new Date(document.created_at) >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      filtered = filtered.filter((document) => {
        if (!document.created_at) return false;
        const docDate = new Date(document.created_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date
        return docDate <= toDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [searchQuery, documents, sortBy, dateFrom, dateTo]);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Documents</h1>
          {canCreateDocument && (
            <Link
              to="/documents/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Document
            </Link>
          )}
        </div>

        {documents.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, external link, or document ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-4 items-end">
              {/* Sort By */}
              <div className="flex-shrink-0 place-self-start">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex gap-3 items-end">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="h-4 w-4" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(dateFrom || dateTo || searchQuery) && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-serif hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-serif">No documents available.</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-serif">
              No documents match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((document) => (
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
                        {document.title || `Document #${document.document_id}`}
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
        {/* Results Count */}
        <div className="py-4 flex flex-1 justify-end text-sm text-gray-600">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      </div>
    </div>
  );
}
