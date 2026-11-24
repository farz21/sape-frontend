import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  FolderKanban,
  Clock,
  UserCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:3000/api";
const PROYECTOS_POR_PAGINA = 6;

const ProyectosEmpleado = () => {
  const token = useAuthStore((state) => state.token);
  const [proyectos, setProyectos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProyectos = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/empleado/proyectos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.mensaje || "No se pudieron cargar tus proyectos.");
          return;
        }
        setProyectos(Array.isArray(data) ? data : []);
        setPaginaActual(1);
      } catch (err) {
        console.error(err);
        setError("Error de conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    if (token) {
      cargarProyectos();
    }
  }, [token]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(proyectos.length / PROYECTOS_POR_PAGINA),
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const proyectosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * PROYECTOS_POR_PAGINA;
    return proyectos.slice(inicio, inicio + PROYECTOS_POR_PAGINA);
  }, [proyectos, paginaActual]);

  const indiceInicio =
    proyectos.length === 0 ? 0 : (paginaActual - 1) * PROYECTOS_POR_PAGINA + 1;
  const indiceFin = Math.min(
    paginaActual * PROYECTOS_POR_PAGINA,
    proyectos.length,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Mis Proyectos Asignados
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Proyectos activos o planificados en los que participás, tu rol y tu
            carga horaria asignada.
          </p>
        </div>

        {!cargando && proyectos.length > 0 && (
          <span className="w-fit rounded-full bg-slate-200/70 px-3 py-1 text-xs font-bold text-slate-700">
            {proyectos.length}{" "}
            {proyectos.length === 1 ? "proyecto" : "proyectos"}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Cargando proyectos asignados...
        </div>
      ) : proyectos.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Actualmente no tenés proyectos asignados.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {proyectosPaginados.map((item) => (
              <div
                key={item.id_asignacion}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <FolderKanban size={20} />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">
                      {item.nombre_proyecto}
                    </h2>
                  </div>

                  {item.estado && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {item.estado}
                    </span>
                  )}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <UserCheck size={16} className="shrink-0 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">Rol:</strong>{" "}
                      {item.rol_en_proyecto || "No especificado"}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock size={16} className="shrink-0 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">
                        Horas asignadas:
                      </strong>{" "}
                      {item.horas_asignadas ?? 0} hs
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="shrink-0 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">
                        Fecha estimada de fin:
                      </strong>{" "}
                      {item.fecha_fin
                        ? new Date(item.fecha_fin).toLocaleDateString("es-AR")
                        : "Sin definir"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
              <p className="text-xs text-slate-500">
                Mostrando{" "}
                <strong className="text-slate-700">
                  {indiceInicio}–{indiceFin}
                </strong>{" "}
                de <strong className="text-slate-700">{proyectos.length}</strong>{" "}
                proyectos (página {paginaActual} de {totalPaginas})
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((prev) => Math.max(1, prev - 1))
                  }
                  disabled={paginaActual === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Anterior</span>
                </button>

                {Array.from({ length: totalPaginas }, (_, idx) => idx + 1)
                  .filter(
                    (num) =>
                      num === 1 ||
                      num === totalPaginas ||
                      Math.abs(num - paginaActual) <= 1,
                  )
                  .map((num, idx, arr) => {
                    const mostrarPuntos = idx > 0 && num - arr[idx - 1] > 1;
                    return (
                      <div key={num} className="flex items-center gap-1.5">
                        {mostrarPuntos && (
                          <span className="px-1 text-xs text-slate-400">
                            ...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPaginaActual(num)}
                          className={`h-8 min-w-8 rounded-lg px-2.5 text-xs font-bold transition ${
                            paginaActual === num
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {num}
                        </button>
                      </div>
                    );
                  })}

                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProyectosEmpleado;