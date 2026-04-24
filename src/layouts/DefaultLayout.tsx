import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import parseJwt from "../utils/parseToken";
import Cookies from "js-cookie";
import { useEffect } from "react";

function DefaultLayout() {
  const token = Cookies.get("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      const isAdmin = payload?.role === "ADMIN";

      if (isAdmin) {
        navigate("/unauthorized", { replace: true });
      }
    }
  }, [token, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">
      <div className="shrink-0 h-screen z-50 fixed">
        <SideBar />
      </div>
      <div className="flex-1 ml-18 overflow-auto flex justify-center w-272 bg-neutral-950">
        <Outlet />
      </div>
    </div>
  );
}

export default DefaultLayout;
