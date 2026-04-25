import type React from "react";
import { useUser } from "../contexts/user.context";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserSummaryType } from "../types/api/user.type";
import useDebounce from "../hooks/useDebounce";
import { handleSearchUser } from "../api/user.api";
import { CircularProgress, Box } from "@mui/material";
import type { ConversationType } from "../types/api/conversation.type";
import assets from "../assets";
import { useMessage } from "../contexts/message.context";
import CreateConversationPopup from "./CreateConversationPopUp";

const SideBarMessage: React.FC = () => {
  const { currentUser } = useUser();
  const {
    selectedConversation,
    handleSelectUser,
    allConversations,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoadingConversations,
    handleSelectConversation,
  } = useMessage();

  const [searchResults, setSearchResult] = useState<UserSummaryType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 400);
  const [isOpenCreateBox, setIsOpenCreateBox] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!debouncedKeyword.trim()) {
        setSearchResult([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await handleSearchUser(debouncedKeyword, 0, 20, true);
        if (res) setSearchResult(res.content);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResult([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [debouncedKeyword]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    if (bottom && hasNextPage && !isFetchingNextPage && !keyword) {
      fetchNextPage();
    }
  };

  return (
    <>
      <div className="w-full md:w-85 px-5 pt-5 border-r border-gray-600 h-screen flex flex-col">
        <div className="flex justify-between">
          <div className="font-bold text-2xl">{currentUser?.username}</div>
          <button
            className="cursor-pointer"
            onClick={() => setIsOpenCreateBox(true)}
          >
            <Plus />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-3 mt-2">
          <Search size={16} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setKeyword(e.target.value)}
            value={keyword}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4" onScroll={handleScroll}>
          {keyword ? (
            <div className="space-y-3">
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
                </Box>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    className="flex gap-3 items-center hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <img
                      src={user.avatar || assets.profile}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-white">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.fullName}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <div className="text-gray-400 text-sm">No users found</div>
                </Box>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {isLoadingConversations ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={32} sx={{ color: "#3b82f6" }} />
                </Box>
              ) : allConversations.length > 0 ? (
                <>
                  {allConversations.map((conversation: ConversationType) => (
                    <div
                      className="flex gap-3 items-center hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      {conversation.type === "GROUP" ? (
                        conversation.mediaUrl ? (
                          <img
                            src={conversation.mediaUrl}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex">
                            {conversation.otherUsers
                              .slice(0, 3)
                              .map((user, index) => (
                                <img
                                  key={user.userId}
                                  src={user.avatarUrl || assets.profile}
                                  alt={conversation.name || user.username}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                                  style={{
                                    marginLeft: index === 0 ? "0" : "-15px",
                                    zIndex: 3 - index,
                                  }}
                                />
                              ))}
                          </div>
                        )
                      ) : (
                        <div className="relative">
                          <img
                            src={
                              conversation.otherUsers[0].avatarUrl ||
                              assets.profile
                            }
                            alt={
                              conversation.name ||
                              conversation.otherUsers[0].username
                            }
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {conversation.otherUsers[0].lastSeen === null && (
                            <span className="absolute bottom-0 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
                          )}
                        </div>
                      )}

                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-semibold text-white">
                            {conversation.name ||
                              conversation.otherUsers[0].username}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {typeof conversation.lastMessage === "object"
                            ? (conversation.lastMessage as any)?.content ||
                              "No messages yet"
                            : conversation.lastMessage || "No messages yet"}
                        </div>
                      </div>

                      {(!selectedConversation ||
                        selectedConversation.id !== conversation.id) &&
                        conversation.lastMessage &&
                        !conversation.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                    </div>
                  ))}
                  {isFetchingNextPage && (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={24} sx={{ color: "#3b82f6" }} />
                    </Box>
                  )}
                </>
              ) : (
                <Box textAlign="center" py={4}>
                  <div className="text-gray-400 text-sm">
                    No conversations yet
                  </div>
                </Box>
              )}
            </div>
          )}
        </div>
      </div>
      <CreateConversationPopup
        open={isOpenCreateBox}
        onClose={() => setIsOpenCreateBox(false)}
      />
    </>
  );
};

export default SideBarMessage;
