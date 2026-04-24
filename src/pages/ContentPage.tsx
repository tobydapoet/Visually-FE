import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { ShortDetailResponse } from "../types/api/short.type";
import type { PostDetailResponse } from "../types/api/post.type";
import { handleGetPost } from "../api/post.api";
import { handleGetShort } from "../api/short.api";
import {
  User,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { useContentInteraction } from "../hooks/useInteraction";
import CommentComponent, {
  type CommentComponentRef,
} from "../components/CommentComponent";
import { formatCount } from "../utils/formatCount";
import { formatDateFull } from "../utils/formatDate";
import { ParsedContent } from "../components/ParseContent";
import LikeListPopUp from "../components/LikeListPopUp";
import { useNavigate, useSearchParams } from "react-router-dom";
import type {
  CommentTargetType,
  ReportTargetType,
} from "../constants/interaction.enum";
import type { ContentType } from "../constants/contentType.enum";
import type { ReportSidebarRef } from "../components/ReportSidebar";
import ReportSidebar from "../components/ReportSidebar";

const ContentPage: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<
    PostDetailResponse | ShortDetailResponse | null
  >(null);
  const [searchParams] = useSearchParams();

  const contentId = searchParams.get("contentId");
  const type = searchParams.get("type") as ContentType;

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isOpenLikeList, setIsOpenLikeList] = useState(false);
  const [muted, setMuted] = useState(true);

  const reportRef = useRef<ReportSidebarRef>(null);

  const { likeCount, commentCount } = useContentInteraction(
    currentContent,
    type as "POST" | "SHORT",
  );
  const commentRef = useRef<CommentComponentRef>(null);
  const navigate = useNavigate();

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

  if (!currentContent) return null;

  const isPost = type === "POST";
  const mediaItems =
    isPost && "medias" in currentContent ? currentContent.medias : [];
  const isVideo = !isPost && "mediaUrl" in currentContent;
  const mediaUrl =
    !isPost && "mediaUrl" in currentContent ? currentContent.mediaUrl : "";

  return (
    <div className="w-[calc(100vw-10rem)] h-screen inset-0 flex items-center justify-center">
      <div className="relative bg-zinc-900 overflow-hidden h-screen w-full transform transition-all">
        <div className="flex h-full flex-col lg:flex-row">
          <div className="flex-1 bg-black min-h-[50vh] lg:min-h-full">
            <div className="relative h-full flex items-center justify-center">
              {isPost ? (
                <>
                  <img
                    src={mediaItems[currentMediaIndex]?.url}
                    alt={`Media ${currentMediaIndex + 1}`}
                    className="max-w-full max-h-[50vh] lg:max-h-screen object-contain"
                  />
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
              ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <video
                        src={mediaUrl}
                        className="max-w-full max-h-[50vh] lg:max-h-screen object-contain"
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
                      className="max-w-full max-h-[50vh] lg:max-h-[90vh] object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col bg-zinc-900 max-h-[50vh] lg:max-h-full overflow-y-auto lg:overflow-y-visible">
            <div className="px-4">
              <div className="flex items-center gap-3 mt-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  {currentContent.avatarUrl ? (
                    <img
                      src={currentContent.avatarUrl}
                      alt={currentContent.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {currentContent.username}
                  </p>
                </div>
              </div>
            </div>

            {currentContent.caption && (
              <div className="px-4 py-2">
                <ParsedContent
                  caption={currentContent.caption}
                  mentions={currentContent.mentions || []}
                  classname="text-blue-400 hover:text-blue-300 cursor-pointer font-medium wrap-break-word"
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

            <div className="flex-1 overflow-y-auto p-4 border-zinc-800 min-h-50">
              <CommentComponent
                ref={commentRef}
                targetId={Number(contentId)}
                targetType={type as CommentTargetType}
                commentCount={commentCount}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500 border-t border-zinc-800">
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
            </div>
          </div>

          <ReportSidebar
            ref={reportRef}
            contentId={Number(contentId)}
            type={type}
            status={currentContent.status}
          />
        </div>
      </div>

      <LikeListPopUp
        onClose={() => setIsOpenLikeList(false)}
        open={isOpenLikeList}
        targetId={Number(contentId)}
        targetType={type as ReportTargetType}
      />
    </div>
  );
};

export default ContentPage;
