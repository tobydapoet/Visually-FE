interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  color?: "violet" | "emerald" | "orange" | "blue";
}

const colorMap: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
};

export function ProgressBar({
  progress,
  className = "",
  showLabel = false,
  color = "violet",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden ${className}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-out ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {showLabel && (
        <span className="text-xs text-gray-400 tabular-nums w-8 text-right shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
}
