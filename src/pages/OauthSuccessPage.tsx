import { useEffect } from "react";
import Cookies from "js-cookie";
import LoadingSpinner from "../components/LoadingSpinner";
import parseJwt from "../utils/parseToken";
import { useNavigate } from "react-router-dom";

function OauthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken) return;

    Cookies.set("access_token", accessToken, { expires: 1 });
    if (refreshToken)
      Cookies.set("refresh_token", refreshToken, { expires: 7 });

    const payload = parseJwt(accessToken);
    if (payload?.role !== "CLIENT") {
      navigate("/music_library", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, []);
  return <LoadingSpinner />;
}

export default OauthSuccessPage;
