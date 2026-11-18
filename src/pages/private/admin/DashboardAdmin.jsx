import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { Users, BarChart3, Download, TrendingUp } from "lucide-react";
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

const DashboardAdmin = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [estadisticas, setEstadisticas] = useState(null);
  const [empleadosData, setEmpleadosData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar estadísticas para los gráficos
        const resEstats = await fetch(
          "http://localhost:3000/api/admin/estadisticas",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Cargar lista de empleados para la exportación a Excel
        const resEmpleados = await fetch(
          "http://localhost:3000/api/empleados",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (resEstats.ok && resEmpleados.ok) {
          setEstadisticas(await resEstats.json());
          setEmpleadosData(await resEmpleados.json());
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [token]);

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

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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

        {/* 2. Gráfico de Barras: Rendimiento Promedio por Período (Recomendado por el profe) */}
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="periodo" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value} Pts`, "Promedio"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="promedio" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium text-center px-4">
                No hay suficientes datos de períodos para generar la comparativa.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardAdmin;