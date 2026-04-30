import { Play, Pause } from "lucide-react";
import { ParsedContent } from "./ParseContent";
import { AdStatus } from "../constants/adStatus.enum";

interface AdPostCardProps {
  ad: any;
  updatingStatusId: number | null;
  onSelect: (ad: any) => void;
  onUpdateStatus: (adId: number, currentStatus: AdStatus) => void;
}

const getStatusColor = (status: AdStatus) => {
  switch (status) {
    case AdStatus.ACTIVE:
      return "text-green-400 bg-green-400/10";
    case AdStatus.INACTIVE:
      return "text-yellow-400 bg-yellow-400/10";
    case AdStatus.DISABLED:
      return "text-red-400 bg-red-400/10";
    default:
      return "text-gray-400 bg-gray-400/10";
  }
};

const getStatusText = (status: AdStatus) => {
  switch (status) {
    case AdStatus.ACTIVE:
      return "Active";
    case AdStatus.INACTIVE:
      return "Inactive";
    case AdStatus.DISABLED:
      return "Disabled";
    default:
      return status;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);

const AdPostCard = ({
  ad,
  updatingStatusId,
  onSelect,
  onUpdateStatus,
}: AdPostCardProps) => {
  const pct =
    ad.dailyBudget > 0
      ? Math.min(Math.round((ad.spentAmount / ad.dailyBudget) * 100), 100)
      : 0;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-200 p-5">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ad.status === AdStatus.ACTIVE
                ? "bg-green-400"
                : ad.status === AdStatus.INACTIVE
                  ? "bg-yellow-400"
                  : "bg-red-400"
            }`}
          />
          {getStatusText(ad.status)}
        </span>

        {ad.status !== AdStatus.DISABLED && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(ad.id, ad.status);
            }}
            disabled={updatingStatusId === ad.id}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50"
          >
            {updatingStatusId === ad.id ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : ad.status === AdStatus.ACTIVE ? (
              <Pause className="w-3.5 h-3.5 text-yellow-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-green-400" />
            )}
          </button>
        )}
      </div>

      <div onClick={() => onSelect(ad)} className="cursor-pointer mt-3">
        <div className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
          {ad.caption && (
            <ParsedContent
              caption={ad.content.caption}
              mentions={ad.content.mentions}
              classname="font-medium"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-zinc-800/60 rounded-lg p-2.5 text-center">
            <p className="text-sm font-semibold text-white">
              {ad.views.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Views</p>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-2.5 text-center">
            <p className="text-sm font-semibold text-white">
              {formatCurrency(ad.spentAmount)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Spent today</p>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-4 pt-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Daily budget</span>
            <span className="text-emerald-400 font-medium">
              {formatCurrency(ad.dailyBudget)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Spent</span>
            <span className="text-yellow-400">
              {formatCurrency(ad.spentAmount)}
            </span>
          </div>

          <div className="mt-2">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 100
                    ? "bg-red-500"
                    : pct >= 75
                      ? "bg-yellow-400"
                      : "bg-blue-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-600 mt-1">
              <span>{pct}% used</span>
              <span>
                {formatCurrency(ad.dailyBudget - ad.spentAmount)} left
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdPostCard;
