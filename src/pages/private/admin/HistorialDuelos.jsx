import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  History,
  Eye,
  Trash2,
  Swords,
  Loader2,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000/api";
const DUELOS_POR_PAGINA = 5;

const HistorialDuelos = () => {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState("");

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin información";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "Sin información";
    return date.toLocaleDateString("es-AR");
  };

  const cargarHistorial = async () => {
    if (!token) return;
    setCargando(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/admin/duelos/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistorial(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando historial de duelos:", err);
      setError(
        err.response?.data?.mensaje ||
          "No se pudo cargar el historial de duelos.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [token]);

  const historialFiltrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return historial;

    return historial.filter((item) => {
      const texto = `${item.nombre_a || ""} ${item.apellido_a || ""} ${
        item.nombre_b || ""
      } ${item.apellido_b || ""} ${item.admin_nombre || ""}`.toLowerCase();
      return texto.includes(q);
    });
  }, [historial, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(historialFiltrado.length / DUELOS_POR_PAGINA),
  );

  // Asegura que la página actual no supere el total si se filtra o se elimina un registro
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const duelosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * DUELOS_POR_PAGINA;
    return historialFiltrado.slice(inicio, inicio + DUELOS_POR_PAGINA);
  }, [historialFiltrado, paginaActual]);

  const indiceInicio =
    historialFiltrado.length === 0
      ? 0
      : (paginaActual - 1) * DUELOS_POR_PAGINA + 1;
  const indiceFin = Math.min(
    paginaActual * DUELOS_POR_PAGINA,
    historialFiltrado.length,
  );

  // Navega a la vista de duelo cargando el registro seleccionado
  const handleVerAnalisis = (idDuelo) => {
    navigate(`/admin/duelos/comparar?id_duelo=${idDuelo}`);
  };

  const handleEliminarDuelo = async (item) => {
    if (!token) return;

    const nombreComparacion = `${item.nombre_a} ${item.apellido_a} vs ${item.nombre_b} ${item.apellido_b}`;
    if (
      !window.confirm(
        `¿Seguro que querés eliminar el duelo "${nombreComparacion}" del historial?`,
      )
    ) {
      return;
    }

    setEliminandoId(item.id_duelo);
    try {
      const res = await axios.delete(
        `${API_URL}/admin/duelos/${item.id_duelo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setHistorial((prev) =>
        prev.filter((d) => d.id_duelo !== item.id_duelo),
      );
      window.alert(
        res.data?.mensaje || "Duelo eliminado del historial correctamente.",
      );
    } catch (err) {
      console.error("Error al eliminar duelo:", err);
      window.alert(
        err.response?.data?.mensaje || "No se pudo eliminar el duelo.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 pb-14 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ENCABEZADO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <History size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Historial de Duelos
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Revisá análisis estratégicos generados anteriormente o
                  eliminá comparaciones que ya no correspondan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/duelos/comparar")}
              className="inline-flex h-10.5 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 text-sm font-bold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
            >
              <Swords size={16} />
              <span>Nueva Comparación</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* LISTADO PAGINADO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                Comparaciones registradas
              </h2>
              {historial.length > 0 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {historialFiltrado.length}{" "}
                  {historialFiltrado.length === 1 ? "duelo" : "duelos"}
                </span>
              )}
            </div>

            {historial.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  placeholder="Buscar por candidato o admin..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-7 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusqueda("");
                      setPaginaActual(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {cargando ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Cargando historial...
            </p>
          ) : historialFiltrado.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {busqueda
                ? "No hay duelos que coincidan con la búsqueda."
                : "Todavía no hay comparaciones registradas en el historial."}
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {duelosPaginados.map((item) => {
                  let parsed = null;
                  try {
                    parsed =
                      typeof item.analisis_comparativo === "string"
                        ? JSON.parse(item.analisis_comparativo)
                        : item.analisis_comparativo;
                  } catch {
                    parsed = null;
                  }

                  const estaEliminando = eliminandoId === item.id_duelo;

                  return (
                    <div
                      key={item.id_duelo}
                      className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                            <span className="text-indigo-700">
                              {item.nombre_a} {item.apellido_a}
                            </span>
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600">
                              VS
                            </span>
                            <span className="text-violet-700">
                              {item.nombre_b} {item.apellido_b}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatearFecha(item.fecha_duelo)} · Generado por{" "}
                            {item.admin_nombre}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleVerAnalisis(item.id_duelo)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <Eye size={14} />
                            Ver análisis
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarDuelo(item)}
                            disabled={estaEliminando}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
                          >
                            {estaEliminando ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            <span>
                              {estaEliminando ? "Eliminando..." : "Eliminar"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {parsed?.conclusion && (
                        <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs leading-relaxed text-slate-600">
                          {parsed.conclusion}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CONTROLES DE PAGINACIÓN (5 POR PÁGINA) */}
              {totalPaginas > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                  <p className="text-xs text-slate-500">
                    Mostrando{" "}
                    <strong className="text-slate-700">
                      {indiceInicio}–{indiceFin}
                    </strong>{" "}
                    de{" "}
                    <strong className="text-slate-700">
                      {historialFiltrado.length}
                    </strong>{" "}
                    duelos (página {paginaActual} de {totalPaginas})
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
                        const mostrarPuntos =
                          idx > 0 && num - arr[idx - 1] > 1;
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
                        setPaginaActual((prev) =>
                          Math.min(totalPaginas, prev + 1),
                        )
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
      </div>
    </div>
  );
};

export default HistorialDuelos;