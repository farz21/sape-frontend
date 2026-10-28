import { Link } from 'react-router-dom';

const NavbarPublic = () => {
  return (
    <nav className="flex items-center justify-between max-w-7xl px-8 py-4 mx-auto">
      {/* Logo */}
      <div className="text-2xl font-black tracking-tighter text-blue-700">
        S.A.P.E.
      </div>
      
      {/* Enlaces / Botones */}
      <div>
        <Link 
          to="/login" 
          className="px-5 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Iniciar Sesión
        </Link>
      </div>
    </nav>
  );
};

export default NavbarPublic;