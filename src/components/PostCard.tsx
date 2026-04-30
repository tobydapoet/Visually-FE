import { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  VolumeOff,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { FeedContentResponse } from "../types/api/feed.type";
import { ParsedContent } from "./ParseContent";
import ContentPopUp from "./ContentPopUp";
import { useContentInteraction } from "../hooks/useInteraction";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ReportPopUp from "./ReportPopUp";
import assets from "../assets";
import { handleView } from "../api/interaction.api";
import { timeAgo } from "../utils/timeAgot";
import { toast } from "sonner";
import type { ContentType } from "../constants/contentType.enum";

const isVideo = (url?: string) =>
  url?.includes(".mp4") || url?.includes("/video/");

export const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const MediaSlider = ({
  medias,
  muted,
  onMuteToggle,
}: {
  medias: string[];
  muted: boolean;
  onMuteToggle: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
  };

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: "none" }}
      >
        {medias.map((url, i) => (
          <div key={i} className="shrink-0 w-full snap-start relative">
            {isVideo(url) ? (
              <video
                src={url}
                autoPlay
                loop
                muted={muted}
                playsInline
                className="w-full object-cover"
              />
            ) : (
              <img
                src={url}
                alt=""
                loading="lazy"
                className="w-full object-cover"
              />
            )}
            {isVideo(url) && (
              <button
                onClick={onMuteToggle}
                className="absolute bottom-2 cursor-pointer right-2 bg-black/50 rounded-full p-1"
              >
                {muted ? (
                  <VolumeOff size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {medias.length > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {medias.map((_, i) => (
              <div
                key={i}
                onClick={() => scrollTo(i)}
                className={`rounded-full cursor-pointer transition-all ${
                  i === currentIndex
                    ? "w-1.5 h-1.5 bg-blue-400"
                    : "w-1.5 h-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/50 text-white/80 text-xs px-2 py-0.5 rounded-full">
            {currentIndex + 1}/{medias.length}
          </div>
        </>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: FeedContentResponse }) => {
  const navigate = useNavigate();
  const [isShowContent, setIsShowContent] = useState(false);
  const [isShowReport, setIsShowReport] = useState(false);

  const {
    isLiked,
    isSaved,
    isReposted,
    likeCount,
    commentCount,
    repostCount,
    toggleLike,
    toggleSave,
    toggleRepost,
  } = useContentInteraction(post, post.contentType as "POST" | "SHORT");

  const handleCopyLink = (contentId: number, type: ContentType) => {
    const url = `${window.location.origin}/content?contentId=${contentId}&type=${type}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const hasSeen = useRef(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasSeen.current) {
          startTimeRef.current = Date.now();
        } else {
          if (startTimeRef.current) {
            accumulatedTimeRef.current += Date.now() - startTimeRef.current;
            startTimeRef.current = null;

            hasSeen.current = true;
            if (Math.floor(accumulatedTimeRef.current / 1000) !== 0) {
              handleView(
                post.id,
                post.contentType,
                Math.floor(accumulatedTimeRef.current / 1000),
              );
            }

            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (startTimeRef.current && !hasSeen.current) {
        accumulatedTimeRef.current += Date.now() - startTimeRef.current;
        handleView(
          post.id,
          post.contentType,
          Math.floor(accumulatedTimeRef.current / 1000),
        );
      }
    };
  }, [post.id]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const videos = el.querySelectorAll("video");
        videos.forEach((v) => {
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
            setMuted(true);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ContentPopUp
        open={isShowContent}
        onClose={() => setIsShowContent(false)}
        contentId={post.id}
        type={post.contentType}
      />
      <ReportPopUp
        onClose={() => setIsShowReport(false)}
        open={isShowReport}
        targetId={post.id}
        targetType={post.contentType}
      />
      <article ref={cardRef} className="rounded-xl mb-3 overflow-hidden">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="w-9 h-9 rounded-full cursor-pointer overflow-hidden border border-neutral-700 shrink-0 bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400"
            onClick={() => navigate(`/${post.username}`)}
          >
            <img
              src={post.avatarUrl || assets.profile}
              alt={post.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              onClick={() => navigate(`/${post.username}`)}
              className="text-sm cursor-pointer hover:underline w-fit font-semibold text-white truncate"
            >
              {post.username}
              <span className="text-xs text-neutral-500">
                <span className="ml-1.5 mr-1">•</span> {timeAgo(post.createdAt)}
              </span>
            </p>
            {post.isAd && <span className="text-xs">Ad</span>}
          </div>

          <Menu>
            <MenuButton className="p-1 text-neutral-500 cursor-pointer hover:text-neutral-300 transition-colors">
              <MoreHorizontal size={18} />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="w-52 origin-top-right rounded-xl border border-white/5 bg-neutral-900 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                <button
                  onClick={() => setIsShowContent(true)}
                  className="group cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                >
                  Show post
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={() => handleCopyLink(post.id, post.contentType)}
                  className="group flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                >
                  Copy link
                </button>
              </MenuItem>
              <div className="my-1 h-px bg-white/5" />
              <MenuItem>
                <button
                  onClick={() => setIsShowReport(true)}
                  className="group cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                >
                  Report
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        {post.medias && post.medias.length > 0 && (
          <MediaSlider
            medias={post.medias}
            muted={muted}
            onMuteToggle={() => setMuted((prev) => !prev)}
          />
        )}

        <div className="px-3 pt-2.5 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={toggleLike}
              className="group flex cursor-pointer gap-1 p-0.5 transition-transform active:scale-90"
            >
              <Heart
                size={22}
                className={
                  isLiked
                    ? "text-red-500 fill-red-500"
                    : "text-neutral-200 group-hover:text-red-400"
                }
              />
              <div>{formatCount(likeCount)}</div>
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => setIsShowContent(true)}
                className="cursor-pointer p-0.5 text-neutral-200 hover:text-neutral-400 transition-colors"
              >
                <MessageCircle size={22} />
              </button>
              <div>
                <div>{formatCount(commentCount)}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={toggleRepost}
                className="cursor-pointer p-0.5 text-neutral-200 hover:text-neutral-400 transition-colors"
              >
                <Send
                  size={22}
                  className={isReposted ? "text-green-400" : "text-neutral-200"}
                />
              </button>
              <div>{formatCount(repostCount)}</div>
            </div>
            <button
              onClick={toggleSave}
              className="cursor-pointer p-0.5 ml-auto text-neutral-200 hover:text-neutral-400 transition-colors"
            >
              <Bookmark
                size={22}
                className={
                  isSaved ? "text-white fill-white" : "text-neutral-200"
                }
              />
            </button>
          </div>

          {post.caption && (
            <div className="text-sm text-neutral-200 leading-snug mb-1">
              <ParsedContent
                caption={post.caption}
                mentions={post.mentions}
                classname="font-bold"
              />
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {post.tags.map((tag) => (
                <span key={tag.id} className="text-xs text-blue-400">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {post.commentCount > 0 && (
            <p
              onClick={() => setIsShowContent(true)}
              className="text-xs text-neutral-500 mb-1 cursor-pointer hover:text-neutral-300 transition-colors"
            >
              View all {post.commentCount} comments
            </p>
          )}
        </div>
      </article>
    </>
  );
};

export default PostCard;
