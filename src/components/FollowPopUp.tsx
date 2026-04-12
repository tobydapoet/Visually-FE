import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type React from "react";
import { useEffect, useState } from "react";
import type { FollowType } from "../types/api/follow.type";
import {
  handleFollow,
  handleGetFollower,
  handleGetFollowing,
  handleUnfollow,
} from "../api/follow.api";
import type { FollowRelation } from "../constants/followRelation.enum";
import { X, Users, UserPlus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import { useUser } from "../contexts/user.context";
import useDebounce from "../hooks/useDebounce";
import assets from "../assets";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  followRelation: FollowRelation;
};

const FollowPopUp: React.FC<Props> = ({
  open,
  onClose,
  userId,
  followRelation,
}) => {
  const [follow, setFollow] = useState<FollowType[]>();
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const navigate = useNavigate();
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchFollow = async () => {
      setLoading(true);
      try {
        if (followRelation === "FOLLOWER") {
          const res = await handleGetFollower(userId, page, debouncedSearch);
          if (res) setFollow(res.content);
          console.log(res);
        } else if (followRelation === "FOLLOWING") {
          const res = await handleGetFollowing(userId, page, debouncedSearch);
          if (res) setFollow(res.content);
        }
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchFollow();
  }, [followRelation, userId, page, open, debouncedSearch]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const toggleFollow = (id: string) => {
    setFollow((prev) =>
      prev?.map((item) =>
        item.user.id === id
          ? {
              ...item,
              user: { ...item.user, isFollowed: !item.user.isFollowed },
            }
          : item,
      ),
    );
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel
          transition
          className="w-full max-w-lg rounded-xl bg-zinc-900 p-0
            text-white duration-300 ease-out
            data-closed:scale-95 data-closed:opacity-0"
        >
          <DialogTitle className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <div className="text-md font-semibold text-white">
              {followRelation === "FOLLOWER" ? "Followers" : "Following"}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogTitle>

          <div className="px-4 py-2">
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder={`Search ${followRelation === "FOLLOWER" ? "followers" : "following"}`}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "20px",
                  "& fieldset": { borderColor: "#3f3f46" },
                  "&:hover fieldset": { borderColor: "#52525b" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
                "& .MuiInputBase-input": { padding: "8px 12px" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {loading && search ? (
                      <CircularProgress size={14} sx={{ color: "#71717a" }} />
                    ) : (
                      <Search className="w-4 h-4 text-zinc-500" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="flex flex-col max-h-100 overflow-y-auto">
            {loading && !search ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <CircularProgress sx={{ color: "#71717a" }} />
                <p className="text-sm text-zinc-500 text-center mt-4">
                  Loading...
                </p>
              </div>
            ) : !follow || follow.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  {followRelation === "FOLLOWER" ? (
                    <Users className="w-10 h-10 text-zinc-600" />
                  ) : (
                    <UserPlus className="w-10 h-10 text-zinc-600" />
                  )}
                </div>
                <p className="text-white font-medium text-center">
                  {search
                    ? `No results for "${search}"`
                    : followRelation === "FOLLOWER"
                      ? "No followers yet"
                      : "Not following anyone"}
                </p>
                <p className="text-sm text-zinc-500 text-center mt-2">
                  {search
                    ? "Try a different name or username"
                    : followRelation === "FOLLOWER"
                      ? "When someone follows you, they'll appear here"
                      : "When you follow someone, they'll appear here"}
                </p>
              </div>
            ) : (
              follow?.map((follow) => (
                <div
                  key={follow.followedId}
                  className=" flex justify-between items-center px-6 py-3 cursor-pointer"
                  onClick={() => {
                    navigate(`/${follow.user.username}`);
                    onClose();
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={follow.user.avatar || assets.profile}
                      alt={follow.user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-white">
                        {follow.user.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {follow.user.fullName}
                      </div>
                    </div>
                  </div>
                  {follow.user.id !== currentUser?.id &&
                    (!follow.user.isFollowed ? (
                      <button
                        className="ml-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
                        onClick={async (e) => {
                          e.stopPropagation();
                          toggleFollow(follow.user.id);
                          try {
                            await handleFollow(follow.user.id);
                          } catch {
                            toggleFollow(follow.user.id);
                          }
                        }}
                      >
                        Follow
                      </button>
                    ) : (
                      <button
                        className="ml-auto px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
                        onClick={async (e) => {
                          e.stopPropagation();
                          toggleFollow(follow.user.id);
                          try {
                            await handleUnfollow(follow.user.id);
                          } catch {
                            toggleFollow(follow.user.id);
                          }
                        }}
                      >
                        Following
                      </button>
                    ))}
                </div>
              ))
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default FollowPopUp;
