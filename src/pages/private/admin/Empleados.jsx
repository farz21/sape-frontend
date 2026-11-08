import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; // Ajusta la ruta si es necesario
import { estadoActividad } from './datosEmpleados';

const Empleados = () => {
  const [empleadosBD, setEmpleadosBD] = useState([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/empleados", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Mapeamos los datos de MySQL al formato que espera tu UI
          const dataAdaptada = data.map(dbUser => ({
            id: dbUser.id.toString(),
            nombre: `${dbUser.nombre} ${dbUser.apellido}`,
            puesto: 'Empleado',
            equipo: dbUser.empresa,
            // Simulamos métricas basándonos en el ID para mantener el diseño visual
            actividad: dbUser.id % 2 === 0 ? 'atencion' : 'al-dia',
            avance: dbUser.id % 2 === 0 ? 65 : 95
          }));
          setEmpleadosBD(dataAdaptada);
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      }
    };
    fetchEmpleados();
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600">Equipo</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Todos los empleados</h2>
        <p className="mt-2 text-slate-500">Selecciona una persona para ver su actividad en detalle.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Empleado</span><span>Equipo</span><span>Actividad</span><span>Progreso</span>
        </div>
        {empleadosBD.map((empleado) => { 
          const estado = estadoActividad[empleado.actividad]; 
          return (
            <Link key={empleado.id} to={`/admin/empleados/${empleado.id}`} className="grid gap-3 border-t border-slate-100 px-6 py-5 transition hover:bg-indigo-50/40 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:items-center sm:gap-4">
              <span>
                <span className="block font-semibold">{empleado.nombre}</span>
                <span className="mt-1 block text-sm text-slate-500">{empleado.puesto}</span>
              </span>
              <span className="text-sm text-slate-600">{empleado.equipo}</span>
              <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${estado.color}`}>{estado.etiqueta}</span>
              <span className="text-sm font-semibold text-slate-700">{empleado.avance}% completado</span>
            </Link>
          ); 
        })}
      </div>
    </div>
  );
};

export default Empleados;