import { Link } from 'react-router-dom';
import HeaderPublic from '../../components/public/HeaderPublic';
import FooterPublic from '../../components/public/FooterPublic';

const Error404 = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <HeaderPublic />

      {/* flex-1 hace que esta sección ocupe todo el espacio vacío, empujando el footer abajo */}
      <main className="flex flex-col items-center justify-center flex-1 px-8 text-center">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Página no encontrada</h2>
        <p className="mt-2 text-lg text-slate-600">
          Lo sentimos, la ruta que buscas no existe en S.A.P.E.
        </p>
        
        <Link 
          to="/" 
          className="mt-8 px-6 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Volver al Inicio
        </Link>
      </main>

      <FooterPublic />
    </div>
  );
};

export default Error404;