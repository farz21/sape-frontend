import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Users,
  BarChart3,
  Download,
  TrendingUp,
  BellRing,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  Award,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";

// Colores para el gráfico de semáforo
const COLORES_SEMAFORO = {
  Verde: "#10b981", // Emerald 500
  Amarillo: "#f59e0b", // Amber 500
  Rojo: "#f43f5e", // Rose 500
  Pendiente: "#cbd5e1", // Slate 300
};

const construirPromedioCompetencias = (catalogoCompetencias, detallesPorEvaluacion) => {
  const mapaCompetencias = new Map();

  for (const comp of catalogoCompetencias) {
    mapaCompetencias.set(String(comp.id_competencia), {
      nombre: comp.nombre,
      tipo_skill: comp.tipo_skill || "General",
      suma: 0,
      cantidad: 0,
    });
  }

  for (const det of detallesPorEvaluacion) {
    const puntaje = Number(det.puntaje_obtenido);
    if (Number.isNaN(puntaje)) continue;

    const clave = String(det.id_competencia ?? det.competencia ?? "");
    if (!clave) continue;

    if (!mapaCompetencias.has(clave)) {
      mapaCompetencias.set(clave, {
        nombre: det.competencia || `Competencia ${clave}`,
        tipo_skill: det.tipo_skill || "General",
        suma: 0,
        cantidad: 0,
      });
    }

    const item = mapaCompetencias.get(clave);
    item.suma += puntaje;
    item.cantidad += 1;
  }

  return Array.from(mapaCompetencias.values())
    .filter((item) => item.cantidad > 0)
    .map((item) => ({
      nombre: item.nombre,
      tipo_skill: item.tipo_skill,
      promedio: Number((item.suma / item.cantidad).toFixed(1)),
      evaluaciones: item.cantidad,
    }))
    .sort((a, b) => a.promedio - b.promedio);
};

const DashboardAdmin = () => {
  const token = useAuthStore((state) => state.token);

  const [estadisticas, setEstadisticas] = useState(null);
  const [empleadosData, setEmpleadosData] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [promedioCompetencias, setPromedioCompetencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [desplegadaAlertas, setDesplegadaAlertas] = useState(false);

  useEffect(() => {
    if (!token) {
      setCargando(false);
      return;
    }

    const cargarDatos = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [resEstats, resEmpleados, resNotificaciones, resCompetencias] =
          await Promise.all([
            fetch("http://localhost:3000/api/admin/estadisticas", { headers }),
            fetch("http://localhost:3000/api/empleados", { headers }),
            fetch("http://localhost:3000/api/admin/notificaciones", {
              headers,
            }),
            fetch("http://localhost:3000/api/competencias", { headers }),
          ]);

        let listaEmp = [];
        if (resEstats.ok && resEmpleados.ok) {
          setEstadisticas(await resEstats.json());
          const empJson = await resEmpleados.json();
          listaEmp = Array.isArray(empJson)
            ? empJson
            : empJson.empleados || [];
          setEmpleadosData(listaEmp);
        }

        if (resNotificaciones.ok) {
          const notificacionesData = await resNotificaciones.json();
          setNotificaciones(
            Array.isArray(notificacionesData) ? notificacionesData : [],
          );
        }

        let catalogoComp = [];
        if (resCompetencias.ok) {
          const compJson = await resCompetencias.json();
          catalogoComp = Array.isArray(compJson)
            ? compJson
            : compJson.competencias || [];
        }

        // Recolectar detalles por competencia desde los legajos disponibles
        const detallesRecolectados = [];
        if (listaEmp.length > 0) {
          const fichas = await Promise.allSettled(
            listaEmp.slice(0, 20).map(async (emp) => {
              const r = await fetch(
                `http://localhost:3000/api/empleados/${emp.id_empleado}`,
                { headers },
              );
              if (!r.ok) return null;
              return r.json();
            }),
          );

          for (const resultado of fichas) {
            if (resultado.status !== "fulfilled" || !resultado.value) continue;
            for (const ev of resultado.value.evaluaciones || []) {
              if (Array.isArray(ev.detalles)) {
                detallesRecolectados.push(...ev.detalles);
              }
            }
          }
        }

        setPromedioCompetencias(
          construirPromedioCompetencias(catalogoComp, detallesRecolectados),
        );
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [token]);

  const obtenerIdEmpleadoAlerta = (notificacion) => {
    if (notificacion.id_empleado) return notificacion.id_empleado;

    const textoAlerta =
      `${notificacion.titulo || ""} ${notificacion.mensaje || ""}`.toLowerCase();
    const encontrado = empleadosData.find((emp) => {
      const nombreCompleto = `${emp.nombre || ""} ${emp.apellido || ""}`
        .trim()
        .toLowerCase();
      const legajo = String(emp.legajo || "")
        .trim()
        .toLowerCase();
      return (
        (nombreCompleto && textoAlerta.includes(nombreCompleto)) ||
        (legajo && textoAlerta.includes(legajo))
      );
    });

    return encontrado?.id_empleado || null;
  };

  const marcarAlertaLeida = async (idNotificacion) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/notificaciones/${idNotificacion}/leida`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("No se pudo actualizar la alerta.");
      setNotificaciones((actuales) =>
        actuales.map((notificacion) =>
          notificacion.id_notificacion === idNotificacion
            ? { ...notificacion, leida: 1 }
            : notificacion,
        ),
      );
    } catch (error) {
      console.error("Error al marcar la alerta:", error);
    }
  };

  const quitarAlertaDelListado = (idNotificacion) => {
    setNotificaciones((actuales) =>
      actuales.filter(
        (notificacion) => notificacion.id_notificacion !== idNotificacion,
      ),
    );
  };

  // Función para exportar a Excel usando SheetJS
  const exportarAExcel = () => {
    if (empleadosData.length === 0) return;

    const datosFormateados = empleadosData.map((emp) => ({
      "ID Legajo": emp.legajo || "N/A",
      "Nombre Completo": `${emp.nombre} ${emp.apellido}`,
      Email: emp.email,
      Empresa: emp.empresa,
      "Fecha Ingreso": emp.fecha_ingreso
        ? new Date(emp.fecha_ingreso).toLocaleDateString()
        : "N/A",
    }));

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    hoja["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
    ];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Empleados");

    XLSX.writeFile(
      libro,
      `Reporte_Empleados_SAPE_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`,
    );
  };

  if (cargando)
    return <div className="p-8 text-slate-500">Cargando métricas...</div>;

  const alertasFatigaActivas = notificaciones.filter(
    (n) => n.tipo === "alerta_fatiga" && !Number(n.leida),
  );

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard Administrativo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Visión general del desempeño y gestión de la plantilla.
          </p>
        </div>

        <button
          onClick={exportarAExcel}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Download size={18} />
          Exportar Empleados
        </button>
      </div>

      {/* Pestaña desplegable: solo aparece cuando hay alertas de fatiga sin revisar */}
      {alertasFatigaActivas.length > 0 && (
        <section className="mb-8 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setDesplegadaAlertas((prev) => !prev)}
            aria-expanded={desplegadaAlertas}
            className="w-full px-4 py-3.5 sm:px-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 shrink-0">
                <BellRing size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                    Alertas preventivas de fatiga
                  </h2>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    {alertasFatigaActivas.length} sin revisar
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {desplegadaAlertas
                    ? "Avisos generados a partir de los check-ins recientes."
                    : "Clic para desplegar y revisar las alertas de agotamiento."}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shrink-0">
              {desplegadaAlertas ? (
                <>
                  Ocultar <ChevronUp size={15} />
                </>
              ) : (
                <>
                  Desplegar <ChevronDown size={15} />
                </>
              )}
            </span>
          </button>

          {desplegadaAlertas && (
            <ul className="divide-y divide-slate-100 border-t border-slate-100 px-4 sm:px-5 bg-white">
              {alertasFatigaActivas.map((notificacion) => {
                const idEmpleadoAlerta = obtenerIdEmpleadoAlerta(notificacion);

                return (
                  <li
                    key={notificacion.id_notificacion}
                    className="flex flex-col gap-2.5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {notificacion.titulo}
                        </p>
                        <span className="shrink-0 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Pendiente
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                        {notificacion.mensaje}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(notificacion.fecha_creacion).toLocaleString(
                          "es-AR",
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {idEmpleadoAlerta && (
                        <Link
                          to={`/admin/empleados/${idEmpleadoAlerta}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Ir a la ficha y evaluación del empleado"
                        >
                          <ExternalLink size={14} /> Ver empleado
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          marcarAlertaLeida(notificacion.id_notificacion)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-colors"
                        title="Marcar alerta como revisada"
                      >
                        <Check size={14} /> Marcar revisada
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          quitarAlertaDelListado(notificacion.id_notificacion)
                        }
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Quitar del listado"
                        aria-label="Quitar alerta del listado"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Tarjetas de KPIs */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl flex items-center gap-4">
          <div className="p-4 text-blue-700 bg-blue-50 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Total Empleados
            </p>
            <p className="text-2xl font-black text-slate-800">
              {estadisticas?.totalEmpleados || 0}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl flex items-center gap-4">
          <div className="p-4 text-indigo-700 bg-indigo-50 rounded-xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Evaluaciones Emitidas
            </p>
            <p className="text-2xl font-black text-slate-800">
              {estadisticas?.distribucionSemaforo?.reduce(
                (acc, curr) => acc + curr.value,
                0,
              ) || 0}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl flex items-center gap-4">
          <div className="p-4 text-purple-700 bg-purple-50 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Puntaje Promedio
            </p>
            <p className="text-2xl font-black text-slate-800">
              {estadisticas?.promedioPuntaje || "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos Estadísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Gráfico Circular de Distribución de Semáforo */}
        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Distribución de Desempeño
          </h2>
          <div className="h-72 w-full">
            {estadisticas?.distribucionSemaforo?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadisticas.distribucionSemaforo}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {estadisticas.distribucionSemaforo.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORES_SEMAFORO[entry.name] ||
                          COLORES_SEMAFORO["Pendiente"]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} Evaluaciones`, "Cantidad"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                No hay evaluaciones registradas para graficar.
              </div>
            )}
          </div>
        </div>

        {/* 2. Gráfico de Barras: Rendimiento Promedio por Período */}
        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Rendimiento Promedio por Período
          </h2>
          <div className="h-72 w-full">
            {estadisticas?.rendimientoPorPeriodo?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={estadisticas.rendimientoPorPeriodo}
                  margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="periodo"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} Pts`, "Promedio"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="promedio"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium text-center px-4">
                No hay suficientes datos de períodos para generar la
                comparativa.
              </div>
            )}
          </div>
        </div>

        {/* 3. Gráfico de Barras Horizontales: Puntaje Promedio por Competencia */}
        <div className="lg:col-span-2 p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award size={20} className="text-indigo-600" />
                Puntaje Promedio por Competencia
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ordenado de menor a mayor puntaje para detectar brechas de
                desarrollo en la plantilla.
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {promedioCompetencias.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={promedioCompetencias}
                  layout="vertical"
                  margin={{ top: 5, right: 24, bottom: 5, left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={175}
                    tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${value} Pts (${props?.payload?.evaluaciones || 0} reg.)`,
                      props?.payload?.tipo_skill || "Competencia",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="promedio" radius={[0, 6, 6, 0]}>
                    {promedioCompetencias.map((entry, index) => {
                      const fillColor =
                        entry.promedio < 60
                          ? "#f43f5e"
                          : entry.promedio < 80
                            ? "#f59e0b"
                            : "#4f46e5";
                      return <Cell key={`comp-bar-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium text-center px-4">
                Todavía no hay evaluaciones con desglose por competencia para
                calcular promedios.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;