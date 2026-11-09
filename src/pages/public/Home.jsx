import { Link } from 'react-router-dom';
import HeaderPublic from '../../components/public/HeaderPublic';
import FooterPublic from '../../components/public/FooterPublic';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <HeaderPublic />

      {/* Contenido Principal de la página */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-8 py-24 text-center">
          <h1 className="max-w-4xl mx-auto text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            El rendimiento de tu equipo, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              medido con inteligencia.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-slate-600">
            Plataforma de People Analytics para empresas modernas. Elimina los sesgos en las evaluaciones, compara talento objetivamente y genera planes de acción con IA.
          </p>
          <div className="mt-10">
            <Link 
              to="/login" 
              className="px-8 py-4 text-lg font-bold text-white transition-transform transform bg-slate-900 rounded-xl hover:scale-105 hover:bg-slate-800 shadow-xl"
            >
              Acceder al Sistema
            </Link>
          </div>
        </section>
      </main>

      <FooterPublic />
    </div>
  );
};

export default Home;