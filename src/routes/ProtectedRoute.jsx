
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Si no inició sesión
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si es administrador, no puede entrar al panel empleado
  if (user?.rol !== "empleado") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
