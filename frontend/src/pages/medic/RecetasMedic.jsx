import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";

export default function RecetasMedic() {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pacientes, setPacientes] = useState([]); // Para el selector de pacientes

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recetaParaEditar, setRecetaParaEditar] = useState(null);

  const [nuevaReceta, setNuevaReceta] = useState({
    id_historial: "",
    medicamento: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    indicaciones: "",
  });

  // Cargar recetas y pacientes al montar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Cargar todas las recetas
        const recetasRes = await fetch("http://localhost/telehealth/backend/api/MedicPHP/getRecetas.php");
        const recetasData = await recetasRes.json();
        if (recetasData.success) {
          setRecetas(recetasData.data);
        } else {
          throw new Error(recetasData.message || "Error al cargar recetas");
        }

        // Cargar pacientes para el formulario (usando el endpoint de historial)
        const idMedico = localStorage.getItem("id_medico"); // Asumiendo que el ID del médico está guardado
        const historialRes = await fetch(`http://localhost/telehealth/backend/api/MedicPHP/getHistorial.php?id_medico=${idMedico}`);
        const historialData = await historialRes.json();
        if (historialData.success) {
          // Crear una lista única de pacientes desde el historial
          const pacientesUnicos = historialData.data.reduce((acc, curr) => {
            if (!acc.find((p) => p.id_historial === curr.id_historial)) {
              acc.push({ id_historial: curr.id_historial, nombre: curr.paciente, diagnostico: curr.diagnostico });
            }
            return acc;
          }, []);
          setPacientes(pacientesUnicos);
        } else {
          console.warn("No se pudieron cargar los pacientes para el formulario.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevaReceta.id_historial || !nuevaReceta.medicamento) {
      alert("Por favor, seleccione un paciente e ingrese un medicamento.");
      return;
    }

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/MedicPHP/getRecetas.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaReceta),
      });
      const result = await response.json();

      if (result.success) {
        // Para actualizar la UI, necesitamos el nombre del paciente y diagnóstico
        const pacienteInfo = pacientes.find((p) => p.id_historial == nuevaReceta.id_historial);
        const recetaParaUI = {
          ...result.data,
          paciente: pacienteInfo?.nombre || "N/A",
          diagnostico: pacienteInfo?.diagnostico || "N/A",
          fecha_emision: new Date().toISOString(), // La API no devuelve la fecha, la simulamos
        };

        setRecetas([recetaParaUI, ...recetas]);
        setNuevaReceta({ id_historial: "", medicamento: "", dosis: "", frecuencia: "", duracion: "", indicaciones: "" });
        alert("Receta creada con éxito.");
      } else {
        throw new Error(result.message || "Error al crear la receta.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id_receta) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta receta?")) {
      return;
    }

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/MedicPHP/getRecetas.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_receta }),
      });
      const result = await response.json();

      if (result.success) {
        setRecetas(recetas.filter((r) => r.id_receta !== id_receta));
        alert("Receta eliminada con éxito.");
      } else {
        throw new Error(result.message || "Error al eliminar la receta.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenEditModal = (receta) => {
    setRecetaParaEditar({ ...receta });
    setIsEditModalOpen(true);
  };

  const handleUpdateReceta = async (e) => {
    e.preventDefault();
    if (!recetaParaEditar || !recetaParaEditar.medicamento) {
      alert("El campo medicamento es obligatorio.");
      return;
    }

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/MedicPHP/getRecetas.php", {
        method: "POST", // La API usa POST para crear y actualizar
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recetaParaEditar),
      });
      const result = await response.json();

      if (result.success) {
        setRecetas(recetas.map((r) => (r.id_receta === recetaParaEditar.id_receta ? { ...r, ...recetaParaEditar } : r)));
        setIsEditModalOpen(false);
        setRecetaParaEditar(null);
        alert("Receta actualizada con éxito.");
      } else {
        throw new Error(result.message || "Error al actualizar la receta.");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          Cargando recetas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-sm text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-[#120F43]">Recetas Médicas</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="text-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FaPlusCircle className="text-[#0aa6b7]" /> Crear nueva receta
            </h3>
            <button type="submit" className="text-[#0aa6b7] font-medium hover:underline">
              Guardar Receta
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              className="border rounded-lg p-2 focus:outline-[#0aa6b7] focus:ring-1 focus:ring-[#0aa6b7]"
              value={nuevaReceta.id_historial}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, id_historial: e.target.value })}
            >
              <option value="">-- Seleccione Paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id_historial} value={p.id_historial}>
                  {p.nombre} (ID Hist: {p.id_historial})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Medicamento *"
              className="border rounded-lg p-2 focus:outline-[#0aa6b7] focus:ring-1 focus:ring-[#0aa6b7]"
              value={nuevaReceta.medicamento}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, medicamento: e.target.value })}
            />
            <input
              type="text"
              placeholder="Dosis (ej: 500mg)"
              className="border rounded-lg p-2 focus:outline-[#0aa6b7] focus:ring-1 focus:ring-[#0aa6b7]"
              value={nuevaReceta.dosis}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, dosis: e.target.value })}
            />
            <input
              type="text"
              placeholder="Frecuencia (ej: cada 8h)"
              className="border rounded-lg p-2 focus:outline-[#0aa6b7] focus:ring-1 focus:ring-[#0aa6b7]"
              value={nuevaReceta.frecuencia}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, frecuencia: e.target.value })}
            />
            <input
              type="text"
              placeholder="Duración (ej: por 7 días)"
              className="border rounded-lg p-2 focus:outline-[#0aa6b7] focus:ring-1 focus:ring-[#0aa6b7]"
              value={nuevaReceta.duracion}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, duracion: e.target.value })}
            />
            <input
              type="text"
              placeholder="Indicaciones adicionales"
              className="border rounded-lg p-2 focus:outline-[#0aa6b7] focus:ring-1 focus:ring-[#0aa6b7] sm:col-span-2 lg:col-span-1"
              value={nuevaReceta.indicaciones}
              onChange={(e) => setNuevaReceta({ ...nuevaReceta, indicaciones: e.target.value })}
            />
          </div>
        </form>

        {/* Tabla escritorio */}
        <div className="hidden sm:block overflow-x-auto min-h-0">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b border-gray-300/50">
                <th className="py-3 text-left">Paciente</th>
                <th className="py-3 text-left">Diagnóstico</th>
                <th className="py-3 text-left">Fecha</th>
                <th className="py-3 text-left">Medicamento</th>
                <th className="py-3 text-left">Indicaciones</th>
                <th className="py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recetas.map((r) => (
                <tr key={r.id_receta} className="border-b border-gray-300/50 hover:bg-gray-50 transition">
                  <td className="py-3 font-medium">{r.paciente}</td>
                  <td className="py-3">{r.diagnostico}</td>
                  <td className="py-3">{new Date(r.fecha_emision).toLocaleDateString()}</td>
                  <td className="py-3">{r.medicamento}</td>
                  <td className="py-3">{r.indicaciones}</td>
                  <td className="py-3 text-center">
                    <button onClick={() => handleOpenEditModal(r)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(r.id_receta)} className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {recetas.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No hay recetas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards móvil */}
        <div className="sm:hidden flex flex-col gap-3 mt-2 pb-4">
          {recetas.map((r) => (
            <div key={r.id_receta} className="border border-gray-300/50 rounded-xl p-4 shadow-sm bg-white">
              <p className="font-semibold text-gray-800 mb-1">{r.paciente}</p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Diagnóstico:</strong> {r.diagnostico}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Fecha:</strong> {new Date(r.fecha_emision).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Medicamento:</strong> {r.medicamento}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Indicaciones:</strong> {r.indicaciones || "N/A"}
              </p>
              <div className="flex justify-end gap-4 mt-2">
                <button onClick={() => handleOpenEditModal(r)} className="text-blue-600 hover:text-blue-800 text-lg">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(r.id_receta)} className="text-red-600 hover:text-red-800 text-lg">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          {recetas.length === 0 && <p className="text-center py-4 text-gray-500">No hay recetas registradas.</p>}
        </div>
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && recetaParaEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold text-[#120F43] mb-4">Editar Receta</h2>
            <form onSubmit={handleUpdateReceta} className="text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold">Paciente:</label>
                  <p className="border rounded-lg p-2 bg-gray-100">{recetaParaEditar.paciente}</p>
                </div>
                <div>
                  <label className="font-semibold">Medicamento *</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-[#0aa6b7]"
                    value={recetaParaEditar.medicamento}
                    onChange={(e) => setRecetaParaEditar({ ...recetaParaEditar, medicamento: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold">Dosis</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-[#0aa6b7]"
                    value={recetaParaEditar.dosis}
                    onChange={(e) => setRecetaParaEditar({ ...recetaParaEditar, dosis: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold">Frecuencia</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-[#0aa6b7]"
                    value={recetaParaEditar.frecuencia}
                    onChange={(e) => setRecetaParaEditar({ ...recetaParaEditar, frecuencia: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold">Duración</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 focus:outline-[#0aa6b7]"
                    value={recetaParaEditar.duracion}
                    onChange={(e) => setRecetaParaEditar({ ...recetaParaEditar, duracion: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold">Indicaciones Adicionales</label>
                  <textarea
                    className="w-full border rounded-lg p-2 focus:outline-[#0aa6b7]"
                    rows="3"
                    value={recetaParaEditar.indicaciones}
                    onChange={(e) => setRecetaParaEditar({ ...recetaParaEditar, indicaciones: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0aa6b7] text-white rounded-lg hover:bg-[#0996a6]">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}