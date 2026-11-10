import { useState, useEffect } from 'react';
import { useAuthStore } from "../../../store/useAuthStore";
import { User, Briefcase, Mail, Building2, Calendar } from 'lucide-react';

const PerfilEmpleado = () => {
  const token = useAuthStore((state) => state.token);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/empleado/perfil", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, [token]);

  if (cargando) return <p className="p-8 text-slate-500">Cargando perfil...</p>;
  if (!perfil) return <p className="p-8 text-red-500">No se pudo cargar la información.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Mi Perfil</h1>
        <p className="mt-1 text-sm text-slate-500">Información personal y laboral registrada en el sistema.</p>
      </div>

      <div className="bg-white border rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-200 bg-slate-50 flex items-center gap-6">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-blue-100 text-blue-700 text-3xl font-bold">
            {perfil.nombre.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{perfil.nombre} {perfil.apellido}</h2>
            <p className="text-slate-500 font-medium">{perfil.puesto || 'Puesto no asignado'}</p>
          </div>
        </div>

        <div className="p-8 grid gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Building2 size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Departamento</p>
              <p className="text-sm font-medium text-slate-800">{perfil.departamento || 'No asignado'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Briefcase size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Legajo</p>
              <p className="text-sm font-medium text-slate-800">{perfil.legajo || 'Sin legajo'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Mail size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
              <p className="text-sm font-medium text-slate-800">{perfil.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Calendar size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Fecha de Ingreso</p>
              <p className="text-sm font-medium text-slate-800">
                {perfil.fecha_ingreso ? new Date(perfil.fecha_ingreso).toLocaleDateString() : 'No registrada'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilEmpleado;