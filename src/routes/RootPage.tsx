import Cookies from "js-cookie";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";

export default function RootPage() {
  const token = Cookies.get("accessToken");

  return token ? <HomePage /> : <LoginPage />;
}
