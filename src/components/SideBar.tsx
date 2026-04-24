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
import { useState, Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { useUser } from "../contexts/user.context";
import { useNavigate } from "react-router-dom";
import PostPopUp from "./PostPopUp";
import ShortPopUp from "./ShortPopUp";
import StoryPopUp from "./StoryPopUp";
import SearchPopup from "../pages/SearchPopup";
import NotificationPopUp from "../pages/NotificationPopUp";

const SideBar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openShortPopUp, setOpenShortPopUp] = useState(false);
  const [openStoryPopUp, setOpenStoryPopUp] = useState(false);
  const [openPostPopUp, setOpenPostPopUp] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenNotification, setIsOpenNotification] = useState(false);

  const { currentUser } = useUser();
  const navigate = useNavigate();

  const expanded = isExpanded || menuOpen;

  const menuItems = [
    { id: "Home", icon: Home, label: "Home", hasFill: true, link: "/" },
    { id: "Shorts", icon: SquarePlay, label: "Reels", link: "/reels" },
    {
      id: "Messages",
      icon: MessageCircle,
      label: "Messages",
      link: "/inbox",
    },
    { id: "Search", icon: Search, label: "Search" },
    { id: "Boosted", icon: Megaphone, label: "Boosts", link: "/ad" },
    {
      id: "Notifications",
      icon: Bell,
      label: "Notifications",
    },
  ];

  return (
    <>
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!menuOpen) setIsExpanded(false);
        }}
        className={`h-screen bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden shadow-xl flex flex-col
          ${expanded ? "w-64" : "w-18"}`}
      >
        <div className="p-4 border-b border-gray-700 shrink-0">
          <img
            src={assets.white_logo}
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="flex-1 py-4">
          <div className="flex flex-col gap-2 px-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    if (item.link) {
                      navigate(item.link);
                    } else if (item.id === "Notifications") {
                      setIsOpenNotification(true);
                    } else if (item.id === "Search") {
                      setIsOpenSearch(true);
                    }
                  }}
                  className={`
                    flex items-center gap-4 h-12 p-3 text-sm rounded-xl cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isActive ? "bg-blue-500 shadow-lg shadow-blue-500/30" : "hover:bg-gray-700"}
                  `}
                >
                  <div className="w-6 flex justify-center shrink-0">
                    <IconComponent
                      color="white"
                      fill={item.hasFill && isActive ? "white" : "none"}
                      className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                      size={24}
                    />
                  </div>
                  <span
                    className={`
                    text-white font-medium whitespace-nowrap transition-all duration-200
                    ${expanded ? "opacity-100 translate-x-0" : "hidden translate-x-2"}
                    ${isActive ? "opacity-100! translate-x-0!" : ""}
                  `}
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
                      className={`
                      flex items-center gap-4 w-full h-12 p-3 text-sm rounded-xl cursor-pointer
                      transition-all duration-200 outline-none
                      ${open ? "bg-gray-700" : "hover:bg-gray-700"}
                    `}
                    >
                      <div className="w-6 flex justify-center shrink-0">
                        <Plus
                          color="white"
                          size={24}
                          className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                        />
                      </div>
                      <span
                        className={`
                        text-white font-medium whitespace-nowrap transition-all duration-200
                        ${expanded ? "opacity-100 translate-x-0" : "hidden translate-x-2"}
                      `}
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
                        className="z-9999 w-56 rounded-xl bg-gray-800 p-1 text-sm text-white shadow-2xl ring-1 ring-white/10 focus:outline-none"
                      >
                        {[
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
                        ].map(({ emoji, label, onOpen }) => {
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
                                <EmojiComponent
                                  color="white"
                                  className="transition-transform duration-200 group-hover:scale-110"
                                  size={17}
                                />
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
            onClick={() => navigate(`/${currentUser.username}`)}
          >
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700 transition-colors cursor-pointer">
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
