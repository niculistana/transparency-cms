import { useEffect, useState } from "react";
import {
  useCommentModerationService,
  fetchAdminComments,
  type CommentModerationState,
} from "../services/comment-moderation/CommentModerationService";
import { useAuthService } from "../services/AuthService";
import { type Comment } from "../types/Comment";
import { MessageSquare, User, Calendar, Flag, Search } from "lucide-react";
import { ButtonManager, sortByDate } from "../components/util";

export function CommentModerationPage() {
  const [loading, setLoading] = useState(true);
  const [loadedComments, setLoadedComments] = useState<Comment[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>([]);
  const [unflaggedComments, setUnflaggedComments] = useState<Comment[]>([]);
  const [filteredUnflaggedComments, setFilteredUnflaggedComments] = useState<
    Comment[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const currentRole = useAuthService((state) => state.currentRole);
  const comments: Map<number, Comment> = useCommentModerationService(
    (state: CommentModerationState) => state.comments,
  );
  const error: string = useCommentModerationService(
    (state: CommentModerationState) => state.error,
  );
  const selectedComment = useCommentModerationService(
    (state: CommentModerationState) => state.selectedComment,
  );

  useEffect(() => {
    const loadComments = async () => {
      await fetchAdminComments();
      setLoading(false);
    };

    loadComments();
  }, []);

  useEffect(() => {
    if (comments.size > 0) {
      const values = Array.from(comments.values());
      const sorted = values.sort(sortByDate);
      setLoadedComments(sorted);

      // Separate flagged and unflagged comments
      const flagged = sorted.filter((c) => c.flagged);
      const unflagged = sorted.filter((c) => !c.flagged);

      setFlaggedComments(flagged);
      setUnflaggedComments(unflagged);
    } else {
      setLoadedComments([]);
      setFlaggedComments([]);
      setUnflaggedComments([]);
    }
  }, [comments]);

  useEffect(() => {
    setEditingComment(selectedComment);
  }, [selectedComment]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUnflaggedComments(unflaggedComments);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = unflaggedComments.filter((comment) => {
        const text = comment.text?.toLowerCase() || "";
        const author = comment.author?.toLowerCase() || "";
        const id = comment.comment_id?.toString() || "";

        return (
          text.includes(query) || author.includes(query) || id.includes(query)
        );
      });
      setFilteredUnflaggedComments(filtered);
    }
  }, [searchQuery, unflaggedComments]);

  const renderComment = (comment: Comment, isFlagged: boolean = false) => (
    <div
      key={comment.comment_id}
      className={`bg-white shadow border p-6 ${
        isFlagged ? "border-red-400 border-2" : "border-gray-200"
      }`}
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <p className="text-gray-900 font-serif whitespace-pre-wrap break-words">
              {comment.text}
            </p>
          </div>

          {comment.image && (
            <div className="mb-4">
              <img
                src={comment.image}
                alt="Comment attachment"
                className="max-w-xs h-auto border border-gray-200"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 font-serif mb-4">
            {comment.author && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{comment.author}</span>
              </div>
            )}
            {comment.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
            )}
            <div className="text-gray-500">ID: {comment.comment_id}</div>
          </div>

          <div className="flex justify-end">
            <ButtonManager
              comment={comment}
              editingComment={editingComment}
              user={{
                role: currentRole,
                isAuthor: false,
              }}
              context="moderate"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-serif">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 font-serif">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">
            Comment Moderation
          </h1>
          <p className="text-gray-600 font-serif">
            Manage and moderate all comments across all documents
          </p>
        </div>

        {loadedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-serif">No comments available.</p>
          </div>
        ) : (
          <>
            {/* Flagged Comments Section */}
            {flaggedComments.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6 bg-red-50 border border-red-300 p-4">
                  <Flag className="h-6 w-6 text-red-600" />
                  <h2 className="text-2xl font-bold font-serif text-red-900">
                    Flagged Comments ({flaggedComments.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {flaggedComments.map((comment) =>
                    renderComment(comment, true),
                  )}
                </div>
              </div>
            )}

            {/* All Comments Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-gray-900">
                  All Comments ({filteredUnflaggedComments.length})
                </h2>
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search comments by text, author, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-serif"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {filteredUnflaggedComments.length > 0 ? (
                  filteredUnflaggedComments.map((comment) =>
                    renderComment(comment, false),
                  )
                ) : (
                  <div className="text-center py-12 bg-gray-50">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-serif">
                      {searchQuery
                        ? "No comments match your search."
                        : "No comments available."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
