import { useEffect, useState } from "react";
import { useAuthService } from "../services/AuthService";
import { type Comment } from "../types/Comment";
import { LikeButton } from "../components/button";
import { ButtonManager, sortByDate } from "../components/util";
import {
  setCommentsMap,
  useCommentService,
  type CommentState,
} from "../services/comment/CommentService";

interface CommentsSectionProps {
  comments?: Comment[];
}

export function CommentsSection({
  comments: commentsProp,
}: CommentsSectionProps) {
  const [loadedComments, setLoadedComments] = useState<Comment[]>([]);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const currentRole = useAuthService((state) => state.currentRole);

  const selectedComment = useCommentService(
    (state: CommentState) => state.selectedComment,
  );

  const fetchedCommentsMap = useCommentService(
    (state: CommentState) => state.commentsMap,
  );

  useEffect(() => {
    if (commentsProp && commentsProp.length > 0) {
      const commentsMap = new Map<number, Comment>();
      commentsProp.forEach((comment) => {
        if (comment.comment_id !== undefined) {
          commentsMap.set(comment.comment_id, comment);
        }
      });
      setCommentsMap(commentsMap);
    }
  }, [commentsProp]);

  useEffect(() => {
    const commentsFromMap = Array.from(fetchedCommentsMap.values());
    const sortedComments = commentsFromMap.sort(sortByDate);
    console.log(sortedComments);
    setLoadedComments(sortedComments);
  }, [fetchedCommentsMap]);

  useEffect(() => {
    setEditingComment(selectedComment);
  }, [selectedComment]);

  if (!commentsProp) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="w-96 lg:w-full px-24 grid grid-cols-1 m-auto">
      <div className="grid grid-cols-1 m-auto">
        {loadedComments?.length ? (
          loadedComments.map((comment) => (
            <>
              {comment && (
                <div
                  className="flex flex-col py-4 border-b-2 border-opacity-40"
                  key={comment.comment_id}
                >
                  <div className="flex flex-1">
                    <div className="flex h-full align-middle self-center">
                      {comment.comment_id && comment.likes && (
                        <LikeButton
                          commentId={comment.comment_id}
                          likeCount={comment.likes || 0}
                        ></LikeButton>
                      )}
                    </div>
                    <div className="flex flex-1 py-2 border-x border-black p-4 m-4">
                      <div className="flex flex-col flex-1">
                        <div className="whitespace-break-spaces word mb-4">
                          {comment.text && <span>{comment.text}</span>}
                        </div>
                        <img className="w-32" src={comment.image}></img>
                        <small className="place-self-end">
                          {comment.author && <span>By {comment.author} </span>}
                          {comment.created_at && (
                            <span>On {comment.created_at}</span>
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-row self-end w-full">
                      <ButtonManager
                        comment={comment}
                        editingComment={editingComment}
                        user={{
                          role: currentRole,
                          isAuthor: false,
                        }}
                        context="document"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ))
        ) : (
          <div className="font-serif">No comments.</div>
        )}
      </div>
    </div>
  );
}
