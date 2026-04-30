import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { ShortDetailResponse } from "../types/api/short.type";
import type { PostDetailResponse } from "../types/api/post.type";
import { handleGetPost } from "../api/post.api";
import { handleGetShort } from "../api/short.api";
import {
  Heart,
  MoreHorizontal,
  Bookmark,
  MessageCircle,
  Send,
  VolumeOff,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Flag,
} from "lucide-react";
import { useContentInteraction } from "../hooks/useInteraction";
import CommentComponent, {
  type CommentComponentRef,
} from "../components/CommentComponent";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { ContentType } from "../constants/contentType.enum";
import { useUser } from "../contexts/user.context";
import assets from "../assets";
import ActionBtn from "../components/ActionButton";
import type { MessageInputRef } from "../components/MessageInput";
import MessageInput from "../components/MessageInput";
import type { MentionItem } from "../types/api/mention.type";
import ReportSidebar from "../components/ReportSidebar";
import ContentMorePopUp from "../components/ContentMorePopUp";

export const isVideo = (url: string): boolean =>
  /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

const ContentPage: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<
    PostDetailResponse | ShortDetailResponse | null
  >(null);
  const [searchParams] = useSearchParams();
  const { currentUser } = useUser();

  const contentId = searchParams.get("contentId");

  const [expanded, setExpanded] = useState(false);
  const [expandedReport, setExpandedReport] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [isOpenMore, setIsOpenMore] = useState(false);

  const messageInputRef = useRef<MessageInputRef>(null);

  const type = searchParams.get("type") as ContentType;

  const [isOpenComment, setIsOpenComment] = useState(false);

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [muted, setMuted] = useState(true);

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
  } = useContentInteraction(currentContent, type as "POST" | "SHORT");
  const commentRef = useRef<CommentComponentRef>(null);
  const navigate = useNavigate();
  const isClient = currentUser?.role?.includes("CLIENT");

  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId || !type) {
        navigate("/unauthorized");
        return;
      }
      let res: PostDetailResponse | ShortDetailResponse | null = null;

      if (type === "POST") {
        res = await handleGetPost(Number(contentId));
      } else if (type === "SHORT") {
        res = await handleGetShort(Number(contentId));
      }
      setCurrentContent(res);
    };

    fetchContent();
  }, [Number(contentId), type]);

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

  const caption = currentContent?.caption || "";
  const isLong = caption.length > 80;
  const displayCaption =
    isLong && !expanded ? caption.slice(0, 80) + "…" : caption;

  if (!currentContent) return null;

  return (
    <div
      className="relative flex items-center justify-center bg-transparent"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="hidden md:flex items-center justify-center gap-6 w-full h-full -pb-2">
        <div className="flex flex-col justify-end pb-10 w-56 shrink-0 self-end">
          <div
            className="flex items-center gap-2 mb-3 cursor-pointer w-fit"
            onClick={() => navigate(`/${currentContent.username}`)}
          >
            <img
              src={currentContent.avatarUrl || assets.profile}
              alt={currentContent.username}
              className="w-9 h-9 rounded-full object-contain ring-2 ring-white/30"
            />
            <div>
              <span className="text-white font-bold text-sm block">
                {currentContent.username}
              </span>
            </div>
          </div>

          {(currentContent.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {currentContent.tags.map((t) => (
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
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)",
              zIndex: 10,
            }}
          />

          {"medias" in currentContent ? (
            <>
              <img
                src={currentContent.medias[currentMediaIndex]?.url}
                alt={`Media ${currentMediaIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {currentContent.medias.length > 1 && (
                <>
                  {currentMediaIndex > 0 && (
                    <button
                      onClick={() => setCurrentMediaIndex((p) => p - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-black/50 rounded-full"
                    >
                      <ChevronLeft size={20} className="text-white" />
                    </button>
                  )}
                  {currentMediaIndex < currentContent.medias.length - 1 && (
                    <button
                      onClick={() => setCurrentMediaIndex((p) => p + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-black/50 rounded-full"
                    >
                      <ChevronRight size={20} className="text-white" />
                    </button>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1">
                    {currentContent.medias.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentMediaIndex
                            ? "bg-white scale-125"
                            : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : // SHORT
          isVideo(currentContent.mediaUrl) ? (
            <>
              <video
                src={currentContent.mediaUrl}
                className="w-full h-full object-contain"
                poster={currentContent.thumbnailUrl}
                autoPlay
                loop
                playsInline
                muted={muted}
                onClick={(e) => {
                  const v = e.currentTarget;
                  v.paused ? v.play() : v.pause();
                }}
              />
              <button
                onClick={() => setMuted(!muted)}
                className="absolute bottom-4 right-3 z-20 p-2 bg-black/60 rounded-full border border-white/10"
              >
                {muted ? (
                  <VolumeOff size={16} className="text-white" />
                ) : (
                  <Volume2 size={16} className="text-white" />
                )}
              </button>
            </>
          ) : (
            <img
              src={currentContent.mediaUrl}
              alt="Short"
              className="w-full h-full object-contain"
            />
          )}
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
              onClick={isClient ? toggleLike : undefined}
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
              onClick={isClient ? toggleSave : undefined}
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
              onClick={isClient ? toggleRepost : undefined}
              active={isReposted}
              activeColor="#3b82f6"
            />
            {!isClient && (
              <ActionBtn
                icon={<Flag size={24} strokeWidth={2} />}
                onClick={() => setExpandedReport((prev) => !prev)}
              />
            )}
            <ActionBtn
              icon={<MoreHorizontal size={26} color="white" />}
              onClick={() => setIsOpenMore(true)}
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
                    targetId={currentContent.id}
                    targetType={type}
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
        {"medias" in currentContent ? (
          <img
            src={currentContent.medias[currentMediaIndex]?.url}
            alt="media"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : isVideo(currentContent.mediaUrl) ? (
          <video
            src={currentContent.mediaUrl}
            className="absolute inset-0 w-full h-full object-contain"
            poster={currentContent.thumbnailUrl}
            autoPlay
            loop
            playsInline
            muted={muted}
            onClick={(e) => {
              const v = e.currentTarget;
              v.paused ? v.play() : v.pause();
            }}
          />
        ) : (
          <img
            src={currentContent.mediaUrl}
            alt="Short"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {"mediaUrl" in currentContent && isVideo(currentContent.mediaUrl) && (
          <button
            onClick={() => setMuted(!muted)}
            className="absolute bottom-2 right-3 z-20 p-2 bg-black/60 rounded-full border border-white/10"
          >
            {muted ? (
              <VolumeOff size={16} className="text-white" />
            ) : (
              <Volume2 size={16} className="text-white" />
            )}
          </button>
        )}

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

          {!isClient && (
            <ActionBtn
              icon={<Flag size={24} strokeWidth={2} />}
              onClick={() => setExpandedReport((prev) => !prev)}
            />
          )}

          <ActionBtn
            icon={<MoreHorizontal size={26} color="white" />}
            onClick={() => setIsOpenMore(true)}
          />
        </div>

        <div
          className="absolute bottom-6 left-4 right-16 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center gap-2 mb-2 cursor-pointer w-fit"
            onClick={() => navigate(`/${currentContent.username}`)}
          >
            <img
              src={currentContent.avatarUrl || assets.profile}
              alt={currentContent.username}
              className="w-8 h-8 rounded-full object-contain"
            />
            <span
              className="text-white font-bold text-sm"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              {currentContent.username}
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
          {(currentContent.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {currentContent.tags.map((t) => (
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
                    targetId={currentContent.id}
                    targetType={type}
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
      {expandedReport && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setExpandedReport(false)}
          />
          <div
            className="fixed top-0 right-0 h-screen w-80 xl:w-96 z-50 shadow-2xl
        animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ReportSidebar
              contentId={Number(contentId)}
              type={type}
              status={currentContent.status}
            />
          </div>
        </>
      )}
      {contentId && type && (
        <ContentMorePopUp
          onClose={() => setIsOpenMore(false)}
          open={isOpenMore}
          targetId={Number(contentId)}
          targetType={type}
        />
      )}
    </div>
  );
};

export default ContentPage;
