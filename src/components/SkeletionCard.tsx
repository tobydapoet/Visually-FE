const SkeletonCard = () => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl mb-4 overflow-hidden animate-pulse">
    <div className="flex items-center gap-3 p-3">
      <div className="w-9 h-9 rounded-full bg-neutral-800" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3 w-28 bg-neutral-800 rounded" />
        <div className="h-2.5 w-16 bg-neutral-700 rounded" />
      </div>
    </div>
    <div className="w-full h-72 bg-neutral-800" />
    <div className="p-3 flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="w-6 h-6 rounded bg-neutral-800" />
        <div className="w-6 h-6 rounded bg-neutral-800" />
        <div className="w-6 h-6 rounded bg-neutral-800" />
      </div>
      <div className="h-3 w-20 bg-neutral-800 rounded" />
      <div className="h-3 w-48 bg-neutral-700 rounded" />
    </div>
  </div>
);
export default SkeletonCard;
