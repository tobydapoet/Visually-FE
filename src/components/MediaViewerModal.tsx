import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { handleGetMediaConversation } from "../api/message.api";
import type { MessageMedia } from "../types/api/message-media.type";

type MediaItem = {
  id: number;
  url: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: number;
  initialMediaId?: number;
};

const MediaViewerModal: React.FC<Props> = ({
  open,
  onClose,
  conversationId,
  initialMediaId,
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await handleGetMediaConversation(conversationId, 1, 20);
        setMediaList(res.data);
        setTotalPages(res.totalPages);
        if (initialMediaId) {
          const idx = res.data.findIndex(
            (m: MessageMedia) => m.id === initialMediaId,
          );
          setCurrentIndex(idx >= 0 ? idx : 0);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [open, conversationId]);

  const handleLoadMore = async () => {
    if (page >= totalPages || loading) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await handleGetMediaConversation(
        conversationId,
        nextPage,
        20,
      );
      setMediaList((prev) => [...prev, ...res.data]);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      const newIndex = i < mediaList.length - 1 ? i + 1 : i;
      if (newIndex >= mediaList.length - 3) handleLoadMore();
      return newIndex;
    });
  }, [mediaList.length]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, prev, next]);

  if (!open) return null;

  const current = mediaList[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-sm text-zinc-400">
          {mediaList.length > 0
            ? `${currentIndex + 1} / ${mediaList.length}`
            : ""}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-zinc-800 cursor-pointer transition-colors text-zinc-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main viewer */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-12">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="absolute left-2 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer z-10"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>

        {loading && !current ? (
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        ) : current ? (
          <img
            src={current.url}
            alt=""
            className="max-h-full max-w-full object-contain rounded-lg select-none"
            draggable={false}
          />
        ) : null}

        <button
          onClick={next}
          disabled={currentIndex === mediaList.length - 1}
          className="absolute right-2 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer z-10"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto border-t border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700"
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 50) {
            handleLoadMore();
          }
        }}
      >
        {mediaList.map((media, idx) => (
          <button
            key={media.id}
            onClick={() => setCurrentIndex(idx)}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              idx === currentIndex
                ? "border-blue-500 scale-105"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={media.url}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              draggable={false}
            />
          </button>
        ))}
        {loading && (
          <div className="shrink-0 w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewerModal;
