import type { Comment } from "../../types/Comment";
import { createComment } from "../../services/comment/CommentService";
import { SubmitButton } from "../button/submit/SubmitButton";

type AddCommentFormProps = {
  documentId?: number;
};

export const AddCommentForm = ({ documentId }: AddCommentFormProps) => {
  return (
    <form
      id="commentForm"
      className="flex flex-1 self-center items-center m-auto"
      onSubmit={(e) => {
        e.preventDefault();

        const data = new FormData(e.target);

        const comment: Comment = {
          comment_id: 0,
          text: (data.get("text") as string) || "",
          author: (data.get("author") as string) || "",
          image: (data.get("image") as string) || "",
          likes: parseInt(data.get("likes") as string) || 1,
          created_at: new Date().toISOString(),
        };

        createComment(comment, documentId);
        e.target.reset();
      }}
    >
      <div className="grid gap-y-4 p-4 w-full lg:w-[700px]">
        <div>
          <input type="hidden" name="comment_id" readOnly></input>
        </div>
        <div>
          <input
            type="hidden"
            name="document_id"
            readOnly
            value={documentId}
          ></input>
        </div>
        <div className="flex flex-1 justify-between">
          <label
            className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
            htmlFor="text"
          >
            Text
          </label>
          <textarea
            className="w-64 p-2 lg:w-[600px] resize-none shadow-sm"
            id="commentFormTextInput"
            name="text"
            required
          ></textarea>
        </div>
        <div className="flex flex-1 justify-between">
          <label
            className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
            htmlFor="author"
          >
            Author
          </label>
          <input
            className="w-64 p-2 lg:w-[600px]"
            id="commentFormAuthorInput"
            type="text"
            name="author"
            defaultValue="test.user@example.com"
          ></input>
        </div>
        <div className="flex flex-1 justify-between">
          <label
            className="block text-sm font-semibold text-gray-700 mb-2 font-serif"
            htmlFor="image"
          >
            Image
          </label>
          <input
            className="w-64 p-2 lg:w-[600px]"
            id="commentFormImageInput"
            type="text"
            name="image"
          ></input>
        </div>
        <div className="flex flex-1 place-self-end">
          <SubmitButton></SubmitButton>
        </div>
      </div>
    </form>
  );
};
