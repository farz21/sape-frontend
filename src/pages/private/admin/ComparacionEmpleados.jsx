
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// ==========================================
// DATOS HARDCODEADOS
// ==========================================

const empleados = [
  {
    id: 1,
    nombre: "María González",
    iniciales: "MG",
    puesto: "Desarrolladora",
    departamento: "Tecnología",
    antiguedad: "2 años",
    rendimiento: 92,
    productividad: 95,
    cumplimiento: 90,
    puntualidad: 88,
    evaluaciones: 94,
    asistencia: 96,
    tareasCompletadas: 48,
    tareasPendientes: 3,
    color: "#3B82F6",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    iniciales: "JP",
    puesto: "Analista",
    departamento: "Tecnología",
    antiguedad: "1 año",
    rendimiento: 84,
    productividad: 82,
    cumplimiento: 88,
    puntualidad: 94,
    evaluaciones: 79,
    asistencia: 98,
    tareasCompletadas: 41,
    tareasPendientes: 7,
    color: "#8B5CF6",
  },
];

const evolucion = [
  { mes: "Jun", maria: 78, juan: 75 },
  { mes: "Jul", maria: 82, juan: 79 },
  { mes: "Ago", maria: 85, juan: 80 },
  { mes: "Sep", maria: 87, juan: 83 },
  { mes: "Oct", maria: 90, juan: 82 },
  { mes: "Nov", maria: 92, juan: 84 },
];

const indicadores = [
  { nombre: "Productividad", maria: 95, juan: 82 },
  { nombre: "Cumplimiento", maria: 90, juan: 88 },
  { nombre: "Puntualidad", maria: 88, juan: 94 },
  { nombre: "Evaluaciones", maria: 94, juan: 79 },
  { nombre: "Asistencia", maria: 96, juan: 98 },
];

const colores = ["#3B82F6", "#8B5CF6"];

// ==========================================
// COMPONENTE: GRÁFICO DE DONA
// ==========================================

function GraficoDona({ valor, color, titulo }) {
  const datos = [
    { name: "Completado", value: valor },
    { name: "Restante", value: 100 - valor },
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
                  key={index}
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
            {valor}%
          </span>
          <span className="text-xs text-gray-400">
            {titulo}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: TARJETA DE EMPLEADO
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
            {empleado.puesto}
          </p>
          <p className="text-xs text-gray-400">
            {empleado.departamento} · {empleado.antiguedad}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-center text-sm font-medium text-gray-500">
          Rendimiento general
        </p>

        <GraficoDona
          valor={empleado.rendimiento}
          color={empleado.color}
          titulo="Rendimiento"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-400">Tareas completadas</p>
          <p className="text-xl font-bold text-gray-900">
            {empleado.tareasCompletadas}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Tareas pendientes</p>
          <p className="text-xl font-bold text-gray-900">
            {empleado.tareasPendientes}
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: INDICADOR ESTADÍSTICO
// ==========================================

function Indicador({ titulo, valor, descripcion }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{titulo}</p>

      <h3 className="mt-2 text-3xl font-bold text-gray-900">
        {valor}
      </h3>

      <p className="mt-1 text-xs text-gray-400">
        {descripcion}
      </p>
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function ComparacionEmpleados() {
  const maria = empleados[0];
  const juan = empleados[1];

  const ganador =
    maria.rendimiento > juan.rendimiento ? maria : juan;

  const diferencia = Math.abs(
    maria.rendimiento - juan.rendimiento
  );

  const totalTareas =
    maria.tareasCompletadas +
    juan.tareasCompletadas;

  const promedioAsistencia = Math.round(
    (maria.asistencia + juan.asistencia) / 2
  );

  const datosTareas = [
    {
      nombre: maria.nombre,
      completadas: maria.tareasCompletadas,
      pendientes: maria.tareasPendientes,
      color: maria.color,
    },
    {
      nombre: juan.nombre,
      completadas: juan.tareasCompletadas,
      pendientes: juan.tareasPendientes,
      color: juan.color,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* ENCABEZADO */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            SAPE / People Analytics
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Duelo de empleados
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Comparación de rendimiento y estadísticas de empleados.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-400">Período analizado</p>
          <p className="font-semibold text-gray-700">
            Últimos 6 meses
          </p>
        </div>
      </div>

      {/* EMPLEADOS */}
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">

        <TarjetaEmpleado empleado={maria} />

        <TarjetaEmpleado empleado={juan} />

      </div>

      {/* INDICADORES GENERALES */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Indicador
          titulo="Diferencia de rendimiento"
          valor={`${diferencia} pp`}
          descripcion="Diferencia entre empleados"
        />

        <Indicador
          titulo="Tareas completadas"
          valor={totalTareas}
          descripcion="Total de ambos empleados"
        />

        <Indicador
          titulo="Promedio de asistencia"
          valor={`${promedioAsistencia}%`}
          descripcion="Asistencia de ambos empleados"
        />

        <Indicador
          titulo="Tareas pendientes"
          valor={maria.tareasPendientes + juan.tareasPendientes}
          descripcion="Total de tareas pendientes"
        />

      </div>

      {/* COMPARACIÓN DE INDICADORES */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Comparación de indicadores
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Rendimiento individual en cada área evaluada.
          </p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={indicadores}
              layout="vertical"
              margin={{ left: 15, right: 20 }}
              barGap={5}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                type="category"
                dataKey="nombre"
                width={105}
                tick={{ fontSize: 11 }}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, ""]}
              />

              <Legend />

              <Bar
                dataKey="maria"
                name="María González"
                fill="#3B82F6"
                radius={[0, 5, 5, 0]}
                barSize={13}
              />

              <Bar
                dataKey="juan"
                name="Juan Pérez"
                fill="#8B5CF6"
                radius={[0, 5, 5, 0]}
                barSize={13}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EVOLUCIÓN DEL RENDIMIENTO */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-bold text-gray-900">
          Evolución del rendimiento
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Evolución mensual de los dos empleados.
        </p>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion}>

              <defs>
                <linearGradient id="colorMaria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="colorJuan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="mes" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Legend />

              <Area
                type="monotone"
                dataKey="maria"
                name="María González"
                stroke="#3B82F6"
                fill="url(#colorMaria)"
                strokeWidth={3}
              />

              <Area
                type="monotone"
                dataKey="juan"
                name="Juan Pérez"
                stroke="#8B5CF6"
                fill="url(#colorJuan)"
                strokeWidth={3}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PRODUCTIVIDAD */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-bold text-gray-900">
          Productividad operativa
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Distribución de tareas completadas y pendientes.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">

          {datosTareas.map((empleado) => {
            const total =
              empleado.completadas + empleado.pendientes;

            const porcentaje = Math.round(
              (empleado.completadas / total) * 100
            );

            return (
              <div
                key={empleado.nombre}
                className="rounded-xl bg-gray-50 p-5"
              >
                <h3 className="text-center font-semibold text-gray-800">
                  {empleado.nombre}
                </h3>

                <div className="mt-3">
                  <GraficoDona
                    valor={porcentaje}
                    color={empleado.color}
                    titulo="Completadas"
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-center">

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xl font-bold text-gray-900">
                      {empleado.completadas}
                    </p>
                    <p className="text-xs text-gray-500">
                      Completadas
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xl font-bold text-gray-900">
                      {empleado.pendientes}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pendientes
                    </p>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* RESULTADO FINAL */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Resultado del duelo
        </p>

        <h2 className="mt-3 text-2xl font-bold text-gray-900">
          {ganador.nombre}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Según los datos demostrativos, {ganador.nombre} obtiene
          el mayor rendimiento general, con una diferencia de{" "}
          {diferencia} puntos porcentuales respecto al otro empleado.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="rounded-xl bg-white p-4">
            <p className="text-sm font-semibold text-gray-800">
              Principal fortaleza de María
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Productividad: {maria.productividad}%
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-sm font-semibold text-gray-800">
              Principal fortaleza de Juan
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Asistencia: {juan.asistencia}%
            </p>
          </div>

        </div>

        <p className="mt-5 text-xs text-gray-500">
          Los resultados son orientativos y se basan en datos ficticios.
          La puntuación general no reemplaza una evaluación integral
          del desempeño laboral.
        </p>

      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        SAPE · People Analytics · Módulo de comparación
      </p>

    </div>
  );
}
