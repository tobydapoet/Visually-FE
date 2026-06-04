import { useState } from "react";
import { Settings, User, LogOut, ChevronRight, Globe } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user.context";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTranslation } from "../hooks/useTranslation";

type MenuItem = {
  id: string;
  icon: any;
  label: string;
  danger?: boolean;
  onclick?: () => void;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

function SettingLayout() {
  const [activeItem, setActiveItem] = useState("Profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialog, setIsLogoutDialog] = useState(false);
  const { onLogout } = useUser();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  const menuGroups: MenuGroup[] = [
    {
      title: t("general"),
      items: [{ id: "Profile", icon: User, label: t("profile") }],
    },
    {
      title: t("support"),
      items: [
        {
          id: "Logout",
          icon: LogOut,
          label: t("logout"),
          danger: true,
          onclick: () => setIsLogoutDialog(true),
        },
      ],
    },
  ];

  const handleSelect = (item: MenuItem) => {
    setIsSidebarOpen(false);

    if (!item.onclick) {
      setActiveItem(item.id);
    }

    item.onclick?.();
  };

  const handleChangeLang = (newLang: string) => {
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  const SidebarContent = () => (
    <>
      <div className="pt-10 pb-3 px-9">
        <h1 className="text-xl font-bold text-white">{t("settings")}</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSelect(item)}
                      className={`
                        w-full flex items-center justify-between cursor-pointer px-3 py-3 rounded-lg
                        transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : item.danger
                              ? "hover:bg-red-500/10 text-gray-300 hover:text-red-500"
                              : "hover:bg-neutral-800 text-gray-300 hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={`transition-colors ${
                            isActive
                              ? "text-white"
                              : item.danger
                                ? "group-hover:text-red-500"
                                : "text-gray-500 group-hover:text-gray-300"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      {!item.danger && (
                        <ChevronRight
                          size={16}
                          className={`transition-all ${
                            isActive
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                          }`}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Language
          </h3>
          <div className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-neutral-800 transition-all">
            <Globe size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-300 flex-1">
              {t("language")}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleChangeLang("en")}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  lang === "en"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-700 text-gray-400 hover:bg-neutral-600"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleChangeLang("vi")}
                className={`px-2 py-1 rounded text-xs cursor-pointer font-medium transition-colors ${
                  lang === "vi"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-700 text-gray-400 hover:bg-neutral-600"
                }`}
              >
                VI
              </button>
            </div>
          </div>
        </div>
      </nav>
      <ConfirmDialog
        message={t("logout_confirm_message")}
        title={t("logout_confirm_title")}
        onClose={() => setIsLogoutDialog(false)}
        onConfirm={() => onLogout(() => navigate("/login"))}
        open={isLogoutDialog}
      />
    </>
  );

  return (
    <div className="flex h-screen bg-zinc-900 text-gray-200 w-full relative">
      <div className="hidden md:flex w-80 bg-zinc-900 border-r border-neutral-800 flex-col">
        <SidebarContent />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed top-0 left-0 h-full w-72 bg-zinc-900 border-r border-neutral-800
        flex flex-col z-30 transition-transform duration-300 md:hidden
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <SidebarContent />
      </div>

      <main className="flex-1 overflow-y-auto bg-zinc-900">
        <div className="md:hidden flex items-center gap-3 px-4 py-4 border-b border-neutral-800">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Settings size={20} className="text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-white">{activeItem}</h2>
        </div>

        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="mb-8">
            <h2 className="hidden md:block text-3xl font-bold text-white mb-2">
              {activeItem}
            </h2>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
export default SettingLayout;
