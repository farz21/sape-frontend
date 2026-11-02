import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Si no está autenticado, lo redirige al login y borra el historial de esa pestaña (replace)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza las rutas hijas (el Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
