import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import parseJwt from "../utils/parseToken";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { MessageProvider } from "../contexts/message.context";

function DefaultLayout() {
  const token = Cookies.get("access_token");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      const isAdmin = payload?.role !== "CLIENT";

      if (isAdmin) {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [token, navigate]);

  return (
    <MessageProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-900">
        <SideBar />
        <div
          className={`
          flex-1 overflow-auto flex justify-center w-full bg-zinc-900
          ${isMobile ? "pb-16" : ""}
        `}
        >
          <Outlet />
        </div>
      </div>
    </MessageProvider>
  );
}

export default DefaultLayout;
