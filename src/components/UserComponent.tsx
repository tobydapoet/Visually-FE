import React, { useState } from "react";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import type { PostResponse } from "../types/api/post.type";
import type { ShortResponse } from "../types/api/short.type";
import ContentPopUp from "./ContentPopUp";
import type {
  ContentDefaultResponse,
  ContentSearchResponse,
} from "../types/api/content.type";

type Props = {
  data:
    | PostResponse
    | ShortResponse
    | ContentDefaultResponse
    | ContentSearchResponse;
};

export const UserComponent: React.FC<Props> = ({ data }) => {
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);

  const isShort = (
    data:
      | PostResponse
      | ShortResponse
      | ContentDefaultResponse
      | ContentSearchResponse,
  ): data is ShortResponse => {
    return "thumbnailUrl" in data;
  };

  const isVideo = (url?: string) =>
    url?.includes(".mp4") ||
    url?.includes("/video/") ||
    url?.includes(".webm") ||
    url?.includes(".mov");

  const mediaUrl =
    "thumbnailUrl" in data
      ? data.thumbnailUrl
      : "mediaUrl" in data
        ? data.mediaUrl
        : undefined;

  const isVideoFile = isVideo(mediaUrl);

  return (
    <>
      <div
        className="relative aspect-[3/4] w-full group overflow-hidden cursor-pointer"
        onClick={() => setIsOpenPopUp(true)}
      >
        {isVideoFile ? (
          <video
            src={mediaUrl}
            className="h-full w-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <img src={mediaUrl} className="h-full w-full object-cover" alt="" />
        )}

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative text-white flex gap-4 items-center justify-center h-full">
            <div className="flex items-center gap-1">
              <Heart fill="currentColor" size={20} />
              <span className="text-md">{data.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle fill="currentColor" size={20} />
              <span className="text-md">{data.commentCount}</span>
            </div>
            {"saveCount" in data && (
              <div className="flex items-center gap-1">
                <Bookmark fill="currentColor" size={20} />
                <span className="text-md">{data.saveCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ContentPopUp
        onClose={() => setIsOpenPopUp(false)}
        open={isOpenPopUp}
        contentId={data.id}
        type={
          "originalType" in data && data.originalType
            ? data.originalType
            : isShort(data)
              ? "SHORT"
              : "POST"
        }
      />
    </>
  );
};
