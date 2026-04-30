import { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
} from "lucide-react";
import type { FeedContentResponse } from "../types/api/feed.type";
import { MediaCarousel } from "./MediaCarousel";
import assets from "../assets";
import { useContentInteraction } from "../hooks/useInteraction";
import CommentComponent, { type CommentComponentRef } from "./CommentComponent";
import type { MessageInputRef } from "./MessageInput";
import { useUser } from "../contexts/user.context";
import MessageInput from "./MessageInput";
import type { MentionItem } from "../types/api/mention.type";
import ActionBtn from "./ActionButton";
import { handleView } from "../api/interaction.api";
import { useNavigate } from "react-router-dom";
import ContentMorePopUp from "./ContentMorePopUp";

interface ReelCardProps {
  reel: FeedContentResponse;
  isActive: boolean;
}

export function ReelCard({ reel, isActive }: ReelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isOpenComment, setIsOpenComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [isOpenMore, setIsOpenMore] = useState(false);
  const commentRef = useRef<CommentComponentRef>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);

  const messageInputRef = useRef<MessageInputRef>(null);
  const { currentUser } = useUser();
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
    }

    return () => {
      if (startTimeRef.current) {
        accumulatedTimeRef.current += Date.now() - startTimeRef.current;
        startTimeRef.current = null;

        handleView(
          reel.id,
          reel.contentType as "POST" | "SHORT",
          Math.floor(accumulatedTimeRef.current / 1000),
        );
      }
    };
  }, [isActive]);

  const {
    isLiked,
    isSaved,
    isReposted,
    likeCount,
    saveCount,
    repostCount,
    commentCount,
    onComment,
    toggleLike,
    toggleSave,
    onUpdateComment,
    toggleRepost,
    toggleCommentLike,
  } = useContentInteraction(reel, reel.contentType as "POST" | "SHORT");

  const caption = reel.caption ?? "";
  const isLong = caption.length > 80;
  const displayCaption =
    isLong && !expanded ? caption.slice(0, 80) + "…" : caption;

  const handleSend = async (content: string, mentions?: MentionItem[]) => {
    if (editingCommentId) {
      await onUpdateComment(editingCommentId, content, mentions);
      commentRef.current?.updateComment(editingCommentId, content, mentions);
      setEditingCommentId(null);
    } else {
      const newComment = await onComment(
        content,
        mentions,
        replyingToId ?? undefined,
      );
      if (newComment) {
        if (replyingToId) {
          commentRef.current?.addReply(replyingToId, {
            ...newComment,
            mentions: newComment.mentions ?? mentions ?? [],
          });
        } else {
          commentRef.current?.addComment({
            ...newComment,
            mentions: newComment.mentions ?? mentions ?? [],
          });
        }
      }
      setReplyingToId(null);
      messageInputRef.current?.clearText();
    }
  };

  return (
    <div
      className="relative flex items-center justify-center bg-transparent"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="hidden md:flex items-center justify-center gap-6 w-full h-full -pb-2">
        <div className="flex flex-col justify-end pb-10 w-56 shrink-0 self-end">
          <div
            className="flex items-center gap-2 mb-3 cursor-pointer w-fit"
            onClick={() => navigate(`/${reel.username}`)}
          >
            <img
              src={reel.avatarUrl || assets.profile}
              alt={reel.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
            />
            <div>
              <span className="text-white font-bold text-sm block">
                {reel.username}
              </span>
            </div>
          </div>

          {caption && (
            <p className="text-white/90 text-sm leading-snug mb-3">
              {displayCaption}
              {isLong && (
                <button
                  className="ml-1 text-white/50 font-semibold cursor-pointer"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? " less" : " more"}
                </button>
              )}
            </p>
          )}

          {(reel.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {reel.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs font-semibold text-white/60"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="relative shrink-0 rounded-2xl mt-2 overflow-hidden shadow-2xl"
          style={{
            aspectRatio: "9/16",
            height: "calc(100vh - 1rem)",
            maxHeight: "820px",
          }}
        >
          <MediaCarousel medias={reel.medias ?? []} isActive={isActive} />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)",
              zIndex: 10,
            }}
          />
        </div>

        <div
          className={`flex gap-2 self-end shrink-0 ${isOpenComment ? "w-100" : "w-56"}`}
        >
          <div
            className="flex flex-col items-center pb-10 justify-end gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionBtn
              icon={
                isLiked ? (
                  <Heart size={28} fill="#ff3b5c" color="#ff3b5c" />
                ) : (
                  <Heart size={28} fill="none" color="white" strokeWidth={2} />
                )
              }
              label={likeCount}
              onClick={toggleLike}
              active={isLiked}
              activeColor="#ff3b5c"
            />
            <ActionBtn
              icon={<MessageCircle size={28} color="white" strokeWidth={2} />}
              label={commentCount}
              onClick={() => setIsOpenComment((prev) => !prev)}
            />
            <ActionBtn
              icon={
                isSaved ? (
                  <Bookmark size={28} fill="white" color="white" />
                ) : (
                  <Bookmark
                    size={28}
                    fill="none"
                    color="white"
                    strokeWidth={2}
                  />
                )
              }
              label={saveCount}
              onClick={toggleSave}
              active={isSaved}
              activeColor="white"
            />
            <ActionBtn
              icon={
                <Send
                  size={26}
                  color={isReposted ? "#3b82f6" : "white"}
                  strokeWidth={2}
                />
              }
              label={repostCount}
              onClick={toggleRepost}
              active={isReposted}
              activeColor="#3b82f6"
            />
            <ActionBtn
              onClick={() => setIsOpenMore(true)}
              icon={<MoreHorizontal size={26} color="white" />}
            />
          </div>

          {isOpenComment && (
            <div
              className="w-88 rounded-2xl h-[calc(100vh-1rem)] flex flex-col overflow-hidden bg-[rgba(15,15,15,0.98)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="py-2 px-3">
                  <CommentComponent
                    ref={commentRef}
                    targetId={reel.id}
                    targetType={reel.contentType}
                    commentCount={commentCount}
                    toggleCommentLike={toggleCommentLike}
                    onEditComment={(comment) => {
                      setReplyingToId(null);
                      setEditingCommentId(comment.id);
                      messageInputRef.current?.setText(
                        comment.content,
                        comment.mentions,
                        true,
                      );
                    }}
                    onDeleteComment={(commentId) => {
                      commentRef.current?.deleteComment(commentId);
                    }}
                    onReplyComment={(comment) => {
                      setEditingCommentId(null);
                      setReplyingToId(comment.id);
                      if (comment.username !== currentUser?.username) {
                        messageInputRef.current?.setText(
                          `@${comment.username} `,
                          [
                            {
                              userId: comment.userId,
                              username: comment.username,
                            },
                          ],
                          false,
                        );
                        messageInputRef.current?.setReplyingTo(
                          comment.username,
                        );
                      } else {
                        messageInputRef.current?.setText("", [], false);
                        messageInputRef.current?.setReplyingTo(
                          comment.username,
                        );
                      }
                    }}
                  />
                </div>
              </div>
              {currentUser?.role.includes("CLIENT") && (
                <div className="shrink-0 border-t border-white/10">
                  <MessageInput
                    ref={messageInputRef}
                    mode="COMMENT"
                    onSend={async (message, mentions) =>
                      handleSend(message, mentions)
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden relative w-screen h-[calc(100vh-4rem)] md:w-full md:h-full">
        <MediaCarousel medias={reel.medias ?? []} isActive={isActive} />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 42%, rgba(0,0,0,0.15) 100%)",
            zIndex: 10,
          }}
        />

        <div
          className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionBtn
            icon={
              isLiked ? (
                <Heart size={26} fill="#ff3b5c" color="#ff3b5c" />
              ) : (
                <Heart size={26} fill="none" color="white" strokeWidth={2} />
              )
            }
            label={likeCount}
            onClick={toggleLike}
            active={isLiked}
            activeColor="#ff3b5c"
          />
          <ActionBtn
            icon={<MessageCircle size={26} color="white" strokeWidth={2} />}
            label={commentCount}
            onClick={() => setIsOpenComment((prev) => !prev)}
          />
          <ActionBtn
            icon={
              isSaved ? (
                <Bookmark size={26} fill="white" color="white" />
              ) : (
                <Bookmark size={26} fill="none" color="white" strokeWidth={2} />
              )
            }
            label={saveCount}
            onClick={toggleSave}
            active={isSaved}
            activeColor="white"
          />
          <ActionBtn
            icon={
              <Send
                size={24}
                color={isReposted ? "#3b82f6" : "white"}
                strokeWidth={2}
              />
            }
            label={repostCount}
            onClick={toggleRepost}
            active={isReposted}
            activeColor="#3b82f6"
          />
          <ActionBtn
            onClick={() => setIsOpenMore(true)}
            icon={<MoreHorizontal size={24} color="white" />}
          />
        </div>

        <div
          className="absolute bottom-6 left-4 right-16 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer w-fit"
            onClick={() => navigate(`/${reel.username}`)}
          >
            <img
              src={reel.avatarUrl || assets.profile}
              alt={reel.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span
              className="text-white font-bold text-sm"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              {reel.username}
            </span>
          </div>
          {caption && (
            <p
              className="text-white text-sm leading-snug mb-2"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
            >
              {displayCaption}
              {isLong && (
                <button
                  className="ml-1 text-white/60 font-semibold cursor-pointer"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? " less" : " more"}
                </button>
              )}
            </p>
          )}
          {(reel.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {reel.tags.map((t) => (
                <span
                  key={t.id}
                  className="text-xs font-semibold"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                  }}
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {isOpenComment && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsOpenComment(false)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 z-40 h-[70vh] rounded-t-2xl flex flex-col overflow-hidden bg-[rgba(15,15,15,0.98)] border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <div className="flex-1 overflow-y-auto relative">
                <div className="py-2 px-3">
                  <CommentComponent
                    ref={commentRef}
                    targetId={reel.id}
                    targetType={reel.contentType}
                    commentCount={commentCount}
                    toggleCommentLike={toggleCommentLike}
                    onEditComment={(comment) => {
                      setReplyingToId(null);
                      setEditingCommentId(comment.id);
                      messageInputRef.current?.setText(
                        comment.content,
                        comment.mentions,
                        true,
                      );
                    }}
                    onDeleteComment={(commentId) => {
                      commentRef.current?.deleteComment(commentId);
                    }}
                    onReplyComment={(comment) => {
                      setEditingCommentId(null);
                      setReplyingToId(comment.id);
                      if (comment.username !== currentUser?.username) {
                        messageInputRef.current?.setText(
                          `@${comment.username} `,
                          [
                            {
                              userId: comment.userId,
                              username: comment.username,
                            },
                          ],
                          false,
                        );
                        messageInputRef.current?.setReplyingTo(
                          comment.username,
                        );
                      } else {
                        messageInputRef.current?.setText("", [], false);
                        messageInputRef.current?.setReplyingTo(
                          comment.username,
                        );
                      }
                    }}
                  />
                </div>
                {currentUser?.role.includes("CLIENT") && (
                  <div className="absolute bottom-0 w-full">
                    <MessageInput
                      ref={messageInputRef}
                      mode="COMMENT"
                      onSend={async (message, mentions) =>
                        handleSend(message, mentions)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <ContentMorePopUp
        onClose={() => setIsOpenMore(false)}
        open={isOpenMore}
        targetId={reel.id}
        targetType={reel.contentType}
      />
    </div>
  );
}
