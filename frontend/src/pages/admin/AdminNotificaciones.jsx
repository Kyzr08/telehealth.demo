import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost/telehealth/backend/api/AdminPHP/notificaciones.php")
      .then((res) => (res.ok ? res.json() : Promise.reject("Error al obtener los datos")))
      .then((data) => {
        if (!data?.success) {
          throw data?.message || "Error al obtener los datos";
        }
        setNotificaciones(data.notificaciones || []);
      })
      .catch((err) => {
        console.error("Error cargando notificaciones:", err);
        setError(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof err === "string" ? err : "No se pudo cargar la lista de notificaciones.",
          confirmButtonColor: "#d33",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const notificacionesFiltradas = notificaciones;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      {loading ? (
        <p className="text-sm text-gray-500">Cargando notificaciones...</p>
      ) : error ? (
        <p className="text-sm text-red-500">No se pudo cargar la información.</p>
      ) : !notificaciones.length ? (
        <p className="text-sm text-gray-500">No se encontraron notificaciones registradas.</p>
      ) : (
        <>

          {/* Tabla (solo escritorio) */}
          <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block admin-table-responsive">
            <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
              <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
                <tr>
                  {["Usuario", "Tipo", "Mensaje", "Fecha"].map((h) => (
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
                {notificacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No se encontraron notificaciones con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  notificacionesFiltradas.map((n) => (
                    <tr
                      key={n.id}
                      className="hover:bg-gray-50 transition-all rounded-lg"
                    >
                      <td className="py-3 px-4 border-b border-gray-100 font-semibold text-gray-800">
                        {n.usuario}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100">{n.tipo || "General"}</td>
                      <td className="py-3 px-4 border-b border-gray-100">{n.mensaje}</td>
                      <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-500">
                        {new Date(n.fecha).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cards (versión móvil) */}
          <div className="sm:hidden flex-1 overflow-y-auto flex flex-col gap-3 mt-2 pr-1">
            {notificacionesFiltradas.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No se encontraron notificaciones con los filtros seleccionados.
              </div>
            ) : (
              notificacionesFiltradas.map((n) => (
                <div
                  key={n.id}
                  className="border border-gray-300/50 rounded-xl p-4 shadow-sm bg-white"
                >
                  <div className="mb-3">
                    <p className="font-semibold text-gray-800">{n.usuario}</p>
                    <p className="text-xs text-gray-500">{n.tipo || "General"}</p>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <p className="mb-2">{n.mensaje}</p>
                    <p className="text-xs text-gray-400">
                      Registrado el {new Date(n.fecha).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <style>{`
            @media (min-width: 820px) and (max-width: 1180px),
                   (min-width: 768px) and (max-width: 1024px) {
              .admin-table-responsive { display: none !important; }
              .admin-cards-responsive { display: flex !important; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
