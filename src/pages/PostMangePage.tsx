import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import {
  Search,
  Filter,
  Loader2,
  ImageOff,
  User,
  Calendar,
  Hash,
  Ban,
  CheckCircle,
} from "lucide-react";
import {
  ContentStatus,
  type ContentStatus as ContentStatusType,
} from "../constants/contentStatus.enum";
import { ParsedContent } from "../components/ParseContent";
import Pagination from "../components/Pagination";
import ContentPopUp from "../components/ContentPopUp";
import ConfirmDialog from "../components/ConfirmDialog";
import { usePost } from "../contexts/post.context";

const PostManagePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getPostByStatus, postByStatus, updatePostStatus } = usePost();
  const [selectedContentId, setSelectedContentId] = useState<number>(0);
  const [isOpenContetPopUp, setIsOpenContentPopUp] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");
  const statusParam = searchParams.get("status");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam) : 1,
  );
  const [searchInput, setSearchInput] = useState(searchParam || "");
  const [status, setStatus] = useState<ContentStatusType>(
    (statusParam as ContentStatusType) || ContentStatus.ACTIVE,
  );
  const isActive = status === "ACTIVE";
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);
  const pageSize = 10;

  const total = postByStatus?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const posts = postByStatus?.content || [];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      await getPostByStatus(status, currentPage, pageSize, debouncedSearch);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateURLParams = (
    newPage: number,
    newSearch: string,
    newStatus: ContentStatusType,
  ) => {
    const params: Record<string, string> = {};
    params.page = newPage.toString();
    if (newSearch) params.search = newSearch;
    if (newStatus && newStatus !== ContentStatus.ACTIVE)
      params.status = newStatus;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURLParams(newPage, debouncedSearch, status);
  };

  useEffect(() => {
    setCurrentPage(1);
    updateURLParams(1, debouncedSearch, status);
  }, [debouncedSearch, status]);

  const handleStatusChange = (newStatus: ContentStatusType) => {
    setStatus(newStatus);
    setCurrentPage(1);
    setSearchInput("");
    updateURLParams(1, "", newStatus);
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, debouncedSearch, status]);

  const statusOptions = [
    { value: ContentStatus.ACTIVE, label: "Active" },
    { value: ContentStatus.BANNED, label: "Banned" },
  ];

  const getStatusBadgeColor = (statusValue: ContentStatusType) => {
    switch (statusValue) {
      case ContentStatus.ACTIVE:
        return "bg-emerald-600 text-white";
      case ContentStatus.DELETED:
        return "bg-red-600 text-white";
      case ContentStatus.BANNED:
        return "bg-amber-600 text-white";
      default:
        return "bg-neutral-600 text-white";
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-neutral-950 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="rounded-xl">
            <h1 className="text-2xl font-bold text-white mb-4">
              Posts Management
            </h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    status === option.value
                      ? getStatusBadgeColor(option.value)
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by caption, username..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-neutral-500 text-sm"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4 animate-spin" />
              )}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                <thead className="bg-neutral-950 border-b border-neutral-800">
                  <tr>
                    {[
                      { icon: <Hash className="w-3.5 h-3.5" />, label: "ID" },
                      { label: "Thumbnail" },
                      { label: "Caption" },
                      { icon: <User className="w-3.5 h-3.5" />, label: "User" },
                      {
                        icon: <Calendar className="w-3.5 h-3.5" />,
                        label: "Created At",
                      },
                    ].map(({ icon, label }) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1.5">
                          {icon}
                          {label}
                        </div>
                      </th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {loading && posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <Loader2 className="w-7 h-7 animate-spin text-neutral-500 mx-auto mb-2" />
                        <p className="text-neutral-500 text-sm">
                          Loading data...
                        </p>
                      </td>
                    </tr>
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Filter className="w-10 h-10 text-neutral-700" />
                          <p className="text-neutral-400 text-sm">
                            No posts found
                          </p>
                          <p className="text-xs text-neutral-600">
                            Try changing the filter or search keyword
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-neutral-800/50 transition-colors cursor-pointer"
                        onClick={() => {
                          navigate(`/content?contentId=${post.id}&type=POST`);
                        }}
                      >
                        <td className="px-4 py-3 text-sm text-neutral-400 font-medium whitespace-nowrap">
                          #{post.id}
                        </td>
                        <td className="px-4 py-3">
                          {post.thumbnailUrl ? (
                            <img
                              src={post.thumbnailUrl}
                              alt="thumbnail"
                              className="w-14 h-14 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-neutral-800 rounded-lg flex items-center justify-center">
                              <ImageOff className="w-5 h-5 text-neutral-600" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="text-sm text-neutral-300 line-clamp-2">
                            {post.caption && (
                              <ParsedContent
                                caption={post.caption}
                                classname="font-bold"
                                mentions={post.mentions}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {post.avatarUrl ? (
                              <img
                                src={post.avatarUrl}
                                alt={post.username}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-neutral-600" />
                              </div>
                            )}
                            <p className="text-sm text-neutral-300 whitespace-nowrap">
                              {post.username}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-neutral-400">
                            {new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContentId(post.id);
                              setIsOpenDialog(true);
                            }}
                            className="p-1.5 rounded-lg transition-all duration-200 group relative"
                            title="Ban this post"
                          >
                            {status === "ACTIVE" ? (
                              <Ban className="w-5 h-5 cursor-pointer text-red-500 group-hover:text-red-400 transition-colors" />
                            ) : (
                              <CheckCircle className="w-5 h-5 cursor-pointer text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-neutral-500 order-2 sm:order-1">
                Showing{" "}
                <span className="text-neutral-300">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                –{" "}
                <span className="text-neutral-300">
                  {Math.min(currentPage * pageSize, total)}
                </span>{" "}
                of <span className="text-neutral-300">{total}</span> posts
              </p>
              <div className="order-1 sm:order-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContentPopUp
        contentId={selectedContentId}
        type={"POST"}
        onClose={() => setIsOpenContentPopUp(false)}
        open={isOpenContetPopUp}
      />

      <ConfirmDialog
        title={isActive ? "Ban post" : "Unban post"}
        message={
          isActive
            ? `Do you want to ban #${selectedContentId}?`
            : `Do you want to unban #${selectedContentId}?`
        }
        onClose={() => setIsOpenDialog(false)}
        onConfirm={() => {
          const newStatus = isActive ? "BANNED" : "ACTIVE";

          updatePostStatus(selectedContentId, newStatus, () => {
            getPostByStatus(status, currentPage, pageSize, debouncedSearch);
          });
        }}
        open={isOpenDialog}
      />
    </>
  );
};

export default PostManagePage;
