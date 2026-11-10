import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PublicRoute = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // Si el usuario ya está autenticado, lo redirigimos según su rol
  if (token && user) {
    if (user.rol === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/empleado" replace />;
    }
  }

  // Si no hay sesión, renderizamos la ruta pública normalmente (Home, Login, etc.)
  return <Outlet />;
};

export default PublicRoute;