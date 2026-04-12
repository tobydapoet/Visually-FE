import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { routes } from "./routes.config";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import OauthSuccessPage from "../pages/OauthSuccessPage";
import DefaultLayout from "../layouts/DefaultLayout";
import UserPage from "../pages/UserPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import EditProfilePage from "../pages/EditProfilePage";
import SettingLayout from "../layouts/SettingLayout";
import ManageLayout from "../layouts/ManagerLayout";
import MusicLibraryPage from "../pages/MusicLibraryPage";
import StoryManagePage from "../pages/StoryManagePage";
import { MusicProvider } from "../contexts/music.context";
import StoragePage from "../pages/StoragePage";
import StoryHighlightPage from "../pages/StoryHighlightPage";
import StoryPage from "../pages/StoryPage";
import MessagePage from "../pages/MessagePage";
import { MessageProvider } from "../contexts/message.context";

export const router = createBrowserRouter([
  // {
  //   path: routes.root,
  //   element: <RootPage />,
  // },

  {
    element: <AuthLayout />,
    children: [
      {
        path: routes.login,
        element: <LoginPage />,
      },
    ],
  },

  {
    element: <DefaultLayout />,
    children: [
      {
        path: routes.root,
        element: <HomePage />,
      },
      {
        path: routes.user,
        element: <UserPage />,
      },
      {
        element: <StoragePage />,
        path: routes.storage,
      },
      {
        element: <StoryHighlightPage />,
        path: routes.highlight,
      },
      {
        element: <StoryPage />,
        path: routes.story,
      },
      {
        element: (
          <MessageProvider>
            <MessagePage />
          </MessageProvider>
        ),
        path: routes.inbox,
      },
      {
        element: (
          <MessageProvider>
            <MessagePage />
          </MessageProvider>
        ),
        path: routes.inboxDetail,
      },
    ],
  },
  {
    element: <ManageLayout />,
    children: [
      {
        path: routes.music_library,
        element: (
          <MusicProvider>
            <MusicLibraryPage />
          </MusicProvider>
        ),
      },
      {
        path: routes.story_manage,
        element: <StoryManagePage />,
      },
    ],
  },
  {
    element: <SettingLayout />,
    children: [
      {
        element: <EditProfilePage />,
        path: routes.edit_profile,
      },
    ],
  },

  { path: routes.unauthorized, element: <UnauthorizedPage /> },

  { path: routes.register, element: <RegisterPage /> },

  { path: routes.oauth_success, element: <OauthSuccessPage /> },
]);
