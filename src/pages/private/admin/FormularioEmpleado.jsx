import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore } from "../../../store/useAuthStore";
import { Save, ArrowLeft, Building2, User, Mail, Key, Calendar, Briefcase, Eye, EyeOff, BellRing, ChevronDown, ChevronUp } from 'lucide-react';

const FormularioEmpleado = () => {
  const { id } = useParams(); // Si hay ID, estamos en modo Edición
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  
  const esModoEdicion = Boolean(id);
  const [cargando, setCargando] = useState(esModoEdicion);
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false); // Estado para el ojito del password
  const [alertasEmpleado, setAlertasEmpleado] = useState([]);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '', 
    empresa: 'S.A.P.E.',
    legajo: '',
    fecha_ingreso: '',
    id_puesto: 1,
    condicion_laboral: 'empleado' // 'empleado' (puesto fijo) | 'a_prueba'
  });

  // Si estamos editando, buscamos los datos actuales del empleado y sus alertas de fatiga
  useEffect(() => {
    if (!esModoEdicion) return;

    const cargarDatosEmpleado = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/empleados/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          let emp = data.datos || data.empleado || data;

          // Fallback: si el endpoint /:id no incluye en_periodo_prueba, lo buscamos en la lista general
          if (
            emp.en_periodo_prueba === undefined &&
            emp.condicion_laboral === undefined &&
            emp.estado_puesto === undefined
          ) {
            const listaRes = await fetch(`http://localhost:3000/api/empleados`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (listaRes.ok) {
              const listaData = await listaRes.json();
              const lista = Array.isArray(listaData)
                ? listaData
                : listaData.empleados || [];
              const encontrado = lista.find(
                (item) =>
                  String(item.id_empleado) === String(id) ||
                  String(item.id_usuario) === String(id)
              );
              if (encontrado) {
                emp = {
                  ...encontrado,
                  ...emp,
                  en_periodo_prueba: encontrado.en_periodo_prueba,
                };
              }
            }
          }

          const fechaFormateada = emp.fecha_ingreso
            ? new Date(emp.fecha_ingreso).toISOString().split('T')[0]
            : '';
          const condicionActual = String(
            emp.condicion_laboral || emp.estado_puesto || ''
          ).toLowerCase();
          const esPruebaActual =
            emp.en_periodo_prueba === true ||
            Number(emp.en_periodo_prueba) === 1 ||
            condicionActual === 'a_prueba' ||
            condicionActual === 'a prueba' ||
            condicionActual === 'prueba';

          setFormData({
            nombre: emp.nombre || '',
            apellido: emp.apellido || '',
            email: emp.email || '',
            password: '',
            empresa: emp.empresa || 'S.A.P.E.',
            legajo: emp.legajo || '',
            fecha_ingreso: fechaFormateada,
            id_puesto: emp.id_puesto || 1,
            condicion_laboral: esPruebaActual ? 'a_prueba' : 'empleado'
          });

          // Misma fuente que DashboardAdmin: /api/admin/notificaciones filtrando tipo === "alerta_fatiga"
          const resNotificaciones = await fetch(
            "http://localhost:3000/api/admin/notificaciones",
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (resNotificaciones.ok) {
            const notificacionesData = await resNotificaciones.json();
            const listaNotif = Array.isArray(notificacionesData)
              ? notificacionesData
              : [];

            const idEmpActual = emp.id_empleado ?? id;
            const idUsrActual = emp.id_usuario ?? null;
            const nombreCompleto = `${emp.nombre || ''} ${emp.apellido || ''}`
              .trim()
              .toLowerCase();
            const nombreSolo = String(emp.nombre || '').trim().toLowerCase();
            const apellidoSolo = String(emp.apellido || '').trim().toLowerCase();
            const legajo = String(emp.legajo || '').trim().toLowerCase();

            const alertasFiltradas = listaNotif.filter((notificacion) => {
              if (notificacion.tipo !== "alerta_fatiga") return false;

              if (
                notificacion.id_empleado !== undefined &&
                notificacion.id_empleado !== null &&
                String(notificacion.id_empleado) === String(idEmpActual)
              ) {
                return true;
              }

              if (
                idUsrActual !== null &&
                notificacion.id_usuario !== undefined &&
                notificacion.id_usuario !== null &&
                String(notificacion.id_usuario) === String(idUsrActual)
              ) {
                return true;
              }

              const textoAlerta = `${notificacion.titulo || ''} ${notificacion.mensaje || ''}`.toLowerCase();
              return (
                (nombreCompleto && textoAlerta.includes(nombreCompleto)) ||
                (legajo && textoAlerta.includes(legajo)) ||
                (nombreSolo.length > 2 && textoAlerta.includes(nombreSolo)) ||
                (apellidoSolo.length > 2 && textoAlerta.includes(apellidoSolo))
              );
            });

            setAlertasEmpleado(alertasFiltradas);
          }
        }
      } catch (error) {
        setError("Error al cargar los datos del empleado.");
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosEmpleado();
  }, [id, token, esModoEdicion]);

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

    const esPruebaSeleccionado = formData.condicion_laboral === 'a_prueba';
    const datosAEnviar = {
      ...formData,
      en_periodo_prueba: esPruebaSeleccionado ? 1 : 0,
    };
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
        body: JSON.stringify(datosAEnviar)
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

        {/* Aviso lateral discreto y plegable solo si el empleado tiene alertas de fatiga */}
        {esModoEdicion && alertasEmpleado.length > 0 && (
          <div className="mx-6 mt-6 sm:mx-8 rounded-lg border border-slate-200 border-l-4 border-l-amber-500 bg-slate-50/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setMostrarAlertas((prev) => !prev)}
              aria-expanded={mostrarAlertas}
              className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BellRing size={16} className="text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  Alertas preventivas de fatiga ({alertasEmpleado.length})
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 shrink-0">
                {mostrarAlertas ? (
                  <>
                    Ocultar <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Ver detalle <ChevronDown size={14} />
                  </>
                )}
              </span>
            </button>

            {mostrarAlertas && (
              <ul className="divide-y divide-slate-200/80 border-t border-slate-200/80 px-4 py-1 bg-white">
                {alertasEmpleado.map((notificacion) => (
                  <li key={notificacion.id_notificacion} className="py-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">
                        {notificacion.titulo}
                      </p>
                      <span className="text-[11px] font-medium text-amber-700">
                        {Number(notificacion.leida) ? "Revisada" : "Pendiente"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-600">{notificacion.mensaje}</p>
                    {notificacion.fecha_creacion && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(notificacion.fecha_creacion).toLocaleString("es-AR")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
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

          {/* Password (Solo Alta) con Botón de Visibilidad (Ojito) */}
          {!esModoEdicion && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña Temporal</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={mostrarPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={manejarCambio}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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

          {/* Condición / Puesto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Condición del Puesto</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                name="condicion_laboral"
                value={formData.condicion_laboral}
                onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="empleado">Empleado (puesto fijo)</option>
                <option value="a_prueba">A prueba</option>
              </select>
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