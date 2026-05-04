import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CurrentUserType } from "../types/api/user.type";
import Cookies from "js-cookie";
import { handleGetCurrentUser } from "../api/user.api";
import { handleLogout } from "../api/auth.api";
import { toast } from "sonner";

type UserContextType = {
  currentUser: CurrentUserType | null | undefined;
  loading: boolean;
  reloadUser: () => Promise<CurrentUserType | null>;
  onLogout: (onSuccess?: () => void) => Promise<void>;
};
const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<
    CurrentUserType | undefined | null
  >();
  const [loading, setLoading] = useState(false);

  const onLogout = async (onSuccess?: () => void) => {
    const res = await handleLogout();
    if (res.success) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      setCurrentUser(null);
      onSuccess?.();
      toast.success(res.message);
    } else {
      console.log(res.message);
    }
  };

  const reloadUser = async (): Promise<CurrentUserType | null> => {
    try {
      setLoading(true);
      const refresh_token = Cookies.get("refresh_token");
      if (!refresh_token) {
        setCurrentUser(null);
        return null;
      }
      const data = await handleGetCurrentUser();
      if (!data) {
        setCurrentUser(null);
        return null;
      }
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.log("Error when fetch user: ", err);
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Cookies.get("refresh_token")) {
      reloadUser();
    }
  }, []);

  useEffect(() => {
    const handleTokenChange = () => {
      if (Cookies.get("refresh_token")) {
        reloadUser();
      }
    };

    window.addEventListener("tokenChanged", handleTokenChange);
    return () => window.removeEventListener("tokenChanged", handleTokenChange);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        reloadUser,
        onLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("userUser must be used within an UserProvider");
  }
  return context;
};
