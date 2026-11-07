import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; 

const NavbarPublic = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate(); // 1. Inicializamos el hook de navegación

  // 2. Creamos una función que hace las dos cosas
  const manejarLogout = () => {
    logout(); // Borra los datos de Zustand y del localStorage
    navigate('/login'); // Lo redirige al formulario
  };

  return (
    <nav className="flex items-center justify-between max-w-7xl px-4 py-4 mx-auto md:px-8">
      {/* Logo */}
      <div className="text-xl font-black tracking-tighter text-blue-700 md:text-2xl">
        S.A.P.E.
      </div>

      {/* Contenedor de botones */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {isAuthenticated ? (
          <button 
            onClick={manejarLogout} // 3. Usamos la nueva función acá
            className="px-3 py-2 text-xs font-semibold transition-all border rounded-lg border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 md:text-sm md:px-4"
          >
            Cerrar Sesión
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="px-3 py-2 text-xs font-semibold transition-all bg-white border rounded-lg hover:translate-y-0.5 border-slate-300 text-slate-700 hover:bg-slate-50 md:text-sm md:px-4"
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/registro"
              className="px-4 py-2 text-xs font-semibold text-white transition-all bg-indigo-600 rounded-lg shadow-md shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 md:text-sm md:px-5"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavbarPublic;