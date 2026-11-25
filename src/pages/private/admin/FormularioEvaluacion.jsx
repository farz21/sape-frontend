import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Save,
  ArrowLeft,
  Award,
  Calendar,
  BarChart3,
  Plus,
  Trash2,
} from "lucide-react";

const calcularSemaforo = (puntaje) => {
  const num = Number(puntaje);
  if (Number.isNaN(num)) return "Verde";
  if (num < 60) return "Rojo";
  if (num < 80) return "Amarillo";
  return "Verde";
};

const FormularioEvaluacion = () => {
  const { id } = useParams(); // ID del empleado a evaluar
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [ultimoCheckin, setUltimoCheckin] = useState(null);
  const [cargandoCheckin, setCargandoCheckin] = useState(true);

  const [competenciasDisponibles, setCompetenciasDisponibles] = useState([]);
  const [filasCompetencia, setFilasCompetencia] = useState([]);

  const [formData, setFormData] = useState({
    periodo: "",
    puntaje_final: "",
    semaforo: "Verde",
  });

  // Cargar contexto del último check-in y catálogo de competencias
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [resEmpleado, resCompetencias] = await Promise.allSettled([
          fetch(`http://localhost:3000/api/empleados/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/api/competencias", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (resEmpleado.status === "fulfilled" && resEmpleado.value.ok) {
          const data = await resEmpleado.value.json();
          setUltimoCheckin(data.ultimoCheckin || null);
        }

        if (
          resCompetencias.status === "fulfilled" &&
          resCompetencias.value.ok
        ) {
          const dataComp = await resCompetencias.value.json();
          const lista = Array.isArray(dataComp)
            ? dataComp
            : dataComp.competencias || [];
          setCompetenciasDisponibles(lista);

          if (lista.length > 0) {
            setFilasCompetencia([
              {
                id_competencia: String(lista[0].id_competencia),
                puntaje_obtenido: "",
                justificacion: "",
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      } finally {
        setCargandoCheckin(false);
      }
    };

    if (token && id) {
      cargarDatosIniciales();
    }
  }, [id, token]);

  const recalcularPromedioDesdeFilas = (filas) => {
    const puntuadas = filas.filter(
      (f) =>
        f.id_competencia &&
        f.puntaje_obtenido !== "" &&
        !Number.isNaN(Number(f.puntaje_obtenido)),
    );

    if (puntuadas.length === 0) return;

    const suma = puntuadas.reduce(
      (acc, f) => acc + Number(f.puntaje_obtenido),
      0,
    );
    const promedio = Number((suma / puntuadas.length).toFixed(2));

    setFormData((prev) => ({
      ...prev,
      puntaje_final: String(promedio),
      semaforo: calcularSemaforo(promedio),
    }));
  };

  const agregarFilaCompetencia = () => {
    const primeraId = competenciasDisponibles[0]?.id_competencia
      ? String(competenciasDisponibles[0].id_competencia)
      : "";
    setFilasCompetencia((prev) => [
      ...prev,
      { id_competencia: primeraId, puntaje_obtenido: "", justificacion: "" },
    ]);
  };

  const quitarFilaCompetencia = (index) => {
    const nuevas = filasCompetencia.filter((_, i) => i !== index);
    setFilasCompetencia(nuevas);
    recalcularPromedioDesdeFilas(nuevas);
  };

  const cambiarFilaCompetencia = (index, campo, valor) => {
    const nuevas = filasCompetencia.map((fila, i) =>
      i === index ? { ...fila, [campo]: valor } : fila,
    );
    setFilasCompetencia(nuevas);

    if (campo === "puntaje_obtenido") {
      recalcularPromedioDesdeFilas(nuevas);
    }
  };

  const manejarCambioPuntaje = (e) => {
    const puntaje = e.target.value;
    setFormData((prev) => ({
      ...prev,
      puntaje_final: puntaje,
      semaforo: calcularSemaforo(puntaje),
    }));
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const guardarEvaluacion = async (e) => {
    e.preventDefault();
    setError("");

    const detalles = filasCompetencia
      .filter(
        (f) =>
          f.id_competencia &&
          f.puntaje_obtenido !== "" &&
          !Number.isNaN(Number(f.puntaje_obtenido)),
      )
      .map((f) => ({
        id_competencia: Number(f.id_competencia),
        puntaje_obtenido: Number(f.puntaje_obtenido),
        justificacion: String(f.justificacion || "").trim(),
      }));

    if (detalles.some((d) => !d.justificacion)) {
      setError(
        "Completá la justificación para cada competencia puntuada.",
      );
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch("http://localhost:3000/api/evaluaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_empleado: id,
          periodo: formData.periodo,
          puntaje_final: parseFloat(formData.puntaje_final),
          semaforo: formData.semaforo,
          detalles,
        }),
      });

      if (response.ok) {
        window.alert("Evaluación agregada correctamente.");
        navigate(`/admin/empleados/${id}`);
      } else {
        const data = await response.json();
        setError(data.mensaje || "Error al registrar la evaluación.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/admin/empleados/${id}`}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Registrar Nueva Evaluación
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Asigna un periodo, evalúa competencias y clasifica el desempeño del
            colaborador.
          </p>
        </div>
      </div>

      {/* 📊 TARJETA DE CONTEXTO: ÚLTIMO CHECK-IN DEL EMPLEADO */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" />
          <span>Contexto del Último Check-in Semanal</span>
        </h3>
        {cargandoCheckin ? (
          <p className="text-xs text-slate-400">
            Cargando check-in reciente...
          </p>
        ) : ultimoCheckin ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <span className="font-semibold block text-slate-400 uppercase">
                Motivación
              </span>
              <span className="text-sm font-bold text-blue-600">
                {ultimoCheckin.nivel_motivacion} / 5
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
              <span className="font-semibold block text-slate-400 uppercase">
                Carga Laboral
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {ultimoCheckin.carga_trabajo} / 5
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs col-span-2">
              <span className="font-semibold block text-slate-400 uppercase mb-1">
                Logros Recientes
              </span>
              <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                {ultimoCheckin.logros_semana || "Sin registrar"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            El empleado todavía no registró check-ins recientes en el sistema.
          </p>
        )}
      </div>

      <form
        onSubmit={guardarEvaluacion}
        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
      >
        {error && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Periodo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Periodo de Evaluación
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                name="periodo"
                required
                value={formData.periodo}
                onChange={manejarCambio}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. Q3 2026 o Octubre 2026"
              />
            </div>
          </div>

          {/* Desglose por Competencias (detalle_eval) */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Evaluación por Competencias
                </h3>
                <p className="text-xs text-slate-500">
                  Opcional. Si cargás puntajes aquí, se calcula el promedio
                  automáticamente y se guarda en el detalle.
                </p>
              </div>
              {competenciasDisponibles.length > 0 && (
                <button
                  type="button"
                  onClick={agregarFilaCompetencia}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  <Plus size={15} /> Agregar competencia
                </button>
              )}
            </div>

            {filasCompetencia.map((fila, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Competencia
                    </label>
                    <select
                      value={fila.id_competencia}
                      onChange={(e) =>
                        cambiarFilaCompetencia(
                          idx,
                          "id_competencia",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {competenciasDisponibles.map((comp) => (
                        <option
                          key={comp.id_competencia}
                          value={comp.id_competencia}
                        >
                          {comp.nombre} ({comp.tipo_skill})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Puntaje (0 - 100)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={fila.puntaje_obtenido}
                        onChange={(e) =>
                          cambiarFilaCompetencia(
                            idx,
                            "puntaje_obtenido",
                            e.target.value,
                          )
                        }
                        placeholder="Ej. 85"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      {filasCompetencia.length > 1 && (
                        <button
                          type="button"
                          onClick={() => quitarFilaCompetencia(idx)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Quitar fila"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Justificación
                  </label>
                  <input
                    type="text"
                    value={fila.justificacion}
                    onChange={(e) =>
                      cambiarFilaCompetencia(
                        idx,
                        "justificacion",
                        e.target.value,
                      )
                    }
                    placeholder="Ej. Código ordenado y buena resolución de bloqueos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Puntaje Final */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Puntaje Final (0 a 100)
            </label>
            <div className="relative">
              <Award
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="number"
                name="puntaje_final"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.puntaje_final}
                onChange={manejarCambioPuntaje}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Ej. 85.5"
              />
            </div>
          </div>

          {/* Semáforo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Clasificación (Semáforo)
            </label>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white uppercase ${
                  formData.semaforo === "Verde"
                    ? "bg-emerald-600"
                    : formData.semaforo === "Amarillo"
                      ? "bg-amber-500"
                      : "bg-rose-600"
                }`}
              >
                {formData.semaforo}
              </span>
              <span className="text-xs text-slate-500">
                (Se calcula automáticamente: &lt;60 Rojo, &lt;80 Amarillo, 80+
                Verde)
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <Link
            to={`/admin/empleados/${id}`}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {guardando ? "Guardando..." : "Guardar Evaluación"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEvaluacion;