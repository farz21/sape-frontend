import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  ClipboardCheck,
  LineChart,
  CalendarDays,
  Target,
  FolderKanban,
} from "lucide-react";

const API_URL = "http://localhost:3000";

const DashboardEmpleado = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [resumen, setResumen] = useState(null);
  const [proyectosAsignados, setProyectosAsignados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const [resDashboard, resProyectos] = await Promise.all([
          fetch(`${API_URL}/api/empleado/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/empleado/proyectos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const data = await resDashboard.json();
        if (!resDashboard.ok)
          throw new Error(data.mensaje || "No se pudo cargar tu resumen.");
        setResumen(data);

        if (resProyectos.ok) {
          const dataProyectos = await resProyectos.json();
          setProyectosAsignados(Array.isArray(dataProyectos) ? dataProyectos : []);
        }
      } catch (err) {
        setError(err.message || "No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    if (token) cargarResumen();
    else {
      setError("La sesión no tiene un token válido. Volvé a iniciar sesión.");
      setCargando(false);
    }
  }, [token]);

  const nombreMostrar = resumen?.empleado?.nombre || user?.nombre || "Empleado";
  const evaluaciones = resumen?.evaluaciones || [];
  const planes = resumen?.planes || [];
  const evaluacionesOrdenadas = [...evaluaciones].sort(
    (a, b) => b.id_evaluacion - a.id_evaluacion,
  );
  const ultimaEvaluacion = evaluacionesOrdenadas[0];

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-700">Panel del empleado</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          ¡Hola, {nombreMostrar}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Aquí podés consultar tus evaluaciones, resultados, proyectos asignados
          y objetivos de mejora.
        </p>
      </div>

      {cargando && (
        <p
          role="status"
          className="mb-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600"
        >
          Cargando tus datos...
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Mis evaluaciones
            </h2>
          </div>
          <p className="mb-4 flex-1 text-sm text-slate-500">
            {cargando
              ? "Consultando..."
              : `Tenés ${evaluaciones.length} evaluación${evaluaciones.length === 1 ? "" : "es"} registrada${evaluaciones.length === 1 ? "" : "s"}.`}
          </p>
          <Link
            to="/empleado/evaluaciones"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Ver evaluaciones
          </Link>
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-indigo-100 p-3 text-indigo-700">
              <LineChart className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Mi desempeño
            </h2>
          </div>
          <p className="mb-4 flex-1 text-sm text-slate-500">
            {ultimaEvaluacion
              ? `Último puntaje: ${ultimaEvaluacion.puntaje_final ?? "Sin puntaje"}${ultimaEvaluacion.semaforo ? ` · ${ultimaEvaluacion.semaforo}` : ""}.`
              : "Todavía no hay evaluaciones cargadas."}
          </p>
          <Link
            to="/empleado/evaluaciones"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Consultar resultados
          </Link>
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Planes de acción
            </h2>
          </div>
          <p className="mb-4 flex-1 text-sm text-slate-500">
            {cargando
              ? "Consultando..."
              : `${planes.length} objetivo${planes.length === 1 ? "" : "s"} de mejora asignado${planes.length === 1 ? "" : "s"}.`}
          </p>
          <div className="text-sm font-medium text-slate-600">
            {planes.slice(0, 2).map((plan) => (
              <p key={plan.id_plan} className="mb-1 truncate">
                - {plan.objetivo}
              </p>
            ))}
            <Link
              to="/empleado/metas"
              className="mt-4 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Ver y actualizar mis metas
            </Link>
          </div>
        </section>
      </div>

      {/* PROYECTOS ASIGNADOS AL EMPLEADO */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">
              Mis proyectos asignados
            </h2>
          </div>
          <Link
            to="/empleado/proyectos"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Ver detalle completo →
          </Link>
        </div>

        {proyectosAsignados.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {proyectosAsignados.slice(0, 4).map((item) => (
              <div
                key={item.id_asignacion}
                className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-900">
                    {item.nombre_proyecto}
                  </p>
                  {item.estado && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {item.estado}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-slate-600">
                  <strong className="text-slate-800">Rol:</strong>{" "}
                  {item.rol_en_proyecto || "No especificado"} ·{" "}
                  <strong className="text-slate-800">Horas:</strong>{" "}
                  {item.horas_asignadas ?? 0} hs
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {cargando
              ? "Cargando proyectos..."
              : "Todavía no tenés proyectos asignados."}
          </p>
        )}
      </section>

      {/* SECCIÓN DE LA ÚLTIMA EVALUACIÓN EN EL INICIO */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">
            Última evaluación registrada
          </h2>
        </div>
        {ultimaEvaluacion ? (
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <p>
              <span className="font-medium text-slate-800">Período:</span>{" "}
              {ultimaEvaluacion.periodo || "Sin período"}
            </p>
            <p>
              <span className="font-medium text-slate-800">Fecha:</span>{" "}
              {new Date(ultimaEvaluacion.fecha).toLocaleDateString("es-AR")}
            </p>
            <p>
              <span className="font-medium text-slate-800">Resultado:</span>{" "}
              {ultimaEvaluacion.semaforo || "Pendiente"} (
              {ultimaEvaluacion.puntaje_final} pts)
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {cargando
              ? "Cargando..."
              : "Cuando se registre una evaluación, vas a poder verla acá."}
          </p>
        )}
      </section>
    </>
  );
};

export default DashboardEmpleado;