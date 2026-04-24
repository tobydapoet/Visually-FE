import { Dialog, DialogPanel } from "@headlessui/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { ShortDetailResponse } from "../types/api/short.type";
import type { PostDetailResponse } from "../types/api/post.type";
import { handleGetPost } from "../api/post.api";
import { handleGetShort } from "../api/short.api";
import {
  X,
  Heart,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeOff,
  Flag,
  Repeat2,
} from "lucide-react";
import MessageInput, { type MessageInputRef } from "./MessageInput";
import { useContentInteraction } from "../hooks/useInteraction";
import ReportPopUp from "./ReportPopUp";
import CommentComponent, { type CommentComponentRef } from "./CommentComponent";
import { formatCount } from "../utils/formatCount";
import { formatDateFull } from "../utils/formatDate";
import { ParsedContent } from "./ParseContent";
import type { MentionItem } from "../types/api/mention.type";
import { useUser } from "../contexts/user.context";
import LikeListPopUp from "./LikeListPopUp";
import CreateAdPopUp from "./CreateAdPopUp";
import assets from "../assets";

type Props = {
  open: boolean;
  onClose: () => void;
  contentId: number;
  type: "POST" | "SHORT";
};

const ContentPopUp: React.FC<Props> = ({ open, onClose, contentId, type }) => {
  const [currentContent, setCurrentContent] = useState<
    PostDetailResponse | ShortDetailResponse | null
  >(null);
  const [isOpenAd, setIsOpenAd] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isOpenReport, setIsOpenReport] = useState(false);
  const [isOpenLikeList, setIsOpenLikeList] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const {
    isLiked,
    isSaved,
    isReposted,
    likeCount,
    commentCount,
    toggleLike,
    onComment,
    toggleSave,
    toggleRepost,
    onUpdateComment,
    toggleCommentLike,
  } = useContentInteraction(currentContent, type);
  const commentRef = useRef<CommentComponentRef>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const { currentUser } = useUser();

  const handleOnclose = () => {
    onClose();
    setCurrentMediaIndex(0);
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!open) {
        setCurrentContent(null);
        return;
      }
      let res: PostDetailResponse | ShortDetailResponse | null = null;

      if (type === "POST") {
        res = await handleGetPost(contentId);
      } else if (type === "SHORT") {
        res = await handleGetShort(contentId);
      }
      setCurrentContent(res);
    };

    fetchContent();
  }, [open, contentId, type]);

  const nextMedia = () => {
    if (type === "POST" && currentContent && "medias" in currentContent) {
      setCurrentMediaIndex((prev) =>
        prev + 1 < currentContent.medias.length ? prev + 1 : prev,
      );
    }
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

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

  if (!currentContent) return null;

  const isPost = type === "POST";
  const mediaItems =
    isPost && "medias" in currentContent ? currentContent.medias : [];
  const isShort = !isPost && "mediaUrl" in currentContent;
  const mediaUrl =
    !isPost && "mediaUrl" in currentContent ? currentContent.mediaUrl : "";
  const isVideo = (url: string) =>
    url.endsWith(".mp4") || url.includes("/video/");
  const currentMedia = mediaItems[currentMediaIndex];
  return (
    <>
      <Dialog open={open} onClose={handleOnclose} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl transform transition-all">
            <button
              onClick={handleOnclose}
              className="absolute cursor-pointer top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh]">
              <div className="relative flex-1 bg-black md:min-w-100">
                {isPost ? (
                  <div className="relative h-full flex items-center justify-center">
                    {mediaItems.length > 0 && (
                      <>
                        {isVideo(currentMedia.url) ? (
                          <div>
                            <video
                              src={currentMedia.url}
                              className="max-w-full max-h-[90vh]"
                              autoPlay
                              loop
                              playsInline
                              muted={muted}
                              onClick={(e) => {
                                const video = e.currentTarget;
                                video.paused ? video.play() : video.pause();
                              }}
                            />
                            <button
                              onClick={() => setMuted(!muted)}
                              className="absolute bottom-2 cursor-pointer right-2 z-10 p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 border border-white/10 shadow-lg"
                            >
                              {muted ? (
                                <VolumeOff size={18} className="text-white" />
                              ) : (
                                <Volume2 size={18} className="text-white" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <img
                            src={currentMedia.url}
                            alt={`Media ${currentMediaIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                          />
                        )}

                        {mediaItems.length > 1 && (
                          <>
                            {currentMediaIndex > 0 && (
                              <button
                                onClick={prevMedia}
                                className="absolute cursor-pointer left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                              >
                                <ChevronLeft className="w-6 h-6 text-white" />
                              </button>
                            )}
                            {currentMediaIndex < mediaItems.length - 1 && (
                              <button
                                onClick={nextMedia}
                                className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                              >
                                <ChevronRight className="w-6 h-6 text-white" />
                              </button>
                            )}

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                              {currentMediaIndex + 1} / {mediaItems.length}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    {isShort ? (
                      <div>
                        <video
                          src={mediaUrl}
                          className="max-w-full max-h-[90vh]"
                          poster={currentContent.thumbnailUrl}
                          autoPlay
                          loop
                          playsInline
                          muted={muted}
                          onClick={(e) => {
                            const video = e.currentTarget;
                            video.paused ? video.play() : video.pause();
                          }}
                        />
                        <button
                          onClick={() => setMuted(!muted)}
                          className="absolute bottom-2 cursor-pointer right-2 z-10 p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 border border-white/10 shadow-lg"
                        >
                          {muted ? (
                            <VolumeOff size={18} className="text-white" />
                          ) : (
                            <Volume2 size={18} className="text-white" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Short content"
                        className="max-w-full max-h-[90vh] object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-100 flex flex-col bg-zinc-900">
                <div className="px-4">
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <img
                        src={currentContent.avatarUrl || assets.profile}
                        alt={currentContent.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {currentContent.username}
                      </p>
                    </div>
                    <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                      <MoreHorizontal className="w-6 h-6 text-zinc-400" />
                    </button>
                  </div>
                </div>

                {currentContent.caption && (
                  <div className="px-4 py-2">
                    <ParsedContent
                      caption={currentContent.caption}
                      mentions={currentContent.mentions || []}
                      classname="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                    />
                    {currentContent.tags && currentContent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentContent.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 border-zinc-800">
                  <CommentComponent
                    ref={commentRef}
                    targetId={contentId}
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

                {currentUser && currentUser.role.includes("CLIENT") && (
                  <div className="px-2 pt-1 border-zinc-800">
                    <div className="flex justify-between">
                      <div className="flex gap-3">
                        <button
                          onClick={toggleLike}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <div
                            className={`p-2 rounded-full transition-colors cursor-pointer ${
                              isLiked
                                ? "text-red-500"
                                : "text-white hover:text-red-500"
                            }`}
                          >
                            <Heart
                              className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                            />
                          </div>
                        </button>

                        <button
                          onClick={toggleSave}
                          className="flex flex-col items-center gap-1 group cursor-pointer disabled:opacity-40 disabled:cursor-default"
                        >
                          <div
                            className={`py-2 px-1 rounded-full transition-colors ${
                              isSaved
                                ? "text-yellow-500"
                                : isSaved
                                  ? "text-zinc-600"
                                  : "text-white hover:text-yellow-500"
                            }`}
                          >
                            <Bookmark
                              className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
                            />
                          </div>
                        </button>
                        {currentUser &&
                          currentUser.id !== currentContent.userId && (
                            <button
                              onClick={toggleRepost}
                              className="flex flex-col items-center gap-1 group cursor-pointer"
                            >
                              <div
                                className={`py-2 px-1 rounded-full transition-colors ${
                                  isReposted
                                    ? "text-green-500"
                                    : "text-white hover:text-green-500"
                                }`}
                              >
                                <Repeat2
                                  className={`w-6 h-6 ${isReposted ? "fill-current" : ""}`}
                                />
                              </div>
                            </button>
                          )}
                      </div>

                      <button
                        className="flex flex-col items-center gap-1 group"
                        onClick={() => setIsOpenReport(true)}
                      >
                        <div
                          className={`p-2 rounded-full cursor-pointer transition-colors text-white hover:text-red-500`}
                        >
                          <Flag className={`w-6 h-6`} />
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
                  <div>
                    <div
                      className="text-lg text-white font-bold hover:underline cursor-pointer"
                      onClick={() => setIsOpenLikeList(true)}
                    >
                      {formatCount(likeCount)} likes
                    </div>
                    <div className="text-gray-400 text-xs">
                      {formatDateFull(currentContent.createdAt)}
                    </div>
                  </div>
                  {currentUser && currentUser.id === currentContent.userId && (
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors bg-blue-600 text-white hover:bg-blue-700`}
                      onClick={() => setIsOpenAd(true)}
                    >
                      Boots post
                    </button>
                  )}
                </div>
                {currentUser && currentUser.role.includes("CLIENT") && (
                  <div>
                    <MessageInput
                      ref={messageInputRef}
                      mode="COMMENT"
                      onSend={async (message, mentions) => {
                        handleSend(message, mentions);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <ReportPopUp
        onClose={() => setIsOpenReport(false)}
        open={isOpenReport}
        targetId={contentId}
        targetType={type}
      />

      <LikeListPopUp
        onClose={() => setIsOpenLikeList(false)}
        open={isOpenLikeList}
        targetId={contentId}
        targetType={type}
      />

      <CreateAdPopUp
        open={isOpenAd}
        onClose={() => setIsOpenAd(false)}
        contentId={contentId}
        type={type}
      />
    </>
  );
};

export default ContentPopUp;
