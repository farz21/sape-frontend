import { Link } from "react-router-dom";
import HeaderPublic from "../../components/public/HeaderPublic";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <HeaderPublic />

      <main className="flex-1 flex flex-col justify-center">
        <section className="px-6 pt-6 md:pt-10 pb-16 text-center">
          {/* Logo institucional */}
          <div className="max-w-4xl mx-auto mb-6">
            <img
              src="/logo-sape.png"
              alt="S.A.P.E. - Sistema Analítico Para Empleados"
              className="w-full h-auto object-contain mix-blend-multiply"
            />
          </div>

          {/* Presentación */}
          <div className="max-w-3xl mx-auto">
            <p className="mt-6 text-base md:text-lg leading-relaxed text-slate-600">
              Plataforma de People Analytics para empresas modernas. Elimina los
              sesgos en las evaluaciones, compara talento objetivamente y genera
              planes de acción con inteligencia artificial.
            </p>

            {/* Botón de acceso */}
            <div className="mt-10">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-blue-900 rounded-xl hover:bg-blue-800 hover:scale-105 shadow-lg shadow-blue-900/20"
              >
                Acceder al Sistema
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
