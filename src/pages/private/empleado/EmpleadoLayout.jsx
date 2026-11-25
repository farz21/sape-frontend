import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  HeartPulse,
  Bell,
  LogOut,
  UserCircle,
  LayoutDashboard,
  ClipboardList,
  Target,
  FolderKanban,
  CheckCheck,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000";

const EmpleadoLayout = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();

  const [avatarNavbar, setAvatarNavbar] = useState(user?.avatar_url || "");
  const [errorAvatarNavbar, setErrorAvatarNavbar] = useState(false);

  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);
  const [errorNotificaciones, setErrorNotificaciones] = useState("");

  const manejarLogout = () => {
    logout();
    navigate("/login");
  };

  const nombreMostrar = user?.nombre || "Empleado";

  // Obtener avatar desde el perfil al cargar y escuchar actualizaciones en vivo
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarNavbar(user.avatar_url);
      setErrorAvatarNavbar(false);
    }
  }, [user?.avatar_url]);

  useEffect(() => {
    if (!token) return;

    const obtenerAvatarPerfil = async () => {
      try {
        const res = await fetch(`${API_URL}/api/empleado/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAvatarNavbar(data.avatar_url || "");
          setErrorAvatarNavbar(false);
        }
      } catch (err) {
        console.error("Error al obtener avatar para el nav:", err);
      }
    };

    obtenerAvatarPerfil();

    const alActualizarAvatar = (e) => {
      const nuevaUrl = e?.detail?.avatar_url ?? "";
      setAvatarNavbar(nuevaUrl);
      setErrorAvatarNavbar(false);
    };

    window.addEventListener("avatarActualizado", alActualizarAvatar);
    return () => {
      window.removeEventListener("avatarActualizado", alActualizarAvatar);
    };
  }, [token]);

  const linkActivo = (ruta) =>
    location.pathname === ruta
      ? "text-blue-700 bg-blue-50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  // Cargar notificaciones del empleado (excluyendo las que ya están leídas en BD con leida === 1)
  const cargarNotificaciones = async () => {
    if (!token) return;

    try {
      setCargandoNotificaciones(true);
      setErrorNotificaciones("");

      const response = await fetch(`${API_URL}/api/empleado/notificaciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensaje || "No se pudieron cargar las notificaciones.",
        );
      }

      const lista = Array.isArray(data) ? data : [];
      const noLeidas = lista.filter(
        (notificacion) => Number(notificacion.leida) !== 1,
      );
      setNotificaciones(noLeidas);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setErrorNotificaciones(error.message);
    } finally {
      setCargandoNotificaciones(false);
    }
  };

  // Cargar al entrar y actualizar cada 30 segundos
  useEffect(() => {
    if (!token) return;

    cargarNotificaciones();

    const intervalo = setInterval(() => {
      cargarNotificaciones();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [token]);

  // Contar notificaciones sin leer
  const cantidadSinLeer = notificaciones.filter(
    (notificacion) => Number(notificacion.leida) === 0,
  ).length;

  // Marcar una notificación como leída y quitarla de la lista activa
  const marcarComoLeida = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/empleado/notificaciones/${id}/leida`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo actualizar.");
      }

      setNotificaciones((actuales) =>
        actuales.filter((notificacion) => notificacion.id_notificacion !== id),
      );
    } catch (error) {
      console.error("Error al marcar notificación:", error);
      setErrorNotificaciones(error.message);
    }
  };

  // Eliminar / limpiar una notificación con la X: la marca como leída en BD (leida = 1) para que no reaparezca al recargar
  const eliminarNotificacion = async (e, id) => {
    e.stopPropagation();

    try {
      await fetch(`${API_URL}/api/empleado/notificaciones/${id}/leida`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error al persistir estado de leída:", error);
    } finally {
      setNotificaciones((actuales) =>
        actuales.filter((notificacion) => notificacion.id_notificacion !== id),
      );
    }
  };

  // Marcar todas como leídas y limpiarlas de la lista activa
  const marcarTodasLeidas = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/empleado/notificaciones/leidas`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudieron actualizar.");
      }

      setNotificaciones([]);
    } catch (error) {
      console.error("Error al marcar todas:", error);
      setErrorNotificaciones(error.message);
    }
  };

  // Formatear fecha
  const fechaLegible = (fecha) => {
    if (!fecha) return "";

    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
      {/* HEADER DE NAVEGACIÓN */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm border-slate-200">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-blue-700">
                S.A.P.E.
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/empleado"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado")}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Inicio
              </Link>

              <Link
                to="/empleado/evaluaciones"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado/evaluaciones")}`}
              >
                <ClipboardList className="w-4 h-4" /> Evaluaciones
              </Link>

              <Link
                to="/empleado/metas"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado/metas")}`}
              >
                <Target className="w-4 h-4" />
                Mis metas
              </Link>

              <Link
                to="/empleado/checkin"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado/checkin")}`}
              >
                <HeartPulse className="w-4 h-4" />
                Check-in
              </Link>
              <Link
                to="/empleado/proyectos"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${linkActivo("/empleado/proyectos")}`}
              >
                <FolderKanban className="w-4 h-4" />
                Mis proyectos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMostrarNotificaciones((actual) => !actual);
                  setErrorNotificaciones("");
                }}
                className="relative p-2 transition-colors rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                title="Notificaciones"
                aria-label="Abrir notificaciones"
                aria-expanded={mostrarNotificaciones}
              >
                <Bell className="w-5 h-5" />

                {cantidadSinLeer > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                    {cantidadSinLeer > 9 ? "9+" : cantidadSinLeer}
                  </span>
                )}
              </button>

              {/* PANEL DESPLEGABLE */}
              {mostrarNotificaciones && (
                <div className="absolute right-0 z-50 mt-3 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xl w-80 sm:w-96">
                  {/* ENCABEZADO */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        Notificaciones
                      </h3>
                      <p className="text-xs text-slate-500">
                        {cantidadSinLeer} sin leer
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {cantidadSinLeer > 0 && (
                        <button
                          type="button"
                          onClick={marcarTodasLeidas}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          title="Marcar todas como leídas"
                        >
                          Leer todas
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setMostrarNotificaciones(false)}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                        title="Cerrar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* CONTENIDO */}
                  <div className="overflow-y-auto max-h-96">
                    {cargandoNotificaciones && notificaciones.length === 0 ? (
                      <div className="p-8 text-center">
                        <RefreshCw className="w-6 h-6 mx-auto mb-2 text-blue-600 animate-spin" />
                        <p className="text-sm text-slate-500">
                          Cargando notificaciones...
                        </p>
                      </div>
                    ) : errorNotificaciones && notificaciones.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-red-600">
                          {errorNotificaciones}
                        </p>
                        <button
                          type="button"
                          onClick={cargarNotificaciones}
                          className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : notificaciones.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-9 h-9 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium text-slate-700">
                          No tenés notificaciones
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Acá aparecerán tus próximos avisos.
                        </p>
                      </div>
                    ) : (
                      notificaciones.map((notificacion) => {
                        const leida = Number(notificacion.leida) === 1;

                        return (
                          <div
                            key={notificacion.id_notificacion}
                            onClick={() => {
                              if (!leida) {
                                marcarComoLeida(notificacion.id_notificacion);
                              }
                            }}
                            className={`w-full p-4 text-left border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                              !leida
                                ? "bg-blue-50/60 cursor-pointer"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-full shrink-0 ${
                                  leida
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {leida ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Bell className="w-4 h-4" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-sm font-semibold text-slate-800 truncate">
                                    {notificacion.titulo}
                                  </h4>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {!leida && (
                                      <span className="w-2 h-2 bg-blue-600 rounded-full" />
                                    )}

                                    <button
                                      type="button"
                                      onClick={(e) =>
                                        eliminarNotificacion(
                                          e,
                                          notificacion.id_notificacion,
                                        )
                                      }
                                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                      title="Eliminar notificación"
                                      aria-label="Eliminar notificación"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                  {notificacion.mensaje}
                                </p>

                                <p className="mt-2 text-xs text-slate-400">
                                  {fechaLegible(notificacion.fecha_creacion)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* PIE */}
                  <div className="p-3 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={cargarNotificaciones}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Actualizar notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-slate-200"></div>

            {/* PERFIL */}
            <Link
              to="/empleado/perfil"
              className="flex items-center gap-2 group hover:opacity-85 transition-opacity"
              title="Ver mi perfil"
            >
              {avatarNavbar && !errorAvatarNavbar ? (
                <img
                  src={avatarNavbar}
                  alt={`Foto de ${nombreMostrar}`}
                  onError={() => setErrorAvatarNavbar(true)}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
              )}

              <span className="hidden text-sm font-medium sm:block text-slate-700 group-hover:text-blue-700">
                {nombreMostrar}
              </span>
            </Link>

            {/* CERRAR SESIÓN */}
            <button
              onClick={manejarLogout}
              className="p-2 ml-2 transition-colors rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="w-full px-4 pt-6 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default EmpleadoLayout;
