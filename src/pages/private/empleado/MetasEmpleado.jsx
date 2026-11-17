
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Target,
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquare,
  RefreshCw,
  Save,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000";

const MetasEmpleado = () => {
  const token = useAuthStore((state) => state.token);

  const [metas, setMetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(null);
  const [mensajes, setMensajes] = useState({});

  // Cargar las metas del empleado
  const cargarMetas = async () => {
    try {
      setCargando(true);
      setError("");

      const response = await fetch(`${API_URL}/api/empleado/metas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudieron cargar las metas.");
      }

      setMetas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarMetas();
    } else {
      setError("No hay una sesión válida. Volvé a iniciar sesión.");
      setCargando(false);
    }
  }, [token]);

  // Actualizar progreso y comentarios
  const actualizarMeta = async (meta) => {
    try {
      setGuardando(meta.id_meta);
      setError("");

      const estado =
        Number(meta.progreso) === 100 ? "Completada" :
        Number(meta.progreso) > 0 ? "En progreso" : "Pendiente";

      const response = await fetch(
        `${API_URL}/api/empleado/metas/${meta.id_meta}/progreso`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progreso: Number(meta.progreso),
            estado,
            comentarios_empleado: mensajes[meta.id_meta] ?? meta.comentarios_empleado ?? "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo actualizar la meta.");
      }

      setMetas((actuales) =>
        actuales.map((item) =>
          item.id_meta === meta.id_meta
            ? {
                ...item,
                estado,
                fecha_completada:
                  estado === "Completada"
                    ? new Date().toISOString().split("T")[0]
                    : null,
                comentarios_empleado:
                  mensajes[meta.id_meta] ?? item.comentarios_empleado ?? "",
              }
            : item
        )
      );

      alert("Meta actualizada correctamente.");
    } catch (err) {
      setError(err.message || "Error al actualizar la meta.");
    } finally {
      setGuardando(null);
    }
  };

  const cambiarProgreso = (id, valor) => {
    setMetas((actuales) =>
      actuales.map((meta) =>
        meta.id_meta === id
          ? { ...meta, progreso: Number(valor) }
          : meta
      )
    );
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "Completada":
        return "bg-emerald-100 text-emerald-700";
      case "En progreso":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const fechaLegible = (fecha) => {
    if (!fecha) return "Sin fecha límite";

    // Evita desfases de día al interpretar una fecha SQL YYYY-MM-DD.
    const [anio, mes, dia] = String(fecha).slice(0, 10).split("-");
    return `${dia}/${mes}/${anio}`;
  };

  if (cargando) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Cargando tus metas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">
          Desarrollo profesional
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Mis metas y objetivos
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Consultá tus objetivos de mejora y actualizá tu progreso.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total de metas</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metas.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">En progreso</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {metas.filter((m) => m.estado === "En progreso").length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completadas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {metas.filter((m) => m.estado === "Completada").length}
          </p>
        </div>
      </div>

      {metas.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Target className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h2 className="font-semibold text-slate-800">
            Todavía no tenés metas asignadas
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Cuando se registre una evaluación y se generen objetivos, aparecerán acá.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {metas.map((meta) => (
            <section
              key={meta.id_meta}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex gap-3">
                  <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
                    <Target className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {meta.titulo}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {meta.descripcion || "Sin descripción disponible."}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${obtenerColorEstado(meta.estado)}`}
                >
                  {meta.estado || "Pendiente"}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Fecha límite: {fechaLegible(meta.fecha_limite)}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Progreso
                  </span>
                  <span className="font-semibold text-blue-700">
                    {meta.progreso || 0}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(meta.progreso) || 0))}%`,
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={meta.progreso ?? 0}
                  onChange={(e) =>
                    cambiarProgreso(meta.id_meta, e.target.value)
                  }
                  disabled={meta.estado === "Completada"}
                  className="mt-4 w-full cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                />

                <div className="flex justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios sobre tu avance
                </label>

                <textarea
                  rows="3"
                  value={
                    mensajes[meta.id_meta] ??
                    meta.comentarios_empleado ??
                    ""
                  }
                  onChange={(e) =>
                    setMensajes((actuales) => ({
                      ...actuales,
                      [meta.id_meta]: e.target.value,
                    }))
                  }
                  placeholder="Contá qué avances realizaste o qué dificultades encontraste..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => actualizarMeta(meta)}
                  disabled={guardando === meta.id_meta}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {guardando === meta.id_meta
                    ? "Guardando..."
                    : "Guardar progreso"}
                </button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetasEmpleado;
