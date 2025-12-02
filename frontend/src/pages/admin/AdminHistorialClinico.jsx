import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Trash2 } from "lucide-react";
import PatientDetails from "../../components/PatientDetails";
import Swal from "sweetalert2";

export default function AdminHistorialClinico() {
  const [historiales, setHistoriales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // --- Cargar historiales ---
  useEffect(() => {
    fetch("http://localhost/telehealth/backend/api/AdminPHP/getHistorial.php")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta de la API");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setHistoriales(data.data);
        } else {
          console.error("Error en la respuesta de la API:", data.message);
        }
      })
      .catch((err) => console.error("Error cargando historiales clínicos:", err));
  }, []);

  // --- Filtro ---
  const filtrados = historiales.filter((h) =>
    h.paciente.toLowerCase().includes(busqueda.toLowerCase())
  );

  // --- Mostrar detalle ---
  const fetchHistorialDetails = (id_historial) => {
    if (!id_historial) {
      console.error("ID del historial no proporcionado.");
      setAlerta({ tipo: "error", mensaje: "ID del historial no proporcionado." });
      return;
    }

    setLoading(true);

    fetch(`http://localhost/telehealth/backend/api/AdminPHP/getHistorial.php?id_historial=${id_historial}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta de la API");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Respuesta detalle:", data);
        if (data.success && data.data) {
          setDetalle(data.data);
        } else {
          console.error("Error en la respuesta de la API:", data.message);
          setAlerta({ tipo: "error", mensaje: data.message || "No se encontraron detalles." });
        }
      })
      .catch((err) => {
        console.error("Error cargando detalles del historial:", err);
        setAlerta({ tipo: "error", mensaje: "Error cargando detalles del historial." });
      })
      .finally(() => setLoading(false));
  };

  // --- Eliminar historial ---
  const deleteHistorial = (id_historial) => {
    if (!id_historial) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "ID del historial no proporcionado.",
      });
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost/telehealth/backend/api/AdminPHP/DeleteHC.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_historial }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Error en la respuesta de la API");
            }
            return res.json();
          })
          .then((data) => {
            if (data.success) {
              setHistoriales((prev) => prev.filter((h) => h.id_historial !== id_historial));
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El historial clínico ha sido eliminado correctamente.",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "No se pudo eliminar el historial.",
              });
            }
          })
          .catch((err) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Error eliminando el historial clínico.",
            });
            console.error("Error eliminando el historial clínico:", err);
          });
      }
    });
  };

  // --- Alerta temporal ---
  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  if (loading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  // --- Vista general ---
  if (!detalle) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#0aa6b7] focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Alerta */}
        <AnimatePresence>
          {alerta && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                alerta.tipo === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {alerta.mensaje}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabla */}
        <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block">
          <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
            <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
              <tr>
                {["Paciente", "Motivo", "Diagnóstico", "Fecha", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left font-medium text-gray-500 text-xs uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No se encontraron historiales clínicos disponibles.
                  </td>
                </tr>
              ) : (
                filtrados.map((h, index) => (
                  <tr
                    key={h.id_historial || index}
                    className="border-b border-gray-300/50 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{h.paciente || "Sin nombre"}</td>
                    <td className="py-3 px-4" title={h.motivo_consulta}>
                      {h.motivo_consulta?.length > 50
                        ? `${h.motivo_consulta.substring(0, 50)}...`
                        : h.motivo_consulta || "Sin motivo"}
                    </td>
                    <td className="py-3 px-4">{h.diagnostico || "Sin diagnóstico"}</td>
                    <td className="py-3 px-4">{h.fecha_cita || "Sin fecha"}</td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa] hover:shadow-md transition"
                        onClick={() => fetchHistorialDetails(h.id_historial)}
                        title="Ver Detalle"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#e63946] hover:bg-[#f8d7da] hover:shadow-md transition"
                        onClick={() => deleteHistorial(h.id_historial)}
                        title="Eliminar historial"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- Vista detalle ---
  return (
    <PatientDetails
      patient={detalle}
      recetas={[]}
      onBack={() => setDetalle(null)}
    />
  );
}
