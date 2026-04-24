import { useState, useEffect } from "react";
import {
  handleLike,
  handleComment,
  handleSave,
  handleDislike,
  handleUnsave,
  handleUpdateComment,
} from "../api/interaction.api";
import type { PostDetailResponse } from "../types/api/post.type";
import type { ShortDetailResponse } from "../types/api/short.type";
import type {
  CommentTargetType,
  LikeTargetType,
  RepostTargetType,
  SaveTargetType,
} from "../constants/interaction.enum";
import type { CommentResponse } from "../types/api/interaction.type";
import type { MentionItem } from "../types/api/mention.type";
import { handleDeleteRepost, handleRepost } from "../api/post.api";
import type { FeedContentResponse } from "../types/api/feed.type";

export const useContentInteraction = (
  content:
    | PostDetailResponse
    | ShortDetailResponse
    | FeedContentResponse
    | null,
  type: "POST" | "SHORT",
) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [repostCount, setRepostCount] = useState(0);

  useEffect(() => {
    if (!content) return;
    setIsLiked(content.isLiked ?? false);
    setIsCommented(content.isCommented ?? false);
    setIsSaved(content.isSaved ?? false);
    setIsReposted(content.isReposted ?? false);
    setLikeCount(content.likeCount ?? 0);
    setCommentCount(content.commentCount ?? 0);
    setRepostCount(content.repostCount ?? 0);
    setSaveCount(content.saveCount ?? 0);
  }, [content]);

  const toggleLike = async () => {
    if (!content) return;

    const prevLiked = isLiked;

    setIsLiked(!prevLiked);
    setLikeCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      if (prevLiked) {
        await handleDislike({
          targetId: content.id,
          targetType: type as LikeTargetType,
        });
      } else {
        await handleLike({
          targetId: content.id,
          targetType: type as LikeTargetType,
        });
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikeCount((prev) => (prevLiked ? prev + 1 : prev - 1));
    }
  };

  const onComment = async (
    message: string,
    mentions?: MentionItem[],
    parentId?: number,
  ): Promise<CommentResponse | null> => {
    if (!content) return null;
    console.log("metions: ", mentions);
    const newComment = await handleComment({
      targetId: content.id,
      targetType: type as CommentTargetType,
      content: message,
      mentions: mentions?.map((mention) => {
        return {
          userId: mention.userId,
          username: mention.username,
        };
      }),
      replyToId: parentId,
    });
    if (newComment) {
      setCommentCount((prev) => prev + 1);
      setIsCommented(true);
    }
    return newComment.data ?? null;
  };

  const onUpdateComment = async (
    commentId: number,
    message: string,
    mentions?: MentionItem[],
  ): Promise<void> => {
    if (!content) return;
    await handleUpdateComment(
      commentId,
      message,
      mentions?.map((mention) => ({
        userId: mention.userId,
        username: mention.username,
      })),
    );
  };

  const toggleSave = async () => {
    if (!content) return;
    const prevSave = isSaved;
    setIsSaved(!prevSave);
    setSaveCount((prev) => (prevSave ? prev - 1 : prev + 1));
    try {
      if (prevSave) {
        await handleUnsave(content.id, type as SaveTargetType);
      } else {
        await handleSave({
          targetId: content.id,
          targetType: type as SaveTargetType,
        });
      }
    } catch (err) {
      setIsSaved(prevSave);
      setSaveCount((prev) => (prevSave ? prev + 1 : prev - 1));
    }
  };

  const toggleRepost = async () => {
    if (!content) return;
    const prevReposted = isReposted;
    setIsReposted(!prevReposted);
    setRepostCount((prev) => (prevReposted ? prev - 1 : prev + 1));

    try {
      if (prevReposted) {
        await handleDeleteRepost(content.id, type as RepostTargetType);
        console.log("LOST");
      } else {
        await handleRepost(content.id, type as RepostTargetType);
        console.log("POST");
      }
    } catch {
      setIsReposted(prevReposted);
      setRepostCount((prev) => (prevReposted ? prev + 1 : prev - 1));
    }
  };

  const toggleCommentLike = async (
    commentId: number,
    isLiked: boolean,
  ): Promise<boolean> => {
    try {
      if (isLiked) {
        await handleDislike({
          targetId: commentId,
          targetType: "COMMENT" as LikeTargetType,
        });
        return false;
      } else {
        await handleLike({
          targetId: commentId,
          targetType: "COMMENT" as LikeTargetType,
        });
        return true;
      }
    } catch (err) {
      return isLiked;
    }
  };

  return {
    isLiked,
    isCommented,
    isSaved,
    isReposted,
    likeCount,
    commentCount,
    saveCount,
    repostCount,
    toggleLike,
    onUpdateComment,
    onComment,
    toggleSave,
    toggleCommentLike,
    toggleRepost,
  };
};
