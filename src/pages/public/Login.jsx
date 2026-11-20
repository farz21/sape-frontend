
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import HeaderPublic from "../../components/public/HeaderPublic";

// Validación básica del formato del correo electrónico.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Función para interpretar respuestas del backend sin romperse
// cuando el servidor devuelve una respuesta que no es JSON.
const obtenerRespuesta = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [datos, setDatos] = useState({
    email: "",
    password: "",
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Actualizar campos y limpiar sus errores.
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setDatos((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMensaje("");
  };

  // Validaciones del formulario.
  const validarFormulario = () => {
    const nuevosErrores = {};

    const email = datos.email.trim();

    if (!email) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (
      email.length > 254 ||
      !EMAIL_REGEX.test(email)
    ) {
      nuevosErrores.email = "Ingresá un correo electrónico válido.";
    }

    if (!datos.password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (!datos.password.trim()) {
      nuevosErrores.password = "Ingresá una contraseña válida.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setMensaje("");

    if (!validarFormulario()) return;

    setCargando(true);

    try {
      const datosLogin = {
        email: datos.email.trim().toLowerCase(),
        password: datos.password,
      };

      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosLogin),
      });

      const data = await obtenerRespuesta(response);

      if (!response.ok) {
        throw new Error(
          data.mensaje || "Correo o contraseña incorrectos."
        );
      }

      // Aceptamos los dos formatos de respuesta utilizados
      // habitualmente por el backend.
      const usuarioLogueado = data.user || data.usuario;
      const tokenRecibido = data.token;

      // Comprobar que el servidor haya devuelto una sesión válida.
      if (!usuarioLogueado || !tokenRecibido) {
        throw new Error(
          "El servidor no devolvió los datos necesarios para iniciar sesión."
        );
      }

      // Normalizar el rol para evitar problemas de mayúsculas.
      const rolUsuario = usuarioLogueado.rol
        ?.toString()
        .trim()
        .toLowerCase();

      if (!["administrador", "empleado"].includes(rolUsuario)) {
        throw new Error(
          "No se pudo validar el rol de tu cuenta. Contactá al administrador."
        );
      }

      // Guardar la sesión después de validar usuario, token y rol.
      login(usuarioLogueado, tokenRecibido);

      // Redirección según el rol.
      if (rolUsuario === "administrador") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/empleado", { replace: true });
      }
    } catch (error) {
      setMensaje(
        error.message || "No pudimos conectarnos con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarRecuperacion = () => {
    setMensaje(
      "Para recuperar tu acceso, contactá al administrador de S.A.P.E."
    );
  };

  const claseInput = (campo) =>
    `block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
      errores[campo]
        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <HeaderPublic />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

          <Link
            to="/"
            aria-label="Volver al inicio"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al inicio
          </Link>

          <div className="mb-7 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Iniciar sesión
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ingresa tus datos para acceder a tu espacio de trabajo.
            </p>
          </div>

          <form
            onSubmit={manejarEnvio}
            className="space-y-5"
            noValidate
          >

            {/* Correo electrónico */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>

              <input
                id="email"
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
                className={claseInput("email")}
              />

              {errores.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-rose-600"
                >
                  {errores.email}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={datos.password}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!errores.password}
                  aria-describedby={
                    errores.password ? "password-error" : undefined
                  }
                  className={`${claseInput("password")} pr-11`}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  {mostrarPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errores.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-rose-600"
                >
                  {errores.password}
                </p>
              )}
            </div>

            {/* Recuperación de contraseña */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={manejarRecuperacion}
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Mensajes generales */}
            {mensaje && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
              >
                {mensaje}
              </div>
            )}

            {/* Botón de acceso */}
            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión →"
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            ¿Todavía no tienes cuenta?{" "}
            <Link
              to="/registro"
              className="font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
