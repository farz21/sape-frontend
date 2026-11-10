import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from "../../../../store/useAuthStore";
import { ArrowLeft, User, Briefcase, Mail, PlusCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Empleado = () => {
  const { id } = useParams();
  const token = useAuthStore((state) => state.token);
  
  const [empleado, setEmpleado] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/empleados/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEmpleado(data.datos);
          
          // Invertimos el array para que el gráfico fluya de izquierda (más antiguo) a derecha (más reciente)
          const historialCronologico = [...data.evaluaciones].reverse();
          setEvaluaciones(historialCronologico);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id, token]);

  if (cargando) return <div className="p-8 text-slate-500 font-medium">Cargando legajo del empleado...</div>;
  if (!empleado) return <div className="p-8 text-rose-500 font-medium">No se encontró el empleado.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado y Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/empleados" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Ficha del Empleado</h1>
            <p className="mt-1 text-sm text-slate-500">Análisis de desempeño y datos de contacto.</p>
          </div>
        </div>
        
        {/* Botón para abrir modal o ir a la vista de nueva evaluación (si la tienen) */}
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
          <PlusCircle size={18} />
          Nueva Evaluación
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Información Personal */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {empleado.nombre.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{empleado.nombre} {empleado.apellido}</h2>
                <p className="text-sm font-medium text-slate-500">ID: {empleado.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400" size={18} />
                <span className="text-sm text-slate-700">{empleado.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="text-slate-400" size={18} />
                <span className="text-sm text-slate-700">{empleado.empresa || 'S.A.P.E.'}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="text-slate-400" size={18} />
                <span className="text-sm text-slate-700">Ingreso: {empleado.creado_en ? new Date(empleado.creado_en).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel del Gráfico de Evolución */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Evolución de Desempeño</h2>
          <p className="text-sm text-slate-500 mb-6">Puntaje final obtenido en las evaluaciones históricas.</p>
          
          <div className="h-72 w-full">
            {evaluaciones.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evaluaciones} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="periodo" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Pts`, 'Puntaje']}
                    labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="puntaje_final" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                Este empleado aún no tiene evaluaciones registradas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empleado;