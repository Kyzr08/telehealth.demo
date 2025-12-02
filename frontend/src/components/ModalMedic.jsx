import { useState, useEffect } from "react";

import Swal from 'sweetalert2';

export default function ModalMedic({ isOpen, onClose, onSubmit, medicoId }) {
  const [formData, setFormData] = useState({
    id_paciente: "", // 🔹 nombre correcto según el backend
    id_cita: "",
    id_medico: "", // 🔹 ahora se envía correctamente
    motivo_consulta: "",
    diagnostico: "",
    recomendaciones: "",
    estado: "En tratamiento", // Valor por defecto
  });

  const [citas, setCitas] = useState([]);
  const [enums, setEnums] = useState({
    padecimientos: [],
    naturaleza_padecimiento: [],
    tipo_atencion: [],
    estado: [],
  });

  // 🔹 useEffect: carga citas confirmadas y enums
  useEffect(() => {
    if (isOpen) {
      // Asignar id_medico
      setFormData((prevFormData) => ({
        ...prevFormData,
        id_medico: medicoId,
      }));

      // 🔸 Cargar citas confirmadas del médico
      fetch(`http://localhost/telehealth/backend/api/MedicPHP/getCitasConfirmadas.php?medico_id=${medicoId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCitas(data.data);
          } else {
            setCitas([]);
          }
        })
        .catch(() => setCitas([]));

      // 🔸 Cargar los ENUM y padecimientos
      fetch("http://localhost/telehealth/backend/api/MedicPHP/createHistorial.php", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setEnums({
              padecimientos: data.data.padecimientos || [],
              naturaleza_padecimiento: data.data.naturaleza_padecimiento || [],
              tipo_atencion: data.data.tipo_atencion || [],
              estado: data.data.estado || [],
            });
          } else {
            console.error("Error: Respuesta inesperada del backend", data);
          }
        })
        .catch((err) =>
          console.error("Error al cargar los valores ENUM y padecimientos:", err)
        );
    }
  }, [isOpen, medicoId]);

  // 🔹 Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Cuando el usuario selecciona una cita
  const handleCitaChange = (e) => {
    const selectedCita = citas.find(
      (cita) => cita.id_cita === parseInt(e.target.value)
    );

    setFormData((prev) => ({
      ...prev,
      id_cita: e.target.value,
      id_paciente: selectedCita ? selectedCita.id_paciente : "", // ✅ campo correcto
      tipo_cita: selectedCita ? selectedCita.tipo_cita : "",
      especialidad: selectedCita ? selectedCita.especialidad : "",
    }));
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (!formData.id_cita || !formData.id_paciente || !formData.id_medico) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor seleccione una cita válida y complete todos los campos obligatorios.",
      });
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];

    const updatedFormData = {
      ...formData,
      fecha_consulta: currentDate,
    };

    try {
      const response = await fetch(
        "http://localhost/telehealth/backend/api/MedicPHP/createHistorial.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFormData),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: result.message,
        });
        if (typeof onSubmit === "function") onSubmit(updatedFormData);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Error al crear el historial médico",
        });
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al enviar el formulario",
      });
    }
  };

  // 🔹 Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <style>
        {`
          @keyframes fadeIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 sm:p-10 max-h-[90vh] overflow-auto transition-all duration-300 mx-4 sm:mx-0"
        style={{ animation: "fadeIn 0.25s ease-in-out" }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-300/70 pb-3">
          Crear Historial Médico
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Cita Confirmada</label>
              <select
                name="id_cita"
                value={formData.id_cita}
                onChange={handleCitaChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
                required
              >
                <option value="">Seleccione una cita</option>
                {citas.map((cita) => (
                  <option key={cita.id_cita} value={cita.id_cita}>
                    {`${cita.detalle_cita}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Tipo de Cita</label>
              <input
                name="tipo_cita"
                value={formData.tipo_cita || ""}
                readOnly
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Especialidad</label>
              <input
                name="especialidad"
                value={formData.especialidad || ""}
                readOnly
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Padecimiento</label>
              <select
                name="id_padecimiento"
                value={formData.id_padecimiento || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
                required
              >
                <option value="">Seleccione un padecimiento</option>
                {(Array.isArray(enums.padecimientos) ? enums.padecimientos : []).map((padecimiento) => (
                  <option key={padecimiento.id_padecimiento} value={padecimiento.id_padecimiento}>
                    {padecimiento.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Naturaleza del Padecimiento</label>
              <select
                name="naturaleza_padecimiento"
                value={formData.naturaleza_padecimiento || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              >
                <option value="">Seleccione una opción</option>
                {enums.naturaleza_padecimiento.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Fecha de Diagnóstico</label>
              <input
                type="date"
                name="fecha_diagnostico"
                value={formData.fecha_diagnostico || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Motivo de Consulta</label>
              <textarea
                name="motivo_consulta"
                value={formData.motivo_consulta || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Descripción del Cuadro</label>
              <textarea
                name="descripcion_cuadro"
                value={formData.descripcion_cuadro || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Diagnóstico</label>
              <textarea
                name="diagnostico"
                value={formData.diagnostico || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Antecedentes Patológicos</label>
              <textarea
                name="antecedentes_patologicos"
                value={formData.antecedentes_patologicos || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Antecedentes No Patológicos</label>
              <textarea
                name="antecedentes_no_patologicos"
                value={formData.antecedentes_no_patologicos || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Antecedentes Perinatales</label>
              <textarea
                name="antecedentes_perinatales"
                value={formData.antecedentes_perinatales || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Antecedentes Gineco-Obstétricos</label>
              <textarea
                name="antecedentes_gineco_obstetricos"
                value={formData.antecedentes_gineco_obstetricos || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Recomendaciones</label>
              <textarea
                name="recomendaciones"
                value={formData.recomendaciones || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              ></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Estado</label>
              <select
                name="estado"
                value={formData.estado || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              >
                <option value="">Seleccione un estado</option>
                {(enums.estado || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Tipo de Atención</label>
              <select
                name="tipo_atencion"
                value={formData.tipo_atencion || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition h-10"
              >
                <option value="">Seleccione una opción</option>
                {enums.tipo_atencion.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 border-t border-gray-300/70 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-navbar-link hover:bg-gray-100 transition w-full sm:w-auto"
              style={{ border: "1px solid var(--navbar-link-hover)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-semibold text-white w-full sm:w-auto bg-[#0aa6b7] hover:bg-[#0895a5] transition hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
