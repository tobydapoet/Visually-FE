import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CommentTargetType } from "../constants/interaction.enum";
import { handleGetCommentByTarget } from "../api/interaction.api";
import type { CommentResponse } from "../types/api/interaction.type";
import type { MentionItem } from "../types/api/mention.type";
import CommentItem from "./CommentItem";

type Props = {
  targetId: number;
  targetType: CommentTargetType;
  commentCount: number;
  onEditComment?: (comment: CommentResponse) => void;
  onReplyComment?: (comment: CommentResponse) => void;
  toggleCommentLike?: (commentId: number, isLiked: boolean) => Promise<boolean>;
  onDeleteComment?: (commentId: number) => void;
};

export type CommentComponentRef = {
  addComment: (comment: CommentResponse) => void;
  updateComment: (
    commentId: number,
    content: string,
    mentions?: MentionItem[],
  ) => void;
  addReply: (parentId: number, reply: CommentResponse) => void;
  deleteComment: (commentId: number) => void;
};

const CommentComponent = forwardRef<CommentComponentRef, Props>(
  (
    {
      targetId,
      targetType,
      commentCount,
      onEditComment,
      onReplyComment,
      toggleCommentLike,
      onDeleteComment,
    },
    ref,
  ) => {
    const queryClient = useQueryClient();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      addComment: (newComment: CommentResponse) => {
        queryClient.setQueryData(
          ["comments", targetId, targetType],
          (oldData: any) => {
            if (!oldData) return oldData;

            const safeComment: CommentResponse = {
              ...newComment,
              mentions: newComment.mentions ?? [],
            };

            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) =>
                index === 0
                  ? { ...page, content: [safeComment, ...page.content] }
                  : page,
              ),
            };
          },
        );
      },

      updateComment: (commentId, content, mentions) => {
        queryClient.setQueryData(
          ["comments", targetId, targetType],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                content: page.content.map((c: CommentResponse) =>
                  c.id === commentId
                    ? { ...c, content, mentions: mentions ?? [] }
                    : c,
                ),
              })),
            };
          },
        );
      },
      addReply: (parentId: number) => {
        queryClient.setQueryData(
          ["comments", targetId, targetType],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                content: page.content.map((c: CommentResponse) =>
                  c.id === parentId
                    ? { ...c, replyCount: c.replyCount + 1 }
                    : c,
                ),
              })),
            };
          },
        );
      },

      deleteComment: (commentId: number) => {
        queryClient.setQueryData(
          ["comments", targetId, targetType],
          (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                content: page.content.filter(
                  (c: CommentResponse) => c.id !== commentId,
                ),
              })),
            };
          },
        );
      },
    }));

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isError,
      error,
    } = useInfiniteQuery({
      queryKey: ["comments", targetId, targetType],
      queryFn: ({ pageParam = 1 }) =>
        handleGetCommentByTarget(targetId, targetType, pageParam, 15),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      enabled: !!targetId && !!targetType,
    });

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );

      if (loadMoreRef.current) {
        observer.observe(loadMoreRef.current);
      }

      return () => {
        if (loadMoreRef.current) {
          observer.unobserve(loadMoreRef.current);
        }
      };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-8 text-red-500">
          Error loading comments: {error?.message}
        </div>
      );
    }

    const allComments = data?.pages.flatMap((page) => page.content) || [];

    return (
      <div>
        <div className="font-semibold text-lg p-2">
          Comments ({commentCount})
        </div>

        <div className="space-y-3">
          {allComments.map((comment: CommentResponse) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={onEditComment}
              onReply={onReplyComment}
              toggleCommentLike={toggleCommentLike}
              onDelete={onDeleteComment}
            />
          ))}
        </div>

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        )}

        {hasNextPage && <div ref={loadMoreRef} className="h-4" />}

        {allComments.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    );
  },
);

export default CommentComponent;
