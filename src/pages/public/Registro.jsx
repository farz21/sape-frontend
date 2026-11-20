
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import HeaderPublic from "../../components/public/HeaderPublic";

// Validaciones generales.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Permite nombres y apellidos con tildes, ñ, espacios,
// guiones y apóstrofes.
const NOMBRE_REGEX = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

// Procesa respuestas del servidor sin romperse si no son JSON.
const obtenerRespuesta = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

// Requisitos de seguridad de la contraseña.
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

// Evaluación orientativa de fortaleza de contraseña.
const evaluarPassword = (password) => {
  if (!password) {
    return {
      nivel: 0,
      texto: "",
    };
  }

  const requisitos = validarRequisitosPassword(password);
  const cumplidos = requisitos.filter((r) => r.valido).length;

  if (password.trim().length === 0) {
    return {
      nivel: 1,
      texto: "Muy débil",
    };
  }

  if (cumplidos <= 2) {
    return {
      nivel: 1,
      texto: "Débil",
    };
  }

  if (cumplidos <= 3) {
    return {
      nivel: 2,
      texto: "Regular",
    };
  }

  if (cumplidos <= 4) {
    return {
      nivel: 3,
      texto: "Buena",
    };
  }

  return {
    nivel: 4,
    texto: "Fuerte",
  };
};

const Registro = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    aceptar: false,
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const [cargando, setCargando] = useState(false);

  // Validaciones de contraseña en tiempo real.
  const requisitosPassword = validarRequisitosPassword(datos.password);

  const passwordValida = requisitosPassword.every(
    (requisito) => requisito.valido
  );

  const lasContraseñasCoinciden =
    datos.password === datos.confirmPassword;

  const mostrarErrorConfirmacion =
    datos.confirmPassword.length > 0 && !lasContraseñasCoinciden;

  const fortaleza = evaluarPassword(datos.password);

  // Manejo de campos.
  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    const nuevoValor = type === "checkbox" ? checked : value;

    setDatos((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));

    setErrores((prev) => {
      const nuevosErrores = { ...prev };

      delete nuevosErrores[name];

      // Si cambia la contraseña, volver a validar la confirmación.
      if (name === "password") {
        if (
          datos.confirmPassword &&
          nuevoValor !== datos.confirmPassword
        ) {
          nuevosErrores.confirmPassword = "Las contraseñas no coinciden.";
        } else {
          delete nuevosErrores.confirmPassword;
        }
      }

      // Si cambia la confirmación, comprobar coincidencia.
      if (name === "confirmPassword") {
        if (nuevoValor !== datos.password) {
          nuevosErrores.confirmPassword = "Las contraseñas no coinciden.";
        } else {
          delete nuevosErrores.confirmPassword;
        }
      }

      return nuevosErrores;
    });

    setMensaje("");
  };

  // Validación completa antes de enviar.
  const validarFormulario = () => {
    const nuevosErrores = {};

    const nombre = datos.nombre.trim();
    const apellido = datos.apellido.trim();
    const email = datos.email.trim();

    // Nombre.
    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 2 || nombre.length > 50) {
      nuevosErrores.nombre = "El nombre debe tener entre 2 y 50 caracteres.";
    } else if (!NOMBRE_REGEX.test(nombre)) {
      nuevosErrores.nombre =
        "Ingresá un nombre válido. No utilices números ni símbolos.";
    }

    // Apellido.
    if (!apellido) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (apellido.length < 2 || apellido.length > 50) {
      nuevosErrores.apellido =
        "El apellido debe tener entre 2 y 50 caracteres.";
    } else if (!NOMBRE_REGEX.test(apellido)) {
      nuevosErrores.apellido = "Ingresá un apellido válido.";
    }

    // Email.
    if (!email) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (email.length > 254 || !EMAIL_REGEX.test(email)) {
      nuevosErrores.email = "Ingresá un correo electrónico válido.";
    }

    // Contraseña.
    if (!datos.password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (!passwordValida) {
      nuevosErrores.password =
        "La contraseña todavía no cumple todos los requisitos de seguridad.";
    }

    // Confirmación.
    if (!datos.confirmPassword) {
      nuevosErrores.confirmPassword = "Debés confirmar tu contraseña.";
    } else if (!lasContraseñasCoinciden) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden.";
    }

    // Aceptación de condiciones.
    if (!datos.aceptar) {
      nuevosErrores.aceptar =
        "Debés aceptar el tratamiento de datos para continuar.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // Envío del formulario.
  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setMensaje("");

    if (!validarFormulario()) return;

    setCargando(true);

    try {
      // El rol debe ser asignado por el backend.
      const datosRegistro = {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email: datos.email.trim().toLowerCase(),
        password: datos.password,
        empresa: "S.A.P.E.",
      };

      const response = await fetch("http://localhost:3000/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosRegistro),
      });

      const data = await obtenerRespuesta(response);

      if (!response.ok) {
        throw new Error(
          data.mensaje ||
            data.message ||
            "No se pudo completar el registro."
        );
      }

      const usuarioRegistrado = data.usuario || data.user;
      const tokenRecibido = data.token;

      // Solo iniciamos sesión si el backend devuelve
      // tanto el usuario como un token.
      if (!usuarioRegistrado || !tokenRecibido) {
        setMensaje(
          data.mensaje ||
            "El registro se completó, pero no se recibió una sesión. Iniciá sesión con tus credenciales."
        );
        return;
      }

      const rolUsuario = usuarioRegistrado.rol
        ?.toString()
        .trim()
        .toLowerCase();

      // El registro público debe generar una cuenta de empleado.
      if (rolUsuario !== "empleado") {
        throw new Error(
          "No se pudo validar el perfil de la cuenta. Contactá al administrador."
        );
      }

      // Guardar sesión en Zustand.
      register(usuarioRegistrado, tokenRecibido);

      navigate("/empleado", { replace: true });
    } catch (error) {
      setMensaje(
        error.message || "No pudimos conectarnos con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  // Estilos reutilizables.
  const claseInput = (campo) =>
    `mt-1.5 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      errores[campo]
        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  const claseLabel = "block text-sm font-semibold text-slate-700";

  // Indicador visual de fortaleza.
  const coloresFortaleza = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <HeaderPublic />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <Link
            to="/"
            aria-label="Volver al inicio"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al inicio
          </Link>

          <div className="mb-7 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
              Comienza con S.A.P.E.
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Crea tu cuenta
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Completa tus datos para solicitar acceso al espacio de tu
              organización.
            </p>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-4" noValidate>
            {/* Nombre y apellido */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className={claseLabel}>
                  Nombre
                </label>

                <input
                  id="nombre"
                  className={claseInput("nombre")}
                  type="text"
                  name="nombre"
                  value={datos.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej.: Martina"
                  autoComplete="given-name"
                  minLength={2}
                  maxLength={50}
                  required
                  aria-invalid={!!errores.nombre}
                  aria-describedby={
                    errores.nombre ? "nombre-error" : undefined
                  }
                />

                {errores.nombre && (
                  <p
                    id="nombre-error"
                    role="alert"
                    className="mt-1.5 text-xs text-rose-600"
                  >
                    {errores.nombre}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="apellido" className={claseLabel}>
                  Apellido
                </label>

                <input
                  id="apellido"
                  className={claseInput("apellido")}
                  type="text"
                  name="apellido"
                  value={datos.apellido}
                  onChange={manejarCambio}
                  placeholder="Ej.: González"
                  autoComplete="family-name"
                  minLength={2}
                  maxLength={50}
                  required
                  aria-invalid={!!errores.apellido}
                  aria-describedby={
                    errores.apellido ? "apellido-error" : undefined
                  }
                />

                {errores.apellido && (
                  <p
                    id="apellido-error"
                    role="alert"
                    className="mt-1.5 text-xs text-rose-600"
                  >
                    {errores.apellido}
                  </p>
                )}
              </div>
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="email" className={claseLabel}>
                Correo electrónico
              </label>

              <input
                id="email"
                className={claseInput("email")}
                type="email"
                name="email"
                value={datos.email}
                onChange={manejarCambio}
                placeholder="nombre@empresa.com"
                autoComplete="email"
                maxLength={254}
                required
                aria-invalid={!!errores.email}
                aria-describedby={
                  errores.email ? "email-error" : undefined
                }
              />

              {errores.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1.5 text-xs text-rose-600"
                >
                  {errores.email}
                </p>
              )}
            </div>

            {/* Organización fija */}
            <div>
              <label htmlFor="empresa" className={claseLabel}>
                Organización
              </label>

              <input
                id="empresa"
                type="text"
                value="S.A.P.E."
                readOnly
                className="mt-1.5 block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className={claseLabel}>
                Contraseña
              </label>

              <div className="relative mt-1.5">
                <input
                  id="password"
                  className={`${claseInput("password")} pr-11`}
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={datos.password}
                  onChange={manejarCambio}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  maxLength={64}
                  required
                  aria-invalid={!!errores.password}
                  aria-describedby={[
                    datos.password ? "password-requisitos" : null,
                    errores.password ? "password-error" : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                />

                <button
                  type="button"
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={mostrarPassword}
                  onClick={() => setMostrarPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {mostrarPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {/* Requisitos de contraseña en tiempo real */}
              {datos.password && (
                <div
                  id="password-requisitos"
                  className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  aria-live="polite"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Requisitos de seguridad
                    </span>

                    <span className="text-xs font-semibold text-indigo-600">
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

              {/* Indicador de fortaleza */}
              {datos.password && (
                <div className="mt-2" aria-live="polite">
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

              {errores.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-xs text-rose-600"
                >
                  {errores.password}
                </p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="confirmPassword" className={claseLabel}>
                  Confirmar contraseña
                </label>

                {datos.confirmPassword && (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      lasContraseñasCoinciden
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {lasContraseñasCoinciden ? (
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

              <div className="relative mt-1.5">
                <input
                  id="confirmPassword"
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                    errores.confirmPassword || mostrarErrorConfirmacion
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                  }`}
                  type={mostrarConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={datos.confirmPassword}
                  onChange={manejarCambio}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  maxLength={64}
                  required
                  aria-invalid={
                    !!errores.confirmPassword || mostrarErrorConfirmacion
                  }
                  aria-describedby={
                    errores.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  aria-label={
                    mostrarConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                  aria-pressed={mostrarConfirmPassword}
                  onClick={() =>
                    setMostrarConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {mostrarConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errores.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  role="alert"
                  className="mt-1.5 text-xs text-rose-600"
                >
                  {errores.confirmPassword}
                </p>
              )}
            </div>

            {/* Aceptación de tratamiento de datos */}
            <div>
              <label className="flex items-start gap-2.5 pt-1 text-xs leading-5 text-slate-500">
                <input
                  type="checkbox"
                  name="aceptar"
                  checked={datos.aceptar}
                  onChange={manejarCambio}
                  required
                  aria-invalid={!!errores.aceptar}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
                />

                <span>
                  Acepto que mis datos se utilicen para gestionar esta solicitud
                  de acceso a S.A.P.E.
                </span>
              </label>

              {errores.aceptar && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600">
                  {errores.aceptar}
                </p>
              )}
            </div>

            {/* Mensaje general */}
            {mensaje && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
              >
                {mensaje}
              </div>
            )}

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta →"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Registro;
