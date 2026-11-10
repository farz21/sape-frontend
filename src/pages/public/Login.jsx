import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react"; 
import { useAuthStore } from "../../store/useAuthStore"; 
import HeaderPublic from "../../components/public/HeaderPublic";
import FooterPublic from "../../components/public/FooterPublic";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); 

  const [datos, setDatos] = useState({
    email: "",
    password: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    setMensaje("");
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    setMensaje("");

    // Usuarios simulados
    const usuarios = [
      {
        email: "admin@sape.com",
        password: "admin123",
        nombre: "Administrador",
        rol: "administrador",
      },
      {
        email: "empleado@sape.com",
        password: "empleado123",
        nombre: "Empleado de prueba",
        rol: "empleado",
      },
    ];

    // Buscamos si existe el usuario
    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        usuario.email === datos.email &&
        usuario.password === datos.password
    );

    // Si no coincide el correo o contraseña
    if (!usuarioEncontrado) {
      setMensaje("Correo electrónico o contraseña incorrectos.");
      return;
    }

    // Datos que guardaremos en Zustand
    const userData = {
      email: usuarioEncontrado.email,
      nombre: usuarioEncontrado.nombre,
      rol: usuarioEncontrado.rol,
    };

    const token = "fake-jwt-token-123";

    // Guardamos la sesión
    login(userData, token);

    // Redirigimos según el rol
    if (userData.rol === "administrador") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      <HeaderPublic />

      <main className="flex items-center justify-center flex-1 px-4 py-10 sm:px-6">
        <div className="relative w-full max-w-md p-6 bg-white border shadow-xl rounded-2xl border-slate-200 sm:p-8">
          <Link
            to="/"
            aria-label="Volver al inicio"
            className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="w-5 h-5" />
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

          <form onSubmit={manejarEnvio} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Correo electrónico
              </span>
              <input
                type="email"
                name="email"
                value={datos.email}
                onChange={manejarCambio}
                placeholder="nombre@empresa.com"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            {/* Contraseña con Ojito */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Contraseña
              </span>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={datos.password}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                />
                Recordarme
              </label>

              <button
                type="button"
                onClick={() =>
                  setMensaje("Contacta al administrador para recuperar tu acceso.")
                }
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Iniciar sesión <span aria-hidden="true">→</span>
            </button>

            {mensaje && (
              <p
                role="status"
                className="rounded-lg bg-indigo-50 px-4 py-3 text-sm leading-5 text-indigo-800"
              >
                {mensaje}
              </p>
            )}
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            ¿Todavía no tienes cuenta?{" "}
            <Link
              to="/registro"
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>

      <FooterPublic />
    </div>
  );
};

export default Login;