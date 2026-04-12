import { useRef, useState } from "react";

type Props = {
  frames: string[];
  onSelect: (dataUrl: string, index: number) => void;
  onUpload: (file: File) => void; // thêm prop này
  videoDuration?: number;
};

export const VideoFrameStrip: React.FC<Props> = ({
  frames,
  onSelect,
  onUpload,
  videoDuration = 0,
}) => {
  const [selected, setSelected] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleSelect = (i: number) => {
    setSelected(i);
    onSelect(frames[i], i);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current!.offsetLeft;
    scrollLeft.current = scrollRef.current!.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const delta = x - startX.current;
    if (Math.abs(delta) > 4) hasDragged.current = true;
    scrollRef.current!.scrollLeft = scrollLeft.current - delta;
  };

  const formatTime = (i: number) => {
    const secs =
      frames.length <= 1
        ? 0
        : Math.round((i / (frames.length - 1)) * videoDuration);
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div>
      <div className="flex justify-end items-center mb-2">
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="text-sm text-blue-500 hover:text-blue-400 hover:underline transition-colors duration-150 cursor-pointer"
        >
          Upload thumbnail
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              setSelected(-1);
            }
            e.target.value = "";
          }}
        />
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing no-scrollbar"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
      >
        <div className="flex gap-1 w-max p-1">
          {frames.map((src, i) => (
            <div
              key={i}
              onClick={() => {
                if (!hasDragged.current) handleSelect(i);
              }}
              className={`relative w-14 h-20 rounded-md overflow-hidden border-2 cursor-pointer shrink-0 transition-all duration-150
                ${
                  selected === i
                    ? "border-blue-500 scale-105"
                    : "border-transparent hover:border-zinc-500"
                }`}
            >
              <img
                src={src}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] bg-black/60 text-white px-1 rounded whitespace-nowrap">
                {formatTime(i)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
