import { Navigate, useOutletContext } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { role } = useOutletContext<{ role: string | null }>();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
