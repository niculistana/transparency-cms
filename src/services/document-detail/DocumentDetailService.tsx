import { create, type ExtractState } from "zustand";
import { type Document } from "../../types/Document";
import { host } from "../shared/Config";

export const useDocumentDetailService = create(() => ({
  document: null as Document | null,
  loading: false,
  submitting: false,
  publishing: false,
  error: "",
}));

export const fetchDocument = async (id: string) => {
  useDocumentDetailService.setState({ loading: true, error: "" });

  try {
    const response = await fetch(`${host}/documents/${id}`);
    if (!response.ok) {
      throw new Error("Document not found");
    }
    const data = await response.json();
    useDocumentDetailService.setState({
      document: data,
      loading: false,
      error: "",
    });
  } catch (err) {
    useDocumentDetailService.setState({
      document: null,
      loading: false,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const submitDocument = async (id: string, submittedBy: string) => {
  const currentDocument = useDocumentDetailService.getState().document;
  if (!currentDocument) {
    return { success: false, error: "No document loaded" };
  }

  useDocumentDetailService.setState({ submitting: true });

  try {
    const response = await fetch(`${host}/documents/${id}/submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submitted_by: submittedBy,
        status: "pending",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit document");
    }

    const submissionData = await response.json();
    useDocumentDetailService.setState({
      document: {
        ...currentDocument,
        submission: submissionData,
      },
      submitting: false,
    });

    return { success: true };
  } catch (err) {
    useDocumentDetailService.setState({ submitting: false });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit document",
    };
  }
};

export const publishDocument = async (id: string) => {
  const currentDocument = useDocumentDetailService.getState().document;
  if (!currentDocument) {
    return { success: false, error: "No document loaded" };
  }

  if (currentDocument.submission?.status !== "approved") {
    return {
      success: false,
      error: "Document must be approved before publishing",
    };
  }

  useDocumentDetailService.setState({ publishing: true });

  try {
    // Update the submission status to 'published'
    const response = await fetch(`${host}/documents/${id}/submission`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "published",
        reviewed_by: currentDocument.submission.reviewed_by,
        reviewed_at: currentDocument.submission.reviewed_at,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to publish document");
    }

    const submissionData = await response.json();
    useDocumentDetailService.setState({
      document: {
        ...currentDocument,
        submission: submissionData,
      },
      publishing: false,
    });

    return { success: true };
  } catch (err) {
    useDocumentDetailService.setState({ publishing: false });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to publish document",
    };
  }
};

export const setDocument = (document: Document) =>
  useDocumentDetailService.setState(() => ({ document }));

export const setError = (error: string) =>
  useDocumentDetailService.setState(() => ({ error }));

export type DocumentDetailState = ExtractState<typeof useDocumentDetailService>;
