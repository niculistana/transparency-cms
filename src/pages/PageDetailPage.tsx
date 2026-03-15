import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Globe, EyeOff, Calendar } from "lucide-react";
import { usePagesService } from "../services/pages/PagesService";

export function PageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentPage = usePagesService((state) => state.currentPage);
  const loading = usePagesService((state) => state.loading);
  const error = usePagesService((state) => state.error);
  const fetchPageById = usePagesService((state) => state.fetchPageById);

  useEffect(() => {
    if (id) {
      fetchPageById(id);
    }
  }, [id, fetchPageById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-serif">Loading page...</div>
      </div>
    );
  }

  if (error || !currentPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 font-serif mb-4">
            Error: {error || "Page not found"}
          </div>
          <Link
            to="/pages"
            className="text-blue-600 hover:text-blue-800 underline font-serif"
          >
            Back to Pages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/pages"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-serif"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pages
        </Link>

        <div className="bg-white shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <FileText className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 font-serif">
                  {currentPage.title}
                </h1>
                {currentPage.published ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 border border-green-300 text-sm font-semibold font-serif">
                    <Globe className="h-4 w-4" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 text-sm font-semibold font-serif">
                    <EyeOff className="h-4 w-4" />
                    Unpublished
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 font-serif mb-4">
                Slug: <span className="font-mono">/{currentPage.slug}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 font-serif">
              Content
            </h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-800 font-serif bg-gray-50 p-4 rounded">
                {currentPage.content}
              </pre>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 font-serif">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Created: {new Date(currentPage.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Updated: {new Date(currentPage.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
