import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
    aceptar: false,
  });

  const [mensaje, setMensaje] = useState("");

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    setDatos({
      ...datos,
      [name]: type === "checkbox" ? checked : value,
    });

    setMensaje("");
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    // Simulamos la respuesta del backend
    const newUserData = { 
      nombre: datos.nombre, 
      apellido: datos.apellido, 
      email: datos.email, 
      empresa: datos.empresa 
    };
    const token = 'fake-jwt-token-456';

    // Disparamos Zustand (Auto-login)
    register(newUserData, token);

    // Redirigimos al dashboard
    navigate('/dashboard');
  };

  // ¡Acá están las variables que faltaban!
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

            <label className={claseLabel}>
              Contraseña
              <input
                className={claseInput}
                type="password"
                name="password"
                value={datos.password}
                onChange={manejarCambio}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-500">
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
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Crear cuenta <span aria-hidden="true">→</span>
            </button>

            {mensaje && (
              <p role="status" className="rounded-lg bg-indigo-50 px-4 py-3 text-sm leading-5 text-indigo-800">
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