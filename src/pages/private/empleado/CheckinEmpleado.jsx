
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  HeartPulse,
  BriefcaseBusiness,
  Send,
  History,
  TrendingUp,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000/api";

const CheckinEmpleado = () => {
  const token = useAuthStore((state) => state.token);

  const [datos, setDatos] = useState({
    nivel_motivacion: "3",
    carga_trabajo: "3",
    logros_semana: "",
    obstaculos: "",
  });

  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Consultar historial
  const cargarHistorial = async () => {
    try {
      const response = await fetch(
        `${API_URL}/empleado/checkins`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al obtener historial");
      }

      setHistorial(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarHistorial();
    } else {
      setError("No hay una sesión válida.");
      setCargando(false);
    }
  }, [token]);

  // Manejar cambios del formulario
  const manejarCambio = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    });
  };

  // Registrar check-in
  const manejarEnvio = async (e) => {
    e.preventDefault();

    setEnviando(true);
    setMensaje("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/empleado/checkin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...datos,
            nivel_motivacion: Number(datos.nivel_motivacion),
            carga_trabajo: Number(datos.carga_trabajo),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo guardar el check-in");
      }

      setMensaje("¡Tu check-in fue registrado correctamente!");

      setDatos({
        nivel_motivacion: "3",
        carga_trabajo: "3",
        logros_semana: "",
        obstaculos: "",
      });

      await cargarHistorial();

    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const promedio = (campo) => {
    if (!historial.length) return 0;

    const suma = historial.reduce(
      (total, item) => total + Number(item[campo] || 0),
      0
    );

    return (suma / historial.length).toFixed(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ENCABEZADO */}
      <div>
        <p className="text-sm font-semibold text-blue-700">
          Seguimiento personal
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Mi Check-in semanal
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Registra como te sentiste durante la semana y
          hace un seguimiento de tu bienestar laboral.
        </p>
      </div>

      {/* INDICADORES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 text-pink-600 bg-pink-100 rounded-lg">
              <HeartPulse size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Motivación promedio
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {cargando ? "..." : `${promedio("nivel_motivacion")} / 5`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 text-indigo-600 bg-indigo-100 rounded-lg">
              <BriefcaseBusiness size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Carga laboral promedio
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {cargando ? "..." : `${promedio("carga_trabajo")} / 5`}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* FORMULARIO */}
      <section className="p-6 bg-white border shadow-sm rounded-xl border-slate-200 sm:p-8">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Nuevo registro
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completá las siguientes preguntas.
          </p>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-6">

          {/* MOTIVACIÓN */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              ¿Cómo estuvo tu nivel de motivación?
            </label>

            <select
              name="nivel_motivacion"
              value={datos.nivel_motivacion}
              onChange={manejarCambio}
              className="w-full px-4 py-3 bg-white border rounded-lg border-slate-300 outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="1">1 - Muy bajo</option>
              <option value="2">2 - Bajo</option>
              <option value="3">3 - Normal</option>
              <option value="4">4 - Alto</option>
              <option value="5">5 - Muy alto</option>
            </select>
          </div>

          {/* CARGA LABORAL */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              ¿Cómo sentiste tu carga de trabajo?
            </label>

            <select
              name="carga_trabajo"
              value={datos.carga_trabajo}
              onChange={manejarCambio}
              className="w-full px-4 py-3 bg-white border rounded-lg border-slate-300 outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="1">1 - Muy baja</option>
              <option value="2">2 - Baja</option>
              <option value="3">3 - Equilibrada</option>
              <option value="4">4 - Alta</option>
              <option value="5">5 - Muy alta</option>
            </select>
          </div>

          {/* LOGROS */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              ¿Qué logros conseguiste esta semana?
            </label>

            <textarea
              name="logros_semana"
              value={datos.logros_semana}
              onChange={manejarCambio}
              rows={3}
              placeholder="Contanos tus avances y objetivos cumplidos..."
              className="w-full px-4 py-3 border rounded-lg border-slate-300 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* OBSTÁCULOS */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              ¿Qué dificultades encontraste?
            </label>

            <textarea
              name="obstaculos"
              value={datos.obstaculos}
              onChange={manejarCambio}
              rows={3}
              placeholder="Contanos qué dificultades tuviste..."
              className="w-full px-4 py-3 border rounded-lg border-slate-300 outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {mensaje && (
            <p className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {mensaje}
            </p>
          )}

          {error && (
            <p className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || !token}
            className="flex items-center justify-center w-full gap-2 px-5 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {enviando ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                Guardando...
              </>
            ) : (
              <>
                <Send size={18} />
                Registrar Check-in
              </>
            )}
          </button>

        </form>
      </section>

      {/* HISTORIAL */}
      <section className="p-6 bg-white border shadow-sm rounded-xl border-slate-200">

        <div className="flex items-center gap-3 mb-6">
          <History className="text-blue-600" size={23} />

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Historial de Check-ins
            </h2>

            <p className="text-sm text-slate-500">
              Tus registros anteriores.
            </p>
          </div>
        </div>

        {cargando ? (
          <p className="py-6 text-center text-slate-500">
            Cargando historial...
          </p>
        ) : historial.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            Todavía no tenés registros.
          </p>
        ) : (
          <div className="space-y-4">

            {historial.map((item) => (
              <article
                key={item.id_checkin}
                className="p-5 border rounded-xl border-slate-200"
              >

                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="font-semibold text-slate-800">
                    Registro semanal
                  </span>

                  <span className="text-xs text-slate-500">
                    {new Date(item.fecha).toLocaleDateString("es-AR")}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <p className="mb-2 text-sm text-slate-500">
                      Motivación: {item.nivel_motivacion}/5
                    </p>

                    <div className="w-full h-2 overflow-hidden bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{
                          width: `${Number(item.nivel_motivacion) * 20}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-slate-500">
                      Carga laboral: {item.carga_trabajo}/5
                    </p>

                    <div className="w-full h-2 overflow-hidden bg-slate-100 rounded-full">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Number(item.carga_trabajo) * 20}%`,
                        }}
                      />
                    </div>
                  </div>

                </div>

                <div className="grid gap-4 mt-5 sm:grid-cols-2">

                  <div>
                    <p className="mb-1 text-sm font-semibold text-slate-700">
                      Logros
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.logros_semana || "Sin información"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-semibold text-slate-700">
                      Obstáculos
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.obstaculos || "Sin información"}
                    </p>
                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  );
};

export default CheckinEmpleado;
