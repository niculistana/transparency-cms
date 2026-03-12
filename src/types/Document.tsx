import type { Comment } from "./Comment";

export type Submission = {
  submission_id: number;
  document_id: number;
  submitted_by: string;
  submitted_at: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
};

export type Document = {
  document_id?: number;
  title?: string;
  external_link?: string;
  created_at?: string;
  comments?: Comment[];
  submission?: Submission | null;
};
