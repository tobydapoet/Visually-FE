import React, { useState } from "react";
import {
  Music,
  MoreVertical,
  Edit,
  Trash2,
  Pause,
  CheckCircle,
  Ban,
  Play,
} from "lucide-react";
import type { MusicResponse } from "../types/api/music.type";
import { useMusic } from "../contexts/music.context";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MusicStatus } from "../constants/music.enum";
import MusicPopUp from "./MusicPopUp";
import { handleUpdateStatusMusic } from "../api/media.api";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

interface MusicItemProps {
  music: MusicResponse;
  isSelected?: boolean;
  onSelect?: (music: MusicResponse) => void;
  onEdit?: (music: MusicResponse) => void;
  onDelete?: (music: MusicResponse) => void;
}

const statusActions: Record<
  MusicStatus,
  {
    label: string;
    status: MusicStatus;
    icon: React.ReactNode;
    className: string;
  }[]
> = {
  [MusicStatus.PENDING]: [
    {
      label: "Approve",
      status: MusicStatus.ACTIVE,
      icon: <CheckCircle size={14} />,
      className: "text-emerald-400 hover:bg-emerald-500/10",
    },
    {
      label: "Delete",
      status: MusicStatus.DELETED,
      icon: <Trash2 size={14} />,
      className: "text-red-400 hover:bg-red-500/10",
    },
  ],
  [MusicStatus.ACTIVE]: [
    {
      label: "Suspend",
      status: MusicStatus.SUSPENDED,
      icon: <Ban size={14} />,
      className: "text-amber-400 hover:bg-amber-500/10",
    },
    {
      label: "Delete",
      status: MusicStatus.DELETED,
      icon: <Trash2 size={14} />,
      className: "text-red-400 hover:bg-red-500/10",
    },
  ],
  [MusicStatus.SUSPENDED]: [
    {
      label: "Activate",
      status: MusicStatus.ACTIVE,
      icon: <Play size={14} />,
      className: "text-emerald-400 hover:bg-emerald-500/10",
    },
    {
      label: "Delete",
      status: MusicStatus.DELETED,
      icon: <Trash2 size={14} />,
      className: "text-red-400 hover:bg-red-500/10",
    },
  ],
  [MusicStatus.DELETED]: [],
};

const MusicItem: React.FC<MusicItemProps> = ({
  music,
  isSelected,
  onSelect,
}) => {
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 0);
  const currentSearch = searchParams.get("search") ?? "";
  const statusFilter =
    (searchParams.get("status") as MusicStatus) ?? MusicStatus.PENDING;
  const { playMusic, currentPlayingId, getMusicList } = useMusic();
  const isPlaying = currentPlayingId === music.id;
  const actions = statusActions[music.status as MusicStatus] ?? [];
  const [open, setOpen] = useState(false);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMusic(music);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleUpdateStatus = async (status: MusicStatus) => {
    const res = await handleUpdateStatusMusic(music.id, status);
    if (res.success) {
      toast.success(res.message);
      await getMusicList(currentPage, 20, statusFilter, currentSearch);
    } else {
      console.log(res.message);
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-3 p-3 bg-neutral-900 rounded-lg border transition-all relative cursor-pointer ${
          isSelected
            ? "border-indigo-500 shadow-sm bg-indigo-500/10"
            : "border-neutral-800 hover:shadow-sm hover:border-indigo-500/50 hover:bg-neutral-800/50"
        }`}
        onClick={() => onSelect?.(music)}
      >
        <img
          src={music.img}
          alt={music.title}
          className="w-12 h-12 rounded-lg object-cover bg-neutral-800"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/48x48?text=No+Image";
          }}
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {music.title}
          </h4>
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-xs text-neutral-400 truncate">{music.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePlay}
            className={`p-1.5 rounded-full transition-colors ${
              isPlaying
                ? "bg-indigo-500/20 hover:bg-indigo-500/30"
                : "bg-neutral-800 hover:bg-indigo-500/10"
            }`}
          >
            {isPlaying ? (
              <Pause size={14} className="text-indigo-400" />
            ) : (
              <Music size={14} className="text-neutral-400" />
            )}
          </button>

          <Menu as="div" className="relative">
            <MenuButton
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"
            >
              <MoreVertical size={14} className="text-neutral-400" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="w-40 bg-neutral-900 origin-top-right rounded-xl border border-neutral-800 shadow-lg p-1 z-50 focus:outline-none
                  transition duration-150 ease-out
                  data-closed:scale-95 data-closed:opacity-0"
            >
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleEdit}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      focus
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                )}
              </MenuItem>

              {actions.length > 0 && (
                <div className="my-1 border-t border-neutral-800" />
              )}

              {actions.map((action) => (
                <MenuItem key={action.status}>
                  {({ focus }) => (
                    <button
                      onClick={() => handleUpdateStatus(action.status)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        action.className
                      } ${focus ? "bg-neutral-800" : ""}`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>
      <MusicPopUp open={open} onClose={() => setOpen(false)} music={music} />
    </>
  );
};

export default MusicItem;
