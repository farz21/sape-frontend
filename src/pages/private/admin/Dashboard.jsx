import { useState, useEffect } from 'react';
import { useAuthStore } from "../../../store/useAuthStore";
import { Users, BarChart3, Download, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';

// Colores para el gráfico de semáforo
const COLORES_SEMAFORO = {
  'Verde': '#10b981', // Emerald 500
  'Amarillo': '#f59e0b', // Amber 500
  'Rojo': '#f43f5e', // Rose 500
  'Pendiente': '#cbd5e1' // Slate 300
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
        const resEstats = await fetch("http://localhost:3000/api/admin/estadisticas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Cargar lista de empleados para la exportación a Excel
        const resEmpleados = await fetch("http://localhost:3000/api/empleados", {
          headers: { Authorization: `Bearer ${token}` }
        });

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

    // Formatear los datos para que queden prolijos en el Excel
    const datosFormateados = empleadosData.map(emp => ({
      'ID Legajo': emp.legajo || 'N/A',
      'Nombre Completo': `${emp.nombre} ${emp.apellido}`,
      'Email': emp.email,
      'Empresa': emp.empresa,
      'Fecha Ingreso': emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString() : 'N/A'
    }));

    // Crear libro de trabajo y hoja
    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Empleados");

    // Descargar archivo
    XLSX.writeFile(libro, `Reporte_Empleados_SAPE_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  if (cargando) return <div className="p-8 text-slate-500">Cargando métricas...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard Administrativo</h1>
          <p className="mt-1 text-sm text-slate-500">Visión general del desempeño y gestión de la plantilla.</p>
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
          <div className="p-4 text-blue-700 bg-blue-50 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Empleados</p>
            <p className="text-2xl font-black text-slate-800">{estadisticas?.totalEmpleados || 0}</p>
          </div>
        </div>

        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl flex items-center gap-4">
          <div className="p-4 text-indigo-700 bg-indigo-50 rounded-xl"><BarChart3 size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Evaluaciones Emitidas</p>
            <p className="text-2xl font-black text-slate-800">
              {estadisticas?.distribucionSemaforo?.reduce((acc, curr) => acc + curr.value, 0) || 0}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl flex items-center gap-4">
          <div className="p-4 text-purple-700 bg-purple-50 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Puntaje Promedio</p>
            <p className="text-2xl font-black text-slate-800">{estadisticas?.promedioPuntaje || '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Gráficos Estadísticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Circular de Desempeño */}
        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Distribución de Desempeño</h2>
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
                      <Cell key={`cell-${index}`} fill={COLORES_SEMAFORO[entry.name] || COLORES_SEMAFORO['Pendiente']} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Evaluaciones`, 'Cantidad']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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

        {/* Espacio para un segundo gráfico o tabla de empleados recientes */}
        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl flex flex-col justify-center items-center text-center">
           <h2 className="text-lg font-bold text-slate-800 mb-2">Gestión Documental</h2>
           <p className="text-slate-500 text-sm mb-6 max-w-sm">
             Descarga la base de datos completa de tus empleados en formato Excel (.xlsx) para auditorías externas o copias de seguridad.
           </p>
           <button 
             onClick={exportarAExcel}
             className="px-6 py-3 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors"
           >
             Generar Archivo Excel
           </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;