import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeaderPublic from '../../components/public/HeaderPublic';
import FooterPublic from '../../components/public/FooterPublic';

const Login = () => {
  const [datos, setDatos] = useState({
    email: '',
    password: '',
  });

  const [mensaje, setMensaje] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    setMensaje('');
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    setMensaje(
      'Datos recibidos. La validación de acceso se conectará al sistema.'
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">

      {/* Encabezado */}
      <HeaderPublic />

      {/* Contenido principal */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">

        {/* Tarjeta del login */}
        <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

          {/* Flecha para volver al Home */}
          <Link
            to="/"
            aria-label="Volver al inicio"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <span className="text-xl" aria-hidden="true">←</span>
            Volver al inicio
          </Link>

          {/* Título */}
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Iniciar sesión
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ingresa tus datos para acceder a tu espacio de trabajo.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="space-y-5">

            {/* Email */}
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

            {/* Contraseña */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Contraseña
              </span>

              <span className="relative block">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="password"
                  value={datos.password}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </span>
            </label>

            {/* Opciones */}
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
                  setMensaje('Contacta al administrador para recuperar tu acceso.')
                }
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ¿Olvidaste tu contraseña?
              </button>

            </div>

            {/* Botón de ingreso */}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Iniciar sesión <span aria-hidden="true">→</span>
            </button>

            {/* Mensaje */}
            {mensaje && (
              <p
                role="status"
                className="rounded-lg bg-indigo-50 px-4 py-3 text-sm leading-5 text-indigo-800"
              >
                {mensaje}
              </p>
            )}

          </form>

          {/* Enlace al registro */}
          <p className="mt-7 text-center text-sm text-slate-500">
            ¿Todavía no tienes cuenta?{' '}
            <Link
              to="/registro"
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Crear cuenta
            </Link>
          </p>

        </div>
      </main>

      {/* Footer al pie de la página */}
      <FooterPublic />

    </div>
  );
};

export default Login;