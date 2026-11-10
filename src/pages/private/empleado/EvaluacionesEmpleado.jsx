import { useState, useEffect } from 'react';
import { useAuthStore } from "../../../store/useAuthStore";
import { CheckCircle2, ClipboardList, Award, Calendar } from 'lucide-react';

const API_URL = "http://localhost:3000";

const EvaluacionesEmpleado = () => {
  const token = useAuthStore((state) => state.token);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEvaluaciones = async () => {
      try {
        const response = await fetch(`${API_URL}/api/empleado/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "No se pudieron cargar las evaluaciones.");
        
        setEvaluaciones(data.evaluaciones || []);
      } catch (err) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    if (token) cargarEvaluaciones();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Mis Evaluaciones
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Historial de desempeño y calificaciones registradas en el sistema.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">
            Historial de Desempeño
          </h2>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500 text-sm">Cargando evaluaciones...</div>
        ) : evaluaciones.length > 0 ? (
          <ul className="divide-y divide-slate-200">
            {evaluaciones.map((evalItem) => (
              <li key={evalItem.id_evaluacion} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-blue-600">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Periodo: {evalItem.periodo}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> 
                      Fecha: {new Date(evalItem.fecha).toLocaleDateString("es-AR")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md text-white ${
                        evalItem.semaforo === 'Verde' ? 'bg-emerald-600' :
                        evalItem.semaforo === 'Amarillo' ? 'bg-amber-500' : 'bg-rose-600'
                      }`}>
                        {evalItem.semaforo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-800">
                    {evalItem.puntaje_final}
                  </span>
                  <span className="text-xs text-slate-500 block">Pts / 100</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm">
            Todavía no tenés evaluaciones registradas en el sistema.
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluacionesEmpleado;