import { useState } from "react";
import { saveLikes } from "../../../services/comment-moderation/CommentModerationService";
import { ThumbsUp } from "lucide-react";

export const LikeButton = ({
  commentId,
  likeCount,
}: {
  commentId: number;
  likeCount: number;
}) => {
  const [likes, setLikes] = useState(likeCount);

  return (
    <>
      <button
        className="font-serif"
        onClick={() => {
          const newLikes = likes + 1;
          setLikes(newLikes);
          saveLikes({ comment_id: commentId, likes: newLikes });
        }}
      >
        <span>
          <ThumbsUp></ThumbsUp>
        </span>
        {likes}
      </button>
    </>
  );
};
