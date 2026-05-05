import assets from "../assets";
import {
  Home,
  SquarePlay,
  Search,
  Bell,
  MessageCircle,
  Plus,
  Play,
  BookPlus,
  SquareStar,
  Megaphone,
} from "lucide-react";
import { useState, Fragment, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { useUser } from "../contexts/user.context";
import { useLocation, useNavigate } from "react-router-dom";
import PostPopUp from "./PostPopUp";
import ShortPopUp from "./ShortPopUp";
import StoryPopUp from "./StoryPopUp";
import SearchPopup from "../pages/SearchPopup";
import NotificationPopUp from "../pages/NotificationPopUp";
import { useNotification } from "../contexts/notification.context";
import { useMessage } from "../contexts/message.context";

const SideBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openShortPopUp, setOpenShortPopUp] = useState(false);
  const [openStoryPopUp, setOpenStoryPopUp] = useState(false);
  const [openPostPopUp, setOpenPostPopUp] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const location = useLocation();
  const { unreadCount } = useNotification();
  const { unreadConversationCount } = useMessage();
  const { currentUser, loading } = useUser();

  const getActiveFromPath = (pathname: string) => {
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/reels")) return "Shorts";
    if (pathname.startsWith("/inbox")) return "Messages";
    if (pathname.startsWith("/ad")) return "Boosted";
    if (pathname.startsWith("/search")) return "Search";
    if (currentUser && pathname.startsWith(`/${currentUser.username}`))
      return "Profile";
    return "Home";
  };

  const [activeItem, setActiveItem] = useState(() =>
    getActiveFromPath(location.pathname),
  );

  useEffect(() => {
    const active = getActiveFromPath(location.pathname);
    if (active !== "Search" || !isOpenSearch) {
      setActiveItem(active);
    }
  }, [location.pathname]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navigate = useNavigate();
  const expanded = isExpanded || menuOpen;

  const menuItems = [
    { id: "Home", icon: Home, label: "Home", hasFill: true, link: "/" },
    { id: "Shorts", icon: SquarePlay, label: "Reels", link: "/reels" },
    { id: "Messages", icon: MessageCircle, label: "Messages", link: "/inbox" },
    { id: "Search", icon: Search, label: "Search" },
    { id: "Boosted", icon: Megaphone, label: "Boosts", link: "/ad" },
    { id: "Notifications", icon: Bell, label: "Notifications" },
  ];

  const handleItemClick = (item: (typeof menuItems)[0]) => {
    if (item.link) {
      setActiveItem(item.id);
      navigate(item.link);
    } else if (item.id === "Notifications") {
      setIsOpenNotification(true);
    } else if (item.id === "Search") {
      if (isMobile) navigate("/search");
      else setIsOpenSearch(true);
    }
  };

  const bottomNavItems = [
    { id: "Home", icon: Home, label: "Home", hasFill: true, link: "/" },
    { id: "Shorts", icon: SquarePlay, label: "Reels", link: "/reels" },
    { id: "Messages", icon: MessageCircle, label: "Messages", link: "/inbox" },
    { id: "Search", icon: Search, label: "Search" },
  ];

  const createMenuItems = [
    {
      emoji: BookPlus,
      label: "New Post",
      onOpen: () => setOpenPostPopUp(true),
    },
    {
      emoji: Play,
      label: "Upload Video",
      onOpen: () => setOpenShortPopUp(true),
    },
    {
      emoji: SquareStar,
      label: "Create Story",
      onOpen: () => setOpenStoryPopUp(true),
    },
  ];

  if (loading || !currentUser) return null;

  return (
    <>
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!menuOpen) setIsExpanded(false);
        }}
        className={`hidden md:flex h-screen bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden shadow-xl flex-col
          ${expanded ? "w-64" : "w-18"}`}
      >
        <div className="p-3 w-fit shrink-0">
          <div
            className="hover:bg-gray-700 rounded-lg p-1 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={assets.white_logo}
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>

        <div className="flex-1 py-4">
          <div className="flex flex-col gap-2 px-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-4 h-12 p-3 text-sm rounded-xl cursor-pointer transition-all duration-200 ease-in-out
                    ${isActive ? "bg-blue-500 shadow-lg shadow-blue-500/30" : "hover:bg-gray-700"}`}
                >
                  <div className="w-6 flex justify-center shrink-0 relative">
                    <IconComponent
                      color="white"
                      fill={item.hasFill && isActive ? "white" : "none"}
                      className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                      size={24}
                    />
                    {item.id === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 px-1.5 py-0.5 rounded-full text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                    {item.id === "Messages" && unreadConversationCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 px-1.5 py-0.5 rounded-full text-[10px]">
                        {unreadConversationCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-white font-medium whitespace-nowrap transition-all duration-200
                    ${expanded ? "opacity-100 translate-x-0" : "hidden translate-x-2"}
                    ${isActive ? "opacity-100! translate-x-0!" : ""}`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              );
            })}

            <Menu>
              {({ open }) => {
                if (open !== menuOpen) setMenuOpen(open);
                return (
                  <>
                    <MenuButton
                      className={`flex items-center gap-4 w-full h-12 p-3 text-sm rounded-xl cursor-pointer transition-all duration-200 outline-none
                      ${open ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                      <div className="w-6 flex justify-center shrink-0">
                        <Plus
                          color="white"
                          size={24}
                          className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                        />
                      </div>
                      <span
                        className={`text-white font-medium whitespace-nowrap transition-all duration-200
                        ${expanded ? "opacity-100 translate-x-0" : "hidden translate-x-2"}`}
                      >
                        Create
                      </span>
                    </MenuButton>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 scale-95 translate-x-2"
                      enterTo="opacity-100 scale-100 translate-x-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 scale-100 translate-x-0"
                      leaveTo="opacity-0 scale-95 translate-x-2"
                    >
                      <MenuItems
                        portal
                        anchor={{ to: "right start", gap: 15 }}
                        className="z-9999 w-56 rounded-xl bg-zinc-900 p-1 text-sm text-white shadow-2xl ring-1 ring-white/10 focus:outline-none"
                      >
                        {createMenuItems.map(({ emoji, label, onOpen }) => {
                          const EmojiComponent = emoji;
                          return (
                            <MenuItem key={label}>
                              <button
                                onClick={() => {
                                  setIsExpanded(false);
                                  onOpen();
                                }}
                                className="flex cursor-pointer w-full h-10 items-center gap-3 rounded-lg px-3 py-2 text-left data-focus:bg-gray-700 hover:bg-gray-700 transition-all duration-200"
                              >
                                <EmojiComponent color="white" size={17} />
                                <span>{label}</span>
                              </button>
                            </MenuItem>
                          );
                        })}
                      </MenuItems>
                    </Transition>
                  </>
                );
              }}
            </Menu>
          </div>
        </div>

        {currentUser && (
          <div
            className="px-3 pb-4 shrink-0"
            onClick={() => {
              setActiveItem("Profile");
              navigate(`/${currentUser.username}`);
            }}
          >
            <div
              className={`flex items-center gap-3 py-3 pl-2 rounded-xl transition-colors cursor-pointer
              ${activeItem === "Profile" ? "bg-blue-500" : "hover:bg-gray-700"}`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={currentUser.avatar || assets.profile}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`text-white text-sm whitespace-nowrap transition-all duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                Profile
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-gray-700 px-4 h-14 flex items-center justify-between">
        <Menu>
          {({ open }) => (
            <>
              <MenuButton className="p-2 rounded-xl hover:bg-gray-700 transition-all">
                <Plus
                  color="white"
                  size={22}
                  className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                />
              </MenuButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <MenuItems
                  portal
                  anchor={{ to: "bottom end", gap: 8 }}
                  className="z-9999 w-52 rounded-xl bg-zinc-900 p-1 text-sm text-white shadow-2xl ring-1 ring-white/10 focus:outline-none"
                >
                  {createMenuItems.map(({ emoji, label, onOpen }) => {
                    const EmojiComponent = emoji;
                    return (
                      <MenuItem key={label}>
                        <button
                          onClick={onOpen}
                          className="flex cursor-pointer w-full h-10 items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-700 transition-all duration-200"
                        >
                          <EmojiComponent color="white" size={17} />
                          <span>{label}</span>
                        </button>
                      </MenuItem>
                    );
                  })}
                </MenuItems>
              </Transition>
            </>
          )}
        </Menu>

        <img
          src={assets.white_logo}
          alt="Logo"
          className="w-10 h-10 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />

        <button
          className="relative p-2 rounded-xl hover:bg-gray-700 transition-all"
          onClick={() => setIsOpenNotification(true)}
        >
          <Bell color="white" size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-red-500 px-1.5 py-0.5 rounded-full text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-gray-700 shadow-2xl">
        <div className="flex items-center justify-around px-2 pt-2 pb-safe mb-4">
          {bottomNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="flex flex-col items-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all duration-200 active:scale-90"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 relative
                  ${isActive ? "bg-blue-500 shadow-lg shadow-blue-500/40" : ""}`}
                >
                  <IconComponent
                    color="white"
                    fill={item.hasFill && isActive ? "white" : "none"}
                    size={22}
                    className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  />
                  {item.id === "Messages" && unreadConversationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 px-1 py-0.5 rounded-full text-[10px]">
                      {unreadConversationCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <button
            onClick={() => {
              setActiveItem("Profile");
              navigate(`/${currentUser.username}`);
            }}
            className="flex flex-col items-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all duration-200 active:scale-90"
          >
            <div
              className={`p-1 rounded-xl transition-all duration-200
              ${activeItem === "Profile" ? "ring-2 ring-blue-500" : ""}`}
            >
              <img
                src={currentUser.avatar || assets.profile}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            </div>
          </button>
        </div>
      </nav>
      <PostPopUp open={openPostPopUp} onClose={() => setOpenPostPopUp(false)} />
      <ShortPopUp
        open={openShortPopUp}
        onClose={() => setOpenShortPopUp(false)}
      />
      <StoryPopUp
        open={openStoryPopUp}
        onClose={() => setOpenStoryPopUp(false)}
      />
      <SearchPopup open={isOpenSearch} onClose={() => setIsOpenSearch(false)} />
      <NotificationPopUp
        open={isOpenNotification}
        onClose={() => setIsOpenNotification(false)}
      />
    </>
  );
};

export default SideBar;
