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

  // Formulario de creación: Puesto
  const [idDepartamento, setIdDepartamento] = useState("");
  const [nombrePuesto, setNombrePuesto] = useState("");
  const [seniority, setSeniority] = useState("Junior");
  const [creandoPuesto, setCreandoPuesto] = useState(false);

  // Modal de edición: Puesto
  const [modalPuestoAbierto, setModalPuestoAbierto] = useState(false);
  const [editandoPuestoId, setEditandoPuestoId] = useState(null);
  const [modalIdDepto, setModalIdDepto] = useState("");
  const [modalNombrePuesto, setModalNombrePuesto] = useState("");
  const [modalSeniority, setModalSeniority] = useState("Junior");
  const [guardandoEdicionPuesto, setGuardandoEdicionPuesto] = useState(false);

  // Formulario de creación: Departamento
  const [nombreDepto, setNombreDepto] = useState("");
  const [presupuestoDepto, setPresupuestoDepto] = useState("");
  const [creandoDepto, setCreandoDepto] = useState(false);

  // Modal de edición: Departamento
  const [modalDeptoAbierto, setModalDeptoAbierto] = useState(false);
  const [editandoDeptoId, setEditandoDeptoId] = useState(null);
  const [modalNombreDepto, setModalNombreDepto] = useState("");
  const [modalPresupuestoDepto, setModalPresupuestoDepto] = useState("");
  const [guardandoEdicionDepto, setGuardandoEdicionDepto] = useState(false);

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

      if (listaDeptos.length > 0) {
        setIdDepartamento(
          (prev) => prev || String(listaDeptos[0].id_departamento),
        );
      }
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Error al cargar los datos.");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token, cargarDatos]);

  const cerrarModalPuesto = useCallback(() => {
    setModalPuestoAbierto(false);
    setEditandoPuestoId(null);
    setModalIdDepto("");
    setModalNombrePuesto("");
    setModalSeniority("Junior");
  }, []);

  const cerrarModalDepto = useCallback(() => {
    setModalDeptoAbierto(false);
    setEditandoDeptoId(null);
    setModalNombreDepto("");
    setModalPresupuestoDepto("");
  }, []);

  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === "Escape") {
        if (modalPuestoAbierto) cerrarModalPuesto();
        if (modalDeptoAbierto) cerrarModalDepto();
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [
    modalPuestoAbierto,
    modalDeptoAbierto,
    cerrarModalPuesto,
    cerrarModalDepto,
  ]);

  const contarPuestosPorDepto = (idDepto) =>
    puestos.filter((p) => String(p.id_departamento) === String(idDepto)).length;

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
  const limpiarFormCreacionPuesto = () => {
    setNombrePuesto("");
    setSeniority("Junior");
    if (departamentos.length > 0) {
      setIdDepartamento(String(departamentos[0].id_departamento));
    }
  };

  const abrirModalEdicionPuesto = (puesto) => {
    setEditandoPuestoId(puesto.id_puesto);
    setModalIdDepto(String(puesto.id_departamento || ""));
    setModalNombrePuesto(puesto.nombre || "");
    setModalSeniority(puesto.seniority || "Junior");
    setModalPuestoAbierto(true);
  };

  const validarPuesto = ({ idDepto, nombre, nivel, idExcluir = null }) => {
    const nombreLimpio = String(nombre || "")
      .trim()
      .replace(/\s+/g, " ");
    const seniorityFinal = nivel || "Junior";

    if (!idDepto || !nombreLimpio) {
      window.alert(
        "Seleccioná un departamento e ingresá el nombre del puesto.",
      );
      return null;
    }

    const puestoDuplicado = puestos.some(
      (p) =>
        p.id_puesto !== idExcluir &&
        Number(p.id_departamento) === Number(idDepto) &&
        normalizarTexto(p.nombre) === normalizarTexto(nombreLimpio) &&
        normalizarTexto(p.seniority || "Junior") ===
          normalizarTexto(seniorityFinal),
    );

    if (puestoDuplicado) {
      window.alert(
        `Ya existe el puesto "${nombreLimpio}" (${seniorityFinal}) en ese departamento.`,
      );
      return null;
    }

    return {
      id_departamento: Number(idDepto),
      nombre: nombreLimpio,
      seniority: seniorityFinal,
    };
  };

  const handleCrearPuesto = async (e) => {
    e.preventDefault();

    const payload = validarPuesto({
      idDepto: idDepartamento,
      nombre: nombrePuesto,
      nivel: seniority,
    });
    if (!payload) return;

    setCreandoPuesto(true);
    try {
      const res = await fetch(`${API_URL}/puestos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo agregar el puesto.");
        return;
      }

      const mensajeFinal = data.mensaje || "Puesto agregado correctamente.";
      limpiarFormCreacionPuesto();
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión con el servidor.");
    } finally {
      setCreandoPuesto(false);
    }
  };

  const handleGuardarEdicionPuesto = async (e) => {
    e.preventDefault();
    if (!editandoPuestoId) return;

    const payload = validarPuesto({
      idDepto: modalIdDepto,
      nombre: modalNombrePuesto,
      nivel: modalSeniority,
      idExcluir: editandoPuestoId,
    });
    if (!payload) return;

    setGuardandoEdicionPuesto(true);
    try {
      const res = await fetch(`${API_URL}/puestos/${editandoPuestoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo actualizar el puesto.");
        return;
      }

      const mensajeFinal = data.mensaje || "Puesto actualizado correctamente.";
      cerrarModalPuesto();
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión con el servidor.");
    } finally {
      setGuardandoEdicionPuesto(false);
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
        cerrarModalPuesto();
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
  const limpiarFormCreacionDepto = () => {
    setNombreDepto("");
    setPresupuestoDepto("");
  };

  const abrirModalEdicionDepto = (depto) => {
    setEditandoDeptoId(depto.id_departamento);
    setModalNombreDepto(depto.nombre || "");
    setModalPresupuestoDepto(
      depto.presupuesto !== null && depto.presupuesto !== undefined
        ? String(depto.presupuesto)
        : "",
    );
    setModalDeptoAbierto(true);
  };

  const validarDepto = ({ nombre, presupuesto, idExcluir = null }) => {
    const nombreLimpio = String(nombre || "")
      .trim()
      .replace(/\s+/g, " ");

    if (!nombreLimpio) {
      window.alert("Ingresá el nombre del departamento.");
      return null;
    }

    const deptoDuplicado = departamentos.some(
      (d) =>
        d.id_departamento !== idExcluir &&
        normalizarTexto(d.nombre) === normalizarTexto(nombreLimpio),
    );

    if (deptoDuplicado) {
      window.alert(`Ya existe un departamento llamado "${nombreLimpio}".`);
      return null;
    }

    return {
      nombre: nombreLimpio,
      presupuesto: presupuesto === "" ? null : Number(presupuesto),
    };
  };

  const handleCrearDepto = async (e) => {
    e.preventDefault();

    const payload = validarDepto({
      nombre: nombreDepto,
      presupuesto: presupuestoDepto,
    });
    if (!payload) return;

    setCreandoDepto(true);
    try {
      const res = await fetch(`${API_URL}/departamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo agregar el departamento.");
        return;
      }

      const mensajeFinal =
        data.mensaje || "Departamento agregado correctamente.";
      limpiarFormCreacionDepto();
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión con el servidor.");
    } finally {
      setCreandoDepto(false);
    }
  };

  const handleGuardarEdicionDepto = async (e) => {
    e.preventDefault();
    if (!editandoDeptoId) return;

    const payload = validarDepto({
      nombre: modalNombreDepto,
      presupuesto: modalPresupuestoDepto,
      idExcluir: editandoDeptoId,
    });
    if (!payload) return;

    setGuardandoEdicionDepto(true);
    try {
      const res = await fetch(`${API_URL}/departamentos/${editandoDeptoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        window.alert(data.mensaje || "No se pudo actualizar el departamento.");
        return;
      }

      const mensajeFinal =
        data.mensaje || "Departamento actualizado correctamente.";
      cerrarModalDepto();
      await cargarDatos();
      window.alert(mensajeFinal);
    } catch (err) {
      console.error(err);
      window.alert("Error de conexión con el servidor.");
    } finally {
      setGuardandoEdicionDepto(false);
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
        cerrarModalDepto();
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

  const opcionesModalSeniority = SENIORITIES_OPCIONES.includes(modalSeniority)
    ? SENIORITIES_OPCIONES
    : [modalSeniority, ...SENIORITIES_OPCIONES];

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      {/* ENCABEZADO */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Puestos, Seniorities y Departamentos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Administrá departamentos, creá o editá puestos en modal con su
          seniority y eliminá registros cuando corresponda.
        </p>
      </div>

      {/* SECCIÓN 1: PUESTOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
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

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCrearPuesto}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Plus size={17} className="text-indigo-600" />
                Nuevo Puesto
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Departamento
              </label>
              <select
                value={idDepartamento}
                onChange={(e) => setIdDepartamento(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
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
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Nombre del Puesto
              </label>
              <input
                type="text"
                value={nombrePuesto}
                onChange={(e) => setNombrePuesto(e.target.value)}
                placeholder="Ej: Analista QA"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              >
                {SENIORITIES_OPCIONES.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {nivel}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creandoPuesto}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check size={17} />
              {creandoPuesto ? "Guardando..." : "Agregar Puesto"}
            </button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaPuesto(1);
                  }}
                  placeholder="Buscar por puesto, departamento o seniority..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <select
                value={filtroDepto}
                onChange={(e) => {
                  setFiltroDepto(e.target.value);
                  setPaginaPuesto(1);
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
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
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold tracking-wider text-slate-500 uppercase">
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
                          className="transition hover:bg-slate-50"
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
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => abrirModalEdicionPuesto(puesto)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <Pencil size={13} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEliminarPuesto(puesto)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 size={13} />
                                Eliminar
                              </button>
                            </div>
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
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
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
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

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCrearDepto}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Plus size={17} className="text-indigo-600" />
                Nuevo Departamento
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Nombre del Departamento
              </label>
              <input
                type="text"
                value={nombreDepto}
                onChange={(e) => setNombreDepto(e.target.value)}
                placeholder="Ej: Producto y Diseño"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Presupuesto (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={presupuestoDepto}
                onChange={(e) => setPresupuestoDepto(e.target.value)}
                placeholder="Ej: 35000"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creandoDepto}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check size={17} />
              {creandoDepto ? "Guardando..." : "Agregar Departamento"}
            </button>
          </form>

          <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
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
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-bold tracking-wider text-slate-500 uppercase">
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
                            className="transition hover:bg-slate-50"
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
                                ? `$ ${Number(depto.presupuesto).toLocaleString(
                                    "es-AR",
                                    { minimumFractionDigits: 2 },
                                  )}`
                                : "Sin asignar"}
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => abrirModalEdicionDepto(depto)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                  <Pencil size={13} />
                                  Editar
                                </button>

                                <div className="group relative inline-block">
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarDepto(depto)}
                                    aria-disabled={tienePuestos}
                                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                                      tienePuestos
                                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                                    }`}
                                  >
                                    <Trash2 size={13} />
                                    Eliminar
                                  </button>

                                  {tienePuestos && (
                                    <span
                                      role="tooltip"
                                      className="pointer-events-none absolute right-0 bottom-full z-20 mb-2 w-56 rounded-lg bg-slate-800 px-3 py-1.5 text-left text-[11px] leading-snug font-medium whitespace-normal text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
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
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {departamentos.length > DEPTOS_POR_PAGINA && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
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

      {/* MODAL EDITAR PUESTO */}
      {modalPuestoAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
          onClick={cerrarModalPuesto}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Pencil size={17} className="text-indigo-600" />
                Editar Puesto #{editandoPuestoId}
              </h3>
              <button
                type="button"
                onClick={cerrarModalPuesto}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicionPuesto} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Departamento
                </label>
                <select
                  value={modalIdDepto}
                  onChange={(e) => setModalIdDepto(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
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
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Nombre del Puesto
                </label>
                <input
                  type="text"
                  value={modalNombrePuesto}
                  onChange={(e) => setModalNombrePuesto(e.target.value)}
                  placeholder="Ej: Analista QA"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Seniority
                </label>
                <select
                  value={modalSeniority}
                  onChange={(e) => setModalSeniority(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                  required
                >
                  {opcionesModalSeniority.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalPuesto}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicionPuesto}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  {guardandoEdicionPuesto ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR DEPARTAMENTO */}
      {modalDeptoAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
          onClick={cerrarModalDepto}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Pencil size={17} className="text-indigo-600" />
                Editar Departamento #{editandoDeptoId}
              </h3>
              <button
                type="button"
                onClick={cerrarModalDepto}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicionDepto} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Nombre del Departamento
                </label>
                <input
                  type="text"
                  value={modalNombreDepto}
                  onChange={(e) => setModalNombreDepto(e.target.value)}
                  placeholder="Ej: Producto y Diseño"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Presupuesto (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={modalPresupuestoDepto}
                  onChange={(e) => setModalPresupuestoDepto(e.target.value)}
                  placeholder="Ej: 35000"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalDepto}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicionDepto}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  {guardandoEdicionDepto ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuestosAdmin;