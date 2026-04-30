import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReelItem from "./ReeItem";

interface MediaCarouselProps {
  medias: string[];
  isActive: boolean;
}

export function MediaCarousel({ medias, isActive }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isHorizontal = useRef<boolean | null>(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (isHorizontal.current === true) e.preventDefault();
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - startX.current);
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    if (isHorizontal.current === null) {
      isHorizontal.current = dx > dy;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isHorizontal.current || startX.current === null) {
      startX.current = null;
      startY.current = null;
      isHorizontal.current = null;
      return;
    }
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50 && current < medias.length - 1) setCurrent((c) => c + 1);
    if (diff < -50 && current > 0) setCurrent((c) => c - 1);
    startX.current = null;
    startY.current = null;
    isHorizontal.current = null;
  };

  return (
    <div
      ref={carouselRef}
      className="absolute inset-0 overflow-hidden h-[calc(100vh-2rem)] md:h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {medias.map((url, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          <ReelItem url={url} isActive={isActive} isCurrent={i === current} />
        </div>
      ))}

      {medias.length > 1 && (
        <>
          {current > 0 && (
            <button
              className="absolute left-2 top-7 cursor-pointer z-30 -translate-y-1/2 flex items-center justify-center rounded-full transition-opacity hover:opacity-100 opacity-70"
              style={{
                width: 36,
                height: 36,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent((c) => c - 1);
              }}
            >
              <ChevronLeft size={22} color="white" />
            </button>
          )}

          {current < medias.length - 1 && (
            <button
              className="absolute right-2 top-7 z-30 cursor-pointer -translate-y-1/2 flex items-center justify-center rounded-full transition-opacity hover:opacity-100 opacity-70"
              style={{
                width: 36,
                height: 36,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent((c) => c + 1);
              }}
            >
              <ChevronRight size={22} color="white" />
            </button>
          )}
        </>
      )}

      {medias.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {medias.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 18 : 6,
                height: 6,
                background: i === current ? "white" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
