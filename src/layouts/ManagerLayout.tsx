import { Outlet, useNavigate } from "react-router-dom";
import SidebarManage from "../components/SideBarManage";
import Cookies from "js-cookie";
import parseJwt from "../utils/parseToken";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

function ManageLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const token = Cookies.get("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (!payload || payload?.role === "CLIENT")
        navigate("/unauthorized", { replace: true });
    } else {
      navigate("/unauthorized", { replace: true });
    }
  }, [token]);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-neutral-950 border-b border-zinc-800">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-white"
        >
          <Menu size={20} />
        </button>
        <span className="text-white font-medium">Admin Panel</span>
      </div>

      <SidebarManage
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 overflow-auto bg-neutral-950 pt-14 md:pt-0">
        <div className="flex justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export default ManageLayout;
