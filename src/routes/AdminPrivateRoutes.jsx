
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const AdminPrivateRoutes = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.rol !== "administrador") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminPrivateRoutes;
