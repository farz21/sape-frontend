import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Check,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const API_URL = "http://localhost:3000/api";

const TIPOS_SKILL = ["Técnica", "Blanda"];
const ELEMENTOS_POR_PAGINA = 5;

const GestionCompetencias = () => {
  const token = useAuthStore((state) => state.token);

  const [competencias, setCompetencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  // Formulario de creación
  const [nombre, setNombre] = useState("");
  const [tipoSkill, setTipoSkill] = useState("Técnica");

  // Buscador y paginación
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  // Estado del modal de edición
  const [competenciaEditando, setCompetenciaEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTipoSkill, setEditTipoSkill] = useState("Técnica");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const cargarCompetencias = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/competencias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar las competencias.");
      }
      const data = await res.json();
      setCompetencias(Array.isArray(data) ? data : data.competencias || []);
    } catch (err) {
      setError(err.message || "Error al cargar el catálogo de competencias.");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarCompetencias();
  }, [cargarCompetencias]);

  // Filtrado por nombre o tipo de skill
  const termino = busqueda.trim().toLowerCase();
  const competenciasFiltradas = competencias.filter((comp) => {
    if (!termino) return true;
    const coincideNombre = String(comp.nombre || "")
      .toLowerCase()
      .includes(termino);
    const coincideTipo = String(comp.tipo_skill || "")
      .toLowerCase()
      .includes(termino);
    return coincideNombre || coincideTipo;
  });

  // Paginación (5 por página cuando hay más de 5 resultados)
  const mostrarPaginador = competenciasFiltradas.length > ELEMENTOS_POR_PAGINA;
  const totalPaginas = Math.max(
    1,
    Math.ceil(competenciasFiltradas.length / ELEMENTOS_POR_PAGINA),
  );
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * ELEMENTOS_POR_PAGINA;
  const competenciasPaginadas = competenciasFiltradas.slice(
    indiceInicio,
    indiceInicio + ELEMENTOS_POR_PAGINA,
  );

  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  // Crear nueva competencia
  const manejarCrear = async (e) => {
    e.preventDefault();
    setError("");
    setAviso("");

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError("Ingresá un nombre para la competencia.");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/competencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          tipo_skill: tipoSkill,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.mensaje || "No se pudo registrar la competencia.");
        return;
      }

      setNombre("");
      setTipoSkill("Técnica");
      setAviso("Competencia registrada correctamente.");
      await cargarCompetencias();
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = (comp) => {
    setError("");
    setAviso("");
    setCompetenciaEditando(comp);
    setEditNombre(comp.nombre || "");
    setEditTipoSkill(
      TIPOS_SKILL.includes(comp.tipo_skill) ? comp.tipo_skill : "Técnica",
    );
  };

  const cerrarModalEdicion = () => {
    if (guardandoEdicion) return;
    setCompetenciaEditando(null);
    setEditNombre("");
    setEditTipoSkill("Técnica");
  };

  // Guardar edición desde el modal
  const manejarGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!competenciaEditando) return;

    setError("");
    setAviso("");

    const nombreLimpio = editNombre.trim();
    if (!nombreLimpio) {
      setError("Ingresá un nombre para la competencia.");
      return;
    }

    setGuardandoEdicion(true);
    try {
      const res = await fetch(
        `${API_URL}/competencias/${competenciaEditando.id_competencia}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: nombreLimpio,
            tipo_skill: editTipoSkill,
          }),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.mensaje || "No se pudo actualizar la competencia.");
        return;
      }

      setCompetenciaEditando(null);
      setAviso("Competencia actualizada correctamente.");
      await cargarCompetencias();
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // Eliminar competencia
  const manejarEliminar = async (comp) => {
    setError("");
    setAviso("");

    const confirmado = window.confirm(
      `¿Eliminar la competencia "${comp.nombre}"? Si ya fue usada en evaluaciones, el sistema lo impedirá para preservar el historial.`,
    );
    if (!confirmado) return;

    try {
      const res = await fetch(`${API_URL}/competencias/${comp.id_competencia}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.mensaje || "No se pudo eliminar la competencia.");
        return;
      }

      setAviso("Competencia eliminada correctamente.");
      await cargarCompetencias();
    } catch {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Gestión de Competencias
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra el catálogo de habilidades técnicas y blandas utilizadas en
          evaluaciones y duelos.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 bg-slate-50/80">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Award size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Catálogo de Competencias
            </h2>
            <p className="text-xs text-slate-500">
              Crea, edita o elimina competencias disponibles para evaluar
              empleados.
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}
        {aviso && (
          <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            {aviso}
          </div>
        )}

        {/* Formulario de nueva competencia */}
        <form
          onSubmit={manejarCrear}
          className="p-6 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
        >
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Nueva competencia
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Liderazgo Técnico o Pensamiento Crítico"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
              Tipo de skill
            </label>
            <div className="relative">
              <Layers
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={tipoSkill}
                onChange={(e) => setTipoSkill(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {TIPOS_SKILL.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={guardando}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Plus size={16} />
              {guardando ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </form>

        {/* Buscador y listado */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busqueda}
                onChange={manejarBusqueda}
                placeholder="Buscar por competencia o tipo (Técnica / Blanda)..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {!cargando && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
                {competenciasFiltradas.length}{" "}
                {competenciasFiltradas.length === 1
                  ? "competencia"
                  : "competencias"}
              </span>
            )}
          </div>

          {cargando ? (
            <p className="text-center py-8 text-sm text-slate-500">
              Cargando competencias...
            </p>
          ) : competenciasPaginadas.length > 0 ? (
            <>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Competencia</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {competenciasPaginadas.map((comp) => {
                      const esTecnica =
                        String(comp.tipo_skill).toLowerCase() === "técnica" ||
                        String(comp.tipo_skill).toLowerCase() === "tecnica";
                      return (
                        <tr
                          key={comp.id_competencia}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {comp.nombre}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                esTecnica
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : "bg-teal-50 text-teal-700 border border-teal-100"
                              }`}
                            >
                              {comp.tipo_skill}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => abrirModalEdicion(comp)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Editar competencia"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => manejarEliminar(comp)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Eliminar competencia"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {mostrarPaginador && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                    disabled={paginaSegura === 1}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={15} /> Anterior
                  </button>

                  <span className="text-xs font-medium text-slate-600">
                    Página{" "}
                    <strong className="text-slate-900">{paginaSegura}</strong> de{" "}
                    <strong className="text-slate-900">{totalPaginas}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                    }
                    disabled={paginaSegura === totalPaginas}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Siguiente <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-8 text-sm text-slate-400">
              {termino
                ? "No se encontraron competencias que coincidan con la búsqueda."
                : "No hay competencias registradas todavía."}
            </p>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {competenciaEditando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
          onClick={cerrarModalEdicion}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Pencil size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Editar Competencia
                </h3>
              </div>
              <button
                type="button"
                onClick={cerrarModalEdicion}
                disabled={guardandoEdicion}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 disabled:opacity-40 transition"
                aria-label="Cerrar modal de edición"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={manejarGuardarEdicion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Nombre de la competencia
                </label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                  Tipo de skill
                </label>
                <div className="relative">
                  <Layers
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={editTipoSkill}
                    onChange={(e) => setEditTipoSkill(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {TIPOS_SKILL.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrarModalEdicion}
                  disabled={guardandoEdicion}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Check size={16} />
                  {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCompetencias;