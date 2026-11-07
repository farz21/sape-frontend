import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck } from 'lucide-react';
import { empleados, estadoActividad } from './datosEmpleados';

const Empleado = () => {
  const { id } = useParams();
  const empleado = empleados.find((persona) => persona.id === id);
  if (!empleado) return <section className="rounded-2xl bg-white p-8"><h2 className="text-2xl font-bold">No encontramos al empleado</h2><Link className="mt-4 inline-block font-semibold text-indigo-600" to="/admin/empleados">Volver a empleados</Link></section>;
  const estado = estadoActividad[empleado.actividad];

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin/empleados" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={17} />Todos los empleados</Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold text-indigo-600">Ficha individual</p><h2 className="mt-2 text-3xl font-extrabold">{empleado.nombre}</h2><p className="mt-2 text-slate-500">{empleado.puesto} · {empleado.equipo}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Estado de actividad</p><span className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${estado.color}`}>{estado.etiqueta}</span></div><div className="rounded-xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Ultimo registro</p><p className="mt-3 font-bold">{empleado.ultimaActividad}</p></div></div>
        <div className="mt-6 rounded-xl border border-slate-200 p-5"><div className="flex justify-between text-sm"><span className="font-semibold">Avance de actividades</span><span className="font-bold">{empleado.avance}%</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${empleado.avance}%` }} /></div><div className="mt-5 flex items-center gap-2 text-sm text-slate-600"><CircleCheck size={17} className="text-indigo-600" />{empleado.tareas}</div></div>
      </section>
    </div>
  );
};

export default Empleado;

