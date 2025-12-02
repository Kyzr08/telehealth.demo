import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, RotateCw, ClipboardCheck, EllipsisVertical } from "lucide-react";
import Swal from "sweetalert2";

const API_CITAS_MEDICO = "http://localhost/telehealth/backend/api/MedicPHP/getCitas.php";
const API_ACCION_CITA = "http://localhost/telehealth/backend/api/AdminPHP/accionCita.php";

const ESTADOS = ["Todos", "Reservada", "Confirmada", "Cancelada", "Realizada"];

export default function CitasMedic() {
  const [citas, setCitas] = useState([]);
  const [tipos, setTipos] = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [menuVisible, setMenuVisible] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);

  const idMedico = useMemo(() => {
    try {
      return localStorage.getItem("id_medico") || null;
    } catch (err) {
      console.error("No se pudo acceder al localStorage", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchCitas = async () => {
      if (!idMedico) {
        setError("No se encontró la sesión del médico. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_CITAS_MEDICO}?id_medico=${idMedico}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "No se pudieron obtener las citas.");
        }

        setCitas(data.citas || []);
        setTipos(["Todos", ...(data.tipos?.map((t) => t.nombre_tipo) || [])]);
      } catch (err) {
        console.error("Error cargando citas del médico", err);
        setError(err.message || "Error inesperado al cargar las citas.");
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [idMedico]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu") && !event.target.closest(".menu-button")) {
        setMenuVisible(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCitaLocal = (id, updates) => {
    setCitas((prev) => prev.map((cita) => (cita.id === id ? { ...cita, ...updates } : cita)));
  };

  const callAccionCita = async (id, accion, extraPayload = {}) => {
    setAccionLoading(true);

    try {
      const response = await fetch(API_ACCION_CITA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, id_cita: id, ...extraPayload }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudo completar la acción sobre la cita.");
      }

      return data;
    } catch (err) {
      console.error(`Error ejecutando acción ${accion} en la cita`, err);
      throw err;
    } finally {
      setAccionLoading(false);
    }
  };

  const confirmarCita = async (id) => {
    setMenuVisible(null);
    const result = await Swal.fire({
      title: "¿Confirmar cita?",
      text: "Esta acción notificará al paciente sobre la confirmación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0aa6b7",
      cancelButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      await callAccionCita(id, "confirmar");
      updateCitaLocal(id, { estado: "Confirmada" });
      await Swal.fire({
        icon: "success",
        title: "Cita confirmada",
        text: "La cita ha sido confirmada correctamente.",
        confirmButtonColor: "#0aa6b7",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo confirmar la cita.",
      });
    }
  };

  const cancelarCita = async (id) => {
    setMenuVisible(null);
    const result = await Swal.fire({
      title: "¿Cancelar cita?",
      text: "Esta acción notificará al paciente sobre la cancelación.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Mantener",
      confirmButtonColor: "#0aa6b7",
      cancelButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      await callAccionCita(id, "cancelar");
      updateCitaLocal(id, { estado: "Cancelada" });
      await Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        text: "La cita ha sido cancelada exitosamente.",
        confirmButtonColor: "#0aa6b7",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo cancelar la cita.",
      });
    }
  };

  const reprogramarCita = async (id) => {
    setMenuVisible(null);
    const citaActual = citas.find((c) => c.id === id);
    const minDate = new Date().toISOString().split("T")[0];
    const defaultHora = citaActual?.hora ? citaActual.hora.substring(0, 5) : "";
    const defaultFecha = citaActual?.fecha || "";
    const defaultValue = defaultFecha && defaultHora ? `${defaultFecha}T${defaultHora}` : "";

    const result = await Swal.fire({
      title: "¿Reprogramar cita?",
      icon: "warning",
      html: `
        <div class="my-4">
          <input
            type="datetime-local"
            id="nueva-fecha"
            class="swal2-input"
            value="${defaultValue}"
            min="${minDate}T00:00"
            style="width: 90%; margin: 0; padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;"
          />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, reprogramar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0aa6b7",
      cancelButtonColor: "#ef4444",
      preConfirm: () => {
        const value = document.getElementById("nueva-fecha").value;
        if (!value) {
          Swal.showValidationMessage("Selecciona una fecha y hora válidas");
        }
        return value;
      },
    });

    if (!result.isConfirmed || !result.value) return;

    const [fecha, horaParcial] = result.value.split("T");
    const hora = horaParcial?.length === 5 ? `${horaParcial}:00` : horaParcial;

    try {
      await callAccionCita(id, "programar", { fecha, hora });
      updateCitaLocal(id, { fecha, hora, estado: "Reservada", fecha_realizacion: null });
      await Swal.fire({
        icon: "success",
        title: "Cita reprogramada",
        text: `La cita ha sido reprogramada para el ${formatFecha(fecha)} a las ${horaParcial}`,
        confirmButtonColor: "#0aa6b7",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo reprogramar la cita.",
      });
    }
  };

  const marcarComoRealizada = async (id) => {
    setMenuVisible(null);
    const result = await Swal.fire({
      title: "¿Marcar como realizada?",
      text: "Confirma que la cita se ha completado satisfactoriamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, marcar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0aa6b7",
      cancelButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const data = await callAccionCita(id, "realizada");
      updateCitaLocal(id, {
        estado: "Realizada",
        fecha_realizacion: data.fecha_realizacion || nuevaFechaRealizada(),
      });
      await Swal.fire({
        icon: "success",
        title: "Cita realizada",
        text: "La cita se ha marcado como realizada.",
        confirmButtonColor: "#0aa6b7",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo actualizar la cita.",
      });
    }
  };

  const citasFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return citas.filter((cita) => {
      const coincideBusqueda = !query
        || `${cita.paciente || ""} ${cita.subtipo || ""}`.toLowerCase().includes(query);
      const coincideTipo = tipoFiltro === "Todos" || cita.subtipo === tipoFiltro;
      const coincideEstado = estadoFiltro === "Todos" || cita.estado === estadoFiltro;
      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  }, [citas, busqueda, tipoFiltro, estadoFiltro]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          Cargando citas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-sm text-red-500 text-center px-6">
          {error}
        </div>
      </div>
    );
  }

  if (!citas.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm text-center px-6">
          No hay citas disponibles.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 flex-1 min-w-[150px] sm:min-w-[320px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#0aa6b7] transition-all">
            <input
              type="text"
              placeholder="Buscar por paciente o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:w-auto sm:gap-3 sm:ml-auto">
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] text-gray-700 bg-white"
          >
            {tipos.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] text-gray-700 bg-white"
          >
            {ESTADOS.map((estado) => (
              <option key={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block">
        <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
          <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
            <tr>
              {["Paciente", "Modalidad", "Tipo", "Fecha", "Estado", "Fecha realizada", "Acciones"].map((header) => (
                <th
                  key={header}
                  className="py-3 px-4 text-left font-medium text-gray-500 text-xs uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {citasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No hay citas que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              citasFiltradas.map(({ id, paciente, tipo, subtipo, fecha, hora, estado, fecha_realizacion }) => (
                <tr key={id} className="hover:bg-gray-50 transition-all rounded-lg">
                  <td className="py-3 px-4 border-b border-gray-100">{paciente}</td>
                  <td className="py-3 px-4 border-b border-gray-100">{tipo}</td>
                  <td className="py-3 px-4 border-b border-gray-100">{subtipo}</td>
                  <td className="py-3 px-4 border-b border-gray-100">{formatFechaHora(fecha, hora)}</td>
                  <td className="py-3 px-4 border-b border-gray-100"><EstadoPill estado={estado} /></td>
                  <td className="py-3 px-4 border-b border-gray-100">{formatFechaRealizacion(fecha_realizacion)}</td>
                  <td className="py-3 px-4 border-b border-gray-100">
                    <div className="relative">
                      <button
                        className="menu-button w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-gray-700 hover:bg-gray-100 hover:shadow-md transition"
                        onClick={() => setMenuVisible((prev) => (prev === id ? null : id))}
                        disabled={accionLoading}
                      >
                        <EllipsisVertical size={18} />
                      </button>
                      {menuVisible === id && (
                        <div
                          className="dropdown-menu absolute bg-white border border-gray-200 rounded-lg shadow-lg"
                          style={{ zIndex: 10, top: "100%", right: "0" }}
                        >
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => confirmarCita(id)}
                            disabled={accionLoading || estado === "Confirmada" || estado === "Realizada"}
                          >
                            Confirmar
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => cancelarCita(id)}
                            disabled={accionLoading || estado === "Cancelada" || estado === "Realizada"}
                          >
                            Cancelar
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => reprogramarCita(id)}
                            disabled={accionLoading}
                          >
                            Reprogramar
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => marcarComoRealizada(id)}
                            disabled={accionLoading || estado === "Realizada" || estado === "Cancelada"}
                          >
                            Realizada
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden flex flex-col gap-4 mt-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {citasFiltradas.map(({ id, paciente, tipo, subtipo, fecha, hora, estado, fecha_realizacion }) => (
          <div key={id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
            <p className="font-semibold text-gray-800">{paciente}</p>
            <p className="text-sm text-gray-500">{tipo}</p>
            <p className="text-sm text-gray-500">{subtipo}</p>
            <p className="text-sm text-gray-500">Fecha: {formatFechaHora(fecha, hora)}</p>
            <p className="text-sm text-gray-500">Estado: <EstadoPill estado={estado} /></p>
            <p className="text-sm text-gray-500">Fecha realizada: {formatFechaRealizacion(fecha_realizacion)}</p>
            <div className="flex gap-2 mt-3 justify-end">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa] disabled:opacity-50"
                onClick={() => confirmarCita(id)}
                disabled={accionLoading || estado === "Confirmada" || estado === "Realizada"}
              >
                <CheckCircle size={18} />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-red-500 hover:bg-red-100 disabled:opacity-50"
                onClick={() => cancelarCita(id)}
                disabled={accionLoading || estado === "Cancelada" || estado === "Realizada"}
              >
                <XCircle size={18} />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa] disabled:opacity-50"
                onClick={() => reprogramarCita(id)}
                disabled={accionLoading}
              >
                <RotateCw size={18} />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-green-600 hover:bg-green-100 disabled:opacity-50"
                onClick={() => marcarComoRealizada(id)}
                disabled={accionLoading || estado === "Realizada" || estado === "Cancelada"}
              >
                <ClipboardCheck size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstadoPill({ estado }) {
  const base = "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";
  switch (estado) {
    case "Reservada":
      return <span className={`${base} bg-blue-100 text-blue-700`}>{estado}</span>;
    case "Confirmada":
      return <span className={`${base} bg-green-100 text-green-700`}>{estado}</span>;
    case "Cancelada":
      return <span className={`${base} bg-red-100 text-red-700`}>{estado}</span>;
    case "Realizada":
      return <span className={`${base} bg-[#0aa6b7]/20 text-[#0aa6b7]`}>{estado}</span>;
    default:
      return <span className={`${base} bg-gray-200 text-gray-600`}>{estado}</span>;
  }
}

function formatFecha(fecha) {
  if (!fecha) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y}`;
  }
  return fecha;
}

function formatFechaHora(fecha, hora) {
  if (!fecha) return "-";
  const fechaFormateada = formatFecha(fecha);
  const horaFormateada = hora ? hora.substring(0, 5) : "";
  return `${fechaFormateada}${horaFormateada ? ` ${horaFormateada}` : ""}`;
}

function formatFechaRealizacion(fechaRealizacion) {
  if (!fechaRealizacion) return "-";
  if (/^\d{4}-\d{2}-\d{2} /.test(fechaRealizacion)) {
    const [fecha, hora] = fechaRealizacion.split(" ");
    const horaLimpia = hora ? hora.substring(0, 5) : "";
    return `${formatFecha(fecha)}${horaLimpia ? ` ${horaLimpia}` : ""}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaRealizacion)) {
    return formatFecha(fechaRealizacion);
  }
  return fechaRealizacion;
}

function nuevaFechaRealizada() {
  const ahora = new Date();
  const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  const hora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  return `${fecha} ${hora}:00`;
}