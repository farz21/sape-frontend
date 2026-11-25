import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  ArrowLeft,
  User,
  Briefcase,
  Building2,
  Layers,
  Mail,
  PlusCircle,
  Trash2,
  Calendar,
  Award,
  Sparkles,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DEPARTAMENTOS_MAP = {
  1: "Desarrollo de Software",
  2: "Recursos Humanos",
  3: "Infraestructura y DevOps",
};

const PUESTOS_MAP = {
  1: { nombre: "Desarrollador Junior", id_departamento: 1 },
  2: { nombre: "Desarrollador Semi-Senior", id_departamento: 1 },
  3: { nombre: "Desarrollador Senior", id_departamento: 1 },
  4: { nombre: "Analista de Selección", id_departamento: 2 },
  5: { nombre: "Soporte Técnico", id_departamento: 3 },
};

const Empleado = () => {
  const { id } = useParams(); // id_empleado
  const token = useAuthStore((state) => state.token);

  const [empleado, setEmpleado] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [metas, setMetas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorAvatar, setErrorAvatar] = useState(false);

  // 📄 Estados para la paginación (3 elementos por página en cada sección)
  const [paginaEvaluaciones, setPaginaEvaluaciones] = useState(1);
  const [paginaCheckins, setPaginaCheckins] = useState(1);
  const porPagina = 3;

  useEffect(() => {
    setErrorAvatar(false);
    const cargarDatos = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/empleados/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          let empData = data.datos || null;

          // Respaldo: si data.datos no incluye departamento/puesto/id_puesto, lo buscamos en /api/empleados
          if (
            empData &&
            !empData.departamento &&
            !empData.nombre_departamento &&
            !empData.puesto &&
            !empData.nombre_puesto &&
            !empData.id_puesto
          ) {
            const listaRes = await fetch(
              "http://localhost:3000/api/empleados",
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (listaRes.ok) {
              const listaData = await listaRes.json();
              const lista = Array.isArray(listaData)
                ? listaData
                : listaData.empleados || [];
              const encontrado = lista.find(
                (item) =>
                  String(item.id_empleado) === String(id) ||
                  String(item.id_usuario) === String(id),
              );
              if (encontrado) {
                empData = { ...encontrado, ...empData };
              }
            }
          }

          setEmpleado(empData);
          setCheckins(data.checkins || []);
          setMetas(data.metas || []);
          setPlanes(data.planes || []);

          // ORDEN CRONOLÓGICO ESTRICTO: De más antiguo a más reciente para el gráfico de evaluaciones
          const evaluacionesOrdenadas = [...(data.evaluaciones || [])].sort(
            (a, b) => new Date(a.fecha) - new Date(b.fecha),
          );
          setEvaluaciones(evaluacionesOrdenadas);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setCargando(false);
      }
    };
    if (token && id) {
      cargarDatos();
    }
  }, [id, token]);

  // Resolver nombre de puesto y departamento
  const puestoInfo = empleado?.id_puesto
    ? PUESTOS_MAP[Number(empleado.id_puesto)]
    : null;
  const nombrePuesto =
    empleado?.puesto ||
    empleado?.nombre_puesto ||
    puestoInfo?.nombre ||
    "No asignado";
  const idDeptoResuelto =
    empleado?.id_departamento || puestoInfo?.id_departamento || null;
  const nombreDepartamento =
    empleado?.departamento ||
    empleado?.nombre_departamento ||
    (idDeptoResuelto ? DEPARTAMENTOS_MAP[Number(idDeptoResuelto)] : null) ||
    "No asignado";

  // Eliminar Evaluación
  const eliminarEvaluacion = async (idEvaluacion) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar esta evaluación?")
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/evaluaciones/${idEvaluacion}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setEvaluaciones((prev) =>
          prev.filter((ev) => ev.id_evaluacion !== idEvaluacion),
        );
        window.alert("Evaluación eliminada correctamente.");
      } else {
        const data = await response.json();
        alert(data.mensaje || "No se pudo eliminar la evaluación.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  // 🗑️ Eliminar Check-in desde el Admin
  const eliminarCheckin = async (idCheckin) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este check-in?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/checkins/${idCheckin}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setCheckins((prev) =>
          prev.filter((chk) => chk.id_checkin !== idCheckin),
        );
        window.alert("Check-in eliminado correctamente.");
      } else {
        const data = await response.json();
        alert(data.mensaje || "No se pudo eliminar el check-in.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  // 📄 Lógica de paginación para Evaluaciones (Mostrando más recientes primero)
  const evaluacionesInvertidas = [...evaluaciones].reverse();
  const totalPaginasEvaluaciones = Math.ceil(
    evaluacionesInvertidas.length / porPagina,
  );
  const evaluacionesPaginadas = evaluacionesInvertidas.slice(
    (paginaEvaluaciones - 1) * porPagina,
    paginaEvaluaciones * porPagina,
  );

  // 📄 Lógica de paginación para Check-ins
  const totalPaginasCheckins = Math.ceil(checkins.length / porPagina);
  const checkinsPaginados = checkins.slice(
    (paginaCheckins - 1) * porPagina,
    paginaCheckins * porPagina,
  );

  if (cargando)
    return (
      <div className="p-8 text-slate-500 font-medium">
        Cargando legajo del empleado...
      </div>
    );

  if (!empleado)
    return (
      <div className="p-8 text-rose-500 font-medium">
        No se encontró el empleado.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Encabezado y Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/empleados"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Ficha del Empleado
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Análisis de desempeño, evolución histórica e informes de IA.
            </p>
          </div>
        </div>

        {/* Botón de Nueva Evaluación */}
        <Link
          to={`/admin/empleados/${empleado.id_empleado || id}/evaluar`}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={18} />
          Nueva Evaluación
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Información Personal */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {empleado.nombre?.charAt(0)}
                {empleado.avatar_url && !errorAvatar && (
                  <img
                    src={empleado.avatar_url}
                    alt={`Foto de ${empleado.nombre} ${empleado.apellido}`}
                    onError={() => setErrorAvatar(true)}
                    className="absolute inset-0 h-16 w-16 rounded-full object-cover"
                  />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {empleado.nombre} {empleado.apellido}
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  ID Empleado: {empleado.id_empleado}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400 shrink-0" size={18} />
                <span className="text-sm text-slate-700 break-all">
                  {empleado.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="text-slate-400 shrink-0" size={18} />
                <span className="text-sm text-slate-700">
                  {empleado.empresa || "S.A.P.E."}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="text-slate-400 shrink-0" size={18} />
                <span className="text-sm text-slate-700">
                  <strong className="font-semibold text-slate-900">
                    Departamento:
                  </strong>{" "}
                  {nombreDepartamento}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="text-slate-400 shrink-0" size={18} />
                <span className="text-sm text-slate-700">
                  <strong className="font-semibold text-slate-900">
                    Puesto:
                  </strong>{" "}
                  {nombrePuesto}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <User className="text-slate-400 shrink-0" size={18} />
                <span className="text-sm text-slate-700">
                  Ingreso:{" "}
                  {empleado.fecha_ingreso
                    ? new Date(empleado.fecha_ingreso).toLocaleDateString(
                        "es-AR",
                      )
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel del Gráfico de Evolución y Listados */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Evolución de Desempeño (Cronológica)
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Puntaje final obtenido en orden temporal (pasado a presente).
            </p>

            <div className="h-72 w-full">
              {evaluaciones.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={evaluaciones}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="periodo"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [`${value} Pts`, "Puntaje"]}
                      labelStyle={{ fontWeight: "bold", color: "#334155" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="puntaje_final"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#2563eb",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                  Este empleado aún no tiene evaluaciones registradas.
                </div>
              )}
            </div>
          </div>

          {/* Listado de Evaluaciones con Análisis de IA integrado y Paginación */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                Historial y Feedback de IA
              </h3>
              {evaluaciones.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  Total: {evaluaciones.length}
                </span>
              )}
            </div>

            {evaluacionesPaginadas.length > 0 ? (
              <>
                <ul className="divide-y divide-slate-200">
                  {evaluacionesPaginadas.map((ev) => (
                    <li
                      key={ev.id_evaluacion}
                      className="px-6 py-5 hover:bg-slate-50 transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Award size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Periodo: {ev.periodo}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar size={13} />
                              {new Date(ev.fecha).toLocaleDateString("es-AR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-base font-bold text-slate-800">
                              {ev.puntaje_final} Pts
                            </span>
                            <span
                              className={`block text-xs font-bold px-2 py-0.5 rounded text-white uppercase text-center mt-1 ${
                                ev.semaforo === "Verde"
                                  ? "bg-emerald-600"
                                  : ev.semaforo === "Amarillo"
                                    ? "bg-amber-500"
                                    : "bg-rose-600"
                              }`}
                            >
                              {ev.semaforo}
                            </span>
                          </div>

                          <button
                            onClick={() => eliminarEvaluacion(ev.id_evaluacion)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Eliminar evaluación"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {Array.isArray(ev.detalles) && ev.detalles.length > 0 && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                            Competencias evaluadas
                          </p>
                          <ul className="space-y-1.5">
                            {ev.detalles.map((det) => (
                              <li
                                key={det.id_detalle}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs bg-white px-3 py-2 rounded-md border border-slate-100"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800">
                                    {det.competencia}
                                  </span>
                                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    {det.tipo_skill}
                                  </span>
                                  {det.justificacion && (
                                    <p className="text-slate-500 mt-0.5">
                                      {det.justificacion}
                                    </p>
                                  )}
                                </div>
                                <span className="font-bold text-blue-700 shrink-0">
                                  {det.puntaje_obtenido} Pts
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ev.analisis_generado && (
                        <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs text-slate-700 space-y-1 mt-2">
                          <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                            <Sparkles size={15} className="text-blue-600" />
                            <span>Análisis y Feedback Automático (IA):</span>
                          </div>
                          <p className="leading-relaxed text-slate-600 whitespace-pre-line pl-5">
                            {ev.analisis_generado}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Controles de Paginación de Evaluaciones */}
                {totalPaginasEvaluaciones > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() =>
                        setPaginaEvaluaciones((p) => Math.max(p - 1, 1))
                      }
                      disabled={paginaEvaluaciones === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-xs text-slate-600">
                      Página <strong>{paginaEvaluaciones}</strong> de{" "}
                      <strong>{totalPaginasEvaluaciones}</strong>
                    </span>
                    <button
                      onClick={() =>
                        setPaginaEvaluaciones((p) =>
                          Math.min(p + 1, totalPaginasEvaluaciones),
                        )
                      }
                      disabled={paginaEvaluaciones === totalPaginasEvaluaciones}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-sm text-slate-400">
                No hay registros de evaluaciones para mostrar.
              </div>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800">
                Metas del empleado
              </h3>

              <div className="mt-4 space-y-3">
                {metas.length ? (
                  metas.map((meta) => (
                    <div
                      key={meta.id_meta}
                      className="rounded-lg border border-slate-100 p-3"
                    >
                      <p className="font-medium text-slate-800">
                        {meta.titulo}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {meta.descripcion || "Sin descripcion"}
                      </p>

                      <p className="mt-2 text-xs font-semibold text-blue-700">
                        {meta.estado} - {meta.progreso}%
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No tiene metas asignadas.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800">Planes de accion</h3>

              <div className="mt-4 space-y-3">
                {planes.length ? (
                  planes.map((plan) => (
                    <div
                      key={plan.id_plan}
                      className="rounded-lg border border-slate-100 p-3"
                    >
                      <p className="text-sm text-slate-700">{plan.objetivo}</p>

                      <p className="mt-2 text-xs font-semibold text-blue-700">
                        {plan.estado_cumplimiento}
                        {plan.fecha_limite
                          ? ` - Limite ${new Date(
                              plan.fecha_limite,
                            ).toLocaleDateString("es-AR")}`
                          : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No tiene planes de accion generados.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* 📋 SECCIÓN: Historial de Check-ins con Paginación y Opción de Eliminar */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <HeartPulse size={18} className="text-blue-600" />
                Historial de Check-ins y Evidencias de Trabajo
              </h3>
              {checkins.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                  Total: {checkins.length}
                </span>
              )}
            </div>

            {checkinsPaginados.length > 0 ? (
              <>
                <ul className="divide-y divide-slate-200">
                  {checkinsPaginados.map((chk) => (
                    <li
                      key={chk.id_checkin}
                      className="px-6 py-5 hover:bg-slate-50 transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Calendar size={13} />
                          Fecha:{" "}
                          {new Date(chk.fecha).toLocaleDateString("es-AR")}
                        </span>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                              Motivación: {chk.nivel_motivacion}/5
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md">
                              Carga: {chk.carga_trabajo}/5
                            </span>
                          </div>

                          {/* 🗑️ Botón para eliminar check-in */}
                          <button
                            onClick={() => eliminarCheckin(chk.id_checkin)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Eliminar check-in"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-slate-700">
                        <p>
                          <strong className="text-slate-900">
                            Logros de la semana:
                          </strong>{" "}
                          {chk.logros_semana || "Sin registrar"}
                        </p>
                        {chk.obstaculos && (
                          <p className="text-slate-600">
                            <strong className="text-slate-900">
                              Obstáculos:
                            </strong>{" "}
                            {chk.obstaculos}
                          </p>
                        )}
                      </div>

                      {/* ENLACE DE EVIDENCIA */}
                      {chk.link_evidencia && (
                        <div className="pt-2 border-t border-slate-100">
                          <a
                            href={chk.link_evidencia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                          >
                            🔗 Ver evidencia de trabajo / Pull Request aportada
                          </a>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Controles de Paginación de Check-ins */}
                {totalPaginasCheckins > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() =>
                        setPaginaCheckins((p) => Math.max(p - 1, 1))
                      }
                      disabled={paginaCheckins === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-xs text-slate-600">
                      Página <strong>{paginaCheckins}</strong> de{" "}
                      <strong>{totalPaginasCheckins}</strong>
                    </span>
                    <button
                      onClick={() =>
                        setPaginaCheckins((p) =>
                          Math.min(p + 1, totalPaginasCheckins),
                        )
                      }
                      disabled={paginaCheckins === totalPaginasCheckins}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">
                Este empleado todavía no ha registrado check-ins.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empleado;