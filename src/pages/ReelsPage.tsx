import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { FeedEnum } from "../constants/feed.enum";
import { handleGetFeed, handleMarkCurrentReelFeed } from "../api/feed.api";
import { ReelCard } from "../components/ReelCard";
import type { FeedContentResponse } from "../types/api/feed.type";
import { useNavigate, useParams } from "react-router-dom";

export default function ReelsPage() {
  const [reels, setReels] = useState<FeedContentResponse[]>([]);
  const [cursor, setCursor] = useState<number | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { feedId } = useParams();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  useEffect(() => {
    if (reels.length === 0) return;
    if (!feedId) {
      navigate(`/reels/${reels[0].id}`, { replace: true });
    }
  }, [reels]);

  useEffect(() => {
    if (reels.length === 0 || !reels[activeIndex]) return;
    navigate(`/reels/${reels[activeIndex].id}`, { replace: true });
  }, [activeIndex, reels]);

  useEffect(() => {
    if (!reels[activeIndex]) return;
    const current = reels[activeIndex];
    handleMarkCurrentReelFeed(current.contentId, current.contentType).catch(
      console.error,
    );
  }, [activeIndex, reels]);

  useEffect(() => {
    if (reels.length === 0 || !feedId) return;
    const idx = reels.findIndex((r) => String(r.id) === feedId);
    if (idx <= 0) return;

    setActiveIndex(idx);
    containerRef.current
      ?.querySelector(`[data-index="${idx}"]`)
      ?.scrollIntoView({ behavior: "instant" });
  }, [reels]);

  const fetchReels = useCallback(
    async (cur: number | null | undefined) => {
      if (isFetching.current || !hasMore) return;
      isFetching.current = true;
      setLoading(true);
      try {
        const res = await handleGetFeed(
          FeedEnum.REEL,
          cur != null ? String(cur) : undefined,
        );
        setReels((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const fresh = res.content.filter((r) => !existingIds.has(r.id));
          return [...prev, ...fresh];
        });
        if (res.nextCursor == null) {
          setHasMore(false);
        } else {
          setCursor(res.nextCursor);
        }
      } catch (err) {
        console.error("Failed to fetch reels:", err);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [hasMore],
  );

  useEffect(() => {
    fetchReels(1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(idx);
            if (idx >= reels.length - 2 && hasMore && !isFetching.current) {
              fetchReels(cursor);
            }
          }
        });
      },
      { root: container, threshold: 0.6 },
    );

    const cards = container.querySelectorAll<HTMLElement>("[data-index]");
    cards.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels, cursor, hasMore, fetchReels]);

  return (
    <>
      <style>{`
        @keyframes heartPop {
          0%   { transform: scale(0);   opacity: 1; }
          50%  { transform: scale(1.2); opacity: 1; }
          80%  { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes iconFade {
          0%   { opacity: 1; transform: scale(1);   }
          60%  { opacity: 1; transform: scale(1);   }
          100% { opacity: 0; transform: scale(0.8); }
        }
        .reels-scroll::-webkit-scrollbar { display: none; }
        .reels-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        ref={containerRef}
        className="reels-scroll"
        style={{
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          background: "#000",
        }}
      >
        {reels.map((reel, i) => (
          <div
            key={reel.id}
            data-index={i}
            style={{ width: "100%", height: "100dvh", position: "relative" }}
          >
            <ReelCard reel={reel} isActive={i === activeIndex} />
          </div>
        ))}

        {loading && (
          <div
            className="flex items-center justify-center"
            style={{ width: "100%", height: "100dvh" }}
          >
            <Loader2
              size={36}
              color="white"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!hasMore && reels.length > 0 && (
          <div
            className="flex items-center justify-center"
            style={{ width: "100%", height: 120 }}
          >
            <p className="text-white/40 text-sm">You're all caught up ✓</p>
          </div>
        )}
      </div>
    </>
  );
}
