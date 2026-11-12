
import { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { useAuthStore } from "../../../store/useAuthStore";

// ==========================================
// COMPONENTES DE GRÁFICOS
// ==========================================

function GraficoDona({ valor, color, titulo }) {
  const porcentaje = Math.max(0, Math.min(100, Number(valor) || 0));

  const datos = [
    { name: "Completado", value: porcentaje },
    { name: "Restante", value: 100 - porcentaje },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={66}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
            >
              {datos.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={index === 0 ? color : "#E5E7EB"}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [`${value}%`, "Porcentaje"]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">
            {porcentaje}%
          </span>

          <span className="text-xs text-gray-400">{titulo}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TARJETA DE EMPLEADO
// ==========================================

function TarjetaEmpleado({ empleado }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ backgroundColor: empleado.color }}
        >
          {empleado.iniciales}
        </div>

        <div>
          <h3 className="font-bold text-gray-900">
            {empleado.nombre}
          </h3>

          <p className="text-sm text-gray-500">
            {empleado.puesto || "Sin puesto asignado"}
          </p>

          <p className="text-xs text-gray-400">
            Ingreso: {empleado.fecha_ingreso}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-center text-sm font-medium text-gray-500">
          Rendimiento Histórico
        </p>

        <GraficoDona
          valor={empleado.rendimiento}
          color={empleado.color}
          titulo="Rendimiento"
        />
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function ComparacionEmpleados() {
  const token = useAuthStore((state) => state.token);

  const [empleadosLista, setEmpleadosLista] = useState([]);
  const [idEmpA, setIdEmpA] = useState("");
  const [idEmpB, setIdEmpB] = useState("");

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  // ==========================================
  // ANÁLISIS ESTRUCTURADO DE LA IA
  // ==========================================

  const analisisIA =
    resultado?.veredicto_ia &&
    typeof resultado.veredicto_ia === "object"
      ? resultado.veredicto_ia
      : null;

  // Evita errores si algún array no viene informado
  const fortalezasA = analisisIA?.fortalezas_a || [];
  const fortalezasB = analisisIA?.fortalezas_b || [];
  const mejorasA = analisisIA?.mejoras_a || [];
  const mejorasB = analisisIA?.mejoras_b || [];
  const factoresComparados = analisisIA?.factores_comparados || [];
  const recomendaciones = analisisIA?.recomendaciones || [];

  // ==========================================
  // CARGAR EMPLEADOS
  // ==========================================

  useEffect(() => {
    const fetchEmpleados = async () => {
      if (!token) {
        setEmpleadosLista([]);
        return;
      }

      try {
        setError("");

        const res = await axios.get(
          "http://localhost:3000/api/empleados",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Admite distintas estructuras de respuesta
        const lista = Array.isArray(res.data)
          ? res.data
          : res.data.empleados || res.data.data || [];

        if (!Array.isArray(lista)) {
          throw new Error(
            "El servidor no devolvió una lista válida."
          );
        }

        setEmpleadosLista(lista);
      } catch (err) {
        console.error(
          "Error cargando empleados:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.mensaje ||
            "Error al cargar la lista de empleados. Verifica tu sesión."
        );
      }
    };

    fetchEmpleados();
  }, [token]);

  // ==========================================
  // CALCULAR RENDIMIENTO
  // ==========================================

  const calcularRendimiento = (evaluaciones) => {
    if (!Array.isArray(evaluaciones) || evaluaciones.length === 0) {
      return 0;
    }

    const suma = evaluaciones.reduce(
      (acc, ev) => acc + (Number(ev.puntaje_final) || 0),
      0
    );

    const promedio = suma / evaluaciones.length;

    return Math.max(
      0,
      Math.min(100, Math.round(promedio * 10))
    );
  };

  // ==========================================
  // FORMATEAR FECHAS
  // ==========================================

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin información";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return "Sin información";
    }

    return date.toLocaleDateString("es-AR");
  };

  // ==========================================
  // GENERAR DUELO
  // ==========================================

  const generarDuelo = async () => {
    if (!idEmpA || !idEmpB) {
      setError("Debes seleccionar dos empleados.");
      return;
    }

    if (Number(idEmpA) === Number(idEmpB)) {
      setError("No puedes comparar al mismo empleado.");
      return;
    }

    if (!token) {
      setError("No se encontró el token de autenticación.");
      return;
    }

    const datosDuelo = {
      id_empleado_a: Number(idEmpA),
      id_empleado_b: Number(idEmpB),
    };

    console.log("IDs seleccionados:", idEmpA, idEmpB);
    console.log("Datos enviados al backend:", datosDuelo);

    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/admin/duelos/comparar",
        datosDuelo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del duelo:", response.data);
      console.log(
        "Análisis IA:",
        response.data.veredicto_ia,
        typeof response.data.veredicto_ia
      );

      setResultado(response.data);
    } catch (err) {
      console.error("Error al generar el duelo:", err);
      console.error(
        "Respuesta del servidor:",
        err.response?.data
      );

      setError(
        err.response?.data?.mensaje ||
          "Error al conectar con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* ENCABEZADO Y CONTROLES */}

      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Duelo de Empleados (IA)
        </h1>

        <p className="mt-2 mb-6 text-sm text-gray-500">
          Selecciona dos perfiles para generar un análisis comparativo
          estratégico impulsado por IA.
        </p>

        <div className="flex flex-col items-end gap-4 md:flex-row">
          {/* CANDIDATO A */}

          <div className="flex-1 w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Candidato A
            </label>

            <select
              value={idEmpA}
              onChange={(e) => {
                setIdEmpA(e.target.value);
                setResultado(null);
                setError("");
              }}
            >
              <option value="">
                Seleccione un empleado...
              </option>

              {empleadosLista.map((emp) => (
                <option
                  key={emp.id_empleado}
                  value={emp.id_empleado}
                >
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* CANDIDATO B */}

          <div className="flex-1 w-full">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Candidato B
            </label>

            <select
              value={idEmpB}
              onChange={(e) => {
                setIdEmpB(e.target.value);
                setResultado(null);
                setError("");
              }}
            >
              <option value="">
                Seleccione un empleado...
              </option>

              {empleadosLista.map((emp) => (
                <option
                  key={emp.id_empleado}
                  value={emp.id_empleado}
                >
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* BOTÓN */}

          <button
            onClick={generarDuelo}
            disabled={loading || !token}
            className="h-10 rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Analizando..." : "Generar Duelo"}
          </button>
        </div>

        {/* MENSAJE DE ERROR */}

        {error && (
          <p className="mt-3 text-sm font-semibold text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* SPINNER DE CARGA */}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-t-4 border-blue-600"></div>

          <p className="animate-pulse font-medium text-gray-600">
            La IA está analizando los perfiles y evaluaciones...
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Esto puede demorar unos segundos.
          </p>
        </div>
      )}

      {/* RESULTADOS DEL DUELO */}

      {resultado && !loading && (
        <div className="animate-fade-in">
          {/* TARJETAS DE EMPLEADOS */}

          <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* CANDIDATO A */}

            <TarjetaEmpleado
              empleado={{
                nombre: `${resultado.candidato_a.nombre} ${resultado.candidato_a.apellido}`,

                iniciales: `${
                  resultado.candidato_a.nombre?.charAt(0) || ""
                }${
                  resultado.candidato_a.apellido?.charAt(0) || ""
                }`,

                puesto: resultado.candidato_a.puesto,

                fecha_ingreso: formatearFecha(
                  resultado.candidato_a.fecha_ingreso
                ),

                rendimiento: calcularRendimiento(
                  resultado.candidato_a.evaluaciones
                ),

                color: "#3B82F6",
              }}
            />

            {/* CANDIDATO B */}

            <TarjetaEmpleado
              empleado={{
                nombre: `${resultado.candidato_b.nombre} ${resultado.candidato_b.apellido}`,

                iniciales: `${
                  resultado.candidato_b.nombre?.charAt(0) || ""
                }${
                  resultado.candidato_b.apellido?.charAt(0) || ""
                }`,

                puesto: resultado.candidato_b.puesto,

                fecha_ingreso: formatearFecha(
                  resultado.candidato_b.fecha_ingreso
                ),

                rendimiento: calcularRendimiento(
                  resultado.candidato_b.evaluaciones
                ),

                color: "#8B5CF6",
              }}
            />
          </div>

          {/* ANÁLISIS ESTRUCTURADO DE LA IA */}

          {analisisIA ? (
            <div className="mt-8 space-y-6">

              {/* RESUMEN */}

              <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                    IA
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Análisis estratégico
                    </h2>

                    <p className="text-sm text-gray-500">
                      Evaluación comparativa generada por Groq
                    </p>
                  </div>
                </div>

                <p className="leading-relaxed text-gray-700">
                  {analisisIA.resumen || "No hay resumen disponible."}
                </p>
              </section>

              {/* FORTALEZAS */}

              <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <span className="text-green-600">●</span>
                    Fortalezas de {resultado.candidato_a.nombre}
                  </h3>

                  <ul className="space-y-3">
                    {fortalezasA.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600"
                      >
                        <span className="font-bold text-green-600">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}

                    {fortalezasA.length === 0 && (
                      <li className="text-sm text-gray-400">
                        No hay fortalezas disponibles.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                    <span className="text-purple-600">●</span>
                    Fortalezas de {resultado.candidato_b.nombre}
                  </h3>

                  <ul className="space-y-3">
                    {fortalezasB.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600"
                      >
                        <span className="font-bold text-purple-600">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}

                    {fortalezasB.length === 0 && (
                      <li className="text-sm text-gray-400">
                        No hay fortalezas disponibles.
                      </li>
                    )}
                  </ul>
                </div>
              </section>

              {/* OPORTUNIDADES DE MEJORA */}

              <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-bold text-gray-900">
                    Oportunidades de mejora -{" "}
                    {resultado.candidato_a.nombre}
                  </h3>

                  <ul className="space-y-3">
                    {mejorasA.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600"
                      >
                        <span className="text-orange-500">!</span>
                        {item}
                      </li>
                    ))}

                    {mejorasA.length === 0 && (
                      <li className="text-sm text-gray-400">
                        No hay oportunidades de mejora disponibles.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-bold text-gray-900">
                    Oportunidades de mejora -{" "}
                    {resultado.candidato_b.nombre}
                  </h3>

                  <ul className="space-y-3">
                    {mejorasB.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600"
                      >
                        <span className="text-orange-500">!</span>
                        {item}
                      </li>
                    ))}

                    {mejorasB.length === 0 && (
                      <li className="text-sm text-gray-400">
                        No hay oportunidades de mejora disponibles.
                      </li>
                    )}
                  </ul>
                </div>
              </section>

              {/* FACTORES COMPARADOS */}

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-bold text-gray-900">
                  Comparación por factores
                </h3>

                <div className="space-y-5">
                  {factoresComparados.map((factor, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-4 last:border-0"
                    >
                      <h4 className="mb-3 font-semibold text-gray-800">
                        {factor.factor}
                      </h4>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="mb-1 text-xs font-bold text-blue-700">
                            {resultado.candidato_a.nombre}
                          </p>

                          <p className="text-sm text-gray-700">
                            {factor.empleado_a}
                          </p>
                        </div>

                        <div className="rounded-lg bg-purple-50 p-3">
                          <p className="mb-1 text-xs font-bold text-purple-700">
                            {resultado.candidato_b.nombre}
                          </p>

                          <p className="text-sm text-gray-700">
                            {factor.empleado_b}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {factoresComparados.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No hay factores comparativos disponibles.
                    </p>
                  )}
                </div>
              </section>

              {/* RECOMENDACIONES */}

              <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Recomendaciones estratégicas
                </h3>

                <div className="space-y-3">
                  {recomendaciones.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 text-sm text-gray-700"
                    >
                      <span className="font-bold text-blue-600">
                        {index + 1}.
                      </span>

                      {item}
                    </div>
                  ))}

                  {recomendaciones.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No hay recomendaciones disponibles.
                    </p>
                  )}
                </div>
              </section>

              {/* CONCLUSIÓN */}

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  Conclusión del análisis
                </h3>

                <p className="leading-relaxed text-gray-700">
                  {analisisIA.conclusion ||
                    "No hay una conclusión disponible."}
                </p>

                <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  <strong>Importante:</strong> este análisis es una
                  herramienta de apoyo para RR. HH. La decisión final
                  debe ser revisada y tomada por el administrador.
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="font-semibold text-amber-800">
                No se recibió un análisis estructurado de la IA.
              </p>

              <p className="mt-2 text-sm text-amber-700">
                Verifica que el backend esté devolviendo
                veredicto_ia como un objeto JSON.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
