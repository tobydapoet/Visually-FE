import React, { useState, useRef, useEffect } from "react";
import { Music, Pause, Play, Search } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { MusicResponse } from "../types/api/music.type";
import useDebounce from "../hooks/useDebounce";
import { handleGetListMusic } from "../api/media.api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (musicId: MusicResponse) => void;
};

export const StoryMusicPicker: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["music-list", debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await handleGetListMusic(
        pageParam,
        5,
        "ACTIVE",
        debouncedSearch,
      );
      return {
        content: res.content,
        nextPage: res.last ? undefined : pageParam + 1,
        hasMore: !res.last,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handlePlay = (track: MusicResponse) => {
    const audio = audioRef.current;

    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.pause();

    audio.src = track.url;
    audio.play().catch((err) => console.error("Play failed:", err));
    setPlayingId(track.id);
  };

  const musicList = data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    if (!isOpen) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    isOpen,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    musicList.length,
  ]);

  useEffect(() => {
    if (isOpen && debouncedSearch !== undefined) {
      refetch();
    }
  }, [debouncedSearch, isOpen, refetch]);

  useEffect(() => {
    if (!isOpen) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setPlayingId(null);
    }
  }, [isOpen]);

  const handleSelectMusic = (track: MusicResponse) => {
    audioRef.current.pause();
    audioRef.current.src = "";
    setPlayingId(null);
    onSelect(track);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="inset-0 bg-black/80 backdrop-blur-sm z-50 ml-5"
        onClick={() => {
          audioRef.current.pause();
          audioRef.current.src = "";
          setPlayingId(null);
          onClose();
        }}
      />

      <div className="inset-0 flex h-fit z-50">
        <div className="w-sm rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-2xl">
          <div className="p-4">
            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 mb-4">
              <Search size={16} className="text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500"
                autoFocus
              />
            </div>

            <div className="max-h-102 overflow-y-auto custom-scrollbar">
              {musicList.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  onClick={() => handleSelectMusic(track)}
                  className="flex items-center justify-between hover:bg-zinc-800 cursor-pointer transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 p-3 ">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                      {track.img ? (
                        <img
                          src={track.img}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music size={18} className="text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap max-w-90 text-sm font-medium text-white">
                        {track.title}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {track.artist}
                      </div>
                    </div>
                  </div>
                  <div
                    className="mr-4 cursor-pointer rounded-full bg-blue-500 p-2 flex items-center justify-center shadow-md hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handlePlay(track);
                    }}
                  >
                    {playingId === track.id ? (
                      <Pause size={18} className="text-white" />
                    ) : (
                      <Play size={18} className="text-white" />
                    )}
                  </div>
                </div>
              ))}

              {(isFetchingNextPage || isLoading) && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && musicList.length === 0 && (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  No music found
                </div>
              )}

              {!hasNextPage && musicList.length > 0 && (
                <div className="text-center py-3 text-zinc-500 text-xs">
                  End of list
                </div>
              )}

              {hasNextPage && <div ref={loadMoreRef} className="h-1" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
