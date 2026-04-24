import { Dialog, DialogPanel } from "@headlessui/react";
import { Search, X } from "lucide-react";
import type { FC } from "react";
import { useState, useEffect } from "react";
import type { UserStatusSummaryType } from "../types/api/user.type";
import useDebounce from "../hooks/useDebounce";
import { handleSearchUserWithRole } from "../api/user.api";
import assets from "../assets";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchPopup: FC<Props> = ({ open, onClose }) => {
  const [searchInput, setSearchInput] = useState("");
  const [users, setUsers] = useState<UserStatusSummaryType[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debouncedKeyword = useDebounce(searchInput, 500);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (!searchInput) {
          setUsers([]);
        } else {
          const response = await handleSearchUserWithRole(
            "CLIENT",
            0,
            5,
            debouncedKeyword,
          );
          setUsers(response.content);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedKeyword, open]);

  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setUsers([]);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim()) {
      onClose();
      navigate(`/search?keyword=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-y-0 left-18 flex">
        <DialogPanel
          transition
          className="
            w-120 max-w-[90%]
            bg-zinc-900
            h-full
            p-4
            shadow-none
            border-r border-gray-700

            transform
            transition-all duration-300 ease-out

            data-closed:-translate-x-full
            data-closed:opacity-0
            data-open:translate-x-0
          "
        >
          <div className="flex justify-between">
            <h2 className="text-white text-lg font-semibold mb-4">Search</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center cursor-pointer justify-center rounded-full hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-neutral-500 text-md"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="mt-4 space-y-2">
            {loading && (
              <div className="flex mx-auto justify-center mt-20">
                <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
              </div>
            )}

            {!loading && users.length === 0 && debouncedKeyword && (
              <div className="text-center text-gray-400 py-4">
                No clients found
              </div>
            )}

            {!loading && users.length === 0 && !debouncedKeyword && (
              <div className="text-center text-gray-400 py-4">
                Type to search clients
              </div>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                onClick={() => {
                  onClose();
                  navigate(`${user.username}`);
                }}
              >
                <img
                  src={user.avatar || assets.profile}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">
                    {user.username}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {user.fullName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SearchPopup;
