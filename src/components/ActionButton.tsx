const fmt = (n: number): string =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + "M"
    : n >= 1000
      ? (n / 1000).toFixed(1) + "k"
      : String(n);

interface ActionBtnProps {
  icon: React.ReactNode;
  label?: number;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
}

function ActionBtn({ icon, label, onClick }: ActionBtnProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex flex-col items-center gap-1 select-none cursor-pointer"
    >
      <div>{icon}</div>
      {label !== undefined && (
        <span
          className="text-white text-xs font-semibold"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
        >
          {fmt(label)}
        </span>
      )}
    </button>
  );
}

export default ActionBtn;
