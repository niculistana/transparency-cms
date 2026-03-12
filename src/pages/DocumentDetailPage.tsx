import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { host } from "../services/shared/Config";
import type { Document } from "../types/Document";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Edit,
  Send,
  Pencil,
} from "lucide-react";
import { AddCommentSection } from "../sections/AddCommentSection";
import { CommentsSection } from "../sections/CommentsSection";
import { useAuthService } from "../services/AuthService";
import {
  SubmissionStatusLabel,
  type SubmissionStatus,
} from "../components/label";

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentRole = useAuthService((state) => state.currentRole);

  const canEditDocument =
    currentRole === "ADMIN" ||
    currentRole === "AUTHOR" ||
    currentRole === "EDIT";

  const canReviewDocument = currentRole === "ADMIN" || currentRole === "AUTHOR";

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`${host}/documents/${id}`);
        if (!response.ok) {
          throw new Error("Document not found");
        }
        const data = await response.json();
        setDocument(data);
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

  const handleSubmitDocument = async () => {
    if (!id || !document) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${host}/documents/${id}/submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submitted_by: currentRole || "UNKNOWN",
          status: "pending",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit document");
      }

      const submissionData = await response.json();
      setDocument({
        ...document,
        submission: submissionData,
      });
      alert("Document submitted successfully for approval!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit document");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-serif">Loading document...</div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 font-serif mb-4">
            Error: {error || "Document not found"}
          </div>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>

        <div className="flex flex-col bg-white shadow-lg p-8 mb-8">
          <div className="flex flex-1 flex-row justify-between items-start gap-4 mb-6">
            <div className="flex flex-col self-center">
              <div className="flex flex-row pb-2">
                <FileText className="h-8 w-8 mr-2 text-blue-600 flex-shrink-0" />
                <h1 className="flex flex-1 text-3xl font-bold font-serif text-gray-900">
                  {document.title || `Document #${document.document_id}`}
                </h1>
              </div>
              {document.submission && (
                <div className="flex flex-row">
                  <SubmissionStatusLabel
                    status={document.submission.status as SubmissionStatus}
                  />
                </div>
              )}
            </div>
            {canEditDocument && (
              <div className="flex flex-col justify-end gap-2">
                {!document.submission && (
                  <Link
                    to={`/documents/${id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-serif hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Document
                  </Link>
                )}
                {canReviewDocument && document.submission && (
                  <Link
                    to={`/documents/${id}/submission/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-serif hover:bg-green-700 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Submission
                  </Link>
                )}
                {!document.submission && (
                  <div>
                    <button
                      onClick={handleSubmitDocument}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-serif hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? "Submitting..." : "Submit Document"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-serif font-semibold text-gray-700 mb-2">
              External Link
            </h2>
            <a
              href={document.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-serif inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 break-all"
            >
              {document.external_link}
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </div>

          <div className="flex justify-self-end place-self-end">
            {document.created_at && (
              <p className="text-sm text-gray-600 font-serif">
                Published: {new Date(document.created_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 mb-8">
          <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">
            Comments & Discussion
          </h2>
          <div className="w-full lg:w[900px]">
            <AddCommentSection documentId={document.document_id} />
            <CommentsSection comments={document.comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
