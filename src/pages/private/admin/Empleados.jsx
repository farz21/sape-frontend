import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  UserPlus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Empleados = () => {
  const token = useAuthStore((state) => state.token);
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCondicion, setFiltroCondicion] = useState("todos"); // 'todos' | 'empleado' | 'a_prueba'

  // Estados para la paginación (10 elementos por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const cargarEmpleados = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3000/api/empleados", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmpleados(Array.isArray(data) ? data : data.empleados || []);
      }
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, [token]);

  const manejarEliminar = async (idEmpleado, nombre) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar a ${nombre} del sistema? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/empleados/${idEmpleado}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setEmpleados(empleados.filter((emp) => emp.id_empleado !== idEmpleado));
        window.alert("Empleado eliminado correctamente.");
      } else {
        alert("Error al eliminar el empleado.");
      }
    } catch (error) {
      console.error("Error en la solicitud de eliminación:", error);
    }
  };

  const esAPrueba = (emp) => {
    if (emp.en_periodo_prueba === true || Number(emp.en_periodo_prueba) === 1) {
      return true;
    }
    const valor = String(
      emp.condicion_laboral || emp.estado_puesto || "",
    ).toLowerCase();
    return valor === "a_prueba" || valor === "a prueba" || valor === "prueba";
  };

  // 🔍 Filtrado de empleados por búsqueda y condición laboral
  const empleadosFiltrados = empleados.filter((emp) => {
    const coincideBusqueda =
      (emp.nombre && emp.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emp.apellido &&
        emp.apellido.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emp.legajo && emp.legajo.toLowerCase().includes(busqueda.toLowerCase()));

    if (!coincideBusqueda) return false;

    if (filtroCondicion === "a_prueba") return esAPrueba(emp);
    if (filtroCondicion === "empleado") return !esAPrueba(emp);
    return true;
  });

  // 📄 Lógica de Paginación (10 en 10)
  const totalPaginas = Math.ceil(empleadosFiltrados.length / elementosPorPagina);
  const indiceUltimoElemento = paginaActual * elementosPorPagina;
  const indicePrimerElemento = indiceUltimoElemento - elementosPorPagina;
  const empleadosPaginados = empleadosFiltrados.slice(
    indicePrimerElemento,
    indiceUltimoElemento,
  );

  // Cada vez que el usuario busque algo o cambie el filtro, lo devolvemos a la página 1
  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const manejarFiltroCondicion = (e) => {
    setFiltroCondicion(e.target.value);
    setPaginaActual(1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Gestión de Empleados
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra los accesos y legajos de la plantilla.
          </p>
        </div>
        <Link
          to="/admin/empleados/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={18} /> Nuevo Empleado
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-2xl">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o legajo..."
                value={busqueda}
                onChange={manejarBusqueda}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filtroCondicion}
              onChange={manejarFiltroCondicion}
              aria-label="Filtrar por condición del empleado"
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="empleado">Empleado (puesto fijo)</option>
              <option value="a_prueba">A prueba</option>
            </select>
          </div>

          {empleadosFiltrados.length > 0 && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-3 py-1.5 rounded-full">
              Mostrando {empleadosPaginados.length} de{" "}
              {empleadosFiltrados.length} empleados
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Legajo</th>
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {empleadosPaginados.length > 0 ? (
                empleadosPaginados.map((emp) => (
                  <tr
                    key={emp.id_empleado}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {emp.legajo || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {emp.nombre} {emp.apellido}
                      </div>
                      <div className="text-xs text-slate-500">
                        Ingreso:{" "}
                        {emp.fecha_ingreso
                          ? new Date(emp.fecha_ingreso).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to={`/admin/empleados/${emp.id_empleado}`}
                          className="text-emerald-600 hover:text-emerald-800 font-medium"
                          title="Evaluar"
                        >
                          Evaluar
                        </Link>
                        <Link
                          to={`/admin/empleados/editar/${emp.id_empleado}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() =>
                            manejarEliminar(emp.id_empleado, emp.nombre)
                          }
                          className="text-rose-600 hover:text-rose-800"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No se encontraron empleados con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 CONTROLES DE PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <span className="text-xs font-medium text-slate-600">
              Página <strong className="text-slate-900">{paginaActual}</strong>{" "}
              de <strong className="text-slate-900">{totalPaginas}</strong>
            </span>

            <button
              onClick={() =>
                setPaginaActual((p) => Math.min(p + 1, totalPaginas))
              }
              disabled={paginaActual === totalPaginas}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Empleados;