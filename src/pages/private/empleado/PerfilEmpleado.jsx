
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
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Procesa respuestas del servidor sin romperse si no son JSON.
const obtenerRespuesta = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

// Los mismos requisitos utilizados en Registro.jsx.
const validarRequisitosPassword = (password) => {
  return [
    {
      texto: "Al menos 8 caracteres",
      valido: password.length >= 8,
    },
    {
      texto: "Una letra mayúscula",
      valido: /\p{Lu}/u.test(password),
    },
    {
      texto: "Una letra minúscula",
      valido: /\p{Ll}/u.test(password),
    },
    {
      texto: "Al menos un número",
      valido: /\p{N}/u.test(password),
    },
    {
      texto: "Un carácter especial (!@#$%)",
      valido: /[^\p{L}\p{N}\s]/u.test(password),
    },
    {
      texto: "Máximo 64 caracteres",
      valido: password.length <= 64,
    },
  ];
};

// Evaluación visual de fortaleza.
const evaluarPassword = (password) => {
  if (!password) {
    return { nivel: 0, texto: "" };
  }

  const requisitos = validarRequisitosPassword(password);
  const cumplidos = requisitos.filter((r) => r.valido).length;

  if (password.trim().length === 0 || cumplidos <= 2) {
    return { nivel: 1, texto: "Débil" };
  }

  if (cumplidos <= 3) {
    return { nivel: 2, texto: "Regular" };
  }

  if (cumplidos <= 4) {
    return { nivel: 3, texto: "Buena" };
  }

  return { nivel: 4, texto: "Fuerte" };
};

const PerfilEmpleado = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // Perfil.
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Avatar.
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarActual, setAvatarActual] = useState("");
  const [errorImagen, setErrorImagen] = useState(false);
  const [guardandoAvatar, setGuardandoAvatar] = useState(false);
  const [mensajeAvatar, setMensajeAvatar] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");

  // Cambio de contraseña.
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mensajePass, setMensajePass] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [enviandoPass, setEnviandoPass] = useState(false);

  // Mostrar u ocultar contraseñas.
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Validaciones en tiempo real.
  const requisitosPassword = validarRequisitosPassword(nuevaPassword);

  const passwordValida = requisitosPassword.every(
    (requisito) => requisito.valido
  );

  const contraseñasCoinciden =
    nuevaPassword === confirmarPassword;

  const mostrarErrorConfirmacion =
    confirmarPassword.length > 0 && !contraseñasCoinciden;

  const fortaleza = evaluarPassword(nuevaPassword);

  const coloresFortaleza = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];

  // Cargar perfil.
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/empleado/perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await obtenerRespuesta(response);

        if (!response.ok) {
          throw new Error(
            data.mensaje || "No se pudo cargar el perfil."
          );
        }

        setPerfil(data);
        setAvatarActual(data.avatar_url || "");
        setErrorImagen(false);
        setAvatarUrl("");
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setCargando(false);
      }
    };

    if (token) {
      cargarPerfil();
    } else {
      setCargando(false);
    }
  }, [token]);

  // Guardar avatar.
  const manejarGuardarAvatar = async (e) => {
    e.preventDefault();

    setMensajeAvatar("");
    setErrorAvatar("");

    const urlEnviada = avatarUrl.trim();

    if (!urlEnviada) {
      setErrorAvatar("Ingresá una URL de imagen.");
      return;
    }

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
          body: JSON.stringify({
            avatar_url: urlEnviada,
          }),
        }
      );

      const data = await obtenerRespuesta(response);

      if (!response.ok) {
        throw new Error(
          data.mensaje || "No se pudo guardar la foto."
        );
      }

      const nuevaUrlGuardada =
        data.avatar_url !== undefined
          ? data.avatar_url || ""
          : urlEnviada;

      setAvatarActual(nuevaUrlGuardada);
      setErrorImagen(false);
      setAvatarUrl("");

      setMensajeAvatar(
        data.mensaje || "¡Foto de perfil actualizada!"
      );

      if (user && typeof setUser === "function") {
        setUser({
          ...user,
          avatar_url: nuevaUrlGuardada,
        });
      }

      window.dispatchEvent(
        new CustomEvent("avatarActualizado", {
          detail: {
            avatar_url: nuevaUrlGuardada,
          },
        })
      );
    } catch (error) {
      setErrorAvatar(error.message);
    } finally {
      setGuardandoAvatar(false);
    }
  };

  // Cambio de contraseña.
  const manejarCambioPassword = async (e) => {
    e.preventDefault();

    setMensajePass("");
    setErrorPass("");

    if (enviandoPass) return;

    // Validar contraseña actual.
    if (!passwordActual) {
      setErrorPass("Ingresá tu contraseña actual.");
      return;
    }

    // Validar nueva contraseña.
    if (!passwordValida) {
      setErrorPass(
        "La nueva contraseña todavía no cumple todos los requisitos de seguridad."
      );
      return;
    }

    // Validar confirmación.
    if (!confirmarPassword) {
      setErrorPass("Debés confirmar tu nueva contraseña.");
      return;
    }

    if (!contraseñasCoinciden) {
      setErrorPass("Las nuevas contraseñas no coinciden.");
      return;
    }

    // Evitar que la nueva contraseña sea igual a la anterior.
    if (passwordActual === nuevaPassword) {
      setErrorPass(
        "La nueva contraseña debe ser diferente de la actual."
      );
      return;
    }

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
          body: JSON.stringify({
            passwordActual,
            nuevaPassword,
          }),
        }
      );

      const data = await obtenerRespuesta(response);

      if (!response.ok) {
        throw new Error(
          data.mensaje ||
            "No se pudo actualizar la contraseña."
        );
      }

      setMensajePass(
        data.mensaje || "¡Contraseña actualizada correctamente!"
      );

      // Limpiar los campos después de actualizar.
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");

      setMostrarActual(false);
      setMostrarNueva(false);
      setMostrarConfirmacion(false);
    } catch (error) {
      setErrorPass(
        error.message || "Ocurrió un error al actualizar la contraseña."
      );
    } finally {
      setEnviandoPass(false);
    }
  };

  if (cargando) {
    return (
      <p className="p-8 text-slate-500">
        Cargando perfil...
      </p>
    );
  }

  if (!perfil) {
    return (
      <p className="p-8 text-red-500">
        No se pudo cargar la información.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Encabezado */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Mi Perfil
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Información personal y laboral registrada en el sistema.
        </p>
      </div>

      {/* Información del empleado */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-6 border-b border-slate-200 bg-slate-50 p-8">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
            {perfil.nombre?.charAt(0) || "U"}

            {avatarActual && !errorImagen && (
              <img
                src={avatarActual}
                alt={`Foto de ${perfil.nombre}`}
                onError={() => setErrorImagen(true)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {perfil.nombre} {perfil.apellido}
            </h2>

            <p className="font-medium text-slate-500">
              {perfil.puesto || "Puesto no asignado"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-8 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Building2 size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Departamento
              </p>

              <p className="text-sm font-medium text-slate-800">
                {perfil.departamento || "No asignado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Briefcase size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Legajo
              </p>

              <p className="text-sm font-medium text-slate-800">
                {perfil.legajo || "Sin legajo"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Mail size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Email
              </p>

              <p className="text-sm font-medium text-slate-800">
                {perfil.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Calendar size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Fecha de ingreso
              </p>

              <p className="text-sm font-medium text-slate-800">
                {perfil.fecha_ingreso
                  ? new Date(
                      perfil.fecha_ingreso
                    ).toLocaleDateString()
                  : "No registrada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Foto de perfil */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          Foto de perfil
        </h2>

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
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mensajeAvatar && (
            <p className="text-sm text-emerald-700">
              {mensajeAvatar}
            </p>
          )}

          {errorAvatar && (
            <p className="text-sm text-rose-600">
              {errorAvatar}
            </p>
          )}

          <button
            type="submit"
            disabled={guardandoAvatar}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {guardandoAvatar ? "Guardando..." : "Guardar foto"}
          </button>
        </form>
      </div>

      {/* Cambio de contraseña */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <KeyRound size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Seguridad / Cambiar contraseña
            </h2>

            <p className="text-xs text-slate-500">
              Actualizá tu contraseña de acceso por una más segura.
            </p>
          </div>
        </div>

        <form
          onSubmit={manejarCambioPassword}
          className="max-w-lg space-y-5"
          noValidate
        >
          {/* Contraseña actual */}
          <div>
            <label
              htmlFor="passwordActual"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Contraseña actual
            </label>

            <div className="relative">
              <input
                id="passwordActual"
                type={mostrarActual ? "text" : "password"}
                required
                autoComplete="current-password"
                value={passwordActual}
                onChange={(e) => {
                  setPasswordActual(e.target.value);
                  setErrorPass("");
                  setMensajePass("");
                }}
                placeholder="Ingresá tu contraseña actual"
                className="w-full rounded-lg border border-slate-300 py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                aria-label={
                  mostrarActual
                    ? "Ocultar contraseña actual"
                    : "Mostrar contraseña actual"
                }
                aria-pressed={mostrarActual}
                onClick={() => setMostrarActual((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarActual ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label
              htmlFor="nuevaPassword"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Nueva contraseña
            </label>

            <div className="relative">
              <input
                id="nuevaPassword"
                type={mostrarNueva ? "text" : "password"}
                required
                maxLength={64}
                autoComplete="new-password"
                value={nuevaPassword}
                onChange={(e) => {
                  setNuevaPassword(e.target.value);
                  setErrorPass("");
                  setMensajePass("");
                }}
                placeholder="Ingresá tu nueva contraseña"
                aria-describedby={
                  nuevaPassword ? "password-requisitos" : undefined
                }
                className="w-full rounded-lg border border-slate-300 py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                aria-label={
                  mostrarNueva
                    ? "Ocultar nueva contraseña"
                    : "Mostrar nueva contraseña"
                }
                aria-pressed={mostrarNueva}
                onClick={() => setMostrarNueva((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarNueva ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Checklist de requisitos */}
            {nuevaPassword && (
              <div
                id="password-requisitos"
                className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                aria-live="polite"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Requisitos de seguridad
                  </span>

                  <span className="text-xs font-semibold text-blue-600">
                    {requisitosPassword.filter((r) => r.valido).length}/
                    {requisitosPassword.length} cumplidos
                  </span>
                </div>

                <div className="space-y-2">
                  {requisitosPassword.map((requisito, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >
                      {requisito.valido ? (
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-emerald-600"
                        />
                      ) : (
                        <XCircle
                          size={15}
                          className="shrink-0 text-slate-400"
                        />
                      )}

                      <span
                        className={`text-xs ${
                          requisito.valido
                            ? "font-medium text-emerald-700"
                            : "text-slate-500"
                        }`}
                      >
                        {requisito.texto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fortaleza */}
            {nuevaPassword && (
              <div className="mt-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Seguridad de la contraseña
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      fortaleza.nivel <= 1
                        ? "text-rose-600"
                        : fortaleza.nivel === 2
                          ? "text-amber-600"
                          : fortaleza.nivel === 3
                            ? "text-yellow-600"
                            : "text-emerald-600"
                    }`}
                  >
                    {fortaleza.texto}
                  </span>
                </div>

                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((nivel) => (
                    <div
                      key={nivel}
                      className={`h-1.5 flex-1 rounded-full ${
                        nivel <= fortaleza.nivel
                          ? coloresFortaleza[fortaleza.nivel]
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirmar nueva contraseña */}
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label
                htmlFor="confirmarPassword"
                className="block text-sm font-semibold text-slate-700"
              >
                Confirmar nueva contraseña
              </label>

              {confirmarPassword && (
                <span
                  className={`flex items-center gap-1 text-xs font-medium ${
                    contraseñasCoinciden
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {contraseñasCoinciden ? (
                    <>
                      <CheckCircle2 size={14} />
                      Coinciden
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      No coinciden
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="confirmarPassword"
                type={mostrarConfirmacion ? "text" : "password"}
                required
                maxLength={64}
                autoComplete="new-password"
                value={confirmarPassword}
                onChange={(e) => {
                  setConfirmarPassword(e.target.value);
                  setErrorPass("");
                  setMensajePass("");
                }}
                placeholder="Repetí tu nueva contraseña"
                aria-invalid={mostrarErrorConfirmacion}
                className={`w-full rounded-lg border py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                  mostrarErrorConfirmacion
                    ? "border-rose-400"
                    : "border-slate-300"
                }`}
              />

              <button
                type="button"
                aria-label={
                  mostrarConfirmacion
                    ? "Ocultar confirmación"
                    : "Mostrar confirmación"
                }
                aria-pressed={mostrarConfirmacion}
                onClick={() =>
                  setMostrarConfirmacion((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarConfirmacion ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {mostrarErrorConfirmacion && (
              <p className="mt-1.5 text-xs text-rose-600">
                Las contraseñas no coinciden.
              </p>
            )}
          </div>

          {/* Mensajes */}
          {mensajePass && (
            <p
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-600"
            >
              {mensajePass}
            </p>
          )}

          {errorPass && (
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600"
            >
              {errorPass}
            </p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={enviandoPass}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviandoPass
              ? "Actualizando..."
              : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PerfilEmpleado;
