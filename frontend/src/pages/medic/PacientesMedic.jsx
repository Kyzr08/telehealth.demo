import { useEffect, useMemo, useState } from "react";
import PatientDetails from "../../components/PatientDetails";

const API_PACIENTES = "http://localhost/telehealth/backend/api/MedicPHP/getPacientes.php";
const API_HISTORIAL = "http://localhost/telehealth/backend/api/MedicPHP/getHistorial.php";

const estadoBadgeClass = (estado) => {
  if (!estado) return "bg-gray-100 text-gray-700";
  const normalized = estado.toLowerCase();
  if (normalized.includes("alta")) return "bg-green-100 text-green-700";
  if (normalized.includes("activo") || normalized.includes("trat")) {
    return "bg-yellow-100 text-yellow-700";
  }
  if (normalized.includes("cerrado") || normalized.includes("arch")) {
    return "bg-blue-100 text-blue-700";
  }
  return "bg-gray-100 text-gray-700";
};

export default function PacientesMedic() {
  const [busqueda, setBusqueda] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detalleError, setDetalleError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [historialesPaciente, setHistorialesPaciente] = useState([]);
  const [selectedHistorialId, setSelectedHistorialId] = useState(null);
  const [detalleHistorial, setDetalleHistorial] = useState(null);

  const idMedico = useMemo(() => {
    try {
      return localStorage.getItem("id_medico") || null;
    } catch (err) {
      console.error("No se pudo acceder al localStorage", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!idMedico) {
      setError("No se encontró la sesión del médico. Inicia sesión nuevamente.");
      return;
    }

    const fetchPacientes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_PACIENTES}?id_medico=${idMedico}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "No se pudieron obtener los pacientes asignados.");
        }

        setPacientes(data.data || []);
      } catch (err) {
        console.error("Error cargando pacientes asignados", err);
        setError(err.message || "Error inesperado al cargar los pacientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [idMedico]);

  const pacientesFiltrados = useMemo(() => {
    if (!busqueda) return pacientes;
    return pacientes.filter((paciente) => {
      const nombre = paciente.nombre?.toLowerCase() || "";
      const correo = paciente.correo?.toLowerCase() || "";
      const dni = paciente.dni || "";
      const criterio = busqueda.toLowerCase();
      return nombre.includes(criterio) || correo.includes(criterio) || dni.includes(busqueda);
    });
  }, [busqueda, pacientes]);

  const handleVerHistorial = async (paciente) => {
    if (!paciente || !idMedico) return;

    setSelectedPatientId(paciente.id_paciente);
    setHistorialesPaciente(paciente.historial || []);
    setDetalleHistorial(null);
    setDetalleError("");

    const primerHistorial = paciente.historial?.[0];
    if (primerHistorial) {
      await fetchDetalleHistorial(primerHistorial.id_historial);
    }
  };

  const fetchDetalleHistorial = async (idHistorial) => {
    setDetailLoading(true);
    setDetalleError("");
    setSelectedHistorialId(idHistorial);

    try {
      const response = await fetch(`${API_HISTORIAL}?id_historial=${idHistorial}&id_medico=${idMedico}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudo cargar el historial clínico seleccionado.");
      }

      setDetalleHistorial(data.data);
    } catch (err) {
      console.error("Error cargando detalle del historial", err);
      setDetalleError(err.message || "Error inesperado al cargar el historial clínico.");
      setDetalleHistorial(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVolverLista = () => {
    setSelectedPatientId(null);
    setHistorialesPaciente([]);
    setSelectedHistorialId(null);
    setDetalleHistorial(null);
    setDetalleError("");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          Cargando pacientes...
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

  if (!selectedPatientId) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#120F43]">Pacientes Asignados</h2>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o DNI..."
            className="w-full sm:w-72 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-[#0aa6b7]"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
          {pacientesFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm">No se encontraron pacientes asignados.</p>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto min-h-0">
                <table className="min-w-full text-sm text-gray-700">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-gray-300/50">
                      <th className="py-3 text-left">Paciente</th>
                      <th className="py-3 text-left">Correo</th>
                      <th className="py-3 text-left">Teléfono</th>
                      <th className="py-3 text-left">Estado</th>
                      <th className="py-3 text-left">Historiales</th>
                      <th className="py-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesFiltrados.map((paciente) => (
                      <tr key={paciente.id_paciente} className="border-b border-gray-300/50 hover:bg-gray-50 transition">
                        <td className="py-3 font-semibold text-gray-800">{paciente.nombre || "Sin nombre"}</td>
                        <td className="py-3">{paciente.correo || "—"}</td>
                        <td className="py-3">{paciente.telefono || "—"}</td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoBadgeClass(paciente.estado)}`}>
                            {paciente.estado || "—"}
                          </span>
                        </td>
                        <td className="py-3">{paciente.total_historiales}</td>
                        <td className="py-3">
                          <button
                            onClick={() => handleVerHistorial(paciente)}
                            className="text-[#0aa6b7] font-medium hover:underline"
                          >
                            Ver historial
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden flex flex-col gap-3 pb-4">
                {pacientesFiltrados.map((paciente) => (
                  <div key={paciente.id_paciente} className="border border-gray-300/50 rounded-xl p-4 shadow-sm bg-white">
                    <p className="font-semibold text-gray-800 mb-1">{paciente.nombre || "Sin nombre"}</p>
                    <p className="text-sm text-gray-700"><strong>Correo:</strong> {paciente.correo || "—"}</p>
                    <p className="text-sm text-gray-700"><strong>Teléfono:</strong> {paciente.telefono || "—"}</p>
                    <p className="text-sm text-gray-700"><strong>Historiales:</strong> {paciente.total_historiales}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 inline-block ${estadoBadgeClass(paciente.estado)}`}
                    >
                      {paciente.estado || "—"}
                    </span>
                    <button
                      className="text-[#0aa6b7] font-medium mt-3 hover:underline"
                      onClick={() => handleVerHistorial(paciente)}
                    >
                      Ver historial
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const pacienteActual = pacientes.find((p) => p.id_paciente === selectedPatientId) || null;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">

        <button
          onClick={handleVolverLista}
          className="text-[#0aa6b7] font-medium hover:underline"
        >
          ← Volver a la lista
        </button>

        {pacienteActual && (
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold text-[#120F43]">{pacienteActual.nombre}</p>
            <p>{pacienteActual.correo || "—"}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-6">
        {pacienteActual && historialesPaciente.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-[#120F43] mb-3">Historiales clínicos registrados</h3>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
              {historialesPaciente.map((historial) => (
                <button
                  key={historial.id_historial}
                  onClick={() => fetchDetalleHistorial(historial.id_historial)}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${
                    selectedHistorialId === historial.id_historial
                      ? "bg-[#0aa6b7] text-white border-[#0aa6b7]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#0aa6b7]"
                  }`}
                >
                  <span className="block font-semibold">{historial.fecha_consulta || "Sin fecha"}</span>
                  <span className="block text-xs text-gray-200 md:text-gray-100">
                    {historial.diagnostico || "Sin diagnóstico"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {detalleError && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-sm text-red-700">
            {detalleError}
          </div>
        )}

        {detailLoading ? (
          <div className="text-gray-600 text-sm">Cargando historial clínico...</div>
        ) : detalleHistorial ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <PatientDetails
              patient={detalleHistorial}
              onBack={handleVolverLista}
            />
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Selecciona un historial clínico para visualizar el detalle.
          </div>
        )}
      </div>
    </div>
  );
}