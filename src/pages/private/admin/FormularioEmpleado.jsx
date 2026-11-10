import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore } from "../../../store/useAuthStore";
import { Save, ArrowLeft, Building2, User, Mail, Key, Calendar, Briefcase } from 'lucide-react';

const FormularioEmpleado = () => {
  const { id } = useParams(); // Si hay ID, estamos en modo Edición
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const esModoEdicion = Boolean(id);
  const [cargando, setCargando] = useState(esModoEdicion);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '', 
    empresa: 'S.A.P.E.',
    legajo: '',
    fecha_ingreso: '',
    id_puesto: 1 
  });

  // Si estamos editando, buscamos los datos actuales del empleado
  useEffect(() => {
    if (esModoEdicion) {
      const cargarDatosEmpleado = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/empleados/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const emp = data.datos; // Tomás lo llamó "datos" en su endpoint
            
            // Formatear la fecha para el input type="date" (YYYY-MM-DD)
            // Asumimos que si no hay fecha en el historial, devolvemos vacío
            const fechaFormateada = emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toISOString().split('T')[0] : '';

            setFormData({
              nombre: emp.nombre || '',
              apellido: emp.apellido || '',
              email: emp.email || '',
              password: '', // No mostramos la contraseña hasheada
              empresa: emp.empresa || 'S.A.P.E.',
              legajo: emp.legajo || '', // Si no viene en este endpoint, quedará vacío para que lo llene
              fecha_ingreso: fechaFormateada,
              id_puesto: 1
            });
          }
        } catch (error) {
          setError("Error al cargar los datos del empleado.");
          console.error(error);
        } finally {
          setCargando(false);
        }
      };
      cargarDatosEmpleado();
    }
  }, [id, token]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();
    setError('');

    const url = esModoEdicion 
      ? `http://localhost:3000/api/empleados/${id}`
      : `http://localhost:3000/api/empleados`;
      
    const metodo = esModoEdicion ? 'PUT' : 'POST';

    // ✨ EL CAMBIO ESTÁ AQUÍ: Clonamos y limpiamos el password al editar
    const datosAEnviar = { ...formData };
    if (esModoEdicion) {
      delete datosAEnviar.password;
    }

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datosAEnviar) // Mandamos los datos limpios
      });

      if (response.ok) {
        navigate('/admin/empleados');
      } else {
        const data = await response.json();
        setError(data.mensaje || "Ocurrió un error al guardar.");
      }
    } catch (error) {
      setError("Error de conexión con el servidor.");
    }
  };

  if (cargando) return <div className="p-8 text-slate-500">Cargando formulario...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/empleados" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {esModoEdicion ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {esModoEdicion ? 'Actualiza la información del legajo o contacto.' : 'Completa los datos para dar de alta a un empleado en el sistema.'}
          </p>
        </div>
      </div>

      <form onSubmit={guardarEmpleado} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {error && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="p-6 sm:p-8 grid gap-6 sm:grid-cols-2">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" name="nombre" required value={formData.nombre} onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. Juan"
              />
            </div>
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Apellido</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" name="apellido" required value={formData.apellido} onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" name="email" required value={formData.email} onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="juan@empresa.com"
              />
            </div>
          </div>

          {/* Password (Solo Alta) */}
          {!esModoEdicion && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña Temporal</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" name="password" required value={formData.password} onChange={manejarCambio}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="********"
                />
              </div>
            </div>
          )}

          {/* Legajo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Legajo</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" name="legajo" required value={formData.legajo} onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. DEV-001"
              />
            </div>
          </div>

          {/* Fecha Ingreso */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Ingreso</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date" name="fecha_ingreso" required value={formData.fecha_ingreso} onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <Link 
            to="/admin/empleados" 
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            {esModoEdicion ? 'Actualizar Datos' : 'Registrar Empleado'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEmpleado;