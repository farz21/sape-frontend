import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Swords,
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Lightbulb,
  Award,
  Info,
  History,
  UserCheck,
  BarChart3,
  BatteryCharging,
  Briefcase,
  Search,
  ShieldCheck,
  Clock,
  Loader2,
  RotateCcw,
  ChevronDown,
  X,
  Check,
} from "lucide-react";

import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000/api";

// Helper reutilizable para normalizar el campo en_periodo_prueba (1/0, true/false)
const esEmpleadoAPrueba = (emp) =>
  emp?.en_periodo_prueba === 1 ||
  emp?.en_periodo_prueba === true ||
  emp?.en_periodo_prueba === "1";

// ==========================================
// SELECTOR COMPACTO CON BÚSQUEDA INTEGRADA
// ==========================================

function SelectorEmpleado({
  label,
  acento = "indigo",
  empleados,
  valorSeleccionado,
  onSeleccionar,
  placeholder = "Seleccioná un empleado...",
  deshabilitado = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);

  const esIndigo = acento === "indigo";

  const empleadoActual = empleados.find(
    (emp) => String(emp.id_empleado) === String(valorSeleccionado),
  );

  useEffect(() => {
    const manejarClickAfuera = (e) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target)
      ) {
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
    }
  }, [abierto]);

  const filtrados = empleados.filter((emp) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const texto = `${emp.nombre || ""} ${emp.apellido || ""} ${
      emp.puesto || emp.nombre_puesto || ""
    } ${emp.legajo || ""}`.toLowerCase();
    return texto.includes(q);
  });

  const obtenerPuesto = (emp) =>
    emp?.puesto || emp?.nombre_puesto || "Sin puesto";

  return (
    <div ref={contenedorRef} className="relative">
      <label
        className={`mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
          esIndigo ? "text-indigo-700" : "text-violet-700"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            esIndigo ? "bg-indigo-600" : "bg-violet-600"
          }`}
        />
        {label}
      </label>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => setAbierto((prev) => !prev)}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm shadow-xs transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            abierto
              ? esIndigo
                ? "border-indigo-500 ring-2 ring-indigo-100"
                : "border-violet-500 ring-2 ring-violet-100"
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
                {obtenerPuesto(empleadoActual)}
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
            className="inline-flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {abierto && (
        <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar por nombre, puesto o legajo..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
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
                      estaSeleccionado
                        ? esIndigo
                          ? "bg-indigo-50/90"
                          : "bg-violet-50/90"
                        : "hover:bg-slate-50"
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
                        {obtenerPuesto(emp)}
                        {emp.legajo ? ` · ${emp.legajo}` : ""}
                      </p>
                    </div>

                    {estaSeleccionado && (
                      <Check
                        size={15}
                        className={
                          esIndigo ? "text-indigo-600" : "text-violet-600"
                        }
                      />
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

// ==========================================
// COMPONENTES DE GRÁFICOS
// ==========================================

function GraficoDona({ valor, color, titulo }) {
  const porcentaje = Math.max(0, Math.min(100, Number(valor) || 0));

  const datos = [
    { name: "Puntaje promedio", value: porcentaje },
    { name: "Restante", value: 100 - porcentaje },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={66}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
            >
              {datos.map((entry, index) => (
                <Cell key={entry.name} fill={index === 0 ? color : "#E2E8F0"} />
              ))}
            </Pie>

            <Tooltip formatter={(value) => [`${value}%`, "Promedio"]} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900">
            {porcentaje}%
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {titulo}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TARJETA DE EMPLEADO
// ==========================================

function TarjetaEmpleado({ empleado, etiqueta }) {
  const esA = etiqueta === "A";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
        esA ? "border-indigo-200" : "border-violet-200"
      }`}
    >
      {/* Franja superior decorativa */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: empleado.color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white shadow-sm"
            style={{ backgroundColor: empleado.color }}
          >
            {empleado.iniciales}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {empleado.nombre}
              </h3>

              {empleado.seniority && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    esA
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-violet-50 text-violet-700"
                  }`}
                >
                  {empleado.seniority}
                </span>
              )}

              {/* Badge de condición laboral: Puesto fijo vs Período de prueba */}
              {empleado.enPeriodoPrueba !== null &&
                (empleado.enPeriodoPrueba ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    <Clock size={12} className="text-amber-600" />
                    En Período de Prueba
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Puesto Fijo
                  </span>
                ))}
            </div>

            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {empleado.puesto || "Sin puesto asignado"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Ingreso: {empleado.fecha_ingreso} · {empleado.cantidadEvaluaciones}{" "}
              {empleado.cantidadEvaluaciones === 1
                ? "evaluación"
                : "evaluaciones"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-extrabold tracking-wide ${
            esA
              ? "bg-indigo-100 text-indigo-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          CANDIDATO {etiqueta}
        </span>
      </div>

      {/* Gráfico + indicadores rápidos */}
      <div className="mt-5 grid grid-cols-1 items-center gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rendimiento Histórico
          </p>
          <GraficoDona
            valor={empleado.rendimiento}
            color={empleado.color}
            titulo="Promedio"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <BatteryCharging size={14} className="text-emerald-600" />
                Motivación reciente
              </span>
              <span className="font-bold text-slate-800">
                {empleado.motivacionPromedio !== null
                  ? `${empleado.motivacionPromedio} / 5`
                  : "Sin datos"}
              </span>
            </div>
            {empleado.motivacionPromedio !== null && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${(empleado.motivacionPromedio / 5) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Briefcase size={14} className="text-amber-600" />
                Carga de trabajo
              </span>
              <span className="font-bold text-slate-800">
                {empleado.cargaPromedio !== null
                  ? `${empleado.cargaPromedio} / 5`
                  : "Sin datos"}
              </span>
            </div>
            {empleado.cargaPromedio !== null && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{
                    width: `${(empleado.cargaPromedio / 5) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const ComparacionEmpleados = () => {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idDueloQuery = searchParams.get("id_duelo");

  const [empleadosLista, setEmpleadosLista] = useState([]);
  const [filtroModalidad, setFiltroModalidad] = useState("todos"); // "todos" | "fijos" | "prueba"
  const [idEmpA, setIdEmpA] = useState("");
  const [idEmpB, setIdEmpB] = useState("");

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  // ==========================================
  // ANÁLISIS ESTRUCTURADO DE LA IA
  // ==========================================

  const analisisIA =
    resultado?.veredicto_ia && typeof resultado.veredicto_ia === "object"
      ? resultado.veredicto_ia
      : null;

  const fortalezasA = analisisIA?.fortalezas_a || [];
  const fortalezasB = analisisIA?.fortalezas_b || [];
  const mejorasA = analisisIA?.mejoras_a || [];
  const mejorasB = analisisIA?.mejoras_b || [];
  const factoresComparados = analisisIA?.factores_comparados || [];
  const recomendaciones = analisisIA?.recomendaciones || [];

  // ==========================================
  // LIMPIAR PANTALLA / PREPARAR NUEVO DUELO
  // ==========================================

  const limpiarDuelo = () => {
    setResultado(null);
    setError("");
    setIdEmpA("");
    setIdEmpB("");
    if (idDueloQuery) {
      navigate("/admin/duelos/comparar", { replace: true });
    }
  };

  // ==========================================
  // CARGAR EMPLEADOS
  // ==========================================

  useEffect(() => {
    const fetchEmpleados = async () => {
      if (!token) {
        setEmpleadosLista([]);
        return;
      }

      try {
        setError("");
        const res = await axios.get(`${API_URL}/empleados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const lista = Array.isArray(res.data)
          ? res.data
          : res.data.empleados || res.data.data || [];

        if (!Array.isArray(lista)) {
          throw new Error("El servidor no devolvió una lista válida.");
        }

        setEmpleadosLista(lista);
      } catch (err) {
        console.error("Error cargando empleados:", err.response?.data || err);
        setError(
          err.response?.data?.mensaje ||
            "Error al cargar la lista de empleados. Verifica tu sesión.",
        );
      }
    };

    fetchEmpleados();
  }, [token]);

  // ==========================================
  // CARGAR DUELO GUARDADO SI VIENE POR QUERY (?id_duelo=...)
  // ==========================================

  useEffect(() => {
    if (!token || !idDueloQuery) return;

    let cancelado = false;

    const cargarDueloGuardado = async () => {
      setLoading(true);
      setError("");
      setResultado(null);

      try {
        const res = await axios.get(`${API_URL}/admin/duelos/${idDueloQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelado) return;

        setIdEmpA(String(res.data.candidato_a?.id_empleado || ""));
        setIdEmpB(String(res.data.candidato_b?.id_empleado || ""));
        setResultado(res.data);
      } catch (err) {
        if (cancelado) return;
        console.error("Error cargando duelo desde historial:", err);
        setError(
          err.response?.data?.mensaje ||
            "No se pudo cargar el duelo seleccionado del historial.",
        );
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargarDueloGuardado();

    return () => {
      cancelado = true;
    };
  }, [token, idDueloQuery]);

  // ==========================================
  // HELPERS DE CÁLCULO Y FORMATO
  // ==========================================

  const calcularRendimiento = (evaluaciones) => {
    if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
      return 0;
    }
    const suma = evaluaciones.reduce(
      (acc, ev) => acc + (Number(ev.puntaje_final) || 0),
      0,
    );
    return Math.max(0, Math.min(100, Math.round(suma / evaluaciones.length)));
  };

  const calcularPromedioCampo = (checkins, campo) => {
    if (!Array.isArray(checkins) || checkins.length === 0) return null;
    const suma = checkins.reduce(
      (acc, item) => acc + (Number(item[campo]) || 0),
      0,
    );
    return Number((suma / checkins.length).toFixed(1));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin información";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "Sin información";
    return date.toLocaleDateString("es-AR");
  };

  const intercambiarCandidatos = () => {
    setIdEmpA(idEmpB);
    setIdEmpB(idEmpA);
    setResultado(null);
    setError("");
  };

  // Cambiar filtro de modalidad y limpiar selecciones que ya no coincidan
  const handleCambiarModalidad = (nuevaModalidad) => {
    setFiltroModalidad(nuevaModalidad);
    setResultado(null);
    setError("");

    const cumpleModalidad = (emp) => {
      if (!emp) return false;
      if (nuevaModalidad === "fijos") return !esEmpleadoAPrueba(emp);
      if (nuevaModalidad === "prueba") return esEmpleadoAPrueba(emp);
      return true;
    };

    if (idEmpA) {
      const empA = empleadosLista.find(
        (e) => String(e.id_empleado) === String(idEmpA),
      );
      if (!cumpleModalidad(empA)) setIdEmpA("");
    }

    if (idEmpB) {
      const empB = empleadosLista.find(
        (e) => String(e.id_empleado) === String(idEmpB),
      );
      if (!cumpleModalidad(empB)) setIdEmpB("");
    }
  };

  // Resuelve si el candidato está a prueba (desde respuesta de duelo o lista cargada)
  const obtenerEstadoPruebaCandidato = (candidato) => {
    if (
      candidato?.en_periodo_prueba !== undefined &&
      candidato?.en_periodo_prueba !== null
    ) {
      return esEmpleadoAPrueba(candidato);
    }
    const enLista = empleadosLista.find(
      (e) => String(e.id_empleado) === String(candidato?.id_empleado),
    );
    return enLista ? esEmpleadoAPrueba(enLista) : null;
  };

  // ==========================================
  // GENERAR DUELO
  // ==========================================

  const generarDuelo = async () => {
    if (!idEmpA || !idEmpB) {
      setError("Debes seleccionar dos empleados para iniciar la comparación.");
      return;
    }

    if (Number(idEmpA) === Number(idEmpB)) {
      setError("No puedes comparar al mismo empleado consigo mismo.");
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      return;
    }

    // Validación preventiva si la lista de empleados ya trae arreglos de evaluaciones/check-ins
    const empA = empleadosLista.find(
      (e) => String(e.id_empleado) === String(idEmpA),
    );
    const empB = empleadosLista.find(
      (e) => String(e.id_empleado) === String(idEmpB),
    );

    const faltanDatosLocal = (emp) => {
      if (!emp) return false;
      const tieneEvalArray = Array.isArray(emp.evaluaciones);
      const tieneCheckArray =
        Array.isArray(emp.ultimos_checkins) || Array.isArray(emp.checkins);
      if (!tieneEvalArray && !tieneCheckArray) return false;

      const cantEval = tieneEvalArray ? emp.evaluaciones.length : 0;
      const cantCheck = Array.isArray(emp.ultimos_checkins)
        ? emp.ultimos_checkins.length
        : Array.isArray(emp.checkins)
          ? emp.checkins.length
          : 0;

      return cantEval === 0 && cantCheck === 0;
    };

    const sinDatosA = faltanDatosLocal(empA);
    const sinDatosB = faltanDatosLocal(empB);

    if (sinDatosA || sinDatosB) {
      const afectados = [
        sinDatosA ? `${empA.nombre} ${empA.apellido}` : null,
        sinDatosB ? `${empB.nombre} ${empB.apellido}` : null,
      ]
        .filter(Boolean)
        .join(" y ");

      const mensajeAlerta = `${afectados} no cuenta con los datos necesarios (evaluaciones o check-ins) para realizar la comparación.`;
      setError(mensajeAlerta);
      window.alert(mensajeAlerta);
      return;
    }

    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const response = await axios.post(
        `${API_URL}/admin/duelos/comparar`,
        {
          id_empleado_a: Number(idEmpA),
          id_empleado_b: Number(idEmpB),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setResultado(response.data);
    } catch (err) {
      console.error("Error al generar el duelo:", err);
      const dataError = err.response?.data;
      const mensajeError =
        dataError?.mensaje || "Error al conectar con el servidor.";

      setError(mensajeError);

      if (
        err.response?.status === 422 ||
        dataError?.codigo === "SIN_DATOS_COMPARACION"
      ) {
        window.alert(mensajeError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Contadores por condición laboral
  const totalFijos = empleadosLista.filter(
    (emp) => !esEmpleadoAPrueba(emp),
  ).length;
  const totalPrueba = empleadosLista.filter((emp) =>
    esEmpleadoAPrueba(emp),
  ).length;

  // Filtrado por modalidad para los selectores
  const empleadosFiltrados = empleadosLista.filter((emp) => {
    const aPrueba = esEmpleadoAPrueba(emp);
    if (filtroModalidad === "fijos" && aPrueba) return false;
    if (filtroModalidad === "prueba" && !aPrueba) return false;
    return true;
  });

  const opcionesA = empleadosFiltrados.filter(
    (emp) => String(emp.id_empleado) !== String(idEmpB),
  );
  const opcionesB = empleadosFiltrados.filter(
    (emp) => String(emp.id_empleado) !== String(idEmpA),
  );

  const hayAlgoParaLimpiar = Boolean(resultado || error || idEmpA || idEmpB);

  // ==========================================
  // RENDERIZADO
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 pb-14 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ENCABEZADO HERO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <Swords size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    Duelo de Empleados
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
                    <Sparkles size={13} />
                    Análisis con IA
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Compará objetivamente el historial de evaluaciones,
                  motivación, carga laboral y logros de dos colaboradores para
                  respaldar decisiones de promoción, asignación o efectividad.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              {hayAlgoParaLimpiar && (
                <button
                  type="button"
                  onClick={limpiarDuelo}
                  className="inline-flex h-10.5 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <RotateCcw size={14} />
                  <span>Limpiar / Nuevo duelo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/admin/duelos/historial")}
                className="inline-flex h-10.5 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <History size={15} />
                <span>Ver Historial</span>
              </button>
            </div>
          </div>

          {/* GUÍA DE USO EN 3 PASOS */}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-extrabold text-white">
                1
              </span>
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  Filtrá y elegí Candidato A
                </p>
                <p className="text-slate-500">
                  Podés filtrar por puesto fijo o período de prueba.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-extrabold text-white">
                2
              </span>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Elegí el Candidato B</p>
                <p className="text-slate-500">
                  Segundo perfil distinto para contrastar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                3
              </span>
              <div className="text-xs">
                <p className="font-bold text-slate-800">
                  Generá el veredicto IA
                </p>
                <p className="text-slate-500">
                  Obtené fortalezas, riesgos y recomendación.
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE FILTRO POR CONDICIÓN CONTRACTUAL */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Mostrar:
              </span>

              <button
                type="button"
                onClick={() => handleCambiarModalidad("todos")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filtroModalidad === "todos"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                Todos ({empleadosLista.length})
              </button>

              <button
                type="button"
                onClick={() => handleCambiarModalidad("fijos")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filtroModalidad === "fijos"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <ShieldCheck size={13} />
                Puestos Fijos ({totalFijos})
              </button>

              <button
                type="button"
                onClick={() => handleCambiarModalidad("prueba")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filtroModalidad === "prueba"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "border border-amber-200 bg-white text-amber-800 hover:bg-amber-50"
                }`}
              >
                <Clock size={13} />
                A Prueba ({totalPrueba})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Cada selector incluye búsqueda rápida al abrirse
            </span>
          </div>

          {/* CONTROLES DE SELECCIÓN COMPACTOS */}
          <div className="mt-5 grid grid-cols-1 items-end gap-3 lg:grid-cols-[1fr_auto_1fr_auto]">
            <SelectorEmpleado
              label="Candidato A"
              acento="indigo"
              empleados={opcionesA}
              valorSeleccionado={idEmpA}
              deshabilitado={loading}
              placeholder="Seleccioná el primer empleado..."
              onSeleccionar={(val) => {
                setIdEmpA(val);
                setResultado(null);
                setError("");
              }}
            />

            {/* BOTÓN INTERCAMBIAR */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={intercambiarCandidatos}
                disabled={(!idEmpA && !idEmpB) || loading}
                title="Intercambiar Candidato A y B"
                className="inline-flex h-10.5 w-10.5 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            <SelectorEmpleado
              label="Candidato B"
              acento="violet"
              empleados={opcionesB}
              valorSeleccionado={idEmpB}
              deshabilitado={loading}
              placeholder="Seleccioná el segundo empleado..."
              onSeleccionar={(val) => {
                setIdEmpB(val);
                setResultado(null);
                setError("");
              }}
            />

            {/* BOTÓN GENERAR */}
            <button
              type="button"
              onClick={generarDuelo}
              disabled={loading || !token || !idEmpA || !idEmpB}
              className="inline-flex h-10.5 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Swords size={16} />
              )}
              <span>{loading ? "Analizando..." : "Generar Duelo"}</span>
            </button>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ESTADO VACÍO INFORMATIVO */}
        {!resultado && !loading && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Scale size={28} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Listo para comparar talento con evidencia real
            </h2>
            <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
              Seleccioná dos colaboradores arriba y presioná{" "}
              <span className="font-semibold text-indigo-600">
                Generar Duelo
              </span>
              . El motor de IA cruzará automáticamente sus datos históricos:
            </p>

            <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <BarChart3 size={18} className="text-indigo-600" />
                <p className="mt-2 text-xs font-bold text-slate-800">
                  Evaluaciones y Semáforo
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Puntajes finales de las últimas 5 evaluaciones y evolución de
                  rendimiento.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <BatteryCharging size={18} className="text-emerald-600" />
                <p className="mt-2 text-xs font-bold text-slate-800">
                  Motivación y Carga
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Detecta si un alto rendimiento viene acompañado de sobrecarga
                  laboral.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <UserCheck size={18} className="text-violet-600" />
                <p className="mt-2 text-xs font-bold text-slate-800">
                  Logros y Obstáculos
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Contrasta lo reportado en los check-ins semanales para dar
                  recomendaciones accionables.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SPINNER DE CARGA */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <p className="text-base font-bold text-slate-800">
              {idDueloQuery
                ? "Cargando duelo guardado..."
                : "La IA está analizando ambos perfiles..."}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Evaluando historial de desempeño, check-ins y carga de trabajo.
            </p>
          </div>
        )}

        {/* RESULTADOS DEL DUELO */}
        {resultado && !loading && (
          <div className="space-y-6">
            {/* BARRA SUPERIOR DE RESULTADO CON ACCIÓN RÁPIDA PARA LIMPIAR */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-3.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                <Sparkles size={15} className="text-indigo-600" />
                <span>
                  Resultado del duelo entre{" "}
                  <strong>
                    {resultado.candidato_a.nombre}{" "}
                    {resultado.candidato_a.apellido}
                  </strong>{" "}
                  y{" "}
                  <strong>
                    {resultado.candidato_b.nombre}{" "}
                    {resultado.candidato_b.apellido}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={limpiarDuelo}
                className="inline-flex items-center gap-1.5 self-start rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-xs ring-1 ring-indigo-200 transition hover:bg-indigo-600 hover:text-white sm:self-center"
              >
                <RotateCcw size={14} />
                <span>Limpiar y generar otro duelo</span>
              </button>
            </div>

            {/* TARJETAS DE EMPLEADOS */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TarjetaEmpleado
                etiqueta="A"
                empleado={{
                  nombre: `${resultado.candidato_a.nombre} ${resultado.candidato_a.apellido}`,
                  iniciales: `${resultado.candidato_a.nombre?.charAt(0) || ""}${
                    resultado.candidato_a.apellido?.charAt(0) || ""
                  }`,
                  puesto: resultado.candidato_a.puesto,
                  seniority: resultado.candidato_a.seniority,
                  enPeriodoPrueba: obtenerEstadoPruebaCandidato(
                    resultado.candidato_a,
                  ),
                  fecha_ingreso: formatearFecha(
                    resultado.candidato_a.fecha_ingreso,
                  ),
                  cantidadEvaluaciones:
                    resultado.candidato_a.evaluaciones?.length || 0,
                  rendimiento: calcularRendimiento(
                    resultado.candidato_a.evaluaciones,
                  ),
                  motivacionPromedio: calcularPromedioCampo(
                    resultado.candidato_a.ultimos_checkins,
                    "nivel_motivacion",
                  ),
                  cargaPromedio: calcularPromedioCampo(
                    resultado.candidato_a.ultimos_checkins,
                    "carga_trabajo",
                  ),
                  color: "#4F46E5",
                }}
              />

              <TarjetaEmpleado
                etiqueta="B"
                empleado={{
                  nombre: `${resultado.candidato_b.nombre} ${resultado.candidato_b.apellido}`,
                  iniciales: `${resultado.candidato_b.nombre?.charAt(0) || ""}${
                    resultado.candidato_b.apellido?.charAt(0) || ""
                  }`,
                  puesto: resultado.candidato_b.puesto,
                  seniority: resultado.candidato_b.seniority,
                  enPeriodoPrueba: obtenerEstadoPruebaCandidato(
                    resultado.candidato_b,
                  ),
                  fecha_ingreso: formatearFecha(
                    resultado.candidato_b.fecha_ingreso,
                  ),
                  cantidadEvaluaciones:
                    resultado.candidato_b.evaluaciones?.length || 0,
                  rendimiento: calcularRendimiento(
                    resultado.candidato_b.evaluaciones,
                  ),
                  motivacionPromedio: calcularPromedioCampo(
                    resultado.candidato_b.ultimos_checkins,
                    "nivel_motivacion",
                  ),
                  cargaPromedio: calcularPromedioCampo(
                    resultado.candidato_b.ultimos_checkins,
                    "carga_trabajo",
                  ),
                  color: "#7C3AED",
                }}
              />
            </div>

            {/* ANÁLISIS ESTRUCTURADO DE LA IA */}
            {analisisIA ? (
              <div className="space-y-6">
                {/* RESUMEN ESTRATÉGICO */}
                <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Análisis estratégico
                      </h2>
                      <p className="text-xs text-slate-500">
                        Síntesis comparativa generada a partir de métricas
                        registradas en S.A.P.E.
                      </p>
                    </div>
                  </div>

                  <p className="leading-relaxed text-slate-700">
                    {analisisIA.resumen || "No hay resumen disponible."}
                  </p>
                </section>

                {/* FORTALEZAS */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      Fortalezas de {resultado.candidato_a.nombre}
                    </h3>

                    <ul className="space-y-3">
                      {fortalezasA.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-sm text-slate-700"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}

                      {fortalezasA.length === 0 && (
                        <li className="text-sm text-slate-400">
                          No hay fortalezas disponibles.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      Fortalezas de {resultado.candidato_b.nombre}
                    </h3>

                    <ul className="space-y-3">
                      {fortalezasB.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-sm text-slate-700"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}

                      {fortalezasB.length === 0 && (
                        <li className="text-sm text-slate-400">
                          No hay fortalezas disponibles.
                        </li>
                      )}
                    </ul>
                  </div>
                </section>

                {/* OPORTUNIDADES DE MEJORA */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                      <AlertTriangle size={18} className="text-amber-500" />
                      Oportunidades de mejora — {resultado.candidato_a.nombre}
                    </h3>

                    <ul className="space-y-3">
                      {mejorasA.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-sm text-slate-700"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}

                      {mejorasA.length === 0 && (
                        <li className="text-sm text-slate-400">
                          No hay oportunidades de mejora disponibles.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                      <AlertTriangle size={18} className="text-amber-500" />
                      Oportunidades de mejora — {resultado.candidato_b.nombre}
                    </h3>

                    <ul className="space-y-3">
                      {mejorasB.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 text-sm text-slate-700"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}

                      {mejorasB.length === 0 && (
                        <li className="text-sm text-slate-400">
                          No hay oportunidades de mejora disponibles.
                        </li>
                      )}
                    </ul>
                  </div>
                </section>

                {/* FACTORES COMPARADOS */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Scale size={20} className="text-indigo-600" />
                    Comparación por factores
                  </h3>

                  <div className="space-y-5">
                    {factoresComparados.map((factor, index) => (
                      <div
                        key={index}
                        className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                      >
                        <h4 className="mb-3 text-sm font-bold text-slate-800">
                          {factor.factor}
                        </h4>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
                            <p className="mb-1 text-xs font-bold text-indigo-700">
                              {resultado.candidato_a.nombre}{" "}
                              {resultado.candidato_a.apellido}
                            </p>
                            <p className="text-sm text-slate-700">
                              {factor.empleado_a}
                            </p>
                          </div>

                          <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3.5">
                            <p className="mb-1 text-xs font-bold text-violet-700">
                              {resultado.candidato_b.nombre}{" "}
                              {resultado.candidato_b.apellido}
                            </p>
                            <p className="text-sm text-slate-700">
                              {factor.empleado_b}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {factoresComparados.length === 0 && (
                      <p className="text-sm text-slate-400">
                        No hay factores comparativos disponibles.
                      </p>
                    )}
                  </div>
                </section>

                {/* RECOMENDACIONES ESTRATÉGICAS */}
                <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Lightbulb size={20} className="text-indigo-600" />
                    Recomendaciones estratégicas
                  </h3>

                  <div className="space-y-3">
                    {recomendaciones.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-xl bg-white/80 p-3 text-sm text-slate-700"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{item}</span>
                      </div>
                    ))}

                    {recomendaciones.length === 0 && (
                      <p className="text-sm text-slate-400">
                        No hay recomendaciones disponibles.
                      </p>
                    )}
                  </div>
                </section>

                {/* CONCLUSIÓN FINAL */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <Award size={20} className="text-indigo-600" />
                      Conclusión del análisis
                    </h3>

                    <button
                      type="button"
                      onClick={limpiarDuelo}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <RotateCcw size={13} />
                      <span>Limpiar pantalla</span>
                    </button>
                  </div>

                  <p className="leading-relaxed text-slate-700">
                    {analisisIA.conclusion || "No hay una conclusión disponible."}
                  </p>

                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                    <Info
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                    <p>
                      <strong>Nota para RR. HH.:</strong> Este análisis es una
                      herramienta de apoyo basada en métricas registradas. La
                      decisión final debe ser validada por el administrador
                      considerando el contexto del equipo.
                    </p>
                  </div>
                </section>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="font-semibold text-amber-800">
                  No se recibió un análisis estructurado de la IA.
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  Verifica que el backend esté devolviendo{" "}
                  <code>veredicto_ia</code> como un objeto JSON.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparacionEmpleados;