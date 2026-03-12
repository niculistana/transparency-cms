import { useEffect, useState } from "react";
import {
  saveText,
  setSelectedComment,
} from "../../../services/comment-moderation/CommentModerationService";
import { type Comment } from "../../../types/Comment";
import { EditButton, FlagButton } from "../../button";
import { SubmitButton } from "../../button/submit/SubmitButton";
import { DeleteButton } from "../../button";

export const ButtonManager = ({
  comment,
  editingComment,
  user,
  context,
}: {
  comment: Comment;
  editingComment: Comment | null;
  user: {
    role: string | null;
    isAuthor: boolean;
  };
  context: "document" | "moderate";
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textAreaText, setTextAreaText] = useState<string | undefined>(
    comment.text,
  );

  const { role, isAuthor } = user;

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (editingComment && comment.comment_id === editingComment.comment_id) {
      setIsEditing(true);
      setTextAreaText(comment.text);
    } else {
      setIsEditing(false);
    }
  }, [editingComment]);

  const onEditButtonClick = () => {
    if (!isEditing) {
      setSelectedComment(comment);
    } else {
      setSelectedComment(null);
    }
  };

  return (
    <div className="w-full">
      {isAuthor && (
        <div className="flex flex-1 flex-col items-end self-end mb-4">
          <EditButton
            onClick={onEditButtonClick}
            text={!isEditing ? "Edit" : "Cancel"}
          />
        </div>
      )}
      {isEditing && (
        <div>
          <form
            id="selectedCommentForm"
            onSubmit={(e) => {
              e.preventDefault();

              const data = new FormData(e.target);
              const editedText = (data.get("text") as string) || "";

              saveText({ comment_id: comment.comment_id, text: editedText });
            }}
          >
            <div className="flex flex-1 flex-col items-end">
              <textarea
                className="flex flex-1 h-96 w-full border border-gray-300 py-2 px-4 resize-none shadow-sm outline-none"
                rows={5}
                value={textAreaText}
                onChange={(e) => setTextAreaText(e.target.value)}
                name="text"
              ></textarea>
              <div className="flex flex-1 flex-col items-end self-end my-4 float-right">
                <SubmitButton />
              </div>
            </div>
          </form>
        </div>
      )}
      <div className="flex gap-4 justify-end">
        {context === "moderate" && comment.comment_id && (
          <FlagButton
            commentId={comment.comment_id}
            isFlagged={(!isAuthor && comment.flagged) || false}
          />
        )}
        {context === "moderate" &&
          isAdmin &&
          comment.comment_id &&
          comment.flagged && (
            <DeleteButton commentId={comment.comment_id}></DeleteButton>
          )}
      </div>
    </div>
  );
};
