import { useEffect, useState } from "react";
import {
  useAppService,
  type AppState,
  fetchComments,
} from "./services/AppService";
import { useAuthService } from "./services/AuthService";
import { type Comment } from "./types/Comment";
import { LikeButton } from "./components/button";
import { ButtonManager, sortByDate } from "./components/util";
import { AddCommentForm } from "./components/form/AddCommentForm";

function App() {
  const [loaded, setLoaded] = useState(false);
  const [loadedComments, setLoadedComments] = useState<Comment[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const currentRole = useAuthService((state) => state.currentRole);

  // const snapshot: AppState = useAppService.getState();
  const comments: Map<number, Comment> = useAppService(
    (state: AppState) => state.comments,
  );

  const error: string = useAppService((state: AppState) => state.error);
  const selectedComment = useAppService(
    (state: AppState) => state.selectedComment,
  );

  useEffect(() => {
    if (!loaded) {
      const _fetchComments = async () => {
        await fetchComments();
        setLoaded(true);
      };

      _fetchComments();
    }
  }, [fetchComments, loaded]);

  useEffect(() => {
    if (comments.size > 0) {
      const values = Array.from(comments.values());
      setLoadedComments(values.sort(sortByDate));
    }
  }, [comments]);

  useEffect(() => {
    setEditingComment(selectedComment);
  }, [selectedComment]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  if (!loaded) {
    return <div>Loading comments...</div>;
  }

  if (errorMessage?.length) {
    return (
      <div>
        <div>{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full lg:w-[900px] bg-gray-300 bg-opacity-35 grid grid-cols-1 m-auto my-4">
        <h1 className="font-serif text-md lg:text-xl ml-4 lg:ml-8 mt-4">
          Add your comment
        </h1>
        <AddCommentForm />
      </div>
      <div className="w-96 lg:w-[750px] grid grid-cols-1 m-auto">
        {loaded && (
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
                              {comment.author && (
                                <span>By {comment.author} </span>
                              )}
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
                            userRole={currentRole}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ))
            ) : (
              <div>No comments.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
