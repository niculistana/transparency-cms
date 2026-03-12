import { deleteComment } from "../../../services/AppService";
import { Trash } from "lucide-react";

export const DeleteButton = ({ commentId }: { commentId: number }) => {
  const onDelete = () => {
    console.log("On delete");
    if (confirm("Are you sure you want to delete this comment?")) {
      console.log("confirmed");
      deleteComment({ comment_id: commentId });
    }
  };
  return (
    <button className="font-serif" onClick={onDelete}>
      <span className="ml-2 float-right">
        <Trash></Trash>
      </span>
      Delete
    </button>
  );
};
