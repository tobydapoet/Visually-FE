import { Skeleton } from "@mui/material";
import type { UserSummaryType } from "../types/api/user.type";
import assets from "../assets";

interface AdUserListProps {
  users: UserSummaryType[];
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  selectedUserId?: string;
  onSelectUser?: (user: UserSummaryType) => void;
  horizontal?: boolean;
}

const AdUserList = ({
  users,
  isFetchingNextPage,
  selectedUserId,
  horizontal,
  onSelectUser,
}: AdUserListProps) => {
  return (
    <div
      className={
        horizontal
          ? "flex md:flex-col gap-3 p-3 md:p-4 overflow-x-auto md:overflow-x-visible"
          : "flex flex-col gap-3 p-4"
      }
    >
      <div className="flex flex-col gap-3 w-60 cursor-pointer">
        {users.map((user: UserSummaryType) => (
          <div
            key={user.id}
            onClick={() => onSelectUser?.(user)}
            className={`bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-zinc-700 hover:border-zinc-600
                cursor-pointer ${
                  selectedUserId === user.id
                    ? "border-blue-500 bg-zinc-700"
                    : "border-zinc-700 hover:border-zinc-600"
                }

                ${horizontal ? "min-w-[160px] md:min-w-0" : ""}
                
                `}
          >
            <div className="flex items-center gap-2">
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                className="shrink-0"
                sx={{ display: "none" }}
              />
              <div className="shrink-0">
                <img
                  src={user.avatar || assets.profile}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">
                  {user.fullName}
                </h3>
                <p className="text-gray-400 text-xs">@{user.username}</p>
              </div>
            </div>
          </div>
        ))}

        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
            >
              <div className="flex items-center gap-2">
                <Skeleton
                  variant="circular"
                  width={32}
                  height={32}
                  sx={{ bgcolor: "zinc.700", flexShrink: 0 }}
                />
                <div className="flex-1">
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={20}
                    sx={{ bgcolor: "#3f3f46" }}
                  />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={16}
                    sx={{ bgcolor: "#3f3f46" }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdUserList;
