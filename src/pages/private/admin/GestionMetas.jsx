import { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

const API_URL = "http://localhost:3000/api";

const vacia = {
  id_empleado: "",
  titulo: "",
  descripcion: "",
  estado: "Pendiente",
  progreso: 0,
  fecha_limite: "",
};

const GestionMetas = () => {
  const token = useAuthStore((state) => state.token);

  const [metas, setMetas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [formulario, setFormulario] = useState(vacia);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargar = async () => {
    const params = new URLSearchParams();

    if (filtroEmpleado) {
      params.set("id_empleado", filtroEmpleado);
    }

    if (filtroEstado) {
      params.set("estado", filtroEstado);
    }

    const [metasRes, empleadosRes] = await Promise.all([
      fetch(`${API_URL}/admin/metas?${params}`, { headers }),
      fetch(`${API_URL}/empleados`, { headers }),
    ]);

    if (metasRes.ok) {
      setMetas(await metasRes.json());
    }

    if (empleadosRes.ok) {
      setEmpleados(await empleadosRes.json());
    }
  };

  useEffect(() => {
    if (token) {
      cargar();
    }
  }, [token, filtroEmpleado, filtroEstado]);

  const cambiar = (evento) => {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
  };

  const limpiar = () => {
    setFormulario(vacia);
    setEditandoId(null);
  };

  const guardar = async (evento) => {
    evento.preventDefault();

    const url = editandoId
      ? `${API_URL}/admin/metas/${editandoId}`
      : `${API_URL}/admin/metas`;

    const response = await fetch(url, {
      method: editandoId ? "PUT" : "POST",
      headers,
      body: JSON.stringify({
        ...formulario,
        progreso: Number(formulario.progreso),
      }),
    });

    const data = await response.json();

    setMensaje(data.mensaje);

    if (response.ok) {
      limpiar();
      cargar();
    }
  };

  const editar = (meta) => {
    setEditandoId(meta.id_meta);

    setFormulario({
      ...meta,
      fecha_limite: meta.fecha_limite?.slice(0, 10) || "",
    });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta meta?")) {
      return;
    }

    const response = await fetch(`${API_URL}/admin/metas/${id}`, {
      method: "DELETE",
      headers,
    });

    const data = await response.json();

    setMensaje(data.mensaje);

    if (response.ok) {
      cargar();
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Administracion
        </p>

        <h1 className="text-3xl font-bold text-slate-900">
          Gestion de metas
        </h1>
      </div>

      {mensaje && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          {mensaje}
        </p>
      )}

      <form
        onSubmit={guardar}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <h2 className="text-lg font-bold md:col-span-2">
          {editandoId ? "Editar meta" : "Asignar meta manual"}
        </h2>

        <select
          required
          name="id_empleado"
          value={formulario.id_empleado}
          onChange={cambiar}
          disabled={Boolean(editandoId)}
          className="rounded-lg border p-3 disabled:bg-slate-100"
        >
          <option value="">Selecciona un empleado</option>

          {empleados.map((empleado) => (
            <option
              key={empleado.id_empleado}
              value={empleado.id_empleado}
            >
              {empleado.nombre} {empleado.apellido} - {empleado.legajo}
            </option>
          ))}
        </select>

        <input
          required
          name="titulo"
          value={formulario.titulo}
          onChange={cambiar}
          placeholder="Titulo de la meta"
          className="rounded-lg border p-3"
        />

        <textarea
          name="descripcion"
          value={formulario.descripcion || ""}
          onChange={cambiar}
          placeholder="Descripcion"
          className="min-h-24 rounded-lg border p-3"
        />

        <input
          type="date"
          name="fecha_limite"
          value={formulario.fecha_limite || ""}
          onChange={cambiar}
          className="rounded-lg border p-3"
        />

        {editandoId && (
          <>
            <select
              name="estado"
              value={formulario.estado}
              onChange={cambiar}
              className="rounded-lg border p-3"
            >
              <option>Pendiente</option>
              <option>En progreso</option>
              <option>Completada</option>
            </select>

            <input
              type="number"
              min="0"
              max="100"
              name="progreso"
              value={formulario.progreso}
              onChange={cambiar}
              className="rounded-lg border p-3"
            />
          </>
        )}

        <div className="flex gap-3 md:col-span-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
            <Plus size={17} />
            {editandoId ? "Guardar cambios" : "Asignar meta"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"
            >
              <X size={17} />
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          value={filtroEmpleado}
          onChange={(evento) => setFiltroEmpleado(evento.target.value)}
          className="rounded-lg border bg-white p-2"
        >
          <option value="">Todos los empleados</option>

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
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value)}
          className="rounded-lg border bg-white p-2"
        >
          <option value="">Todos los estados</option>
          <option>Pendiente</option>
          <option>En progreso</option>
          <option>Completada</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Empleado</th>
              <th className="p-4">Meta</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Progreso</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {metas.map((meta) => (
              <tr key={meta.id_meta} className="border-t">
                <td className="p-4">
                  {meta.nombre} {meta.apellido}

                  <br />

                  <span className="text-xs text-slate-500">
                    {meta.legajo}
                  </span>
                </td>

                <td className="p-4">
                  <p className="font-semibold">{meta.titulo}</p>

                  <p className="text-slate-500">
                    {meta.fecha_limite?.slice(0, 10) || "Sin fecha"}
                  </p>
                </td>

                <td className="p-4">{meta.estado}</td>

                <td className="p-4">{meta.progreso}%</td>

                <td className="p-4">
                  <button
                    onClick={() => editar(meta)}
                    className="mr-3 text-indigo-600"
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    onClick={() => eliminar(meta.id_meta)}
                    className="text-rose-600"
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}

            {metas.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-slate-500"
                >
                  No hay metas para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionMetas;