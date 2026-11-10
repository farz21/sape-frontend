import { Clock, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react';
const EvaluacionesEmpleado = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Mis Evaluaciones
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona las evaluaciones de desempeño pendientes y completadas.
        </p>
      </div>

      <div className="bg-white border rounded-xl border-slate-200 shadow-sm overflow-hidden">
        {/* Encabezado de la lista */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">
            Pendientes de completar
          </h2>
        </div>

        {/* Lista de evaluaciones */}
        <ul className="divide-y divide-slate-200">
          {/* Ítem 1 */}
          <li className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Autoevaluación Q3
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Reflexión sobre objetivos del tercer trimestre.
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit">
                  <Clock className="w-3 h-3" /> Vence en 2 días
                </div>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              Comenzar
            </button>
          </li>

          {/* Ítem 2 */}
          <li className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-slate-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Feedback 360° - Tomás Cano
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Evaluación de pares para el equipo de desarrollo.
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md w-fit">
                  <Clock className="w-3 h-3" /> Vence en 5 días
                </div>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              Comenzar
            </button>
          </li>
        </ul>
      </div>

      {/* Historial (Ejemplo de completadas) */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Completadas Recientemente
        </h3>
        <div className="bg-white border rounded-xl border-slate-200 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              Evaluación de Desempeño Q2
            </p>
            <p className="text-xs text-slate-500">
              Completada el 15 de Octubre, 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EvaluacionesEmpleado;
