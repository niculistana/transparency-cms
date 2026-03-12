import { create, type ExtractState } from "zustand";
import { type Comment } from "../../types/Comment";
import { StateChangeResourceRequest } from "../shared/StateChangeResourceRequest";
import { host } from "../shared/Config";

export const useCommentService = create(() => ({
  commentsMap: new Map() as Map<number, Comment>,
  selectedComment: null as Comment | null,
  error: "",
}));

export const setSelectedComment = (comment: Comment | null) =>
  useCommentService.setState(() => ({ selectedComment: comment }));

export const setCommentsMap = (newMap: Map<number, Comment>) =>
  useCommentService.setState(() => ({
    commentsMap: newMap,
  }));

export const fetchDocumentComments = async (documentId: number) => {
  const data = await fetch(`${host}/documents/${documentId}/comments`)
    .then((data) => data.json())
    .catch((error) => {
      return {
        error: error?.message || "Unknown error",
      };
    });

  if (data?.error) {
    useCommentService.setState({ error: data.error });
  } else {
    const newCommentMap = new Map();

    if (data && Array.isArray(data)) {
      data.forEach((c: Comment) => {
        newCommentMap.set(c.comment_id, c);
      });
    }

    useCommentService.setState(() => ({
      commentsMap: newCommentMap,
    }));
  }
};
export const saveLikes = async ({ comment_id, likes = 1 }: Comment) => {
  if (!!comment_id) {
    await updateComment({
      comment_id,
      likes,
    });
  }
};

export const flagComment = async ({ comment_id, flagged }: Comment) => {
  if (comment_id === undefined || flagged === undefined) {
    return;
  }

  const request = new StateChangeResourceRequest("comment/flag", "PUT");
  const data = await request.fetch({ comment_id, flagged });

  if (data?.error) {
    useCommentService.setState({ error: data.error });
  } else {
    const key = data.comment_id;
    const value = data;
    useCommentService.setState((state) => {
      const newMap = new Map(state.commentsMap);
      newMap.set(key, value);

      return {
        commentsMap: newMap,
      };
    });
  }
};

export const saveText = async ({ comment_id, text }: Comment) => {
  if (!!comment_id) {
    await updateComment({
      comment_id,
      text,
    });
  }

  setSelectedComment(null);
};

export const updateComment = async ({
  comment_id,
  text,
  author,
  likes,
  image,
}: Comment) => {
  const request = new StateChangeResourceRequest("comment", "PUT");

  const data = await request.fetch({ comment_id, text, author, likes, image });

  if (data?.error) {
    useCommentService.setState({ error: data.error });
  } else {
    const key = data.comment_id;
    const value = data;
    useCommentService.setState((state) => {
      const newMap = new Map(state.commentsMap);
      newMap.set(key, value);

      return {
        commentsMap: newMap,
      };
    });
  }
};

export const createComment = async (
  { text, author = "Admin", likes = 1, image }: Comment,
  documentId?: number,
) => {
  if (!documentId) {
    useCommentService.setState({ error: "Document ID is required" });
    return;
  }

  const request = new StateChangeResourceRequest(
    `documents/${documentId}/comments`,
    "POST",
  );
  const data = await request.fetch({ text, author, likes, image });

  if (data?.error) {
    useCommentService.setState({ error: data.error });
  } else {
    const key = data.comment_id;
    const value = data;
    useCommentService.setState((state) => {
      const newMap = new Map(state.commentsMap);
      newMap.set(key, value);
      return {
        commentsMap: newMap,
      };
    });
  }
};

export const deleteComment = async ({ comment_id }: Comment) => {
  const request = new StateChangeResourceRequest(
    "admin/delete_comment",
    "DELETE",
  );
  const data = await request.fetch({ comment_id });

  if (data?.error) {
    useCommentService.setState({ error: data.error });
  } else {
    const key = comment_id as number;
    useCommentService.setState((state) => {
      const next = new Map(state.commentsMap);
      next.delete(key);
      return {
        commentsMap: next,
      };
    });
  }
};

export const setError = (error: string) =>
  useCommentService.setState(() => ({ error }));

export type CommentState = ExtractState<typeof useCommentService>;
