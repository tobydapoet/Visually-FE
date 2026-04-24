import Cookies from "js-cookie";
import DefaultLayout from "./DefaultLayout";
import parseJwt from "../utils/parseToken";
import ManageLayout from "./ManagerLayout";

function RoleBasedLayout() {
  const token = Cookies.get("access_token");

  if (!token) return <DefaultLayout />;

  const payload = parseJwt(token);

  const isAdmin = payload?.role === "ADMIN";

  return isAdmin ? <ManageLayout /> : <DefaultLayout />;
}

export default RoleBasedLayout;
