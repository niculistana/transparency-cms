import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Page } from "../types/Page";
import {
  FileText,
  Search,
  ArrowUpDown,
  Calendar,
  Globe,
  EyeOff,
} from "lucide-react";
import { usePagesService } from "../services/pages/PagesService";
import { ApprovedDocumentsSection } from "../sections/ApprovedDocumentsSection";

export function PagesPage() {
  const pages = usePagesService((state) => state.pages);
  const loading = usePagesService((state) => state.loading);
  const error = usePagesService((state) => state.error);
  const fetchPages = usePagesService((state) => state.fetchPages);

  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "unpublished"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    let filtered = [...pages];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((page) => {
        const title = page.title?.toLowerCase() || "";
        const content = page.content?.toLowerCase() || "";
        const slug = page.slug?.toLowerCase() || "";
        const id = page.page_id?.toString() || "";
        return (
          title.includes(query) ||
          content.includes(query) ||
          slug.includes(query) ||
          id.includes(query)
        );
      });
    }

    // Apply published filter
    if (filterPublished !== "all") {
      filtered = filtered.filter((page) =>
        filterPublished === "published" ? page.published : !page.published,
      );
    }

    // Apply date range filter
    if (dateFrom) {
      filtered = filtered.filter((page) => {
        if (!page.created_at) return false;
        return new Date(page.created_at) >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      filtered = filtered.filter((page) => {
        if (!page.created_at) return false;
        const pageDate = new Date(page.created_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        return pageDate <= toDate;
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

    setFilteredPages(filtered);
  }, [searchQuery, pages, sortBy, filterPublished, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading pages...</div>
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
      <ApprovedDocumentsSection />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Pages</h1>
        </div>

        {pages.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, content, slug, or page ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {/* Published Filter */}
              <div className="flex-shrink-0 place-self-start">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2 font-serif">
                  <Globe className="h-4 w-4" />
                  Status
                </label>
                <select
                  value={filterPublished}
                  onChange={(e) =>
                    setFilterPublished(e.target.value as typeof filterPublished)
                  }
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Pages</option>
                  <option value="published">Published Only</option>
                  <option value="unpublished">Unpublished Only</option>
                </select>
              </div>

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
              {(dateFrom ||
                dateTo ||
                searchQuery ||
                filterPublished !== "all") && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setSearchQuery("");
                    setFilterPublished("all");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No pages available.</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No pages match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPages.map((page) => (
              <Link
                key={page.page_id}
                to={`/pages/${page.page_id}`}
                className="block p-6 bg-white shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold font-serif text-gray-900">
                          {page.title}
                        </h3>
                        {page.published ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs">
                            <Globe className="h-3 w-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs">
                            <EyeOff className="h-3 w-3" />
                            Unpublished
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-serif mb-2">
                        Slug: /{page.slug}
                      </p>
                      <p className="text-sm text-gray-500 font-serif line-clamp-2">
                        {page.content.substring(0, 150)}
                        {page.content.length > 150 ? "..." : ""}
                      </p>
                      {page.created_at && (
                        <p className="text-xs text-gray-500 font-serif mt-2">
                          Created:{" "}
                          {new Date(page.created_at).toLocaleDateString()}
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
          Showing {filteredPages.length} of {pages.length} pages
        </div>
      </div>
    </div>
  );
}
