import { useState } from "react";
import { Settings, User, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user.context";
import ConfirmDialog from "../components/ConfirmDialog";

function SettingLayout() {
  const [activeItem, setActiveItem] = useState("Profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialog, setIsLogoutDialog] = useState(false);
  const { onLogout } = useUser();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: "General",
      items: [{ id: "Profile", icon: User, label: "Profile" }],
    },
    {
      title: "Support",
      items: [
        { id: "Help", icon: HelpCircle, label: "Help & Support" },
        {
          id: "Logout",
          icon: LogOut,
          label: "Log out",
          danger: true,
          onclick: () => setIsLogoutDialog(true),
        },
      ],
    },
  ];

  const handleSelect = (item: any) => {
    setActiveItem(item.id);
    setIsSidebarOpen(false);
    item.onclick?.();
  };

  const SidebarContent = () => (
    <>
      <div className="pt-10 pb-3 px-9">
        <h1 className="text-xl font-bold text-white">Settings</h1>
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
      </nav>
      <ConfirmDialog
        message="Do you want logout?"
        onClose={() => setIsLogoutDialog(false)}
        onConfirm={() => onLogout(() => navigate("/login"))}
        open={isLogoutDialog}
        title="Logout confirm"
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
