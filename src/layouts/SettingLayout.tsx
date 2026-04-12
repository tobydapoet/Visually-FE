import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/user.context";

function SettingLayout() {
  const [activeItem, setActiveItem] = useState("Profile");
  const { onLogout } = useUser();
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: "General",
      items: [
        { id: "Profile", icon: User, label: "Profile" },
        { id: "Account", icon: Settings, label: "Account" },
        { id: "Notifications", icon: Bell, label: "Notifications" },
      ],
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
          onclick: () =>
            onLogout(() => {
              navigate("/login");
            }),
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-gray-200 w-full">
      <div className="w-80 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        <div className="pt-10 pb-3 px-9 border-neutral-800">
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
                        onClick={() => {
                          setActiveItem(item.id);
                          item.onclick?.();
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-3 rounded-lg
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
                            className={`
                              transition-colors
                              ${
                                isActive
                                  ? "text-white"
                                  : item.danger
                                    ? "group-hover:text-red-500"
                                    : "text-gray-500 group-hover:text-gray-300"
                              }
                            `}
                          />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                        {!item.danger && (
                          <ChevronRight
                            size={16}
                            className={`
                              transition-all
                              ${
                                isActive
                                  ? "opacity-100 translate-x-0"
                                  : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                              }
                            `}
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
      </div>

      <main className="flex-1 overflow-y-auto bg-neutral-950">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{activeItem}</h2>
            <div>
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingLayout;
