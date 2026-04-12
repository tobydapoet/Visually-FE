import { Outlet, useNavigate } from "react-router-dom";
import SidebarManage from "../components/SideBarManage";
import Cookies from "js-cookie";
import parseJwt from "../utils/parseToken";
import { useEffect } from "react";

function ManageLayout() {
  const token = Cookies.get("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      const isAdmin = payload?.roles?.includes("ADMIN");

      if (!isAdmin) {
        navigate("/unauthorized", { replace: true });
      }
    } else {
      navigate("/unauthorized", { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">
      <div className="shrink-0 h-screen z-50 fixed border-r bg-neutral-950 border-zinc-800">
        <SidebarManage />
      </div>
      <div className="flex-1 ml-61 overflow-auto flex justify-center bg-neutral-950">
        <Outlet />
      </div>
    </div>
  );
}

export default ManageLayout;
