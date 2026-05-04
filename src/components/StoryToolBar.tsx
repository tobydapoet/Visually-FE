import { Type, Music, Trash2 } from "lucide-react";

type Props = {
  onText: () => void;
  onMusic: () => void;
  onRemove: () => void;
};

export function StoryToolbar({ onMusic, onRemove }: Props) {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-3 z-10">
      <button
        type="button"
        onClick={onMusic}
        className="p-2 rounded-full bg-white hover:bg-blue-500 transition-colors"
      >
        <Music size={20} color="black" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 rounded-full bg-white hover:bg-red-500 transition-colors"
      >
        <Trash2 size={20} color="black" />
      </button>
    </div>
  );
}
