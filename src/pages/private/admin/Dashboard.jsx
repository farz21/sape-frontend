import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users, CircleCheck, TriangleAlert, CircleX } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { estadoActividad } from './datosEmpleados';

const Dashboard = () => {
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
          const dataAdaptada = data.map(dbUser => ({
            id: dbUser.id.toString(),
            nombre: `${dbUser.nombre} ${dbUser.apellido}`,
            puesto: 'Empleado',
            equipo: dbUser.empresa,
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

  const cantidad = (estado) => empleadosBD.filter((empleado) => empleado.actividad === estado).length;
  
  const tarjetas = [
    { titulo: 'Al dia', valor: cantidad('al-dia'), icono: CircleCheck, tono: 'text-emerald-600 bg-emerald-50' },
    { titulo: 'Requieren atencion', valor: cantidad('atencion'), icono: TriangleAlert, tono: 'text-amber-600 bg-amber-50' },
    { titulo: 'Con retraso', valor: cantidad('retraso'), icono: CircleX, tono: 'text-rose-600 bg-rose-50' },
    { titulo: 'Empleados', valor: empleadosBD.length, icono: Users, tono: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600">Resumen general</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Dashboard</h2>
        <p className="mt-2 text-slate-500">Estado de las actividades de tu equipo.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map(({ titulo, valor, icono: Icono, tono }) => (
          <article key={titulo} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${tono}`}><Icono size={21} /></div>
            <p className="text-sm text-slate-500">{titulo}</p>
            <p className="mt-1 text-3xl font-extrabold">{valor}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Semaforo de actividad</h3>
            <p className="mt-1 text-sm text-slate-500">Seguimiento individual de las actividades.</p>
          </div>
          <Link to="/admin/empleados" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800">Ver todos <ArrowUpRight size={17} /></Link>
        </div>
        <div className="divide-y divide-slate-100">
          {empleadosBD.map((empleado) => { 
            const estado = estadoActividad[empleado.actividad]; 
            return (
              <Link key={empleado.id} to={`/admin/empleados/${empleado.id}`} className="flex flex-wrap items-center justify-between gap-4 py-4 hover:bg-slate-50">
                <div>
                  <p className="font-semibold">{empleado.nombre}</p>
                  <p className="mt-1 text-sm text-slate-500">{empleado.puesto} · {empleado.equipo}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden text-sm text-slate-500 sm:block">{empleado.avance}% completado</span>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${estado.color}`}>
                    <span className={`h-2 w-2 rounded-full ${estado.punto}`} />{estado.etiqueta}
                  </span>
                </div>
              </Link>
            ); 
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;