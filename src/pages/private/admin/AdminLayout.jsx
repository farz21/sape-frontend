import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, UserRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const salir = () => {
    logout();
    navigate('/login');
  };

  const claseEnlace = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="flex w-[30%] min-w-60 max-w-80 flex-col bg-slate-950 px-5 py-7 text-white">
          <div className="mb-10 px-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-300">S.A.P.E.</p>
            <h1 className="mt-2 text-xl font-extrabold">Panel de gestion</h1>
          </div>
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Administracion</p>
          <nav className="space-y-2">
            <NavLink to="/admin" end className={claseEnlace}><LayoutDashboard size={19} />Dashboard</NavLink>
            <NavLink to="/admin/empleados" end className={claseEnlace}><Users size={19} />Todos los empleados</NavLink>
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-5">
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-900 p-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500"><UserRound size={19} /></span>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.email}</p><p className="text-xs text-slate-400">Administrador</p></div>
            </div>
            <button onClick={salir} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"><LogOut size={19} />Cerrar sesion</button>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;

