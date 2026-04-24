export type TabUserType = "posts" | "shorts" | "saved" | "reposted";

export const TABS = [
  { id: "posts" as const, label: "Posts", icon: "Grid", query: "posts" },
  { id: "shorts" as const, label: "Shorts", icon: "Video", query: "shorts" },
  { id: "saved" as const, label: "Saved", icon: "Bookmark", query: "saved" },
  {
    id: "reposted" as const,
    label: "Repost",
    icon: "Repeat2",
    query: "reposted",
  },
];
