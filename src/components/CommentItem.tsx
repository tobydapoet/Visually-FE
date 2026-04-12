import { useState } from "react";
import {
  handleDeleteComment,
  handleGetRepliesComment,
} from "../api/interaction.api";
import assets from "../assets";
import { useUser } from "../contexts/user.context";
import type { CommentResponse } from "../types/api/interaction.type";
import { ParsedContent } from "./ParseContent";
import { Heart } from "lucide-react";
import LikeListPopUp from "./LikeListPopUp";
import ConfirmDialog from "./ConfirmDialog";

const CommentItem: React.FC<{
  comment: CommentResponse;
  onEdit?: (comment: CommentResponse) => void;
  onReply?: (comment: CommentResponse) => void;
  onDelete?: (commentId: number) => void;
  isReply?: boolean;
  toggleCommentLike?: (commentId: number, isLiked: boolean) => Promise<boolean>; // ✅
}> = ({
  comment,
  onEdit,
  onReply,
  onDelete,
  isReply = false,
  toggleCommentLike,
}) => {
  const { currentUser } = useUser();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentResponse[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showLikeList, setShowLikeList] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);

  const handleLike = async () => {
    if (!toggleCommentLike) return;
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    const result = await toggleCommentLike(comment.id, prevLiked);
    if (result === prevLiked) {
      setIsLiked(prevLiked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
    }
  };

  const canEdit = (createdAt: Date) => {
    const diffMinutes =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
    return diffMinutes <= 15;
  };

  const handleDelete = async () => {
    await handleDeleteComment(comment.id);
    onDelete?.(comment.id);
  };

  const handleToggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    try {
      const res = await handleGetRepliesComment(comment.id, 1, 10);
      setReplies(res.content);
      setCurrentPage(1);
      setHasMore(res.page < res.totalPages);
      setShowReplies(true);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await handleGetRepliesComment(comment.id, nextPage, 10);
      setReplies((prev) => [...prev, ...res.content]);
      setCurrentPage(nextPage);
      setHasMore(res.page < res.totalPages);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 p-3 rounded-lg -mb-2 items-center">
        <div className="shrink-0">
          <img
            src={comment.avatarUrl || assets.profile}
            alt={comment.username}
            className="w-10 h-10 mb-2 rounded-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs">
                  {comment.username}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sx mt-1">
                <ParsedContent
                  mentions={comment.mentions}
                  caption={comment.content}
                  classname="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setShowLikeList((prev) => !prev)}
                  className={`text-xs transition-colors cursor-pointer text-gray-500`}
                >
                  Like ({likeCount})
                </button>

                <LikeListPopUp
                  open={showLikeList}
                  onClose={() => setShowLikeList(false)}
                  targetId={comment.id}
                  targetType={"COMMENT"}
                />

                <button
                  onClick={() => onReply?.(comment)}
                  className="text-xs text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  Reply
                </button>
                {currentUser &&
                  currentUser.id === comment.userId &&
                  onEdit &&
                  canEdit(comment.createdAt) && (
                    <button
                      onClick={() => onEdit(comment)}
                      className="text-xs text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  )}

                {currentUser &&
                  currentUser.id === comment.userId &&
                  onDelete && (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}

                <ConfirmDialog
                  open={showConfirm}
                  onClose={() => setShowConfirm(false)}
                  onConfirm={handleDelete}
                  title="Delete Comment"
                  message="Are you sure you want to delete this comment?"
                  confirmText="Delete"
                  cancelText="Cancel"
                />
              </div>
            </div>

            <button onClick={handleLike} className="cursor-pointer">
              <Heart
                size={15}
                className={`transition-colors ${
                  isLiked
                    ? "text-red-500 fill-red-500"
                    : "text-gray-500 hover:text-red-500"
                }`}
              />
            </button>
          </div>

          {!isReply && comment.replyCount > 0 && (
            <div className="relative flex items-center gap-2 mt-2">
              <div className="flex-1 h-px bg-gray-500" />
              <button
                onClick={handleToggleReplies}
                className="cursor-pointer text-xs text-gray-500 hover:text-blue-500 transition-colors px-2"
              >
                {loadingReplies
                  ? "Loading..."
                  : showReplies
                    ? "Hide replies"
                    : `View replies (${comment.replyCount})`}
              </button>
              <div className="flex-1 h-px bg-gray-500" />
            </div>
          )}
        </div>
      </div>
      {!isReply && showReplies && (
        <div className="mt-2 ml-4 space-y-2 pl-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onEdit={onEdit}
              onReply={onReply}
              isReply={true}
              toggleCommentLike={toggleCommentLike}
              onDelete={(commentId) => {
                setReplies((prev) => prev.filter((r) => r.id !== commentId));
              }}
            />
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-xs text-gray-500 hover:text-blue-500 transition-colors cursor-pointer mt-1"
            >
              {loadingMore ? "Loading..." : "Load more replies"}
            </button>
          )}
        </div>
      )}
    </>
  );
};
export default CommentItem;
