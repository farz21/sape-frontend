import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, LogOut } from 'lucide-react';
import { useAuthStore } from "../../../store/useAuthStore";

const EmpleadoLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const salir = () => {
    logout();
    navigate('/login');
  };

  const claseEnlace = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
        : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="flex w-[25%] min-w-60 max-w-72 flex-col bg-white border-r border-slate-200 px-5 py-7">
          <div className="mb-10 px-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">S.A.P.E.</p>
            <h1 className="mt-2 text-xl font-extrabold text-slate-800">Portal del Empleado</h1>
          </div>
          
          <nav className="space-y-2">
            <NavLink to="/empleado" end className={claseEnlace}>
              <LayoutDashboard size={19} />Inicio
            </NavLink>
            <NavLink to="/empleado/evaluaciones" end className={claseEnlace}>
              <ClipboardList size={19} />Mis Evaluaciones
            </NavLink>
          </nav>
          
          <div className="mt-auto border-t border-slate-100 pt-5">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{user?.nombre || 'Empleado'}</p>
                <p className="text-xs font-medium text-slate-500">Mi Perfil</p>
              </div>
            </div>
            <button 
              onClick={salir} 
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
            >
              <LogOut size={19} />Cerrar sesión
            </button>
          </div>
        </aside>
        
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmpleadoLayout;