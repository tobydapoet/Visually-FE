import React, { useState } from "react";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import type { PostResponse } from "../types/api/post.type";
import ContentPopUp from "./ContentPopup";
import type { ShortResponse } from "../types/api/short.type";

type Props = {
  data: PostResponse | ShortResponse;
};

export const UserComponent: React.FC<Props> = ({ data }) => {
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);

  const isPost = (
    data: PostResponse | ShortResponse,
  ): data is ShortResponse => {
    return "thumbnailUrl" in data;
  };

  return (
    <>
      <div
        className="relative h-90 w-68 group overflow-hidden cursor-pointer"
        onClick={() => setIsOpenPopUp(true)}
      >
        <img
          src={
            "mediaUrl" in data
              ? data.mediaUrl
              : "thumbnailUrl" in data
                ? data.thumbnailUrl
                : undefined
          }
          className="h-full w-full object-cover"
        />

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
            <div className="flex items-center gap-1">
              <Bookmark fill="currentColor" size={20} />
              <span className="text-md">{data.shareCount}</span>
            </div>
          </div>
        </div>
      </div>
      <ContentPopUp
        onClose={() => setIsOpenPopUp(false)}
        open={isOpenPopUp}
        contentId={data.id}
        type={isPost(data) ? "SHORT" : "POST"}
      />
    </>
  );
};
