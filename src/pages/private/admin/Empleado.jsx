import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Empleado = () => {
  const { id } = useParams();
  const token = useAuthStore((state) => state.token);
  
  const [empleado, setEmpleado] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el formulario
  const [nuevaEval, setNuevaEval] = useState({ periodo: '', puntaje: '', semaforo: 'Verde' });
  const [mensajeForm, setMensajeForm] = useState('');

  // 1. Cargar datos reales
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/empleados/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setEmpleado(data.datos);
          setEvaluaciones(data.evaluaciones);
        }
      } catch (error) {
        console.error("Error al cargar el empleado:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchHistorial();
  }, [id, token]);

  // 2. Enviar nueva evaluación al backend
  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensajeForm('');

    try {
      const response = await fetch("http://localhost:3000/api/evaluaciones", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          id_empleado: id,
          periodo: nuevaEval.periodo,
          puntaje_final: nuevaEval.puntaje,
          semaforo: nuevaEval.semaforo
        }),
      });

      if (response.ok) {
        setMensajeForm("¡Evaluación cargada correctamente!");
        // Opcional: Recargar la página o hacer un push al estado 'evaluaciones'
        setTimeout(() => window.location.reload(), 1500); 
      } else {
        setMensajeForm("Error al cargar la evaluación.");
      }
    } catch (error) {
      setMensajeForm("No se pudo conectar con el servidor.");
    }
  };

  if (cargando) return <div className="p-8 font-semibold">Cargando datos del empleado...</div>;
  if (!empleado) return <div className="p-8 text-rose-600">Empleado no encontrado</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin/empleados" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={17} />Todos los empleados
      </Link>
      
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9 mb-8">
        <p className="text-sm font-semibold text-indigo-600">Ficha individual</p>
        <h2 className="mt-2 text-3xl font-extrabold">{empleado.nombre} {empleado.apellido}</h2>
        <p className="mt-2 text-slate-500">{empleado.empresa} · Registrado el {new Date(empleado.creado_en).toLocaleDateString()}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Formulario de Carga */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-indigo-600"/> Registrar Evaluación
          </h3>
          <form onSubmit={manejarEnvio} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Período (Ej. Q1 2026)
              <input type="text" required className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-indigo-500"
                value={nuevaEval.periodo} onChange={(e) => setNuevaEval({...nuevaEval, periodo: e.target.value})} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Puntaje (0 - 100)
              <input type="number" required max="100" min="0" className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-indigo-500"
                value={nuevaEval.puntaje} onChange={(e) => setNuevaEval({...nuevaEval, puntaje: e.target.value})} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Semáforo
              <select className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-indigo-500"
                value={nuevaEval.semaforo} onChange={(e) => setNuevaEval({...nuevaEval, semaforo: e.target.value})}>
                <option value="Verde">Verde (Óptimo)</option>
                <option value="Amarillo">Amarillo (Atención)</option>
                <option value="Rojo">Rojo (Crítico)</option>
              </select>
            </label>
            <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Guardar Evaluación
            </button>
            {mensajeForm && <p className="text-sm font-semibold text-emerald-600 mt-2">{mensajeForm}</p>}
          </form>
        </section>

        {/* Columna Derecha: Historial de Evaluaciones */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Historial de Desempeño</h3>
          {evaluaciones.length === 0 ? (
            <p className="text-sm text-slate-500">Este empleado no tiene evaluaciones registradas.</p>
          ) : (
            <div className="space-y-3">
              {evaluaciones.map((ev) => (
                <div key={ev.id_evaluacion} className="p-4 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{ev.periodo}</p>
                    <p className="text-xs text-slate-500">{new Date(ev.fecha).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-indigo-600">{ev.puntaje_final}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      ev.semaforo === 'Verde' ? 'bg-emerald-100 text-emerald-700' :
                      ev.semaforo === 'Amarillo' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>{ev.semaforo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Empleado;