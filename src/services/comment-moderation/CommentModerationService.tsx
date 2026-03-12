import { create, type ExtractState } from "zustand";
import { type Comment } from "../../types/Comment";
import { StateChangeResourceRequest } from "../shared/StateChangeResourceRequest";
import { host } from "../shared/Config";

export const useCommentModerationService = create(() => ({
  comments: new Map(),
  selectedComment: null as Comment | null,
  deletedComment: null,
  error: "",
}));

export const setSelectedComment = (comment: Comment | null) =>
  useCommentModerationService.setState(() => ({ selectedComment: comment }));

export const setDeletedComment = () =>
  useCommentModerationService.setState((state) => ({
    deletedComment: state.deletedComment,
  }));

export const fetchAdminComments = async () => {
  const data = await fetch(`${host}/admin/get_all_comments`)
    .then((data) => data.json())
    .catch((error) => {
      return {
        error: error?.message || "Unknown error",
      };
    });

  if (data?.error) {
    useCommentModerationService.setState({ error: data.error });
  } else {
    const newCommentMap = new Map();

    if (data && Array.isArray(data)) {
      data.forEach((c: Comment) => {
        newCommentMap.set(c.comment_id, c);
      });
    }

    useCommentModerationService.setState(() => ({
      comments: newCommentMap,
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
    useCommentModerationService.setState({ error: data.error });
  } else {
    const key = data.comment_id;
    const value = data;
    useCommentModerationService.setState((state) => {
      const newMap = new Map(state.comments);
      newMap.set(key, value);

      return {
        comments: newMap,
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
    useCommentModerationService.setState({ error: data.error });
  } else {
    const key = data.comment_id;
    const value = data;
    useCommentModerationService.setState((state) => {
      const newMap = new Map(state.comments);
      newMap.set(key, value);

      return {
        comments: newMap,
      };
    });
  }
};

export const deleteComment = async ({ comment_id }: Comment) => {
  console.log("deleting comment");
  const request = new StateChangeResourceRequest(
    "admin/delete_comment",
    "DELETE",
  );
  const data = await request.fetch({ comment_id });

  if (data?.error) {
    useCommentModerationService.setState({ error: data.error });
  } else {
    const key = comment_id;
    useCommentModerationService.setState((state) => {
      const next = new Map(state.comments);
      next.delete(key);
      return {
        comments: next,
      };
    });
  }
};

export const setError = (error: string) =>
  useCommentModerationService.setState(() => ({ error }));

export type CommentModerationState = ExtractState<
  typeof useCommentModerationService
>;
