import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Bell, Edit } from "lucide-react";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function AdminCitas() {
  const [citas, setCitas] = useState([]);
  const [tipos, setTipos] = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [menuVisible, setMenuVisible] = useState(null); // Estado para controlar el menú desplegable

  const estados = ["Todos", "Reservada", "Confirmada", "Cancelada", "Realizada"];

  useEffect(() => {
    fetch("http://localhost/telehealth/backend/api/AdminPHP/getCitas.php")
      .then((res) => (res.ok ? res.json() : Promise.reject("Error al obtener los datos")))
      .then((data) => {
        setCitas(data.citas);
        setTipos(["Todos", ...data.tipos.map((tipo) => tipo.nombre_tipo)]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const toggleMenu = (id) => {
    setMenuVisible((prev) => (prev === id ? null : id)); // Alternar visibilidad del menú
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest(".dropdown-menu") && !event.target.closest(".menu-button")) {
      setMenuVisible(null); // Cerrar el menú si se hace clic fuera
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Actualiza el estado de la cita en la base de datos
  const actualizarEstado = async (id, nuevoEstado) => {
    const mensajes = {
      Confirmada: "¿Estás seguro de confirmar esta cita?",
      Cancelada: "¿Estás seguro de cancelar esta cita?",
    };

    if (nuevoEstado === "Reprogramada") return; // Se maneja aparte

    const accion = nuevoEstado === "Confirmada" ? "confirmar"
      : nuevoEstado === "Cancelada" ? "cancelar"
      : nuevoEstado === "Realizada" ? "realizada"
      : null;

    if (!accion) return;

    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: mensajes[nuevoEstado] || '¿Deseas continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0aa6b7',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'No, cancelar'
    });
    if (confirm.isConfirmed) {
      try {
        const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/accionCita.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion, id_cita: id })
        });
        const data = await res.json();
        if (data.success) {
          setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)));
          Swal.fire({
            icon: "success",
            title: "Estado actualizado",
            text: `La cita ha sido marcada como ${nuevoEstado}.`,
          });
        } else {
          Swal.fire({ icon: "error", title: "Error", text: data.message || "No se pudo actualizar." });
        }
      } catch (e) {
        Swal.fire({ icon: "error", title: "Error", text: "Error de conexión con el servidor." });
      }
    }
  };

  // Reprograma la cita en la base de datos
  const reprogramarCita = async (id) => {
    const fecha = new Date();
    const minDate = fecha.toISOString().split('T')[0];

    const result = await Swal.fire({
      title: '¿Estás seguro de reprogramar esta cita?',
      icon: 'warning',
      html: `
        <div class="my-4">
          <input 
            type="datetime-local" 
            id="fecha" 
            class="swal2-input" 
            min="${minDate}T00:00"
            style="width: 90%; margin: 0; padding: 8px; border: 1px solid #d1d5db; border-radius: 0.375rem;"
          >
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, reprogramar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#0aa6b7',
      cancelButtonColor: '#ef4444',
      customClass: {
        popup: 'swal2-compact',
        container: 'swal2-compact'
      },
      preConfirm: () => {
        const fechaHora = document.getElementById('fecha').value;
        if (!fechaHora) {
          Swal.showValidationMessage('Por favor seleccione una fecha y hora');
        }
        return fechaHora;
      }
    });
    if (result.isConfirmed && result.value) {
      const [fecha, hora] = result.value.split('T');
      try {
        const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/accionCita.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "programar", id_cita: id, fecha, hora })
        });
        const data = await res.json();
        if (data.success) {
            setCitas((prev) => prev.map((c) =>
              c.id === id
                ? { ...c, estado: "Reservada", fecha, hora, fecha_realizacion: "" }
                : c
            ));
          Swal.fire({
            icon: 'success',
            title: 'Cita reprogramada',
            text: `La cita ha sido reprogramada para el ${fecha} a las ${hora}`,
          });
        } else {
          Swal.fire({ icon: "error", title: "Error", text: data.message || "No se pudo reprogramar." });
        }
      } catch (e) {
        Swal.fire({ icon: "error", title: "Error", text: "Error de conexión con el servidor." });
      }
    }
  };

  const enviarNotificacion = (id) => {
    const cita = citas.find((c) => c.id === id);
    Swal.fire({
      title: '¿Enviar notificación?',
      text: `¿Deseas enviar una notificación al paciente ${cita.paciente}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0aa6b7',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'No, cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Se ha enviado una notificación a ${cita.paciente} sobre su cita el ${cita.fecha} a las ${cita.hora}.`;
          const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/accionCita.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion: "notificar", id_cita: id, mensaje })
          });
          const data = await res.json();
          if (data.success) {
            Swal.fire({
              icon: "success",
              title: "Notificación enviada",
              text: mensaje,
            });
          } else {
            Swal.fire({ icon: "error", title: "Error", text: data.message || "No se pudo guardar la notificación." });
          }
        } catch (e) {
          Swal.fire({ icon: "error", title: "Error", text: "Error de conexión con el servidor." });
        }
      }
    });
  };

  // Marca la cita como realizada en la base de datos
  const marcarComoRealizada = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas marcar esta cita como realizada?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0aa6b7',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, marcar como realizada',
      cancelButtonText: 'No, cancelar'
    });
    if (confirm.isConfirmed) {
      try {
        const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/accionCita.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "realizada", id_cita: id })
        });
        const data = await res.json();
        if (data.success) {
          setCitas((prev) =>
            prev.map((c) =>
              c.id === id ? { ...c, estado: "Realizada", fecha_realizacion: data.fecha_realizacion } : c
            )
          );
          Swal.fire({
            icon: "success",
            title: "Cita realizada",
            text: `La cita ha sido marcada como realizada el ${data.fecha_realizacion}.`,
          });
        } else {
          Swal.fire({ icon: "error", title: "Error", text: data.message || "No se pudo actualizar." });
        }
      } catch (e) {
        Swal.fire({ icon: "error", title: "Error", text: "Error de conexión con el servidor." });
      }
    }
  };

  const citasFiltradas = citas.filter((c) => {
    return (
      (c.paciente.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.medico.toLowerCase().includes(busqueda.toLowerCase())) &&
      (tipoFiltro === "Todos" || c.tipo === tipoFiltro) &&
      (estadoFiltro === "Todos" || c.estado === estadoFiltro)
    );
  });

  if (loading) return <p>Cargando citas...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!citas.length) return <p>No hay citas disponibles.</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="flex w-full sm:w-auto gap-2">
          <div
            className="flex items-center border border-gray-300 rounded-xl px-3 py-2 flex-1 min-w-[150px] sm:min-w-[500px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#0aa6b7] transition-all"
          >
            <input
              type="text"
              placeholder="Buscar por paciente o médico..."
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
            {estados.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block">
        <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
          <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
            <tr>
              {["Paciente", "Médico", "Tipo", "Fecha", "Estado", "Fecha realizada", "Acciones"].map((h) => (
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
            {citasFiltradas.map(({ id, paciente, medico, tipo, fecha, fecha_realizacion, estado }) => (
              <tr key={id} className="hover:bg-gray-50 transition-all rounded-lg">
                <td className="py-3 px-4 border-b border-gray-100">{paciente}</td>
                <td className="py-3 px-4 border-b border-gray-100">{medico}</td>
                <td className="py-3 px-4 border-b border-gray-100">{tipo}</td>
                <td className="py-3 px-4 border-b border-gray-100">
                  {fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
                    ? (() => {
                        const [y, m, d] = fecha.split('-');
                        return `${d}/${m}/${y}`;
                      })()
                    : fecha}
                </td>
                <td className="py-3 px-4 border-b border-gray-100">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${estado === "Confirmada"
                        ? "bg-green-100 text-green-700"
                        : estado === "Cancelada"
                        ? "bg-red-100 text-red-700"
                        : estado === "Reservada"
                        ? "bg-blue-100 text-blue-700"
                        : estado === "Realizada"
                        ? "bg-[#0aa6b7] text-white"
                        : "bg-gray-200 text-gray-600"}
                    `}
                  >
                    {estado}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-gray-100">
                  {fecha_realizacion
                    ? (() => {
                        // Si viene en formato yyyy-mm-dd hh:mm:ss, convertir
                        if (/^\d{4}-\d{2}-\d{2} /.test(fecha_realizacion)) {
                          const [fechaSQL, horaSQL] = fecha_realizacion.split(' ');
                          const [y, m, d] = fechaSQL.split('-');
                          const [h, min] = horaSQL.split(':');
                          return `${d}/${m}/${y} ${h}:${min}`;
                        }
                        // Si ya está en formato dd/mm/yyyy hh:mm, mostrar tal cual
                        if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(fecha_realizacion)) {
                          return fecha_realizacion;
                        }
                        return fecha_realizacion;
                      })()
                    : "-"}
                </td>
                <td className="py-3 px-4 border-b border-gray-100">
                  <div className="relative">
                    <button
                      className="menu-button w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-gray-700 hover:bg-gray-100 hover:shadow-md transition"
                      onClick={() => toggleMenu(id)}
                    >
                      ⋮
                    </button>
                    {menuVisible === id && (
                      <div
                        className="dropdown-menu absolute bg-white border border-gray-200 rounded-lg shadow-lg"
                        style={{ zIndex: 10, top: "100%", right: "0" }}
                      >
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => actualizarEstado(id, "Confirmada")}
                        >
                          Confirmar
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => actualizarEstado(id, "Cancelada")}
                        >
                          Cancelar
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => reprogramarCita(id)}
                        >
                          Reprogramar
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => enviarNotificacion(id)}
                        >
                          Notificar
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => marcarComoRealizada(id)}
                        >
                          Realizada
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden flex flex-col gap-4 mt-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {citas.map(({ id, paciente, medico, tipo, fecha, fecha_realizacion, estado }) => (
          <div key={id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
            <p className="font-semibold text-gray-800">{paciente}</p>
            <p className="text-sm text-gray-500">{medico}</p>
            <p className="text-sm text-gray-500">{tipo}</p>
            <p className="text-sm text-gray-500">Fecha: {fecha}</p>
            <p className="text-sm text-gray-500">Estado: {estado}</p>
            <p className="text-sm text-gray-500">Fecha realizada: {fecha_realizacion || "-"}</p>
            <div className="flex gap-2 mt-3 justify-end">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa]"
                onClick={() => actualizarEstado(id, "Confirmada")}
              >
                <CheckCircle size={18} />
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-red-500 hover:bg-red-100"
                onClick={() => actualizarEstado(id, "Cancelada")}
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
