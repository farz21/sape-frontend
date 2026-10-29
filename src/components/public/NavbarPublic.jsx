import { Link } from 'react-router-dom';

const NavbarPublic = () => {
  return (
    <nav className="flex items-center justify-between max-w-7xl px-8 py-4 mx-auto">

      {/* Logo */}
      <div className="text-2xl font-black tracking-tighter text-blue-700">
        S.A.P.E.
      </div>

      {/* Enlaces / Botones */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Iniciar Sesión
        </Link>

        <Link
          to="/registro"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          Registrarte
        </Link>
      </div>

    </nav>
  );
};

export default NavbarPublic;
