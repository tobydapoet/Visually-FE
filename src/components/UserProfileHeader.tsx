import { Verified, Award, Heart, MessageCircle, Camera } from "lucide-react";
import type { UserType } from "../types/api/user.type";
import assets from "../assets";

type Props = {
  user: UserType;
  gradientClass: string;
  onFollowerClick: () => void;
  onFollowingClick: () => void;
};

export const UserProfileHeader: React.FC<Props> = ({
  user,
  gradientClass,
  onFollowerClick,
  onFollowingClick,
}) => {
  console.log("USSER: ", user);
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 w-145 mx-auto">
      <div className="relative group">
        <div
          className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-r ${gradientClass} p-0.75 shadow-lg shadow-blue-500/20`}
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
          <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
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
            <div className="text-xl font-bold text-white">{user.postCount}</div>
            <div className="text-xs text-gray-400">Posts</div>
          </div>

          <div className="bg-blue-500/5 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30">
            <Camera className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
            <div className="text-xl font-bold text-white">
              {user.shortCount}
            </div>
            <div className="text-xs text-gray-400">Shorts</div>
          </div>

          <div
            className="bg-blue-500/5 cursor-pointer backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30"
            onClick={onFollowerClick}
          >
            <Heart className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
            <div className="text-xl font-bold text-white">
              {user.followersCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>

          <div
            className="bg-blue-500/5 cursor-pointer backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30"
            onClick={onFollowingClick}
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
  );
};
