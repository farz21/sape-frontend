import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Bell,
  LogOut,
  UserCircle,
  LayoutDashboard,
  ClipboardList,
  User,
} from "lucide-react";

const EmpleadoLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const manejarLogout = () => {
    logout();
    navigate("/login");
  };

  const nombreMostrar = user?.nombre || "Empleado";

  const linkActivo = (ruta) =>
    location.pathname === ruta
      ? "text-blue-700 bg-blue-50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm border-slate-200">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-blue-700">
                S.A.P.E.
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/empleado"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado")}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Inicio
              </Link>
              <Link
                to="/empleado/evaluaciones"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado/evaluaciones")}`}
              >
                <ClipboardList className="w-4 h-4" /> Evaluaciones
              </Link>
              <Link
                to="/empleado/perfil"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado/perfil")}`}
              >
                <User className="w-4 h-4" /> Mi Perfil
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="transition-colors text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <UserCircle className="w-8 h-8 text-slate-400" />
              <span className="hidden text-sm font-medium sm:block text-slate-700">
                {nombreMostrar}
              </span>
            </div>
            <button
              onClick={manejarLogout}
              className="p-2 ml-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default EmpleadoLayout;
