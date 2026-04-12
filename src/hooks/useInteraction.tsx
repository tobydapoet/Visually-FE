import { useState, useEffect } from "react";
import {
  handleLike,
  handleComment,
  handleShare,
  handleDislike,
  handleUnshare,
  handleUpdateComment,
} from "../api/interaction.api";
import type { PostDetailResponse } from "../types/api/post.type";
import type { ShortDetailResponse } from "../types/api/short.type";
import type {
  CommentTargetType,
  LikeTargetType,
  ShareTargetType,
} from "../constants/interaction.enum";
import type { CommentResponse } from "../types/api/interaction.type";
import type { MentionItem } from "../types/api/mention.type";

export const useContentInteraction = (
  content: PostDetailResponse | ShortDetailResponse | null,
  type: "POST" | "SHORT",
) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    if (!content) return;
    setIsLiked(content.isLiked ?? false);
    setIsCommented(content.isCommented ?? false);
    setIsShared(content.isShared ?? false);
    setIsSaved(content.isSaved ?? false);
    setLikeCount(content.likeCount ?? 0);
    setCommentCount(content.commentCount ?? 0);
    setShareCount(content.shareCount ?? content.shareCount ?? 0);
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
    const newComment = await handleComment({
      targetId: content.id,
      targetType: type as CommentTargetType,
      content: message,
      mentions,
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

  const toggleShare = async () => {
    if (!content) return;
    const prevShare = isShared;
    setIsShared(!prevShare);
    setShareCount((prev) => (prevShare ? prev - 1 : prev + 1));
    try {
      if (prevShare) {
        await handleUnshare(content.id, type as ShareTargetType);
      } else {
        await handleShare({
          targetId: content.id,
          targetType: type as ShareTargetType,
          isPublic: true,
        });
      }
    } catch (err) {
      setIsShared(prevShare);
      setShareCount((prev) => (prevShare ? prev + 1 : prev - 1));
    }
  };

  const toggleSave = async () => {
    if (!content) return;
    const prevSave = isSaved;
    setIsSaved(!prevSave);
    setShareCount((prev) => (prevSave ? prev - 1 : prev + 1));
    try {
      if (prevSave) {
        await handleUnshare(content.id, type as ShareTargetType);
      } else {
        await handleShare({
          targetId: content.id,
          targetType: type as ShareTargetType,
          isPublic: false,
        });
      }
    } catch (err) {
      setIsSaved(prevSave);
      setShareCount((prev) => (prevSave ? prev + 1 : prev - 1));
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
    isShared,
    isSaved,
    likeCount,
    commentCount,
    shareCount,
    toggleLike,
    onUpdateComment,
    onComment,
    toggleShare,
    toggleSave,
    toggleCommentLike,
  };
};
