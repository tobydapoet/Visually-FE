import { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

function OauthSuccessPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      Cookies.set("access_token", accessToken, { expires: 1 });
    }

    if (refreshToken) {
      Cookies.set("refresh_token", refreshToken, { expires: 7 });
    }
    navigate("/");
  }, []);
  return <LoadingSpinner />;
}

export default OauthSuccessPage;
