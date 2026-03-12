import { useState } from "react";
import { flagComment } from "../../../services/comment-moderation/CommentModerationService";
import { Flag } from "lucide-react";

export const FlagButton = ({
  commentId,
  isFlagged,
}: {
  commentId: number;
  isFlagged: boolean;
}) => {
  const [flagged, setFlagged] = useState(isFlagged);

  const handleFlag = () => {
    const newFlaggedState = !flagged;
    console.log({ newFlaggedState });
    setFlagged(newFlaggedState);
    flagComment({ comment_id: commentId, flagged: newFlaggedState });
  };

  return (
    <button
      className={`font-serif flex items-center gap-2 ${
        flagged ? "text-red-600" : "text-gray-600"
      }`}
      onClick={handleFlag}
    >
      <Flag className={flagged ? "fill-red-600" : ""} />
      {flagged ? "Unflag" : "Flag"}
    </button>
  );
};
