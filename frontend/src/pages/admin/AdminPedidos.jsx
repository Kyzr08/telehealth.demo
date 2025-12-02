import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { generateTrackingCode } from "../../utils/tracking";
import Swal from "sweetalert2";

const ESTADOS = [
  "Pagado",
  "Procesando",
  "Preparando",
  "Enviado",
  "En camino",
  "Entregado",
  "Cancelado",
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(ESTADOS[0]);
  const [updating, setUpdating] = useState(false);

  const adminData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("usuario");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        id: parsed?.id_usuario ?? parsed?.id ?? null,
        nombre: parsed?.nombres || parsed?.nombre || "",
        apellido: parsed?.apellidos || parsed?.apellido || "",
      };
    } catch (err) {
      console.error("Error parsing admin session", err);
      return null;
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/orders.php");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo obtener la lista de pedidos.");
      }

      setOrders(Array.isArray(data.pedidos) ? data.pedidos : []);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setError(err.message || "Error desconocido");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo cargar la lista de pedidos.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "Todos") {
      return orders;
    }
    return orders.filter((order) => order.estado_pedido === statusFilter);
  }, [orders, statusFilter]);

  const openModal = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order?.estado_pedido || ESTADOS[0]);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setSelectedStatus(ESTADOS[0]);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (!adminData?.id) {
      Swal.fire({
        icon: "warning",
        title: "Sesión inválida",
        text: "No se encontró el usuario administrador en sesión.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    if (selectedStatus === selectedOrder.estado_pedido) {
      Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "El pedido ya se encuentra en el estado seleccionado.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/orders.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pedido: selectedOrder.id_pedido,
          nuevo_estado: selectedStatus,
          admin_id: adminData.id,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo actualizar el estado del pedido.");
      }

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: data.message || "Se guardaron los cambios correctamente.",
        confirmButtonColor: "#0aa6b7",
      });

      closeModal();
      fetchOrders();
    } catch (err) {
      console.error("Error actualizando estado del pedido:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo actualizar el estado del pedido.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Gestión de pedidos</h1>
          <p className="text-sm text-gray-500">
            Visualiza el estado de cada pedido y actualiza su avance en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 w-full sm:flex sm:flex-row sm:w-auto sm:gap-3 sm:items-center sm:justify-end">
          <span className="hidden sm:flex items-center text-sm font-semibold text-gray-700">
            <Filter className="h-4 w-4 mr-1 text-gray-500" />
            Filtros:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] bg-white text-gray-700"
          >
            <option value="Todos">Todos los estados</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-gray-500">Cargando pedidos...</div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-rose-500">No se pudo cargar la información.</div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500">
          <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium">Sin resultados</span>
          <p className="text-sm text-gray-500">No encontramos pedidos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block">
            <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
              <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
                <tr>
                  {[
                    "Tracking",
                    "Cliente",
                    "Productos",
                    "Total",
                    "Estado actual",
                    "Última actualización",
                    "Acciones",
                  ].map((header) => (
                    <th key={header} className="py-3 px-4 text-left font-medium text-gray-500 text-xs uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const lastUpdate = order.historial?.[order.historial.length - 1];
                  const itemsResumen = (order.items || [])
                    .map((item) => `${item.nombre} (x${item.cantidad})`)
                    .join(", ");

                  return (
                    <tr key={order.id_pedido} className="border-b border-gray-300/50 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {generateTrackingCode(order.id_pedido, order.fecha_pago)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {`${order.usuario?.nombre || ""} ${order.usuario?.apellido || ""}`.trim() || "Sin nombre"}
                          </span>
                          <span className="text-xs text-gray-400">{order.usuario?.correo || "Sin correo"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500" title={itemsResumen}>
                        <span className="block max-w-[220px] truncate">{itemsResumen || "Sin productos"}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">S/ {(order.total ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-full bg-[#0aa6b7]/10 px-3 py-1 text-xs font-semibold text-[#0aa6b7]">
                          {order.estado_pedido || "Sin estado"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">{formatDate(lastUpdate?.fecha || order.fecha_pago)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-start">
                          <button
                            type="button"
                            onClick={() => openModal(order)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0aa6b7] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#078292]"
                          >
                            Actualizar estado
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden flex-1 overflow-y-auto flex flex-col gap-3 mt-2 pr-1">
            {filteredOrders.map((order) => {
              const lastUpdate = order.historial?.[order.historial.length - 1];
              const itemsResumen = (order.items || [])
                .map((item) => `${item.nombre} (x${item.cantidad})`)
                .join(", ");

              return (
                <div key={order.id_pedido} className="border border-gray-300/50 rounded-xl p-4 shadow-sm bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {generateTrackingCode(order.id_pedido, order.fecha_pago)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {`${order.usuario?.nombre || ""} ${order.usuario?.apellido || ""}`.trim() || "Sin nombre"}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-[#0aa6b7]/10 px-3 py-1 text-xs font-semibold text-[#0aa6b7]">
                      {order.estado_pedido || "Sin estado"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <p className="font-medium">Total: S/ {(order.total ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1" title={itemsResumen}>
                      Productos: <span className="inline-block max-w-[220px] align-middle truncate">{itemsResumen || "Sin productos"}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Última actualización: {formatDate(lastUpdate?.fecha || order.fecha_pago)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(order)}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#0aa6b7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078292]"
                  >
                    Actualizar estado
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Actualizar estado del pedido</h2>
              <p className="text-sm text-gray-500">
                Tracking {generateTrackingCode(selectedOrder.id_pedido, selectedOrder.fecha_pago)} — Cliente: {`${selectedOrder.usuario?.nombre || ""} ${selectedOrder.usuario?.apellido || ""}`.trim() || "Sin nombre"}
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Estado actual
                </label>
                <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-600">
                  {selectedOrder.estado_pedido || "Sin estado"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nuevo estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#0aa6b7] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7]/30"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0aa6b7] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078292] disabled:cursor-not-allowed disabled:opacity-80"
                  disabled={updating}
                >
                  {updating ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
