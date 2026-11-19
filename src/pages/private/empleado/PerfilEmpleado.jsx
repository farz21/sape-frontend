import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Briefcase,
  Mail,
  Building2,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

const PerfilEmpleado = () => {
  const token = useAuthStore((state) => state.token);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [guardandoAvatar, setGuardandoAvatar] = useState(false);
  const [mensajeAvatar, setMensajeAvatar] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");

  // Estados para el cambio de contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mensajePass, setMensajePass] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [enviandoPass, setEnviandoPass] = useState(false);

  // Estados para mostrar u ocultar las contraseñas (el "ojito")
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/empleado/perfil",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, [token]);

  const manejarGuardarAvatar = async (e) => {
    e.preventDefault();
    setMensajeAvatar("");
    setErrorAvatar("");
    setGuardandoAvatar(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/empleado/perfil/avatar",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar_url: avatarUrl }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.mensaje || "No se pudo guardar la foto.");
      setAvatarUrl(data.avatar_url || "");
      setMensajeAvatar(data.mensaje);
    } catch (error) {
      setErrorAvatar(error.message);
    } finally {
      setGuardandoAvatar(false);
    }
  };

  const manejarCambioPassword = async (e) => {
    e.preventDefault();
    setMensajePass("");
    setErrorPass("");
    setEnviandoPass(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/empleado/cambiar-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ passwordActual, nuevaPassword }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.mensaje || "No se pudo actualizar la contraseña.");

      setMensajePass("¡Contraseña actualizada correctamente!");
      setPasswordActual("");
      setNuevaPassword("");
    } catch (err) {
      setErrorPass(err.message);
    } finally {
      setEnviandoPass(false);
    }
  };

  if (cargando) return <p className="p-8 text-slate-500">Cargando perfil...</p>;
  if (!perfil)
    return (
      <p className="p-8 text-red-500">No se pudo cargar la información.</p>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Mi Perfil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Información personal y laboral registrada en el sistema.
        </p>
      </div>

      <div className="bg-white border rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-200 bg-slate-50 flex items-center gap-6">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-blue-700 text-3xl font-bold">
            {perfil.nombre.charAt(0)}
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={`Foto de ${perfil.nombre}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {perfil.nombre} {perfil.apellido}
            </h2>
            <p className="text-slate-500 font-medium">
              {perfil.puesto || "Puesto no asignado"}
            </p>
          </div>
        </div>

        <div className="p-8 grid gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Departamento
              </p>
              <p className="text-sm font-medium text-slate-800">
                {perfil.departamento || "No asignado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Legajo
              </p>
              <p className="text-sm font-medium text-slate-800">
                {perfil.legajo || "Sin legajo"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Email
              </p>
              <p className="text-sm font-medium text-slate-800">
                {perfil.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Fecha de Ingreso
              </p>
              <p className="text-sm font-medium text-slate-800">
                {perfil.fecha_ingreso
                  ? new Date(perfil.fecha_ingreso).toLocaleDateString()
                  : "No registrada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl border-slate-200 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-800">Foto de perfil</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pegá el enlace web de una imagen para actualizar tu foto.
        </p>
        <form
          onSubmit={manejarGuardarAvatar}
          className="mt-4 max-w-lg space-y-3"
        >
          <label
            htmlFor="avatar_url"
            className="block text-sm font-semibold text-slate-700"
          >
            URL de la imagen
          </label>
          <input
            id="avatar_url"
            type="url"
            maxLength={500}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://ejemplo.com/mi-foto.jpg"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {mensajeAvatar && (
            <p className="text-sm text-emerald-700">{mensajeAvatar}</p>
          )}
          {errorAvatar && (
            <p className="text-sm text-rose-600">{errorAvatar}</p>
          )}
          <button
            type="submit"
            disabled={guardandoAvatar}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {guardandoAvatar ? "Guardando..." : "Guardar foto"}
          </button>
        </form>
      </div>

      {/* SECCIÓN DE CAMBIO DE CONTRASEÑA CON EL OJITO */}
      <div className="bg-white border rounded-xl border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <KeyRound size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Seguridad / Cambiar Contraseña
            </h2>
            <p className="text-xs text-slate-500">
              Actualizá tu clave de acceso provisoria por una segura.
            </p>
          </div>
        </div>

        <form onSubmit={manejarCambioPassword} className="space-y-4 max-w-lg">
          {/* CAMPO CONTRASEÑA ACTUAL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={mostrarActual ? "text" : "password"}
                required
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {mostrarActual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CAMPO NUEVA CONTRASEÑA */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarNueva ? "text" : "password"}
                required
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {mostrarNueva ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mensajePass && (
            <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              {mensajePass}
            </p>
          )}
          {errorPass && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
              {errorPass}
            </p>
          )}

          <button
            type="submit"
            disabled={enviandoPass}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {enviandoPass ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PerfilEmpleado;