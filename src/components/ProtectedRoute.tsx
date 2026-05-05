import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import parseJwt from "../utils/parseToken";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const token = Cookies.get("access_token");

  if (!token) {
    return <Navigate to="/unauthorized" replace />;
  }

  const payload = parseJwt(token);

  if (allowedRoles && !allowedRoles.includes(payload?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
