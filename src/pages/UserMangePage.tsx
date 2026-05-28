import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Loader2,
  Shield,
  Users,
  Ban,
  CheckCircle,
  MoreVertical,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  handleSearchUserWithRole,
  handleUpdateUserStatus,
  handleUpdateUserRole,
} from "../api/user.api";
import type { UserStatusSummaryType } from "../types/api/user.type";
import useDebounce from "../hooks/useDebounce";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { toast } from "sonner";
import { UserRole } from "../constants/userRole.enum";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import assets from "../assets";
import { UserStatus } from "../constants/userStatus";
import { useTranslation } from "../hooks/useTranslation";

const UserManagePage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.CLIENT);
  const [users, setUsers] = useState<UserStatusSummaryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("keyword") || "",
  );

  const BAN_DURATIONS = [
    { label: t("days_ago", { count: "7" }), days: 7 },
    { label: "30 days", days: 30 },
    { label: "90 days", days: 90 },
    { label: "180 days", days: 180 },
    { label: t("forever"), days: null },
  ];

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<UserStatusSummaryType | null>(null);
  const [pendingAction, setPendingAction] = useState<"ACTIVATE" | "DELETE">(
    "ACTIVATE",
  );
  const [selectedBanDays, setSelectedBanDays] = useState<number | null>(7);

  const debouncedSearch = useDebounce(searchInput, 500);
  const pageSize = 12;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await handleSearchUserWithRole(
        activeTab,
        currentPage - 1,
        pageSize,
        debouncedSearch,
      );
      setUsers(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, debouncedSearch]);

  const updateURLParams = (page: number, keyword: string) => {
    const params: Record<string, string> = {};
    if (page > 1) params.page = page.toString();
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURLParams(newPage, debouncedSearch);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
    updateURLParams(1, value);
  };

  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchInput("");
    setSearchParams({});
  };

  const openConfirmDialog = (
    user: UserStatusSummaryType,
    action: "ACTIVATE" | "DELETE",
  ) => {
    setSelectedUser(user);
    setPendingAction(action);
    setIsConfirmDialogOpen(true);
  };

  const openBanDialog = (user: UserStatusSummaryType) => {
    setSelectedUser(user);
    setSelectedBanDays(7);
    setIsBanDialogOpen(true);
  };

  const openRoleDialog = (user: UserStatusSummaryType) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    try {
      const bannedUntil = selectedBanDays
        ? new Date(Date.now() + selectedBanDays * 86400000)
            .toISOString()
            .split("T")[0]
        : undefined;

      const result = await handleUpdateUserStatus(
        selectedUser.id,
        UserStatus.BANNED,
        bannedUntil,
      );

      if (result?.success === false) {
        toast.error(result.message || "Ban failed");
      } else {
        const label = selectedBanDays
          ? `${selectedBanDays} days`
          : t("forever");
        toast.success(
          t("ban_success", {
            username: selectedUser.username,
            duration: label,
          }),
        );
        await fetchUsers();
      }
    } catch (error) {
      toast.error(t("failed_ban_user"));
    } finally {
      setIsBanDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    try {
      let newStatus: UserStatus;
      let successMessage: string;

      switch (pendingAction) {
        case "ACTIVATE":
          newStatus = UserStatus.ACTIVE;
          successMessage = t("activate_success", {
            username: selectedUser.username,
          });
          break;
        case "DELETE":
          newStatus = UserStatus.DELETED;
          successMessage = t("delete_success", {
            username: selectedUser.username,
          });
          break;
        default:
          toast.error(t("invalid_action"));
          setIsConfirmDialogOpen(false);
          return;
      }

      const result = await handleUpdateUserStatus(selectedUser.id, newStatus);
      if (result?.success === false) {
        toast.error(result.message || "Update failed");
      } else {
        toast.success(successMessage);
        await fetchUsers();
      }
    } catch (error) {
      toast.error(t("failed_update_status"));
    } finally {
      setIsConfirmDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateRole = async (role: UserRole) => {
    if (!selectedUser || !role) return;
    try {
      const result = await handleUpdateUserRole(selectedUser.id, role);
      if (result?.success === false) {
        toast.error(result.message || "Failed to update role");
      } else {
        const newRoleLabel =
          role === UserRole.MODERATOR ? t("moderators") : t("clients");
        toast.success(
          t("role_change_success", {
            username: selectedUser.username,
            role: newRoleLabel,
          }),
        );
        await fetchUsers();
        if (role !== activeTab) handleTabChange(role);
      }
    } catch (error) {
      toast.error(t("failed_update_role"));
    } finally {
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const getConfirmDialogMessage = () => {
    const name = selectedUser?.fullName || selectedUser?.username || "";
    switch (pendingAction) {
      case "ACTIVATE":
        return t("confirm_activate", { name });
      case "DELETE":
        return t("confirm_delete", { name });
      default:
        return "";
    }
  };

  const getConfirmDialogTitle = () => {
    switch (pendingAction) {
      case "ACTIVATE":
        return t("activate_user");
      case "DELETE":
        return t("delete_user");
      default:
        return t("confirm_action");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> {t("status_active")}
          </span>
        );
      case "BANNED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <Ban className="w-3 h-3" /> {t("status_banned")}
          </span>
        );
      case "DELETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
            <Trash2 className="w-3 h-3" /> {t("status_deleted")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
            {status}
          </span>
        );
    }
  };

  const getAvailableActions = (userStatus: string) => {
    switch (userStatus) {
      case "ACTIVE":
        return [
          {
            action: "BAN" as const,
            label: t("action_ban"),
            icon: <Ban size={14} />,
            className: "text-red-400 hover:bg-red-500/10",
          },
          {
            action: "DELETE" as const,
            label: t("action_delete"),
            icon: <Trash2 size={14} />,
            className: "text-red-400 hover:bg-red-500/10",
          },
        ];
      case "BANNED":
        return [
          {
            action: "ACTIVATE" as const,
            label: t("action_activate"),
            icon: <CheckCircle size={14} />,
            className: "text-emerald-400 hover:bg-emerald-500/10",
          },
          {
            action: "DELETE" as const,
            label: t("action_delete"),
            icon: <Trash2 size={14} />,
            className: "text-red-400 hover:bg-red-500/10",
          },
        ];
      case "DELETED":
        return [];
      default:
        return [
          {
            action: "ACTIVATE" as const,
            label: t("action_activate"),
            icon: <CheckCircle size={14} />,
            className: "text-emerald-400 hover:bg-emerald-500/10",
          },
          {
            action: "DELETE" as const,
            label: t("action_delete"),
            icon: <Trash2 size={14} />,
            className: "text-red-400 hover:bg-red-500/10",
          },
        ];
    }
  };

  const tabs = [
    {
      role: UserRole.CLIENT,
      label: t("clients"),
      icon: <Users className="w-4 h-4" />,
    },
    {
      role: UserRole.MODERATOR,
      label: t("moderators"),
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-zinc-900 p-3 sm:p-4 md:p-6 w-full">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {t("user_management")}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {t("user_management_subtitle")}
            </p>
          </div>

          <div className="flex gap-0 mb-4 sm:mb-6 border-b border-neutral-800">
            {tabs.map((tab) => (
              <button
                key={tab.role}
                onClick={() => handleTabChange(tab.role)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 cursor-pointer text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.role
                    ? "text-blue-500 border-blue-500"
                    : "text-neutral-400 border-transparent hover:text-neutral-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === UserRole.MODERATOR
                  ? t("search_moderator")
                  : t("search_client")
              }
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-neutral-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-neutral-500">
              {activeTab === UserRole.MODERATOR
                ? t("total_moderators")
                : t("total_clients")}
              : <span className="text-white font-medium">{totalElements}</span>
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-neutral-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-2">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-700" />
              <p className="text-neutral-500 text-sm">{t("no_users_found")}</p>
              <p className="text-xs text-neutral-600">
                {t("try_changing_keyword")}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {users.map((user) => {
                  const availableActions = getAvailableActions(user.status);
                  const newRole =
                    activeTab === UserRole.MODERATOR
                      ? UserRole.CLIENT
                      : UserRole.MODERATOR;
                  const newRoleLabel =
                    newRole === UserRole.MODERATOR ? "Moderator" : "Client";

                  return (
                    <div
                      key={user.id}
                      className="bg-neutral-900 cursor-pointer border border-neutral-800 rounded-xl p-3 sm:p-4 hover:border-neutral-700 transition-all duration-200 hover:shadow-lg"
                      onClick={() => navigate(`/user/${user.username}`)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <img
                          src={user.avatar || assets.profile}
                          alt={user.username}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-neutral-600 truncate">
                          ID: {user.id}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {getStatusBadge(user.status)}

                        <Menu as="div" className="relative">
                          <MenuButton
                            className="p-1.5 bg-neutral-800 cursor-pointer rounded-lg hover:bg-neutral-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical
                              size={14}
                              className="text-neutral-400"
                            />
                          </MenuButton>
                          <MenuItems
                            transition
                            anchor="bottom end"
                            className="w-44 bg-neutral-900 origin-top-right rounded-xl border border-neutral-800 shadow-lg p-1 z-50 focus:outline-none"
                          >
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRoleDialog(user);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    focus
                                      ? "bg-neutral-800 text-white"
                                      : "text-neutral-300 hover:bg-neutral-800"
                                  }`}
                                >
                                  <RefreshCw size={14} />
                                  <span>
                                    {t("change_to", { role: newRoleLabel })}
                                  </span>
                                </button>
                              )}
                            </MenuItem>

                            {availableActions.length > 0 && (
                              <div className="my-1 border-t border-neutral-800" />
                            )}

                            {availableActions.map((action) => (
                              <MenuItem key={action.action}>
                                {({ focus }) => (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (action.action === "BAN") {
                                        openBanDialog(user);
                                      } else {
                                        openConfirmDialog(user, action.action);
                                      }
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${action.className} ${focus ? "bg-opacity-20" : ""}`}
                                  >
                                    {action.icon}
                                    <span>{action.label}</span>
                                  </button>
                                )}
                              </MenuItem>
                            ))}
                          </MenuItems>
                        </Menu>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-4 sm:mt-6">
                <Pagination
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  totalPages={totalPages}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {isBanDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-white font-semibold text-base mb-1">
              <h2>{t("ban_user_title")}</h2>
            </h2>
            <p className="text-neutral-400 text-sm mb-4">
              {t("ban_user_message")}{" "}
              <span className="text-white font-medium">
                {selectedUser?.fullName || selectedUser?.username}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {BAN_DURATIONS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setSelectedBanDays(item.days)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium cursor-pointer border transition-all ${
                    selectedBanDays === item.days
                      ? "bg-red-500/20 border-red-500 text-red-400"
                      : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600"
                  } ${item.days === null ? "col-span-2" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsBanDialogOpen(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2 cursor-pointer rounded-lg border border-neutral-700 text-neutral-300 text-sm hover:bg-neutral-800 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleBanUser}
                className="flex-1 py-2 cursor-pointer rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-sm hover:bg-red-500/30 transition-colors font-medium"
              >
                {t("ban_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUpdateStatus}
        title={getConfirmDialogTitle()}
        message={getConfirmDialogMessage()}
      />

      <ConfirmDialog
        open={isRoleDialogOpen}
        onClose={() => {
          setIsRoleDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          const newRole =
            activeTab === UserRole.MODERATOR
              ? UserRole.CLIENT
              : UserRole.MODERATOR;
          handleUpdateRole(newRole);
        }}
        title={t("change_role_title")}
        message={t("change_role_message", {
          name: selectedUser?.fullName || selectedUser?.username || "",
          from:
            activeTab === UserRole.MODERATOR ? t("moderators") : t("clients"),
          to: activeTab === UserRole.MODERATOR ? t("clients") : t("moderators"),
        })}
      />
    </>
  );
};

export default UserManagePage;
