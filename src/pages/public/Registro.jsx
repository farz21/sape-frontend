import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import HeaderPublic from "../../components/public/HeaderPublic";
import FooterPublic from "../../components/public/FooterPublic";

const Registro = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    email: "",
    empresa: "",
    password: "",
    confirmPassword: "",
    aceptar: false,
  });

  const [mensaje, setMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    setDatos({
      ...datos,
      [name]: type === "checkbox" ? checked : value,
    });

    setMensaje("");
  };

  // Variable computada: valida en tiempo real si ambas contraseñas tienen texto y no coinciden
  const lasContraseñasCoinciden = 
    datos.password === "" || datos.confirmPassword === "" || datos.password === datos.confirmPassword;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (datos.password !== datos.confirmPassword) {
      setMensaje("Las contraseñas no coinciden. Por favor, revísalas.");
      return;
    }

    setCargando(true);

    try {
      // Preparamos los datos que espera tu backend (authController.js)
      const datosRegistro = {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: datos.password,
        empresa: datos.empresa || "S.A.P.E.",
        rol: "empleado" // Por defecto al registrarse se crea como empleado con su ficha
      };

      const response = await fetch("http://localhost:3000/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosRegistro),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al registrar la cuenta.");
      }

      // Si el backend devuelve token y usuario en el registro, los guardamos en Zustand
      if (data.token) {
        register(data.usuario || datosRegistro, data.token);
      }

      // Redirigimos al dashboard del empleado
      navigate("/empleado");

    } catch (error) {
      setMensaje(error.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const claseInput =
    "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const claseLabel = "block text-sm font-semibold text-slate-700";

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
              Completa tus datos para solicitar acceso al espacio de tu organización.
            </p>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={claseLabel}>
                Nombre
                <input
                  className={claseInput}
                  type="text"
                  name="nombre"
                  value={datos.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej.: Martina"
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className={claseLabel}>
                Apellido
                <input
                  className={claseInput}
                  type="text"
                  name="apellido"
                  value={datos.apellido}
                  onChange={manejarCambio}
                  placeholder="Ej.: González"
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>

            <label className={claseLabel}>
              Correo laboral
              <input
                className={claseInput}
                type="email"
                name="email"
                value={datos.email}
                onChange={manejarCambio}
                placeholder="nombre@empresa.com"
                autoComplete="email"
                required
              />
            </label>

            <label className={claseLabel}>
              Organización
              <input
                className={claseInput}
                type="text"
                name="empresa"
                value={datos.empresa}
                onChange={manejarCambio}
                placeholder="Nombre de tu empresa"
                autoComplete="organization"
                required
              />
            </label>

            {/* Contraseña con Ojito */}
            <label className={claseLabel}>
              Contraseña
              <div className="relative mt-1.5">
                <input
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={datos.password}
                  onChange={manejarCambio}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  required
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

            {/* Confirmar Contraseña con Validación en Vivo */}
            <label className={claseLabel}>
              <div className="flex justify-between items-center">
                <span>Confirmar contraseña</span>
                {!lasContraseñasCoinciden && (
                  <span className="text-xs font-medium text-rose-600 animate-pulse">
                    Las contraseñas no coinciden
                  </span>
                )}
              </div>
              <div className="relative mt-1.5">
                <input
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                    !lasContraseñasCoinciden
                      ? "border-rose-500 ring-2 ring-rose-100 focus:border-rose-500 focus:ring-rose-200"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                  type={mostrarConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={datos.confirmPassword}
                  onChange={manejarCambio}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {mostrarConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-500 pt-1">
              <input
                type="checkbox"
                name="aceptar"
                checked={datos.aceptar}
                onChange={manejarCambio}
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
              />
              <span>
                Acepto que mis datos se utilicen para gestionar esta solicitud de acceso.
              </span>
            </label>

            <button
              type="submit"
              disabled={(!lasContraseñasCoinciden && datos.confirmPassword !== "") || cargando}
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-md transition ${
                (!lasContraseñasCoinciden && datos.confirmPassword !== "") || cargando
                  ? "bg-rose-400 cursor-not-allowed"
                  : "bg-indigo-600 shadow-indigo-100 hover:-translate-y-0.5 hover:bg-indigo-700"
              }`}
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta →"}
            </button>

            {mensaje && (
              <p role="status" className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm leading-5 text-rose-700">
                {mensaje}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>

      <FooterPublic />
    </div>
  );
};

export default Registro;