import { useEffect, useState } from "react";
import { Edit3, Trash2, X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000/api";

const proyectoVacio = {
  nombre: "",
  estado: "Planificado",
  fecha_fin: "",
};

const asignacionVacia = {
  id_empleado: "",
  id_proyecto: "",
  horas_asignadas: "",
  rol_en_proyecto: "",
};

const GestionProyectos = () => {
  const token = useAuthStore((state) => state.token);

  const [proyectos, setProyectos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [proyecto, setProyecto] = useState(proyectoVacio);
  const [asignacion, setAsignacion] = useState(asignacionVacia);
  const [edicionProyecto, setEdicionProyecto] = useState(null);
  const [edicionAsignacion, setEdicionAsignacion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargar = async () => {
    const [proyectosRes, asignacionesRes, empleadosRes] = await Promise.all([
      fetch(`${API_URL}/admin/proyectos`, { headers }),
      fetch(`${API_URL}/admin/asignaciones`, { headers }),
      fetch(`${API_URL}/empleados`, { headers }),
    ]);

    if (proyectosRes.ok) {
      setProyectos(await proyectosRes.json());
    }

    if (asignacionesRes.ok) {
      setAsignaciones(await asignacionesRes.json());
    }

    if (empleadosRes.ok) {
      setEmpleados(await empleadosRes.json());
    }
  };

  useEffect(() => {
    if (token) {
      cargar();
    }
  }, [token]);

  const enviar = async (url, method, cuerpo) => {
    const response = await fetch(url, {
      method,
      headers,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });

    const data = await response.json();

    setMensaje(data.mensaje);

    if (response.ok) {
      cargar();
    }

    return response.ok;
  };

  const guardarProyecto = async (evento) => {
    evento.preventDefault();

    const url = edicionProyecto
      ? `${API_URL}/admin/proyectos/${edicionProyecto}`
      : `${API_URL}/admin/proyectos`;

    const correcto = await enviar(
      url,
      edicionProyecto ? "PUT" : "POST",
      proyecto,
    );

    if (correcto) {
      setProyecto(proyectoVacio);
      setEdicionProyecto(null);
    }
  };

  const guardarAsignacion = async (evento) => {
    evento.preventDefault();

    const url = edicionAsignacion
      ? `${API_URL}/admin/asignaciones/${edicionAsignacion}`
      : `${API_URL}/admin/asignaciones`;

    const correcto = await enviar(
      url,
      edicionAsignacion ? "PUT" : "POST",
      {
        ...asignacion,
        horas_asignadas: Number(asignacion.horas_asignadas),
      },
    );

    if (correcto) {
      setAsignacion(asignacionVacia);
      setEdicionAsignacion(null);
    }
  };

  const borrar = async (tipo, id) => {
    if (!window.confirm("¿Eliminar este registro?")) {
      return;
    }

    await enviar(`${API_URL}/admin/${tipo}/${id}`, "DELETE");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Administracion
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          Proyectos y asignaciones
        </h1>
      </div>

      {mensaje && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          {mensaje}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">
          {edicionProyecto ? "Editar proyecto" : "Nuevo proyecto"}
        </h2>

        <form
          onSubmit={guardarProyecto}
          className="grid gap-3 md:grid-cols-4"
        >
          <input
            required
            value={proyecto.nombre}
            onChange={(evento) =>
              setProyecto({
                ...proyecto,
                nombre: evento.target.value,
              })
            }
            placeholder="Nombre"
            className="rounded-lg border p-3"
          />

          <select
            value={proyecto.estado}
            onChange={(evento) =>
              setProyecto({
                ...proyecto,
                estado: evento.target.value,
              })
            }
            className="rounded-lg border p-3"
          >
            <option>Planificado</option>
            <option>En curso</option>
            <option>Finalizado</option>
          </select>

          <input
            type="date"
            value={proyecto.fecha_fin || ""}
            onChange={(evento) =>
              setProyecto({
                ...proyecto,
                fecha_fin: evento.target.value,
              })
            }
            className="rounded-lg border p-3"
          />

          <div className="flex gap-2">
            <button className="rounded-lg bg-indigo-600 px-4 font-semibold text-white">
              {edicionProyecto ? "Guardar" : "Crear"}
            </button>

            {edicionProyecto && (
              <button
                type="button"
                onClick={() => {
                  setProyecto(proyectoVacio);
                  setEdicionProyecto(null);
                }}
                className="rounded-lg border px-3"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4">Proyecto</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Fin</th>
              <th className="p-4">Asignados</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {proyectos.map((item) => (
              <tr key={item.id_proyecto} className="border-t">
                <td className="p-4 font-semibold">{item.nombre}</td>
                <td className="p-4">{item.estado}</td>
                <td className="p-4">
                  {item.fecha_fin?.slice(0, 10) || "-"}
                </td>
                <td className="p-4">{item.cantidad_asignados}</td>

                <td className="p-4">
                  <button
                    onClick={() => {
                      setEdicionProyecto(item.id_proyecto);

                      setProyecto({
                        ...item,
                        fecha_fin: item.fecha_fin?.slice(0, 10) || "",
                      });
                    }}
                    className="mr-3 text-indigo-600"
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    onClick={() => borrar("proyectos", item.id_proyecto)}
                    className="text-rose-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">
          {edicionAsignacion
            ? "Editar asignacion"
            : "Asignar empleado a proyecto"}
        </h2>

        <form
          onSubmit={guardarAsignacion}
          className="grid gap-3 md:grid-cols-5"
        >
          <select
            required
            disabled={Boolean(edicionAsignacion)}
            value={asignacion.id_empleado}
            onChange={(evento) =>
              setAsignacion({
                ...asignacion,
                id_empleado: evento.target.value,
              })
            }
            className="rounded-lg border p-3 disabled:bg-slate-100"
          >
            <option value="">Empleado</option>

            {empleados.map((empleado) => (
              <option
                key={empleado.id_empleado}
                value={empleado.id_empleado}
              >
                {empleado.nombre} {empleado.apellido}
              </option>
            ))}
          </select>

          <select
            required
            disabled={Boolean(edicionAsignacion)}
            value={asignacion.id_proyecto}
            onChange={(evento) =>
              setAsignacion({
                ...asignacion,
                id_proyecto: evento.target.value,
              })
            }
            className="rounded-lg border p-3 disabled:bg-slate-100"
          >
            <option value="">Proyecto</option>

            {proyectos.map((item) => (
              <option key={item.id_proyecto} value={item.id_proyecto}>
                {item.nombre}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            min="1"
            value={asignacion.horas_asignadas}
            onChange={(evento) =>
              setAsignacion({
                ...asignacion,
                horas_asignadas: evento.target.value,
              })
            }
            placeholder="Horas"
            className="rounded-lg border p-3"
          />

          <input
            required
            value={asignacion.rol_en_proyecto}
            onChange={(evento) =>
              setAsignacion({
                ...asignacion,
                rol_en_proyecto: evento.target.value,
              })
            }
            placeholder="Rol en proyecto"
            className="rounded-lg border p-3"
          />

          <div className="flex gap-2">
            <button className="rounded-lg bg-indigo-600 px-4 font-semibold text-white">
              {edicionAsignacion ? "Guardar" : "Asignar"}
            </button>

            {edicionAsignacion && (
              <button
                type="button"
                onClick={() => {
                  setAsignacion(asignacionVacia);
                  setEdicionAsignacion(null);
                }}
                className="rounded-lg border px-3"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4">Empleado</th>
              <th className="p-4">Proyecto</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Horas</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {asignaciones.map((item) => (
              <tr key={item.id_asignacion} className="border-t">
                <td className="p-4">
                  {item.nombre} {item.apellido}
                </td>
                <td className="p-4">{item.proyecto}</td>
                <td className="p-4">{item.rol_en_proyecto}</td>
                <td className="p-4">{item.horas_asignadas}</td>

                <td className="p-4">
                  <button
                    onClick={() => {
                      setEdicionAsignacion(item.id_asignacion);
                      setAsignacion(item);
                    }}
                    className="mr-3 text-indigo-600"
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    onClick={() =>
                      borrar("asignaciones", item.id_asignacion)
                    }
                    className="text-rose-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default GestionProyectos;