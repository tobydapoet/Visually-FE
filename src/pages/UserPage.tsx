import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { UserType } from "../types/api/user.type";
import { handleGetUser } from "../api/user.api";

import LoadingSpinner from "../components/LoadingSpinner";
import {
  MessageCircle,
  Pencil,
  Archive,
  Grid,
  Video,
  Bookmark,
  Plus,
  Repeat2,
  UserPlus,
  UserMinus,
  Ban,
} from "lucide-react";
import { useUser } from "../contexts/user.context";
import type { FollowRelation } from "../constants/followRelation.enum";
import FollowPopUp from "../components/FollowPopUp";
import StoryListPopUp from "../components/StoryListPopUp";
import type { StoryStorageResponse } from "../types/api/storage.type";
import { handleGetStorageByUser } from "../api/story.api";
import type { TabUserType } from "../constants/userPage.type";
import { UserProfileTabs } from "../components/UserProfileTabs";
import { UserProfileHeader } from "../components/UserProfileHeader";
import { useUserPageData } from "../hooks/useUserPageData";
import {
  handleBlock,
  handleFollow,
  handleUnblock,
  handleUnfollow,
} from "../api/follow.api";
import { handleGetConversationWithUser } from "../api/message.api";
import ConfirmDialog from "../components/ConfirmDialog";

const UserPage: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [isOpenFollow, setIsOpenFollow] = useState(false);
  const [followRelationType, setFollowRelationType] =
    useState<FollowRelation>();
  const [storageList, setStorageList] = useState<StoryStorageResponse[]>([]);
  const [isOpenStorageCreate, setIsOpenStorage] = useState(false);
  const [isOpenBlockDialog, setIsOpenBlockDialog] = useState(false);
  const { currentUser } = useUser();
  const [isOpenUnBlock, setIsOpenUnblock] = useState(user?.isBlocked || false);

  const [activeTab, setActiveTab] = useState<TabUserType>(() => {
    const tab = searchParams.get("tab") as TabUserType;
    return tab && ["posts", "shorts", "saved", "reposted"].includes(tab)
      ? tab
      : "posts";
  });

  const { posts, shorts, reposted, postsQuery, shortsQuery, repostedQuery } =
    useUserPageData(user, activeTab);

  const getGradientByFollowers = () => {
    if (!user) return "from-blue-400 to-blue-600";
    if (user.followersCount > 10000) return "from-blue-400 to-cyan-400";
    if (user.followersCount > 5000) return "from-blue-400 to-indigo-400";
    if (user.followersCount > 1000) return "from-blue-400 to-blue-500";
    return "from-blue-400 to-blue-600";
  };

  const tabs = [
    { id: "posts" as const, label: "Posts", icon: Grid },
    { id: "shorts" as const, label: "Shorts", icon: Video },
    { id: "saved" as const, label: "Saved", icon: Bookmark },
    { id: "reposted" as const, label: "Repost", icon: Repeat2 },
  ];

  const visibleTabs =
    currentUser && currentUser.id === user?.id
      ? tabs
      : tabs.filter((tab) => tab.id !== "saved");

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
        if (resStorage) setStorageList(resStorage);
      } else {
        navigate("/unauthorized");
      }
    };
    fetchUser();
  }, [username]);

  useEffect(() => {
    if (user?.isBlocked) {
      setIsOpenUnblock(true);
    }
  }, [user?.isBlocked]);

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab]);

  if (!user) return <LoadingSpinner />;

  const isOwner = currentUser?.id === user.id;

  const onFollow = async () => {
    await handleFollow(user.id);
    setUser((prev) => (prev ? { ...prev, isFollowed: true } : prev));
  };

  const onUnfollow = async () => {
    await handleUnfollow(user.id);
    setUser((prev) => (prev ? { ...prev, isFollowed: false } : prev));
  };

  return (
    <>
      <div className="min-h-screen w-272">
        <div className="fixed inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
        </div>
        {user.isBlocked && (
          <ConfirmDialog
            open={isOpenUnBlock}
            message={`@${user.username} Do you want to unblock them?`}
            onConfirm={async () => {
              await handleUnblock(user.id);
              setUser((prev) => (prev ? { ...prev, isBlocked: false } : prev));
            }}
            onConfirmClose={() => setIsOpenUnblock(false)}
            onClose={() => navigate(-1)}
            title="Unblock user"
            cancelText="Go back"
          />
        )}

        <div className="relative mx-auto px-4 py-15">
          <div className="relative">
            <UserProfileHeader
              user={user}
              gradientClass={getGradientByFollowers()}
              onFollowerClick={() => {
                setIsOpenFollow(true);
                setFollowRelationType("FOLLOWER");
              }}
              onFollowingClick={() => {
                setIsOpenFollow(true);
                setFollowRelationType("FOLLOWING");
              }}
            />

            {currentUser &&
              currentUser.role === "CLIENT" &&
              (isOwner ? (
                <div className="flex flex-wrap gap-3 mt-8 w-145 mx-auto">
                  <button
                    className="flex-1 min-w-30 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                    onClick={() => navigate("/account/edit")}
                  >
                    <Pencil className="w-4 h-4" /> Edit profile
                  </button>

                  <button
                    onClick={() => navigate("/storage")}
                    className="flex-1 min-w-30 bg-blue-500/10 text-blue-400 font-semibold py-3 px-6 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30"
                  >
                    <Archive className="w-4 h-4" /> View storage
                  </button>
                </div>
              ) : (
                <div>
                  {!user.isFollowed ? (
                    <div className="flex flex-wrap gap-3 w-145 mx-auto mt-8">
                      <button
                        onClick={() => onFollow()}
                        className="cursor-pointer flex-1 w-145 min-w-30 bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                      >
                        <UserPlus className="w-4 h-4" /> Follow
                      </button>
                      <button
                        onClick={() => setIsOpenBlockDialog(true)}
                        className="cursor-pointer bg-blue-500/10 text-red-400 font-semibold p-4 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 w-145 mx-auto mt-8">
                      <button
                        onClick={() => onUnfollow()}
                        className="cursor-pointer flex-1 min-w-30 bg-blue-500/10 text-blue-400 font-semibold py-3 px-6 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30"
                      >
                        <UserMinus className="w-4 h-4" /> Unfollow
                      </button>
                      <button
                        onClick={async () => {
                          const res = await handleGetConversationWithUser(
                            user.id,
                          );
                          navigate(`/inbox/${res.id}`);
                        }}
                        className="cursor-pointer flex-1 min-w-30 bg-blue-500/10 text-blue-400 font-semibold py-3 px-6 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30"
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </button>
                      <button
                        onClick={() => setIsOpenBlockDialog(true)}
                        className="cursor-pointer bg-blue-500/10 text-red-400 font-semibold p-4 rounded-xl hover:bg-blue-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-blue-500/30"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

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
              {isOwner && (
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

            <UserProfileTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              visibleTabs={visibleTabs}
              posts={posts}
              shorts={shorts}
              reposted={reposted}
              postsQuery={postsQuery}
              shortsQuery={shortsQuery}
              repostedQuery={repostedQuery}
              isOwner={isOwner}
            />
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
      <ConfirmDialog
        open={isOpenBlockDialog}
        onClose={() => setIsOpenBlockDialog(false)}
        onConfirm={async () => {
          await handleBlock(user.id);
          window.location.reload();
        }}
        message="Du you want to block this user?"
        title="Block user"
      />
    </>
  );
};

export default UserPage;
