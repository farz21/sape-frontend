import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from "../../../store/useAuthStore";
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react';

const Empleados = () => {
  const token = useAuthStore((state) => state.token);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const cargarEmpleados = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/empleados', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) setEmpleados(await response.json());
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const manejarEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${nombre} del sistema? Esta acción no se puede deshacer.`)) return;

    try {
      const response = await fetch(`http://localhost:3000/api/empleados/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setEmpleados(empleados.filter(emp => emp.id !== id));
      } else {
        alert("Error al eliminar el empleado.");
      }
    } catch (error) {
      console.error("Error en la solicitud de eliminación:", error);
    }
  };

  const empleadosFiltrados = empleados.filter(emp => 
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    (emp.legajo && emp.legajo.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Gestión de Empleados</h1>
          <p className="mt-1 text-sm text-slate-500">Administra los accesos y legajos de la plantilla.</p>
        </div>
        <Link 
          to="/admin/empleados/nuevo" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={18} /> Nuevo Empleado
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellido o legajo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Legajo</th>
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {empleadosFiltrados.length > 0 ? empleadosFiltrados.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{emp.legajo || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{emp.nombre} {emp.apellido}</div>
                    <div className="text-xs text-slate-500">Ingreso: {emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString() : '-'}</div>
                  </td>
                  <td className="px-6 py-4">{emp.email}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link to={`/admin/empleados/${emp.id}`} className="text-emerald-600 hover:text-emerald-800" title="Evaluar">
                        Evaluar
                      </Link>
                      <Link to={`/admin/empleados/editar/${emp.id}`} className="text-blue-600 hover:text-blue-800" title="Editar">
                        <Pencil size={18} />
                      </Link>
                      <button onClick={() => manejarEliminar(emp.id, emp.nombre)} className="text-rose-600 hover:text-rose-800" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No se encontraron empleados con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Empleados;