import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000/api";
const METAS_POR_PAGINA = 5;

const vacia = {
  id_empleado: "",
  titulo: "",
  descripcion: "",
  estado: "Pendiente",
  progreso: 0,
  fecha_limite: "",
};

const esEmpleadoAPrueba = (emp) =>
  emp?.en_periodo_prueba === 1 ||
  emp?.en_periodo_prueba === true ||
  emp?.en_periodo_prueba === "1";

const obtenerPuestoEmpleado = (emp) =>
  emp?.puesto || emp?.nombre_puesto || "Sin puesto";

const badgeEstadoMeta = (estado) => {
  switch (estado) {
    case "Completada":
      return "bg-emerald-100 text-emerald-800";
    case "En progreso":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

function SelectorEmpleadoDropdown({
  empleados,
  valorSeleccionado,
  onSeleccionar,
  placeholder = "Seleccioná un empleado...",
  deshabilitado = false,
  permitirLimpiar = true,
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCondicion, setFiltroCondicion] = useState("todos"); // "todos" | "fijos" | "prueba"
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);

  const empleadoActual = empleados.find(
    (emp) => String(emp.id_empleado) === String(valorSeleccionado),
  );

  useEffect(() => {
    const manejarClickAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickAfuera);
    return () => document.removeEventListener("mousedown", manejarClickAfuera);
  }, []);

  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
    if (!abierto) {
      setBusqueda("");
      setFiltroCondicion("todos");
    }
  }, [abierto]);

  const totalFijos = empleados.filter((e) => !esEmpleadoAPrueba(e)).length;
  const totalPrueba = empleados.filter((e) => esEmpleadoAPrueba(e)).length;

  const filtrados = empleados.filter((emp) => {
    const aPrueba = esEmpleadoAPrueba(emp);
    if (filtroCondicion === "fijos" && aPrueba) return false;
    if (filtroCondicion === "prueba" && !aPrueba) return false;

    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const texto = `${emp.nombre || ""} ${emp.apellido || ""} ${
      emp.legajo || ""
    } ${obtenerPuestoEmpleado(emp)}`.toLowerCase();
    return texto.includes(q);
  });

  return (
    <div ref={contenedorRef} className="relative">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => setAbierto((prev) => !prev)}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2 text-left text-sm shadow-2xs transition focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 ${
            abierto
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "border-slate-300 hover:border-slate-400"
          }`}
        >
          {empleadoActual ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-slate-800">
                  {empleadoActual.nombre} {empleadoActual.apellido}
                </span>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    esEmpleadoAPrueba(empleadoActual)
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {esEmpleadoAPrueba(empleadoActual) ? "A prueba" : "Fijo"}
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">
                {obtenerPuestoEmpleado(empleadoActual)}
                {empleadoActual.legajo ? ` · Leg. ${empleadoActual.legajo}` : ""}
              </p>
            </div>
          ) : (
            <span className="truncate font-medium text-slate-400">
              {placeholder}
            </span>
          )}

          <ChevronDown
            size={16}
            className={`shrink-0 text-slate-400 transition-transform ${
              abierto ? "rotate-180" : ""
            }`}
          />
        </button>

        {permitirLimpiar && empleadoActual && !deshabilitado && (
          <button
            type="button"
            title="Quitar selección"
            onClick={() => {
              onSeleccionar("");
              setAbierto(false);
            }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {abierto && (
        <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl">
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, legajo o puesto..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-7 pl-8 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* FILTRO RÁPIDO FIJO / A PRUEBA */}
          <div className="mb-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setFiltroCondicion("todos")}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                filtroCondicion === "todos"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({empleados.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCondicion("fijos")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
                filtroCondicion === "fijos"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <ShieldCheck size={11} />
              Fijos ({totalFijos})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCondicion("prueba")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition ${
                filtroCondicion === "prueba"
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              <Clock size={11} />
              A prueba ({totalPrueba})
            </button>
          </div>

          <div className="max-h-56 divide-y divide-slate-100 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No se encontraron empleados con ese criterio.
              </p>
            ) : (
              filtrados.map((emp) => {
                const estaSeleccionado =
                  String(emp.id_empleado) === String(valorSeleccionado);
                const aPrueba = esEmpleadoAPrueba(emp);

                return (
                  <button
                    key={emp.id_empleado}
                    type="button"
                    onClick={() => {
                      onSeleccionar(String(emp.id_empleado));
                      setAbierto(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition ${
                      estaSeleccionado ? "bg-indigo-50/90" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-slate-800">
                          {emp.nombre} {emp.apellido}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            aPrueba
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {aPrueba ? "A prueba" : "Fijo"}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-slate-500">
                        {obtenerPuestoEmpleado(emp)}
                        {emp.legajo ? ` · ${emp.legajo}` : ""}
                      </p>
                    </div>

                    {estaSeleccionado && (
                      <Check size={15} className="shrink-0 text-indigo-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const GestionMetas = () => {
  const token = useAuthStore((state) => state.token);

  const [metas, setMetas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);

  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  // Formulario de creación
  const [formulario, setFormulario] = useState(vacia);

  // Modal de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState(vacia);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const params = new URLSearchParams();
      if (filtroEmpleado) {
        params.set("id_empleado", filtroEmpleado);
      }
      if (filtroEstado) {
        params.set("estado", filtroEstado);
      }

      const [metasRes, empleadosRes] = await Promise.all([
        fetch(`${API_URL}/admin/metas?${params}`, { headers }),
        fetch(`${API_URL}/empleados`, { headers }),
      ]);

      if (!metasRes.ok || !empleadosRes.ok) {
        throw new Error("No se pudieron cargar las metas o empleados.");
      }

      const dataMetas = await metasRes.json();
      const dataEmpleados = await empleadosRes.json();

      setMetas(Array.isArray(dataMetas) ? dataMetas : []);
      setEmpleados(Array.isArray(dataEmpleados) ? dataEmpleados : []);
    } catch (error) {
      console.error(error);
      window.alert(error.message || "Error al cargar los datos de metas.");
    } finally {
      setCargando(false);
    }
  }, [token, filtroEmpleado, filtroEstado]);

  useEffect(() => {
    if (token) {
      cargar();
    }
  }, [token, cargar]);

  const cerrarModal = useCallback(() => {
    setModalAbierto(false);
    setEditandoId(null);
    setFormEdicion(vacia);
  }, []);

  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === "Escape" && modalAbierto) {
        cerrarModal();
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [modalAbierto, cerrarModal]);

  const cambiarCreacion = (evento) => {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
  };

  const cambiarEdicion = (evento) => {
    setFormEdicion({
      ...formEdicion,
      [evento.target.name]: evento.target.value,
    });
  };

  const limpiarFiltros = () => {
    setFiltroEmpleado("");
    setFiltroEstado("");
    setBusqueda("");
    setPaginaActual(1);
  };

  const crearMeta = async (evento) => {
    evento.preventDefault();

    const tituloLimpio = String(formulario.titulo || "").trim();
    if (!formulario.id_empleado || !tituloLimpio) {
      window.alert("Seleccioná un empleado e ingresá el título de la meta.");
      return;
    }

    setCreando(true);
    try {
      const response = await fetch(`${API_URL}/admin/metas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formulario,
          titulo: tituloLimpio,
          progreso: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || "No se pudo asignar la meta.");
        return;
      }

      const mensajeExito = data.mensaje || "Meta asignada correctamente.";
      setFormulario(vacia);
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert("Error de conexión con el servidor al asignar la meta.");
    } finally {
      setCreando(false);
    }
  };

  const abrirEdicion = (meta) => {
    setEditandoId(meta.id_meta);
    setFormEdicion({
      id_empleado: String(meta.id_empleado || ""),
      titulo: meta.titulo || "",
      descripcion: meta.descripcion || "",
      estado: meta.estado || "Pendiente",
      progreso: meta.progreso ?? 0,
      fecha_limite: meta.fecha_limite?.slice(0, 10) || "",
    });
    setModalAbierto(true);
  };

  const guardarEdicion = async (evento) => {
    evento.preventDefault();
    if (!editandoId) return;

    const tituloLimpio = String(formEdicion.titulo || "").trim();
    if (!tituloLimpio) {
      window.alert("Ingresá el título de la meta.");
      return;
    }

    setGuardandoEdicion(true);
    try {
      const response = await fetch(`${API_URL}/admin/metas/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formEdicion,
          titulo: tituloLimpio,
          progreso: Math.max(
            0,
            Math.min(100, Number(formEdicion.progreso) || 0),
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || "No se pudo actualizar la meta.");
        return;
      }

      const mensajeExito = data.mensaje || "Meta actualizada correctamente.";
      cerrarModal();
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert("Error de conexión con el servidor al actualizar la meta.");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const eliminar = async (meta) => {
    const etiquetaMeta = meta?.titulo ? `"${meta.titulo}"` : "esta meta";
    if (!window.confirm(`¿Seguro que querés eliminar ${etiquetaMeta}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/metas/${meta.id_meta}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || "No se pudo eliminar la meta.");
        return;
      }

      if (editandoId === meta.id_meta) {
        cerrarModal();
      }

      const mensajeExito = data.mensaje || "Meta eliminada correctamente.";
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert("Error de conexión con el servidor al eliminar la meta.");
    }
  };

  const metasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return metas;
    return metas.filter((m) => {
      const texto = `${m.nombre || ""} ${m.apellido || ""} ${m.legajo || ""} ${
        m.titulo || ""
      } ${m.descripcion || ""}`.toLowerCase();
      return texto.includes(q);
    });
  }, [metas, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(metasFiltradas.length / METAS_POR_PAGINA),
  );
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaSegura - 1) * METAS_POR_PAGINA;
  const metasPaginadas = metasFiltradas.slice(
    indiceInicio,
    indiceInicio + METAS_POR_PAGINA,
  );

  const hayFiltrosActivos = Boolean(
    filtroEmpleado || filtroEstado || busqueda.trim(),
  );

  const empleadoEditando = empleados.find(
    (emp) => String(emp.id_empleado) === String(formEdicion.id_empleado),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* ENCABEZADO */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Gestión de Metas
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Asigná objetivos a colaboradores, editá su estado o progreso en
                modal y eliminá metas registradas.
              </p>
            </div>
          </div>

          <span className="self-start rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 sm:self-center">
            {metasFiltradas.length}{" "}
            {metasFiltradas.length === 1 ? "meta" : "metas"}
          </span>
        </div>
      </div>

      {/* FORMULARIO DE ALTA + LISTADO PAGINADO */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <form
          onSubmit={crearMeta}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
        >
          <div className="border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Plus size={17} className="text-indigo-600" />
              Asignar meta manual
            </h2>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Empleado
            </label>
            <SelectorEmpleadoDropdown
              empleados={empleados}
              valorSeleccionado={formulario.id_empleado}
              placeholder="Buscar y seleccionar empleado..."
              onSeleccionar={(val) =>
                setFormulario((prev) => ({ ...prev, id_empleado: val }))
              }
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Título de la meta
            </label>
            <input
              required
              name="titulo"
              value={formulario.titulo}
              onChange={cambiarCreacion}
              placeholder="Ej: Completar módulo de testing"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formulario.descripcion || ""}
              onChange={cambiarCreacion}
              placeholder="Detalle o criterio de cumplimiento..."
              className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Fecha límite
            </label>
            <input
              type="date"
              name="fecha_limite"
              value={formulario.fecha_limite || ""}
              onChange={cambiarCreacion}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={creando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Check size={17} />
            {creando ? "Guardando..." : "Asignar meta"}
          </button>
        </form>

        {/* TABLA PAGINADA DE METAS */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-44 flex-1">
              <Search
                size={15}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                placeholder="Buscar meta o empleado..."
                className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="w-full sm:w-56">
              <SelectorEmpleadoDropdown
                empleados={empleados}
                valorSeleccionado={filtroEmpleado}
                placeholder="Filtrar por empleado..."
                onSeleccionar={(val) => {
                  setFiltroEmpleado(val);
                  setPaginaActual(1);
                }}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(evento) => {
                setFiltroEstado(evento.target.value);
                setPaginaActual(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option>Pendiente</option>
              <option>En progreso</option>
              <option>Completada</option>
            </select>

            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <RotateCcw size={13} />
                Limpiar
              </button>
            )}
          </div>

          {cargando ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Cargando metas...
            </div>
          ) : metasPaginadas.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No hay metas para los filtros seleccionados.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      <th className="px-4 py-3">Empleado</th>
                      <th className="px-4 py-3">Meta</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Progreso</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {metasPaginadas.map((meta) => (
                      <tr
                        key={meta.id_meta}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3.5 align-top">
                          <p className="font-semibold text-slate-900">
                            {meta.nombre} {meta.apellido}
                          </p>
                          <span className="text-xs text-slate-500">
                            {meta.legajo || "Sin legajo"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <p className="font-semibold text-slate-900">
                            {meta.titulo}
                          </p>
                          <p className="text-xs text-slate-500">
                            Límite:{" "}
                            {meta.fecha_limite?.slice(0, 10) || "Sin fecha"}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 align-top whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeEstadoMeta(
                              meta.estado,
                            )}`}
                          >
                            {meta.estado}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <div className="w-24">
                            <span className="text-xs font-bold text-slate-700">
                              {meta.progreso}%
                            </span>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-indigo-600"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, Number(meta.progreso) || 0),
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right align-top whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => abrirEdicion(meta)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              <Pencil size={13} />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => eliminar(meta)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 size={13} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {metasFiltradas.length > METAS_POR_PAGINA && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                  <span>
                    Mostrando {indiceInicio + 1}–
                    {Math.min(
                      indiceInicio + METAS_POR_PAGINA,
                      metasFiltradas.length,
                    )}{" "}
                    de {metasFiltradas.length}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPaginaActual((p) => Math.max(1, p - 1))
                      }
                      disabled={paginaSegura <= 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                      Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, idx) => idx + 1).map(
                      (num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPaginaActual(num)}
                          className={`h-7 min-w-7 rounded-lg px-2 font-bold transition ${
                            paginaSegura === num
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {num}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                      }
                      disabled={paginaSegura >= totalPaginas}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      Siguiente
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL EDITAR META */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
          onClick={cerrarModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Pencil size={17} className="text-indigo-600" />
                  Editar meta #{editandoId}
                </h3>
                {empleadoEditando && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Empleado: {empleadoEditando.nombre}{" "}
                    {empleadoEditando.apellido} ({empleadoEditando.legajo})
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarEdicion} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Título de la meta
                </label>
                <input
                  required
                  name="titulo"
                  value={formEdicion.titulo}
                  onChange={cambiarEdicion}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formEdicion.descripcion || ""}
                  onChange={cambiarEdicion}
                  className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formEdicion.estado}
                    onChange={cambiarEdicion}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                  >
                    <option>Pendiente</option>
                    <option>En progreso</option>
                    <option>Completada</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Progreso (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="progreso"
                    value={formEdicion.progreso}
                    onChange={cambiarEdicion}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    name="fecha_limite"
                    value={formEdicion.fecha_limite || ""}
                    onChange={cambiarEdicion}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
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

export default GestionMetas;