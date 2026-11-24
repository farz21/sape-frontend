import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import {
  Briefcase,
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:3000/api";
const SENIORITIES_OPCIONES = [
  "Trainee",
  "Junior",
  "Semi-Senior",
  "Senior",
  "Lead",
];
const DEPTOS_POR_PAGINA = 3;
const PUESTOS_POR_PAGINA = 5;

const normalizarTexto = (texto) =>
  String(texto || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const PuestosAdmin = () => {
  const token = useAuthStore((state) => state.token);

  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros y paginación de puestos
  const [filtroDepto, setFiltroDepto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [paginaPuesto, setPaginaPuesto] = useState(1);

  // Paginación de departamentos (3 por página)
  const [paginaDepto, setPaginaDepto] = useState(1);

  // Estado formulario Puesto
  const [editandoPuestoId, setEditandoPuestoId] = useState(null);
  const [idDepartamento, setIdDepartamento] = useState("");
  const [nombrePuesto, setNombrePuesto] = useState("");
  const [seniority, setSeniority] = useState("Junior");
  const [guardandoPuesto, setGuardandoPuesto] = useState(false);

  // Estado formulario Departamento
  const [editandoDeptoId, setEditandoDeptoId] = useState(null);
  const [nombreDepto, setNombreDepto] = useState("");
  const [presupuestoDepto, setPresupuestoDepto] = useState("");
  const [guardandoDepto, setGuardandoDepto] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resDeptos, resPuestos] = await Promise.all([
        fetch(`${API_URL}/departamentos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/puestos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resDeptos.ok || !resPuestos.ok) {
        throw new Error("No se pudieron cargar departamentos y puestos.");
      }

      const dataDeptos = await resDeptos.json();
      const dataPuestos = await resPuestos.json();

      const listaDeptos = Array.isArray(dataDeptos) ? dataDeptos : [];
      const listaPuestos = Array.isArray(dataPuestos) ? dataPuestos : [];

      setDepartamentos(listaDeptos);
      setPuestos(listaPuestos);

      if (listaDeptos.length > 0 && !idDepartamento) {
        setIdDepartamento(String(listaDeptos[0].id_departamento));
      }
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Error al cargar los datos.");
    } finally {
      setCargando(false);
    }
  }, [token, idDepartamento]);

  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token, cargarDatos]);

  // Contar cuántos puestos tiene cada departamento
  const contarPuestosPorDepto = (idDepto) =>
    puestos.filter((p) => String(p.id_departamento) === String(idDepto)).length;

  // Paginación de departamentos
  const totalPaginasDepto = Math.max(
    1,
    Math.ceil(departamentos.length / DEPTOS_POR_PAGINA),
  );
  const paginaSeguraDepto = Math.min(paginaDepto, totalPaginasDepto);
  const indiceInicioDepto = (paginaSeguraDepto - 1) * DEPTOS_POR_PAGINA;
  const departamentosPaginados = departamentos.slice(
    indiceInicioDepto,
    indiceInicioDepto + DEPTOS_POR_PAGINA,
  );

  // --- PUESTOS ---
  const limpiarFormPuesto = () => {
    setEditandoPuestoId(null);
    setNombrePuesto("");
    setSeniority("Junior");
    if (departamentos.length > 0) {
      setIdDepartamento(String(departamentos[0].id_departamento));
    }
  };

  const iniciarEdicionPuesto = (puesto) => {
    setEditandoPuestoId(puesto.id_puesto);
    setIdDepartamento(String(puesto.id_departamento));
    setNombrePuesto(puesto.nombre || "");
    setSeniority(puesto.seniority || "Junior");
  };

  const handleSubmitPuesto = async (e) => {
    e.preventDefault();

    const nombreLimpio = nombrePuesto.trim().replace(/\s+/g, " ");
    const seniorityFinal = seniority || "Junior";

    if (!idDepartamento || !nombreLimpio) {
      window.alert("Seleccioná un departamento e ingresá el nombre del puesto.");
      return;
    }

    // Validación anti-duplicados: mismo departamento + mismo nombre + mismo seniority
    const puestoDuplicado = puestos.some(
      (p) =>
        p.id_puesto !== editandoPuestoId &&
        Number(p.id_departamento) === Number(idDepartamento) &&
        normalizarTexto(p.nombre) === normalizarTexto(nombreLimpio) &&
        normalizarTexto(p.seniority || "Junior") ===
          normalizarTexto(seniorityFinal),
    );

    if (puestoDuplicado) {
      window.alert(
        `Ya existe el puesto "${nombreLimpio}" (${seniorityFinal}) en ese departamento.`,
      );
      return;
    }

    setGuardandoPuesto(true);
    try {
      const esEdicion = Boolean(editandoPuestoId);
      const url = esEdicion
        ? `${API_URL}/puestos/${editandoPuestoId}`
        : `${API_URL}/puestos`;
      const method = esEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_departamento: Number(idDepartamento),
          nombre: nombreLimpio,
          seniority: seniorityFinal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo guardar el puesto.");
        return;
      }

      const mensajeFinal =
        data.mensaje ||
        (esEdicion
          ? "Puesto editado correctamente."
          : "Puesto agregado correctamente.");

      limpiarFormPuesto();
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión con el servidor.");
    } finally {
      setGuardandoPuesto(false);
    }
  };

  const handleEliminarPuesto = async (puesto) => {
    if (
      !window.confirm(
        `¿Eliminar el puesto "${puesto.nombre}"? Si tiene empleados asignados no se podrá borrar.`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/puestos/${puesto.id_puesto}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo eliminar el puesto.");
        return;
      }
      if (editandoPuestoId === puesto.id_puesto) {
        limpiarFormPuesto();
      }
      const mensajeFinal = data.mensaje || "Puesto eliminado correctamente.";
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión al eliminar el puesto.");
    }
  };

  // --- DEPARTAMENTOS ---
  const limpiarFormDepto = () => {
    setEditandoDeptoId(null);
    setNombreDepto("");
    setPresupuestoDepto("");
  };

  const iniciarEdicionDepto = (depto) => {
    setEditandoDeptoId(depto.id_departamento);
    setNombreDepto(depto.nombre || "");
    setPresupuestoDepto(
      depto.presupuesto !== null && depto.presupuesto !== undefined
        ? String(depto.presupuesto)
        : "",
    );
  };

  const handleSubmitDepto = async (e) => {
    e.preventDefault();

    const nombreLimpio = nombreDepto.trim().replace(/\s+/g, " ");

    if (!nombreLimpio) {
      window.alert("Ingresá el nombre del departamento.");
      return;
    }

    // Validación anti-duplicados: mismo nombre de departamento
    const deptoDuplicado = departamentos.some(
      (d) =>
        d.id_departamento !== editandoDeptoId &&
        normalizarTexto(d.nombre) === normalizarTexto(nombreLimpio),
    );

    if (deptoDuplicado) {
      window.alert(`Ya existe un departamento llamado "${nombreLimpio}".`);
      return;
    }

    setGuardandoDepto(true);
    try {
      const esEdicion = Boolean(editandoDeptoId);
      const url = esEdicion
        ? `${API_URL}/departamentos/${editandoDeptoId}`
        : `${API_URL}/departamentos`;
      const method = esEdicion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          presupuesto:
            presupuestoDepto === "" ? null : Number(presupuestoDepto),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo guardar el departamento.");
        return;
      }

      const mensajeFinal =
        data.mensaje ||
        (esEdicion
          ? "Departamento editado correctamente."
          : "Departamento agregado correctamente.");

      limpiarFormDepto();
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión con el servidor.");
    } finally {
      setGuardandoDepto(false);
    }
  };

  const handleEliminarDepto = async (depto) => {
    const cantidadPuestos = contarPuestosPorDepto(depto.id_departamento);

    if (cantidadPuestos > 0) {
      window.alert(
        `No se puede eliminar "${depto.nombre}" porque tiene ${cantidadPuestos} ${
          cantidadPuestos === 1 ? "puesto asociado" : "puestos asociados"
        }. Eliminá o reasigná esos puestos primero.`,
      );
      return;
    }

    if (
      !window.confirm(
        `¿Seguro que querés eliminar el departamento "${depto.nombre}"?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/departamentos/${depto.id_departamento}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo eliminar el departamento.");
        return;
      }
      if (editandoDeptoId === depto.id_departamento) {
        limpiarFormDepto();
      }
      const mensajeFinal =
        data.mensaje || "Departamento eliminado correctamente.";
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión al eliminar el departamento.");
    }
  };

  // Filtrado y paginación de puestos
  const puestosFiltrados = puestos.filter((p) => {
    const coincideDepto =
      !filtroDepto || String(p.id_departamento) === String(filtroDepto);
    const texto = busqueda.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      String(p.nombre || "")
        .toLowerCase()
        .includes(texto) ||
      String(p.nombre_departamento || "")
        .toLowerCase()
        .includes(texto) ||
      String(p.seniority || "")
        .toLowerCase()
        .includes(texto);
    return coincideDepto && coincideTexto;
  });

  const totalPaginasPuesto = Math.max(
    1,
    Math.ceil(puestosFiltrados.length / PUESTOS_POR_PAGINA),
  );
  const paginaSeguraPuesto = Math.min(paginaPuesto, totalPaginasPuesto);
  const indiceInicioPuesto = (paginaSeguraPuesto - 1) * PUESTOS_POR_PAGINA;
  const puestosPaginados = puestosFiltrados.slice(
    indiceInicioPuesto,
    indiceInicioPuesto + PUESTOS_POR_PAGINA,
  );

  // Asegura que si se edita un puesto antiguo con otro seniority, aparezca seleccionado
  const opcionesSeniority = SENIORITIES_OPCIONES.includes(seniority)
    ? SENIORITIES_OPCIONES
    : [seniority, ...SENIORITIES_OPCIONES];

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Puestos, Seniorities y Departamentos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administrá departamentos, creá o editá puestos con su seniority y
          eliminá registros cuando corresponda.
        </p>
      </div>

      {/* SECCIÓN 1: PUESTOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={20} className="text-indigo-600" />
            Puestos
          </h2>
          {puestos.length > 0 && (
            <span className="text-xs font-medium text-slate-500">
              {puestosFiltrados.length} puesto
              {puestosFiltrados.length === 1 ? "" : "s"}
              {puestosFiltrados.length !== puestos.length
                ? ` (de ${puestos.length})`
                : " en total"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <form
            onSubmit={handleSubmitPuesto}
            className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {editandoPuestoId ? (
                  <>
                    <Pencil size={17} className="text-indigo-600" />
                    Editar Puesto #{editandoPuestoId}
                  </>
                ) : (
                  <>
                    <Plus size={17} className="text-indigo-600" />
                    Nuevo Puesto
                  </>
                )}
              </h3>
              {editandoPuestoId && (
                <button
                  type="button"
                  onClick={limpiarFormPuesto}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                >
                  <X size={14} /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Departamento
              </label>
              <select
                value={idDepartamento}
                onChange={(e) => setIdDepartamento(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              >
                <option value="">Seleccionar departamento...</option>
                {departamentos.map((depto) => (
                  <option
                    key={depto.id_departamento}
                    value={depto.id_departamento}
                  >
                    {depto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nombre del Puesto
              </label>
              <input
                type="text"
                value={nombrePuesto}
                onChange={(e) => setNombrePuesto(e.target.value)}
                placeholder="Ej: Analista QA"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              >
                {opcionesSeniority.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={guardandoPuesto}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Check size={17} />
              {guardandoPuesto
                ? "Guardando..."
                : editandoPuestoId
                  ? "Guardar Cambios"
                  : "Agregar Puesto"}
            </button>
          </form>

          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaPuesto(1);
                  }}
                  placeholder="Buscar por puesto, departamento o seniority..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <select
                value={filtroDepto}
                onChange={(e) => {
                  setFiltroDepto(e.target.value);
                  setPaginaPuesto(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map((depto) => (
                  <option
                    key={depto.id_departamento}
                    value={depto.id_departamento}
                  >
                    {depto.nombre}
                  </option>
                ))}
              </select>
            </div>

            {cargando ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Cargando puestos...
              </div>
            ) : puestosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay puestos que coincidan con el filtro.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-3">Puesto</th>
                        <th className="px-5 py-3">Departamento</th>
                        <th className="px-5 py-3">Seniority</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {puestosPaginados.map((puesto) => (
                        <tr
                          key={puesto.id_puesto}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {puesto.nombre}
                          </td>
                          <td className="px-5 py-3.5 text-slate-700">
                            {puesto.nombre_departamento}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                              {puesto.seniority || "General"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => iniciarEdicionPuesto(puesto)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
                            >
                              <Pencil size={13} />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarPuesto(puesto)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition"
                            >
                              <Trash2 size={13} />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {puestosFiltrados.length > PUESTOS_POR_PAGINA && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                    <span>
                      Mostrando {indiceInicioPuesto + 1}–
                      {Math.min(
                        indiceInicioPuesto + PUESTOS_POR_PAGINA,
                        puestosFiltrados.length,
                      )}{" "}
                      de {puestosFiltrados.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPaginaPuesto((p) => Math.max(1, p - 1))
                        }
                        disabled={paginaSeguraPuesto <= 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      >
                        <ChevronLeft size={14} />
                        Anterior
                      </button>

                      {Array.from(
                        { length: totalPaginasPuesto },
                        (_, idx) => idx + 1,
                      ).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPaginaPuesto(num)}
                          className={`h-7 min-w-7 rounded-lg px-2 font-bold transition ${
                            paginaSeguraPuesto === num
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setPaginaPuesto((p) =>
                            Math.min(totalPaginasPuesto, p + 1),
                          )
                        }
                        disabled={paginaSeguraPuesto >= totalPaginasPuesto}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      >
                        Siguiente
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: DEPARTAMENTOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={20} className="text-indigo-600" />
            Departamentos
          </h2>
          {departamentos.length > 0 && (
            <span className="text-xs font-medium text-slate-500">
              {departamentos.length} departamento
              {departamentos.length === 1 ? "" : "s"} en total
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <form
            onSubmit={handleSubmitDepto}
            className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {editandoDeptoId ? (
                  <>
                    <Pencil size={17} className="text-indigo-600" />
                    Editar Departamento #{editandoDeptoId}
                  </>
                ) : (
                  <>
                    <Plus size={17} className="text-indigo-600" />
                    Nuevo Departamento
                  </>
                )}
              </h3>
              {editandoDeptoId && (
                <button
                  type="button"
                  onClick={limpiarFormDepto}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                >
                  <X size={14} /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nombre del Departamento
              </label>
              <input
                type="text"
                value={nombreDepto}
                onChange={(e) => setNombreDepto(e.target.value)}
                placeholder="Ej: Producto y Diseño"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Presupuesto (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={presupuestoDepto}
                onChange={(e) => setPresupuestoDepto(e.target.value)}
                placeholder="Ej: 35000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={guardandoDepto}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Check size={17} />
              {guardandoDepto
                ? "Guardando..."
                : editandoDeptoId
                  ? "Guardar Cambios"
                  : "Agregar Departamento"}
            </button>
          </form>

          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-visible">
            {cargando ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Cargando departamentos...
              </div>
            ) : departamentos.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay departamentos registrados.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-3">Departamento</th>
                        <th className="px-5 py-3">Puestos</th>
                        <th className="px-5 py-3">Presupuesto</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {departamentosPaginados.map((depto) => {
                        const cantidadPuestos = contarPuestosPorDepto(
                          depto.id_departamento,
                        );
                        const tienePuestos = cantidadPuestos > 0;

                        return (
                          <tr
                            key={depto.id_departamento}
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="px-5 py-3.5 font-semibold text-slate-900">
                              {depto.nombre}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  tienePuestos
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {cantidadPuestos}{" "}
                                {cantidadPuestos === 1 ? "puesto" : "puestos"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-700">
                              {depto.presupuesto !== null &&
                              depto.presupuesto !== undefined
                                ? `$ ${Number(depto.presupuesto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                                : "Sin asignar"}
                            </td>
                            <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => iniciarEdicionDepto(depto)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
                              >
                                <Pencil size={13} />
                                Editar
                              </button>

                              <div className="relative inline-block group">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarDepto(depto)}
                                  aria-disabled={tienePuestos}
                                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                                    tienePuestos
                                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                                  }`}
                                >
                                  <Trash2 size={13} />
                                  Eliminar
                                </button>

                                {tienePuestos && (
                                  <span
                                    role="tooltip"
                                    className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-56 rounded-lg bg-slate-800 px-3 py-1.5 text-left text-[11px] font-medium leading-snug text-white whitespace-normal opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
                                  >
                                    Tiene {cantidadPuestos}{" "}
                                    {cantidadPuestos === 1
                                      ? "puesto asociado"
                                      : "puestos asociados"}
                                    . Eliminalos primero para poder borrar este
                                    departamento.
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {departamentos.length > DEPTOS_POR_PAGINA && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600 rounded-b-xl">
                    <span>
                      Mostrando {indiceInicioDepto + 1}–
                      {Math.min(
                        indiceInicioDepto + DEPTOS_POR_PAGINA,
                        departamentos.length,
                      )}{" "}
                      de {departamentos.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPaginaDepto((p) => Math.max(1, p - 1))
                        }
                        disabled={paginaSeguraDepto <= 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      >
                        <ChevronLeft size={14} />
                        Anterior
                      </button>

                      {Array.from(
                        { length: totalPaginasDepto },
                        (_, idx) => idx + 1,
                      ).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPaginaDepto(num)}
                          className={`h-7 min-w-7 rounded-lg px-2 font-bold transition ${
                            paginaSeguraDepto === num
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {num}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setPaginaDepto((p) =>
                            Math.min(totalPaginasDepto, p + 1),
                          )
                        }
                        disabled={paginaSeguraDepto >= totalPaginasDepto}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                      >
                        Siguiente
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PuestosAdmin;