import { create, type ExtractState } from "zustand";
import { type Document } from "../../types/Document";

export const useDocumentDetailService = create(() => ({
  document: null as Document | null,
  error: "",
}));

export const setError = (error: string) =>
  useDocumentDetailService.setState(() => ({ error }));

export type DocumentDetailState = ExtractState<typeof useDocumentDetailService>;
