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
import { MusicProvider } from "../contexts/music.context";
import StoragePage from "../pages/StoragePage";
import StoryPage from "../pages/StoryPage";
import MessagePage from "../pages/MessagePage";
import BoostedPostPage from "../pages/BoostedPostPage";
import ShortManangePage from "../pages/ShortMangePage";
import { ShortProvider } from "../contexts/short.context";
import { PostProvider } from "../contexts/post.context";
import PostManagePage from "../pages/PostMangePage";
import ReportManagePage from "../pages/ReportManagePage";
import ContentPage from "../pages/ContentPage";
import UserMangePage from "../pages/UserMangePage";
import SearchPage from "../pages/SearchPage";
import { AdProvider } from "../contexts/ad.context";
import { StoryProvider } from "../contexts/story.context";
import ReelsPage from "../pages/ReelsPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import BoostedPostMangePage from "../pages/AdvertisementManagePage";

export const router = createBrowserRouter([
  // {
  //   path: routes.root,
  //   element: <RootPage />,
  // },
  {
    path: routes.forgot,
    element: <ForgotPasswordPage />,
  },
  {
    path: routes.reset,
    element: <ResetPasswordPage />,
  },
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
        element: (
          <StoryProvider>
            <StoryPage />
          </StoryProvider>
        ),
        path: routes.highlight,
      },
      {
        element: (
          <StoryProvider>
            <StoryPage />
          </StoryProvider>
        ),
        path: routes.story,
      },
      {
        element: (
          <StoryProvider>
            <StoryPage />
          </StoryProvider>
        ),
        path: routes.single_story,
      },
      {
        element: (
          <AdProvider>
            <BoostedPostPage />
          </AdProvider>
        ),
        path: routes.ad,
      },
      {
        element: <MessagePage />,
        path: routes.inbox,
      },
      {
        element: <SearchPage />,
        path: routes.search,
      },
      {
        element: <MessagePage />,
        path: routes.inboxDetail,
      },
      {
        element: <ReelsPage />,
        path: routes.reel,
      },
      {
        element: <ReelsPage />,
        path: routes.reels,
      },
      {
        path: routes.content,
        element: (
          <ShortProvider>
            <PostProvider>
              <ContentPage />
            </PostProvider>
          </ShortProvider>
        ),
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
        path: routes.user_manage_detail,
        element: <UserPage />,
      },
      {
        path: routes.short_manage,
        element: (
          <ShortProvider>
            <ShortManangePage />
          </ShortProvider>
        ),
      },
      {
        path: routes.post_manage,
        element: (
          <PostProvider>
            <PostManagePage />
          </PostProvider>
        ),
      },

      {
        path: routes.report_manage,
        element: (
          <PostProvider>
            <ReportManagePage />
          </PostProvider>
        ),
      },
      {
        path: routes.content_manage,
        element: (
          <ShortProvider>
            <PostProvider>
              <ContentPage />
            </PostProvider>
          </ShortProvider>
        ),
      },

      {
        path: routes.ad_manage,
        element: (
          <AdProvider>
            <BoostedPostMangePage />
          </AdProvider>
        ),
      },

      {
        path: routes.user_manage,
        element: <UserMangePage />,
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
