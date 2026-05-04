import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import parseJwt from "../utils/parseToken";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { MessageProvider } from "../contexts/message.context";

function DefaultLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [token, setToken] = useState(() => {
    const t = Cookies.get("access_token");
    return t;
  });

  // console.log("ACCESS: ", token);

  useEffect(() => {
    setToken(Cookies.get("access_token"));
  }, [location.pathname]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload?.role !== "CLIENT") {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [token, navigate]);

  useEffect(() => {
    const handleTokenChange = () => {
      setToken(Cookies.get("access_token"));
    };

    window.addEventListener("tokenChanged", handleTokenChange);
    return () => window.removeEventListener("tokenChanged", handleTokenChange);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      {token ? (
        <MessageProvider>
          <>
            <SideBar />
            <div
              className={`flex-1 overflow-auto flex justify-center w-full bg-zinc-900 ${isMobile ? "pb-16" : ""}`}
            >
              <Outlet />
            </div>
          </>
        </MessageProvider>
      ) : (
        <div
          className={`flex-1 overflow-auto flex justify-center w-full bg-zinc-900 ${isMobile ? "pb-16" : ""}`}
        >
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default DefaultLayout;
