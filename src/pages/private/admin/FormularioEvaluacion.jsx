import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore } from "../../../store/useAuthStore";
import { Save, ArrowLeft, Award, Calendar, CheckCircle } from 'lucide-react';

const FormularioEvaluacion = () => {
  const { id } = useParams(); // ID del empleado a evaluar
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    periodo: '',
    puntaje_final: '',
    semaforo: 'Verde' // Valor por defecto
  });

  // Calcular automáticamente el semáforo en base al puntaje (0 a 100)
  const manejarCambioPuntaje = (e) => {
    const puntaje = e.target.value;
    let semaforoCalculado = 'Verde';

    if (puntaje < 60) {
      semaforoCalculado = 'Rojo';
    } else if (puntaje < 80) {
      semaforoCalculado = 'Amarillo';
    }

    setFormData({
      ...formData,
      puntaje_final: puntaje,
      semaforo: semaforoCalculado
    });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarEvaluacion = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/evaluaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_empleado: id,
          periodo: formData.periodo,
          puntaje_final: parseFloat(formData.puntaje_final),
          semaforo: formData.semaforo
        })
      });

      if (response.ok) {
        // Volvemos a la ficha del empleado
        navigate(`/admin/empleados/${id}`);
      } else {
        const data = await response.json();
        setError(data.mensaje || "Error al registrar la evaluación.");
      }
    } catch (error) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/admin/empleados/${id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Registrar Nueva Evaluación</h1>
          <p className="mt-1 text-sm text-slate-500">Asigna un periodo, puntaje y clasifica el desempeño del colaborador.</p>
        </div>
      </div>

      <form onSubmit={guardarEvaluacion} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {error && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Periodo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Periodo de Evaluación</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                name="periodo" 
                required 
                value={formData.periodo} 
                onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. Q3 2026 o Octubre 2026"
              />
            </div>
          </div>

          {/* Puntaje Final */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Puntaje Final (0 a 100)</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" 
                name="puntaje_final" 
                required 
                min="0" 
                max="100" 
                step="0.01"
                value={formData.puntaje_final} 
                onChange={manejarCambioPuntaje}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. 85.5"
              />
            </div>
          </div>

          {/* Semáforo (Automático o editable) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Clasificación (Semáforo)</label>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-lg text-sm font-bold text-white uppercase ${
                formData.semaforo === 'Verde' ? 'bg-emerald-600' : 
                formData.semaforo === 'Amarillo' ? 'bg-amber-500' : 'bg-rose-600'
              }`}>
                {formData.semaforo}
              </span>
              <span className="text-xs text-slate-500">
                (Se calcula automáticamente: &lt;60 Rojo, &lt;80 Amarillo, 80+ Verde)
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <Link 
            to={`/admin/empleados/${id}`} 
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            Guardar Evaluación
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEvaluacion;