import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { UserType } from "../types/api/user.type";
import { handleGetUser } from "../api/user.api";

import LoadingSpinner from "../components/LoadingSpinner";
import {
  Verified,
  Camera,
  Award,
  Zap,
  Heart,
  MessageCircle,
  Pencil,
  Archive,
  Grid,
  Video,
  Bookmark,
  Plus,
} from "lucide-react";
import { useUser } from "../contexts/user.context";
import type { FollowRelation } from "../constants/followRelation.enum";
import FollowPopUp from "../components/FollowPopUp";
import { handleGetPostByUser } from "../api/post.api";
import { handleGetShortByUser } from "../api/short.api";
import { UserComponent } from "../components/UserComponent";
import StoryListPopUp from "../components/StoryListPopUp";
import type { StoryStorageResponse } from "../types/api/storage.type";
import { handleGetStorageByUser } from "../api/story.api";
import assets from "../assets";
import { useInfiniteQuery } from "@tanstack/react-query";

type TabType = "posts" | "shorts" | "saved";

const UserPage: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [isOpenFollow, setIsOpenFollow] = useState(false);
  const [followRelationType, setFollowRelationType] =
    useState<FollowRelation>();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get("tab") as TabType;
    return tab && ["posts", "shorts", "saved"].includes(tab) ? tab : "posts";
  });
  const postsEndRef = useRef<HTMLDivElement>(null);
  const shortsEndRef = useRef<HTMLDivElement>(null);

  const {
    data: postsData,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: ["posts", user?.id],
    queryFn: ({ pageParam = 1 }) =>
      handleGetPostByUser(user!.id, pageParam, 10),
    getNextPageParam: (lastPage, pages) =>
      pages.length * lastPage.size < lastPage.total
        ? pages.length + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!user && activeTab === "posts",
  });

  const {
    data: shortsData,
    fetchNextPage: fetchNextShorts,
    hasNextPage: hasNextShorts,
    isFetchingNextPage: isFetchingNextShorts,
    isLoading: shortsLoading,
  } = useInfiniteQuery({
    queryKey: ["shorts", user?.id],
    queryFn: ({ pageParam = 1 }) =>
      handleGetShortByUser(user!.id, pageParam, 10),
    getNextPageParam: (lastPage, pages) =>
      pages.length * lastPage.size < lastPage.total
        ? pages.length + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!user && activeTab === "shorts",
  });

  const posts = postsData?.pages.flatMap((p) => p.content) ?? [];
  const shorts = shortsData?.pages.flatMap((p) => p.content) ?? [];

  const [storageList, setStorageList] = useState<StoryStorageResponse[]>([]);

  const [isOpenStorageCreate, setIsOpenStorage] = useState(false);

  const { currentUser } = useUser();

  console.log("USER: ", user);
  console.log("CURRENT-USER: ", currentUser);

  useEffect(() => {
    if (!username) {
      navigate("/unauthorized");
      return;
    }

    const fetchUser = async () => {
      const res = await handleGetUser(username);
      if (res) {
        setUser(res);
        const resStorage = await handleGetStorageByUser(res.id);
        if (resStorage) {
          setStorageList(resStorage);
        }
      } else {
        navigate("/unauthorized");
      }
    };

    fetchUser();
  }, [username]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    if (!postsEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPosts && !isFetchingNextPosts) {
          fetchNextPosts();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(postsEndRef.current);
    return () => observer.disconnect();
  }, [hasNextPosts, isFetchingNextPosts, activeTab]);

  useEffect(() => {
    if (!shortsEndRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextShorts &&
          !isFetchingNextShorts
        ) {
          fetchNextShorts();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(shortsEndRef.current);
    return () => observer.disconnect();
  }, [hasNextShorts, isFetchingNextShorts, activeTab]);

  const getGradientByFollowers = () => {
    if (!user) return "from-blue-400 to-blue-600";
    if (user.followersCount > 10000) return "from-blue-400 to-cyan-400";
    if (user.followersCount > 5000) return "from-blue-400 to-indigo-400";
    if (user.followersCount > 1000) return "from-blue-400 to-blue-500";
    return "from-blue-400 to-blue-600";
  };

  const tabs = [
    { id: "posts" as const, label: "Posts", icon: Grid, query: "posts" },
    { id: "shorts" as const, label: "Shorts", icon: Video, query: "shorts" },
    { id: "saved" as const, label: "Saved", icon: Bookmark, query: "saved" },
  ];

  const visibleTabs =
    currentUser && currentUser.id === user?.id
      ? tabs
      : tabs.filter((tab) => tab.id !== "saved");

  if (!user) return <LoadingSpinner />;

  return (
    <>
      <div className="min-h-screen w-272">
        <div className="fixed inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        </div>
        <div className="relative mx-auto px-4 py-15">
          <div className="relative">
            <div className="flex flex-col md:flex-row items-start gap-8 w-145 mx-auto">
              <div className="relative group">
                <div
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-r ${getGradientByFollowers()} p-0.75 shadow-lg shadow-blue-500/20`}
                >
                  <div className="w-full h-full rounded-full bg-black p-0.5">
                    <img
                      src={user.avatar || assets.profile}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">
                    {user.fullName}
                  </h2>
                  {user.followersCount > 10000 && (
                    <div className="flex items-center gap-1 bg-blue-500/10 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500/30">
                      <Verified className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">
                        Verified
                      </span>
                    </div>
                  )}
                  {user.shortCount > 20 && (
                    <div className="flex items-center gap-1 bg-blue-500/10 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-500/30">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">
                        Top Creator
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-300 max-w-2xl leading-relaxed">
                  {user.bio || "No bio yet"}
                </p>

                <div className="grid grid-cols-4 cursor-pointer gap-3 max-w-lg">
                  <div className="bg-blue-500/5 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30">
                    <Camera className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
                    <div className="text-xl font-bold text-white">
                      {user.postCount}
                    </div>
                    <div className="text-xs text-gray-400">Posts</div>
                  </div>

                  <div className="bg-blue-500/5 cursor-pointer backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30">
                    <Camera className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
                    <div className="text-xl font-bold text-white">
                      {user.shortCount}
                    </div>
                    <div className="text-xs text-gray-400">Shorts</div>
                  </div>

                  <div
                    className="bg-blue-500/5 cursor-pointer backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30"
                    onClick={() => {
                      setIsOpenFollow(true);
                      setFollowRelationType("FOLLOWER");
                    }}
                  >
                    <Heart className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
                    <div className="text-xl font-bold text-white">
                      {user.followersCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>

                  <div
                    className="bg-blue-500/5 cursor-pointer backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30"
                    onClick={() => {
                      setIsOpenFollow(true);
                      setFollowRelationType("FOLLOWING");
                    }}
                  >
                    <MessageCircle className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
                    <div className="text-xl font-bold text-white">
                      {user.followingCount}
                    </div>
                    <div className="text-xs text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {currentUser && currentUser.id === user.id ? (
              <div className="flex flex-wrap gap-3 mt-8 w-145 mx-auto">
                <button
                  className="flex-1 min-w-30 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                  onClick={() => navigate("/account/edit")}
                >
                  <Pencil className="w-4 h-4" />
                  Edit profile
                </button>
                <button
                  onClick={() => navigate("/storage")}
                  className="flex-1 min-w-30 bg-blue-500/10 text-blue-400 font-semibold py-3 px-6 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30"
                >
                  <Archive className="w-4 h-4" />
                  View storage
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 w-145 mx-auto mt-8">
                <button className="flex-1 min-w-30 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                  <Zap className="w-4 h-4" />
                  Follow
                </button>
                <button className="flex-1 min-w-30 bg-blue-500/10 text-blue-400 font-semibold py-3 px-6 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            )}

            <div className="w-145 mx-auto mt-5 flex gap-3">
              {storageList.map((storage) => (
                <div key={storage.id}>
                  <div
                    className="relative w-fit cursor-pointer"
                    onClick={() => navigate(`/stories/highlight/${storage.id}`)}
                  >
                    <div className="rounded-full p-0.5 bg-linear-to-tr from-blue-400 via-cyan-500 to-indigo-600">
                      <div className="rounded-full bg-gray-900 transition-all duration-300 hover:scale-105">
                        <video
                          src={storage.url}
                          className="w-20 h-20 object-cover rounded-full"
                          muted
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-3 hover:text-blue-400 transition-colors">
                    {storage.name}
                  </p>
                </div>
              ))}
              {currentUser && currentUser.id === user.id && (
                <div>
                  <div
                    className="relative w-fit cursor-pointer"
                    onClick={() => setIsOpenStorage(true)}
                  >
                    <div className="rounded-full p-0.5 bg-linear-to-tr from-blue-400 via-cyan-500 to-indigo-600">
                      <div className="rounded-full bg-gray-900 p-6 transition-all duration-300 hover:scale-105">
                        <Plus
                          size={28}
                          className="text-gray-300 hover:text-blue-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-3 hover:text-blue-400 transition-colors">
                    New
                  </p>
                </div>
              )}
            </div>
            <div className="mt-10 w-full border-b border-gray-700">
              <div className="flex border-b border-blue-500/20 w-145 mx-auto">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 relative py-3 text-sm font-medium transition-all duration-200
                        flex items-center justify-center gap-2 rounded-t-lg
                        ${
                          isActive
                            ? "text-blue-400 bg-blue-500/10"
                            : "text-gray-400 hover:text-gray-300 hover:bg-blue-500/5"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "posts" && (
                <div className="space-y-4">
                  {posts.length === 0 && !postsLoading ? (
                    <div className="text-center text-gray-400 py-12">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No posts yet</p>
                    </div>
                  ) : (
                    <>
                      {posts.map((post) => (
                        <UserComponent data={post} key={post.id} />
                      ))}
                      <div
                        ref={postsEndRef}
                        className="py-2 flex justify-center"
                      >
                        {isFetchingNextPosts && <LoadingSpinner />}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "shorts" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shorts.length === 0 && !shortsLoading ? (
                    <div className="col-span-full text-center text-gray-400 py-12">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No shorts yet</p>
                    </div>
                  ) : (
                    <>
                      {shorts.map((short) => (
                        <UserComponent key={short.id} data={short} />
                      ))}
                      <div
                        ref={shortsEndRef}
                        className="col-span-full py-2 flex justify-center"
                      >
                        {isFetchingNextShorts && <LoadingSpinner />}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "saved" && currentUser?.id === user.id && (
                <div className="text-center text-gray-400 py-12">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Saved content will be displayed here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <FollowPopUp
        userId={user.id}
        open={isOpenFollow}
        followRelation={followRelationType!}
        onClose={() => setIsOpenFollow(false)}
      />
      <StoryListPopUp
        open={isOpenStorageCreate}
        onClose={() => setIsOpenStorage(false)}
      />
    </>
  );
};

export default UserPage;
