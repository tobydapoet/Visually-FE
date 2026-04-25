import { Search, User, FileText, Hash, Loader2 } from "lucide-react";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { TagReponse } from "../types/api/tag.type";
import useDebounce from "../hooks/useDebounce";
import type { UserStatusSummaryType } from "../types/api/user.type";
import type { ContentSearchResponse } from "../types/api/content.type";
import { handleSearchUserWithRole } from "../api/user.api";
import { handleContentSearch, handleTagSearch } from "../api/content.api";
import { UserRole } from "../constants/userRole.enum";
import assets from "../assets";
import { UserComponent } from "../components/UserComponent";

type TabType = "users" | "contents" | "tags";

const SearchPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("keyword") || "";

  const [searchInput, setSearchInput] = useState(keyword);
  const [activeTab, setActiveTab] = useState<TabType>("users");

  const [users, setUsers] = useState<UserStatusSummaryType[]>([]);
  const [contents, setContents] = useState<ContentSearchResponse[]>([]);
  const [tags, setTags] = useState<TagReponse[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  const debouncedKeyword = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedKeyword) {
      setSearchParams({ keyword: debouncedKeyword });
    } else if (debouncedKeyword === "") {
      setSearchParams({});
    }
  }, [debouncedKeyword, setSearchParams]);

  useEffect(() => {
    if (!debouncedKeyword) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await handleSearchUserWithRole(
          UserRole.CLIENT,
          0,
          5,
          debouncedKeyword,
        );
        setUsers(response.content);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (activeTab === "users") {
      fetchUsers();
    }
  }, [debouncedKeyword, activeTab]);

  useEffect(() => {
    if (!debouncedKeyword) {
      setContents([]);
      return;
    }

    const fetchContents = async () => {
      setLoadingContents(true);
      try {
        const response = await handleContentSearch(
          1,
          5,
          debouncedKeyword,
          debouncedKeyword,
        );
        setContents(response);
      } catch (error) {
        console.error("Failed to fetch contents:", error);
        setContents([]);
      } finally {
        setLoadingContents(false);
      }
    };

    if (activeTab === "contents") {
      fetchContents();
    }
  }, [debouncedKeyword, activeTab]);

  useEffect(() => {
    if (!debouncedKeyword) {
      setTags([]);
      return;
    }

    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await handleTagSearch(1, 5, debouncedKeyword);
        setTags(response.content);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setTags([]);
      } finally {
        setLoadingTags(false);
      }
    };

    if (activeTab === "tags") {
      fetchTags();
    }
  }, [debouncedKeyword, activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchInput.trim()) {
      setSearchParams({ keyword: searchInput.trim() });
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/${userId}`);
  };

  const handleTagClick = (tagName: string) => {
    setSearchInput(tagName);
    setSearchParams({ keyword: tagName });
  };

  const tabs = [
    { id: "users" as TabType, label: "Users", icon: User },
    { id: "contents" as TabType, label: "Contents", icon: FileText },
    { id: "tags" as TabType, label: "Tags", icon: Hash },
  ];

  return (
    <div className="w-full md:w-272 mt-5 mx-auto">
      <div className="relative px-2 md:px-0">
        <Search className="absolute left-5 md:left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search users, contents, or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full  pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-neutral-500 text-md"
        />
      </div>

      {keyword && (
        <div className="flex gap-1 mt-6 border-b border-neutral-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isLoading =
              (tab.id === "users" && loadingUsers) ||
              (tab.id === "contents" && loadingContents) ||
              (tab.id === "tags" && loadingTags);
            const dataLength =
              tab.id === "users"
                ? users.length
                : tab.id === "contents"
                  ? contents.length
                  : tags.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {dataLength > 0 && !isLoading && (
                  <span className="text-xs text-gray-500">({dataLength})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        {!keyword ? (
          <div className="text-center text-gray-500 py-10">
            Enter a keyword to search
          </div>
        ) : (
          <>
            {activeTab === "users" && (
              <div className="space-y-2">
                {loadingUsers && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                )}

                {!loadingUsers && users.length === 0 && (
                  <div className="text-center text-gray-500 py-10">
                    No users found
                  </div>
                )}

                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <img
                      src={user.avatar || assets.profile}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium ">
                        @{user.username}
                      </p>
                      <p className="text-gray-400 text-sm">{user.fullName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "contents" && (
              <div className="grid grid-cols-4 gap-3">
                {loadingContents && (
                  <div className="col-span-3 flex justify-center py-10">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                )}

                {!loadingContents && contents.length === 0 && (
                  <div className="col-span-4 text-center text-gray-500 py-10">
                    No contents found
                  </div>
                )}

                {contents.map((content) => (
                  <UserComponent data={content} key={content.id} />
                ))}
              </div>
            )}

            {activeTab === "tags" && (
              <div className="flex flex-col flex-wrap gap-2">
                {loadingTags && (
                  <div className="w-full flex justify-center py-10">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                )}

                {!loadingTags && tags.length === 0 && (
                  <div className="w-full text-center text-gray-500 py-10">
                    No tags found
                  </div>
                )}

                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagClick(tag.name)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <Hash />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-md">{tag.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
