import type { Comment } from "./Comment";

export type Document = {
  document_id?: number;
  external_link?: string;
  created_at?: string;
  comments?: Comment[];
};
