import { useEffect, useState } from "react";
import ModalMedic from "../../components/ModalMedic";
import PatientDetails from "../../components/PatientDetails";

export default function HistorialMedic() {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recetas, setRecetas] = useState([]); // Estado para almacenar las recetas médicas
  const [isModalOpen, setIsModalOpen] = useState(false);

  const idMedico = localStorage.getItem("id_medico"); // Obtener dinámicamente el id_medico del almacenamiento local

  useEffect(() => {
    if (!idMedico) {
      console.error("No se encontró el id_medico en el almacenamiento local.");
      return;
    }

    fetch(`http://localhost/telehealth/backend/api/MedicPHP/getHistorial.php?id_medico=${idMedico}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPacientes(data.data);
        } else {
          console.error("Error en la respuesta de la API:", data.message);
        }
      })
      .catch((err) => console.error("Error cargando historial:", err));
  }, [idMedico]);

  const fetchPatientDetails = (id) => {
    if (!idMedico) {
      console.error("No se encontró el id_medico en el almacenamiento local.");
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`http://localhost/telehealth/backend/api/MedicPHP/getHistorial.php?id_historial=${id}&id_medico=${idMedico}`)
        .then((res) => res.json()),
      fetch("http://localhost/telehealth/backend/api/MedicPHP/getRecetas.php")
        .then((res) => res.json()),
    ])
      .then(([historialData, recetasData]) => {
        if (historialData.success) {
          setSelectedPatient(historialData.data);
        } else {
          console.error("Error en la respuesta de la API del historial:", historialData.message);
        }

        if (recetasData.success) {
          const recetasFiltradas = recetasData.data.filter(
            (receta) => receta.id_historial === id // Filtrar por id_historial
          );
          setRecetas(recetasFiltradas);
        } else {
          console.error("Error en la respuesta de la API de recetas:", recetasData.message);
        }
      })
      .catch((err) => console.error("Error cargando detalles del historial o recetas:", err))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Solo refresca la lista y cierra el modal, el POST lo hace el modal
  const handleCreateHistorial = () => {
    handleHistorialCreated();
    handleCloseModal();
  };

  const handleHistorialCreated = () => {
    // Refrescar la lista de pacientes después de crear un historial
    fetch(`http://localhost/telehealth/backend/api/MedicPHP/getHistorial.php?id_medico=${idMedico}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPacientes(data.data);
        } else {
          console.error("Error al refrescar el historial:", data.message);
        }
      })
      .catch((err) => console.error("Error al refrescar el historial:", err));
  };

  const formatMotivo = (texto) => {
    if (!texto) return "—";
    const limit = 70;
    const clean = texto.trim();
    if (clean.length <= limit) return clean;
    const sliced = clean.slice(0, limit - 3);
    const lastSpace = sliced.lastIndexOf(" ");
    const base = lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced;
    return `${base.trim()}...`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          Cargando historial clínico...
        </div>
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#120F43]">
            Historial Clínico de Pacientes
          </h2>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
          >
            Crear Historial
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
          {/* Tabla escritorio */}
          <div className="hidden sm:block overflow-x-auto min-h-0">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-300/50">
                  <th className="py-3 text-left">Paciente</th>
                  <th className="py-3 text-left">DNI</th>
                  <th className="py-3 text-left">Fecha</th>
                  <th className="py-3 text-left">Motivo</th>
                  <th className="py-3 text-left">Diagnóstico</th>
                  <th className="py-3 text-left">Estado</th>
                  <th className="py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pacientes.map((p) => (
                  <tr
                    key={p.id_historial}
                    className="border-b border-gray-300/50 hover:bg-gray-50 transition"
                  >
                    <td className="py-3">{p.paciente}</td>
                    <td className="py-3">{p.dni}</td>
                    <td className="py-3">{p.fecha_cita}</td>
                    <td className="py-3" title={p.motivo_consulta}>
                      {formatMotivo(p.motivo_consulta)}
                    </td>
                    <td className="py-3">{p.diagnostico}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.estado === "Alta médica"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => fetchPatientDetails(p.id_historial)}
                        className="text-[#0aa6b7] font-medium hover:underline"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards móvil */}
          <div className="sm:hidden flex flex-col gap-3 mt-2 pb-4">
            {pacientes.map((p) => (
              <div
                key={p.id_historial}
                className="border border-gray-300/50 rounded-xl p-4 shadow-sm bg-white"
              >
                <div className="text-sm text-gray-700 mb-2">
                  <p><strong>Paciente:</strong> {p.paciente}</p>
                  <p><strong>DNI:</strong> {p.dni}</p>
                  <p><strong>Fecha:</strong> {p.fecha_cita}</p>
                  <p title={p.motivo_consulta}>
                    <strong>Motivo:</strong> {formatMotivo(p.motivo_consulta)}
                  </p>
                  <p><strong>Diagnóstico:</strong> {p.diagnostico}</p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.estado === "Alta médica"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </p>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => fetchPatientDetails(p.id_historial)}
                    className="text-[#0aa6b7] font-medium hover:underline"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ModalMedic
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleCreateHistorial}
          onHistorialCreated={handleHistorialCreated}
          medicoId={localStorage.getItem("id_medico")}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => setSelectedPatient(null)}
          className="text-[#0aa6b7] font-medium hover:underline"
        >
          ← Volver al listado
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
        <PatientDetails
          patient={selectedPatient}
          recetas={recetas}
          onBack={() => setSelectedPatient(null)}
        />
      </div>
    </div>
  );
}
