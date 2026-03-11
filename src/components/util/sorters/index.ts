import { type Comment } from "../../../types/Comment";

export const sortByDate = (a: Comment, b: Comment) => {
  const aDate = new Date(a.created_at || "");
  const bDate = new Date(b.created_at || "");

  return bDate.getTime() - aDate.getTime();
};
