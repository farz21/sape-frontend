import { useAuthStore } from "../../store/useAuthStore";
import { ClipboardCheck, LineChart } from "lucide-react";

const DashboardEmpleado = () => {
  const user = useAuthStore((state) => state.user);
  const nombreMostrar = user?.nombre || "Empleado";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          ¡Hola, {nombreMostrar}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Aquí tienes un resumen de tus evaluaciones y desempeño actual.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjeta 1 */}
        <div className="flex flex-col p-6 transition-shadow bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-blue-700 bg-blue-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Mis Evaluaciones
            </h2>
          </div>
          <p className="flex-1 mb-4 text-sm text-slate-500">
            Tienes <strong className="text-blue-700">2 evaluaciones</strong>{" "}
            pendientes.
          </p>
          <button className="w-full py-2 text-sm font-semibold text-blue-700 transition-colors border rounded-lg bg-slate-50 border-slate-200 hover:bg-blue-50">
            Ir a Evaluaciones
          </button>
        </div>

        {/* Tarjeta 2 */}
        <div className="flex flex-col p-6 transition-shadow bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 text-indigo-700 bg-indigo-100 rounded-lg">
              <LineChart className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Mi Desempeño
            </h2>
          </div>
          <p className="flex-1 mb-4 text-sm text-slate-500">
            Los resultados de tu último feedback 360° ya están disponibles.
          </p>
          <button className="w-full py-2 text-sm font-semibold text-indigo-700 transition-colors border rounded-lg bg-slate-50 border-slate-200 hover:bg-indigo-50">
            Ver Resultados
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardEmpleado;
