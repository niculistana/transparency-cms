import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { host } from "../services/shared/Config";
import { Send, ArrowLeft } from "lucide-react";
import type { Submission } from "../types/Document";

export function SubmissionEditPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [reviewedAt, setReviewedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`${host}/documents/${id}/submission`);
        if (!response.ok) {
          throw new Error("Submission not found");
        }
        const data = await response.json();
        setSubmission(data);
        setStatus(data.status || "");
        setReviewedBy(data.reviewed_by || "");
        setReviewedAt(
          data.reviewed_at
            ? new Date(data.reviewed_at).toISOString().slice(0, 16)
            : "",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!status.trim()) {
      setError("Status is required");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${host}/documents/${id}/submission`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewed_by: reviewedBy || null,
          reviewed_at: reviewedAt ? new Date(reviewedAt).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update submission");
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
        <div className="text-lg">Loading submission...</div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 font-serif mb-4">Error: {error}</div>
          <Link
            to={`/documents/${id}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Document
          </Link>
        </div>
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
            <Send className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 font-serif">
              Edit Submission
            </h1>
          </div>
          <p className="text-gray-600 font-serif">
            Update the submission status and review information
          </p>
        </div>

        <div className="bg-white shadow border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
              >
                Status <span className="text-red-600">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-serif"
                required
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Select the current status of the submission
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="reviewed_by"
                className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
              >
                Reviewed By
              </label>
              <input
                type="text"
                id="reviewed_by"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                placeholder="Enter reviewer name"
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-serif"
              />
              <p className="mt-2 text-sm text-gray-500">
                Name of the person who reviewed this submission
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="reviewed_at"
                className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
              >
                Reviewed At
              </label>
              <input
                type="datetime-local"
                id="reviewed_at"
                value={reviewedAt}
                onChange={(e) => setReviewedAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-serif"
              />
              <p className="mt-2 text-sm text-gray-500">
                Date and time when the submission was reviewed
              </p>
            </div>

            {error && submission && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200">
                <p className="text-red-600 font-serif text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Link
                to={`/documents/${id}`}
                className="px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
