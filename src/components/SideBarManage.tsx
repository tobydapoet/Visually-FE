import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Megaphone,
  ChevronDown,
  Film,
  FileText,
  Music,
} from "lucide-react";
import { useUser } from "../contexts/user.context";
import { NavLink, useNavigate, useMatch } from "react-router-dom";
import assets from "../assets";

type ChildMenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: ChildMenuItem[];
};

const SidebarManage: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    content: true,
  });

  const { currentUser, loading } = useUser();
  const navigate = useNavigate();

  const isContentActive = useMatch("/content/*");

  useEffect(() => {
    if (!loading && currentUser === null) {
      navigate("/login");
    }
  }, [currentUser, loading]);

  const menuItems: MenuItem[] = [
    {
      id: "content",
      label: "Content",
      icon: <LayoutDashboard size={20} />,
      children: [
        {
          id: "short",
          label: "Short",
          icon: <Film size={18} />,
          path: "/content/short",
        },
        {
          id: "post",
          label: "Post",
          icon: <FileText size={18} />,
          path: "/content/post",
        },
      ],
    },
    {
      id: "report",
      label: "Report",
      icon: <BarChart3 size={20} />,
      path: "/report",
    },
    {
      id: "user",
      label: "User",
      icon: <Users size={20} />,
      path: "/user",
    },
    {
      id: "advertisement",
      label: "Advertisement",
      icon: <Megaphone size={20} />,
      path: "/advertisement",
    },
    {
      id: "music",
      label: "Music Library",
      icon: <Music size={20} />,
      path: "/music_library",
    },
  ];

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  return (
    <div className="w-64 h-screen bg-neutral-950 text-white flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-lg">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      !!isContentActive || openMenus[item.id]
                        ? "bg-blue-500 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <span>{item.icon}</span>
                      <span className="ml-3 text-sm font-medium">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`transform transition-transform duration-300 ${openMenus[item.id] ? "rotate-180" : ""}`}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openMenus[item.id]
                        ? "max-h-40 opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="ml-6 space-y-1">
                      {item.children.map((child, index) => (
                        <li
                          key={child.id}
                          className={`transform transition-all duration-300 ${
                            openMenus[item.id]
                              ? "translate-y-0 opacity-100"
                              : "-translate-y-2 opacity-0"
                          }`}
                          style={{
                            transitionDelay: openMenus[item.id]
                              ? `${index * 50}ms`
                              : "0ms",
                          }}
                        >
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-blue-500 text-white"
                                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              }`
                            }
                          >
                            {child.icon}
                            <span className="ml-3 text-sm">{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/account/edit`)}
        >
          <div className="w-8 h-8 bg-zinc-700 rounded-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={currentUser?.avatar || assets.profile}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentUser?.fullName}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {currentUser?.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarManage;
