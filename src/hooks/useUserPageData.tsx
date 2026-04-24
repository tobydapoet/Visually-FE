import { useInfiniteQuery } from "@tanstack/react-query";
import { handleGetPostByUser, handleGetRepostByUser } from "../api/post.api";
import { handleGetShortByUser } from "../api/short.api";
import type { UserType } from "../types/api/user.type";
import type { TabUserType } from "../constants/userPage.type";

export const useUserPageData = (
  user: UserType | null,
  activeTab: TabUserType,
) => {
  const postsQuery = useInfiniteQuery({
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

  const shortsQuery = useInfiniteQuery({
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

  const repostedQuery = useInfiniteQuery({
    queryKey: ["reposted", user?.id],
    queryFn: ({ pageParam = 1 }) =>
      handleGetRepostByUser(user!.id, pageParam, 10),
    getNextPageParam: (lastPage, pages) =>
      pages.length * lastPage.size < lastPage.total
        ? pages.length + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!user && activeTab === "reposted",
  });

  return {
    posts: postsQuery.data?.pages.flatMap((p) => p.content) ?? [],
    shorts: shortsQuery.data?.pages.flatMap((p) => p.content) ?? [],
    reposted: repostedQuery.data?.pages.flatMap((p) => p.content) ?? [],
    postsQuery,
    shortsQuery,
    repostedQuery,
  };
};
