import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  FolderKanban,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000/api";
const ITEMS_POR_PAGINA = 5;

const proyectoVacio = {
  nombre: "",
  estado: "Planificado",
  fecha_fin: "",
};

const asignacionVacia = {
  id_empleado: "",
  id_proyecto: "",
  horas_asignadas: "",
  rol_en_proyecto: "",
};

const esEmpleadoAPrueba = (emp) =>
  emp?.en_periodo_prueba === 1 ||
  emp?.en_periodo_prueba === true ||
  emp?.en_periodo_prueba === "1";

const obtenerPuestoEmpleado = (emp) =>
  emp?.puesto || emp?.nombre_puesto || "Sin puesto";

const badgeEstadoProyecto = (estado) => {
  switch (estado) {
    case "Finalizado":
      return "bg-emerald-100 text-emerald-800";
    case "En curso":
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

        {empleadoActual && !deshabilitado && (
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

const GestionProyectos = () => {
  const token = useAuthStore((state) => state.token);

  const [pestanaActiva, setPestanaActiva] = useState("proyectos"); // "proyectos" | "asignaciones"
  const [proyectos, setProyectos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Formularios de creación
  const [proyecto, setProyecto] = useState(proyectoVacio);
  const [creandoProyecto, setCreandoProyecto] = useState(false);

  const [asignacion, setAsignacion] = useState(asignacionVacia);
  const [creandoAsignacion, setCreandoAsignacion] = useState(false);

  // Modal editar Proyecto
  const [modalProyectoAbierto, setModalProyectoAbierto] = useState(false);
  const [edicionProyectoId, setEdicionProyectoId] = useState(null);
  const [formProyectoEdicion, setFormProyectoEdicion] = useState(proyectoVacio);
  const [guardandoEdicionProyecto, setGuardandoEdicionProyecto] =
    useState(false);

  // Modal editar Asignación
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [edicionAsignacionId, setEdicionAsignacionId] = useState(null);
  const [formAsignacionEdicion, setFormAsignacionEdicion] =
    useState(asignacionVacia);
  const [guardandoEdicionAsignacion, setGuardandoEdicionAsignacion] =
    useState(false);

  const [busquedaProyecto, setBusquedaProyecto] = useState("");
  const [paginaProyecto, setPaginaProyecto] = useState(1);

  const [busquedaAsignacion, setBusquedaAsignacion] = useState("");
  const [paginaAsignacion, setPaginaAsignacion] = useState(1);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [proyectosRes, asignacionesRes, empleadosRes] = await Promise.all([
        fetch(`${API_URL}/admin/proyectos`, { headers }),
        fetch(`${API_URL}/admin/asignaciones`, { headers }),
        fetch(`${API_URL}/empleados`, { headers }),
      ]);

      if (!proyectosRes.ok || !asignacionesRes.ok || !empleadosRes.ok) {
        throw new Error("No se pudieron cargar proyectos y asignaciones.");
      }

      const [dataProyectos, dataAsignaciones, dataEmpleados] =
        await Promise.all([
          proyectosRes.json(),
          asignacionesRes.json(),
          empleadosRes.json(),
        ]);

      setProyectos(Array.isArray(dataProyectos) ? dataProyectos : []);
      setAsignaciones(Array.isArray(dataAsignaciones) ? dataAsignaciones : []);
      setEmpleados(Array.isArray(dataEmpleados) ? dataEmpleados : []);
    } catch (error) {
      console.error(error);
      window.alert(
        error.message || "Error al cargar los datos de proyectos.",
      );
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      cargar();
    }
  }, [token, cargar]);

  const cerrarModalProyecto = useCallback(() => {
    setModalProyectoAbierto(false);
    setEdicionProyectoId(null);
    setFormProyectoEdicion(proyectoVacio);
  }, []);

  const cerrarModalAsignacion = useCallback(() => {
    setModalAsignacionAbierto(false);
    setEdicionAsignacionId(null);
    setFormAsignacionEdicion(asignacionVacia);
  }, []);

  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === "Escape") {
        if (modalProyectoAbierto) cerrarModalProyecto();
        if (modalAsignacionAbierto) cerrarModalAsignacion();
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [
    modalProyectoAbierto,
    modalAsignacionAbierto,
    cerrarModalProyecto,
    cerrarModalAsignacion,
  ]);

  // --- PROYECTOS ---
  const crearProyecto = async (evento) => {
    evento.preventDefault();

    const nombreLimpio = String(proyecto.nombre || "").trim();
    if (!nombreLimpio) {
      window.alert("Ingresá el nombre del proyecto.");
      return;
    }

    setCreandoProyecto(true);
    try {
      const response = await fetch(`${API_URL}/admin/proyectos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...proyecto,
          nombre: nombreLimpio,
          fecha_fin: proyecto.fecha_fin || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || "No se pudo crear el proyecto.");
        return;
      }

      const mensajeExito = data.mensaje || "Proyecto creado correctamente.";
      setProyecto(proyectoVacio);
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert("Error de conexión con el servidor al crear el proyecto.");
    } finally {
      setCreandoProyecto(false);
    }
  };

  const abrirEdicionProyecto = (item) => {
    setEdicionProyectoId(item.id_proyecto);
    setFormProyectoEdicion({
      nombre: item.nombre || "",
      estado: item.estado || "Planificado",
      fecha_fin: item.fecha_fin?.slice(0, 10) || "",
    });
    setModalProyectoAbierto(true);
  };

  const guardarEdicionProyecto = async (evento) => {
    evento.preventDefault();
    if (!edicionProyectoId) return;

    const nombreLimpio = String(formProyectoEdicion.nombre || "").trim();
    if (!nombreLimpio) {
      window.alert("Ingresá el nombre del proyecto.");
      return;
    }

    setGuardandoEdicionProyecto(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/proyectos/${edicionProyectoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formProyectoEdicion,
            nombre: nombreLimpio,
            fecha_fin: formProyectoEdicion.fecha_fin || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || "No se pudo actualizar el proyecto.");
        return;
      }

      const mensajeExito =
        data.mensaje || "Proyecto actualizado correctamente.";
      cerrarModalProyecto();
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert(
        "Error de conexión con el servidor al actualizar el proyecto.",
      );
    } finally {
      setGuardandoEdicionProyecto(false);
    }
  };

  // --- ASIGNACIONES ---
  const crearAsignacion = async (evento) => {
    evento.preventDefault();

    const rolLimpio = String(asignacion.rol_en_proyecto || "").trim();
    const horasNum = Number(asignacion.horas_asignadas);

    if (!asignacion.id_empleado || !asignacion.id_proyecto || !rolLimpio) {
      window.alert("Completá el empleado, el proyecto y el rol.");
      return;
    }

    if (!Number.isFinite(horasNum) || horasNum < 1) {
      window.alert("Ingresá una cantidad válida de horas (mínimo 1).");
      return;
    }

    setCreandoAsignacion(true);
    try {
      const response = await fetch(`${API_URL}/admin/asignaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...asignacion,
          rol_en_proyecto: rolLimpio,
          horas_asignadas: horasNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(
          data.mensaje || "No se pudo asignar el empleado al proyecto.",
        );
        return;
      }

      const mensajeExito = data.mensaje || "Empleado asignado correctamente.";
      setAsignacion(asignacionVacia);
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert(
        "Error de conexión con el servidor al crear la asignación.",
      );
    } finally {
      setCreandoAsignacion(false);
    }
  };

  const abrirEdicionAsignacion = (item) => {
    setEdicionAsignacionId(item.id_asignacion);
    setFormAsignacionEdicion({
      id_empleado: String(item.id_empleado || ""),
      id_proyecto: String(item.id_proyecto || ""),
      horas_asignadas: item.horas_asignadas ?? "",
      rol_en_proyecto: item.rol_en_proyecto || "",
    });
    setModalAsignacionAbierto(true);
  };

  const guardarEdicionAsignacion = async (evento) => {
    evento.preventDefault();
    if (!edicionAsignacionId) return;

    const rolLimpio = String(formAsignacionEdicion.rol_en_proyecto || "").trim();
    const horasNum = Number(formAsignacionEdicion.horas_asignadas);

    if (!rolLimpio) {
      window.alert("Ingresá el rol en el proyecto.");
      return;
    }

    if (!Number.isFinite(horasNum) || horasNum < 1) {
      window.alert("Ingresá una cantidad válida de horas (mínimo 1).");
      return;
    }

    setGuardandoEdicionAsignacion(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/asignaciones/${edicionAsignacionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formAsignacionEdicion,
            rol_en_proyecto: rolLimpio,
            horas_asignadas: horasNum,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || "No se pudo actualizar la asignación.");
        return;
      }

      const mensajeExito =
        data.mensaje || "Asignación actualizada correctamente.";
      cerrarModalAsignacion();
      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert(
        "Error de conexión con el servidor al actualizar la asignación.",
      );
    } finally {
      setGuardandoEdicionAsignacion(false);
    }
  };

  const borrar = async (tipo, id, etiqueta = "este registro") => {
    if (!window.confirm(`¿Seguro que querés eliminar ${etiqueta}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/${tipo}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.mensaje || `No se pudo eliminar ${etiqueta}.`);
        return;
      }

      if (tipo === "proyectos" && edicionProyectoId === id) {
        cerrarModalProyecto();
      }
      if (tipo === "asignaciones" && edicionAsignacionId === id) {
        cerrarModalAsignacion();
      }

      const mensajeExito =
        data.mensaje ||
        (tipo === "proyectos"
          ? "Proyecto eliminado correctamente."
          : "Asignación eliminada correctamente.");

      await cargar();
      window.alert(mensajeExito);
    } catch (error) {
      console.error(error);
      window.alert("Error de conexión con el servidor al eliminar.");
    }
  };

  const proyectosFiltrados = useMemo(() => {
    const q = busquedaProyecto.trim().toLowerCase();
    if (!q) return proyectos;
    return proyectos.filter((item) =>
      `${item.nombre || ""} ${item.estado || ""}`.toLowerCase().includes(q),
    );
  }, [proyectos, busquedaProyecto]);

  const totalPaginasProyecto = Math.max(
    1,
    Math.ceil(proyectosFiltrados.length / ITEMS_POR_PAGINA),
  );
  const paginaSeguraProyecto = Math.min(paginaProyecto, totalPaginasProyecto);
  const inicioProyecto = (paginaSeguraProyecto - 1) * ITEMS_POR_PAGINA;
  const proyectosPaginados = proyectosFiltrados.slice(
    inicioProyecto,
    inicioProyecto + ITEMS_POR_PAGINA,
  );

  const asignacionesFiltradas = useMemo(() => {
    const q = busquedaAsignacion.trim().toLowerCase();
    if (!q) return asignaciones;
    return asignaciones.filter((item) =>
      `${item.nombre || ""} ${item.apellido || ""} ${item.proyecto || ""} ${
        item.rol_en_proyecto || ""
      }`
        .toLowerCase()
        .includes(q),
    );
  }, [asignaciones, busquedaAsignacion]);

  const totalPaginasAsignacion = Math.max(
    1,
    Math.ceil(asignacionesFiltradas.length / ITEMS_POR_PAGINA),
  );
  const paginaSeguraAsignacion = Math.min(
    paginaAsignacion,
    totalPaginasAsignacion,
  );
  const inicioAsignacion = (paginaSeguraAsignacion - 1) * ITEMS_POR_PAGINA;
  const asignacionesPaginadas = asignacionesFiltradas.slice(
    inicioAsignacion,
    inicioAsignacion + ITEMS_POR_PAGINA,
  );

  const empleadoAsignacionEditando = empleados.find(
    (emp) =>
      String(emp.id_empleado) === String(formAsignacionEdicion.id_empleado),
  );
  const proyectoAsignacionEditando = proyectos.find(
    (proy) =>
      String(proy.id_proyecto) === String(formAsignacionEdicion.id_proyecto),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* ENCABEZADO + SELECTOR DE SECCIÓN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <FolderKanban size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Proyectos y Asignaciones
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Creá proyectos o asignaciones desde el formulario y editá
                registros en modal sin perder contexto.
              </p>
            </div>
          </div>

          <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-50 p-1 md:self-center">
            <button
              type="button"
              onClick={() => setPestanaActiva("proyectos")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                pestanaActiva === "proyectos"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <FolderKanban size={14} />
              Proyectos ({proyectos.length})
            </button>

            <button
              type="button"
              onClick={() => setPestanaActiva("asignaciones")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                pestanaActiva === "asignaciones"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Users size={14} />
              Asignaciones ({asignaciones.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN PROYECTOS */}
      {pestanaActiva === "proyectos" && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <form
            onSubmit={crearProyecto}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
          >
            <div className="border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Plus size={17} className="text-indigo-600" />
                Nuevo proyecto
              </h2>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Nombre del proyecto
              </label>
              <input
                required
                value={proyecto.nombre}
                onChange={(evento) =>
                  setProyecto({
                    ...proyecto,
                    nombre: evento.target.value,
                  })
                }
                placeholder="Ej: Rediseño Portal Cliente"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Estado
              </label>
              <select
                value={proyecto.estado}
                onChange={(evento) =>
                  setProyecto({
                    ...proyecto,
                    estado: evento.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option>Planificado</option>
                <option>En curso</option>
                <option>Finalizado</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Fecha de fin
              </label>
              <input
                type="date"
                value={proyecto.fecha_fin || ""}
                onChange={(evento) =>
                  setProyecto({
                    ...proyecto,
                    fecha_fin: evento.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creandoProyecto}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check size={17} />
              {creandoProyecto ? "Guardando..." : "Crear proyecto"}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busquedaProyecto}
                  onChange={(e) => {
                    setBusquedaProyecto(e.target.value);
                    setPaginaProyecto(1);
                  }}
                  placeholder="Buscar proyecto por nombre o estado..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {proyectosFiltrados.length}{" "}
                {proyectosFiltrados.length === 1 ? "proyecto" : "proyectos"}
              </span>
            </div>

            {cargando ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Cargando proyectos...
              </div>
            ) : proyectosPaginados.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay proyectos registrados o que coincidan con la búsqueda.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        <th className="px-4 py-3">Proyecto</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Fin</th>
                        <th className="px-4 py-3">Asignados</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {proyectosPaginados.map((item) => (
                        <tr
                          key={item.id_proyecto}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3.5 font-semibold text-slate-900">
                            {item.nombre}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeEstadoProyecto(
                                item.estado,
                              )}`}
                            >
                              {item.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs whitespace-nowrap text-slate-600">
                            {item.fecha_fin?.slice(0, 10) || "Sin fecha"}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-700">
                            {item.cantidad_asignados ?? 0}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => abrirEdicionProyecto(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <Pencil size={13} />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  borrar(
                                    "proyectos",
                                    item.id_proyecto,
                                    `el proyecto "${item.nombre}"`,
                                  )
                                }
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

                {proyectosFiltrados.length > ITEMS_POR_PAGINA && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                    <span>
                      Mostrando {inicioProyecto + 1}–
                      {Math.min(
                        inicioProyecto + ITEMS_POR_PAGINA,
                        proyectosFiltrados.length,
                      )}{" "}
                      de {proyectosFiltrados.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPaginaProyecto((p) => Math.max(1, p - 1))
                        }
                        disabled={paginaSeguraProyecto <= 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                        Anterior
                      </button>

                      {Array.from(
                        { length: totalPaginasProyecto },
                        (_, idx) => idx + 1,
                      ).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPaginaProyecto(num)}
                          className={`h-7 min-w-7 rounded-lg px-2 font-bold transition ${
                            paginaSeguraProyecto === num
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setPaginaProyecto((p) =>
                            Math.min(totalPaginasProyecto, p + 1),
                          )
                        }
                        disabled={paginaSeguraProyecto >= totalPaginasProyecto}
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
      )}

      {/* SECCIÓN ASIGNACIONES */}
      {pestanaActiva === "asignaciones" && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <form
            onSubmit={crearAsignacion}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
          >
            <div className="border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Plus size={17} className="text-indigo-600" />
                Asignar empleado a proyecto
              </h2>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Empleado
              </label>
              <SelectorEmpleadoDropdown
                empleados={empleados}
                valorSeleccionado={asignacion.id_empleado}
                placeholder="Buscar y seleccionar empleado..."
                onSeleccionar={(val) =>
                  setAsignacion((prev) => ({ ...prev, id_empleado: val }))
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Proyecto
              </label>
              <select
                required
                value={asignacion.id_proyecto}
                onChange={(evento) =>
                  setAsignacion({
                    ...asignacion,
                    id_proyecto: evento.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Seleccioná un proyecto...</option>
                {proyectos.map((item) => (
                  <option key={item.id_proyecto} value={item.id_proyecto}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Rol en el proyecto
              </label>
              <input
                required
                value={asignacion.rol_en_proyecto}
                onChange={(evento) =>
                  setAsignacion({
                    ...asignacion,
                    rol_en_proyecto: evento.target.value,
                  })
                }
                placeholder="Ej: Frontend Developer"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Horas asignadas
              </label>
              <input
                required
                type="number"
                min="1"
                value={asignacion.horas_asignadas}
                onChange={(evento) =>
                  setAsignacion({
                    ...asignacion,
                    horas_asignadas: evento.target.value,
                  })
                }
                placeholder="Ej: 20"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creandoAsignacion}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check size={17} />
              {creandoAsignacion ? "Guardando..." : "Asignar"}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busquedaAsignacion}
                  onChange={(e) => {
                    setBusquedaAsignacion(e.target.value);
                    setPaginaAsignacion(1);
                  }}
                  placeholder="Buscar por empleado, proyecto o rol..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {asignacionesFiltradas.length}{" "}
                {asignacionesFiltradas.length === 1
                  ? "asignación"
                  : "asignaciones"}
              </span>
            </div>

            {cargando ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Cargando asignaciones...
              </div>
            ) : asignacionesPaginadas.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay asignaciones registradas o que coincidan con la búsqueda.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        <th className="px-4 py-3">Empleado</th>
                        <th className="px-4 py-3">Proyecto</th>
                        <th className="px-4 py-3">Rol</th>
                        <th className="px-4 py-3">Horas</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {asignacionesPaginadas.map((item) => (
                        <tr
                          key={item.id_asignacion}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3.5 font-semibold text-slate-900">
                            {item.nombre} {item.apellido}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            {item.proyecto}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                              {item.rol_en_proyecto}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-700">
                            {item.horas_asignadas} h
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => abrirEdicionAsignacion(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <Pencil size={13} />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  borrar(
                                    "asignaciones",
                                    item.id_asignacion,
                                    `la asignación de ${item.nombre || ""} ${
                                      item.apellido || ""
                                    }`.trim(),
                                  )
                                }
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

                {asignacionesFiltradas.length > ITEMS_POR_PAGINA && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                    <span>
                      Mostrando {inicioAsignacion + 1}–
                      {Math.min(
                        inicioAsignacion + ITEMS_POR_PAGINA,
                        asignacionesFiltradas.length,
                      )}{" "}
                      de {asignacionesFiltradas.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPaginaAsignacion((p) => Math.max(1, p - 1))
                        }
                        disabled={paginaSeguraAsignacion <= 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                        Anterior
                      </button>

                      {Array.from(
                        { length: totalPaginasAsignacion },
                        (_, idx) => idx + 1,
                      ).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPaginaAsignacion(num)}
                          className={`h-7 min-w-7 rounded-lg px-2 font-bold transition ${
                            paginaSeguraAsignacion === num
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setPaginaAsignacion((p) =>
                            Math.min(totalPaginasAsignacion, p + 1),
                          )
                        }
                        disabled={
                          paginaSeguraAsignacion >= totalPaginasAsignacion
                        }
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
      )}

      {/* MODAL EDITAR PROYECTO */}
      {modalProyectoAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
          onClick={cerrarModalProyecto}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Pencil size={17} className="text-indigo-600" />
                Editar proyecto #{edicionProyectoId}
              </h3>
              <button
                type="button"
                onClick={cerrarModalProyecto}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={guardarEdicionProyecto}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Nombre del proyecto
                </label>
                <input
                  required
                  value={formProyectoEdicion.nombre}
                  onChange={(evento) =>
                    setFormProyectoEdicion({
                      ...formProyectoEdicion,
                      nombre: evento.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Estado
                </label>
                <select
                  value={formProyectoEdicion.estado}
                  onChange={(evento) =>
                    setFormProyectoEdicion({
                      ...formProyectoEdicion,
                      estado: evento.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                >
                  <option>Planificado</option>
                  <option>En curso</option>
                  <option>Finalizado</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={formProyectoEdicion.fecha_fin || ""}
                  onChange={(evento) =>
                    setFormProyectoEdicion({
                      ...formProyectoEdicion,
                      fecha_fin: evento.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalProyecto}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicionProyecto}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  {guardandoEdicionProyecto
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ASIGNACIÓN */}
      {modalAsignacionAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
          onClick={cerrarModalAsignacion}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Pencil size={17} className="text-indigo-600" />
                  Editar asignación #{edicionAsignacionId}
                </h3>
                {(empleadoAsignacionEditando || proyectoAsignacionEditando) && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {empleadoAsignacionEditando
                      ? `${empleadoAsignacionEditando.nombre} ${empleadoAsignacionEditando.apellido}`
                      : ""}{" "}
                    {proyectoAsignacionEditando
                      ? `· ${proyectoAsignacionEditando.nombre}`
                      : ""}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={cerrarModalAsignacion}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={guardarEdicionAsignacion}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Rol en el proyecto
                </label>
                <input
                  required
                  value={formAsignacionEdicion.rol_en_proyecto}
                  onChange={(evento) =>
                    setFormAsignacionEdicion({
                      ...formAsignacionEdicion,
                      rol_en_proyecto: evento.target.value,
                    })
                  }
                  placeholder="Ej: Frontend Developer"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Horas asignadas
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formAsignacionEdicion.horas_asignadas}
                  onChange={(evento) =>
                    setFormAsignacionEdicion({
                      ...formAsignacionEdicion,
                      horas_asignadas: evento.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalAsignacion}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicionAsignacion}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  {guardandoEdicionAsignacion
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProyectos;