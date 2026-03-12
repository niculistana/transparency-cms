import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { host } from "../services/shared/Config";
import { FileText, ArrowLeft } from "lucide-react";

export function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`${host}/documents/${id}`);
        if (!response.ok) {
          throw new Error("Document not found");
        }
        const data = await response.json();
        setTitle(data.title || "");
        setExternalLink(data.external_link || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!title.trim()) {
      setError("Title is required");
      setSaving(false);
      return;
    }

    if (!externalLink.trim()) {
      setError("External link is required");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${host}/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, external_link: externalLink }),
      });

      if (!response.ok) {
        throw new Error("Failed to update document");
      }

      // Navigate back to the document detail page
      navigate(`/documents/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-serif">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/documents/${id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-serif mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Document
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 font-serif">
              Edit Document
            </h1>
          </div>
          <p className="text-gray-600 font-serif">
            Update the document information
          </p>
        </div>

        <div className="bg-white shadow border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
              >
                Document Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
                required
              />
              <p className="mt-2 text-sm text-gray-500 font-serif">
                Provide a descriptive title for the document
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="external_link"
                className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
              >
                External Link <span className="text-red-600">*</span>
              </label>
              <input
                type="url"
                id="external_link"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
                required
              />
              <p className="mt-2 text-sm text-gray-500 font-serif">
                Enter the full URL to the external document (e.g., PDF, webpage,
                or file)
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200">
                <p className="text-red-600 font-serif text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 bg-blue-600 text-white font-semibold font-serif hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                to={`/documents/${id}`}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold font-serif hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
