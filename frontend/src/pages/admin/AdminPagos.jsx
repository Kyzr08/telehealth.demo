import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [metodoFiltro, setMetodoFiltro] = useState("Todos");

  const metodos = ["Todos", "Tarjeta Crédito", "Tarjeta Débito", "PayPal"];

  useEffect(() => {
    fetch("http://localhost/telehealth/backend/api/AdminPHP/pagos.php")
      .then((res) => (res.ok ? res.json() : Promise.reject("Error al obtener los datos")))
      .then((data) => {
        if (!data?.success) {
          throw data?.message || "Error al obtener los datos";
        }
        setPagos(data.pagos || []);
      })
      .catch((err) => {
        console.error("Error cargando pagos:", err);
        setError(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof err === "string" ? err : "No se pudo cargar la lista de pagos.",
          confirmButtonColor: "#d33",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const pagosEnriquecidos = useMemo(
    () =>
      (pagos || []).map((pago) => {
        const items = Array.isArray(pago.items) ? pago.items : [];
        const resumenProductos = items
          .map((item) => `${item.nombre ?? "Producto"} (x${item.cantidad ?? 0})`)
          .join(", ");
        const cantidadTotal = items.reduce((acc, item) => acc + (item.cantidad ?? 0), 0);
        const monto = Number.isFinite(pago.monto) ? pago.monto : Number(pago.monto) || 0;

        return {
          ...pago,
          items,
          resumenProductos,
          cantidadTotal,
          monto,
          usuario: pago.usuario ?? "",
          metodo: pago.metodo ?? "",
          estado: pago.estado ?? "",
          fecha: pago.fecha ?? null,
        };
      }),
    [pagos]
  );

  const pagosFiltrados = pagosEnriquecidos.filter((pago) => {
    const termino = busqueda.toLowerCase();
    const coincideBusqueda =
      pago.usuario.toLowerCase().includes(termino) ||
      pago.metodo.toLowerCase().includes(termino) ||
      pago.resumenProductos.toLowerCase().includes(termino);

    const coincideMetodo = metodoFiltro === "Todos" || pago.metodo === metodoFiltro;
    return coincideBusqueda && coincideMetodo;
  });

  const estadoColor = (estado) => {
    switch (estado) {
      case "Pagado":
        return "text-green-600 font-medium";
      case "Fallido":
        return "text-red-600 font-medium";
      default:
        return "text-yellow-600 font-medium";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">

      {loading ? (
        <p className="text-sm text-gray-500">Cargando pagos...</p>
      ) : error ? (
        <p className="text-sm text-red-500">No se pudo cargar la información.</p>
      ) : !pagos.length ? (
        <p className="text-sm text-gray-500">No se encontraron pagos registrados.</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sticky top-0 bg-white z-10 pb-2 admin-filtros-responsive">
            <div className="flex w-full sm:w-auto gap-2 admin-buscador-responsive">
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 flex-1 min-w-[150px] sm:min-w-[500px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#0aa6b7] transition-all">
                <input
                  type="text"
                  placeholder="Buscar por usuario, método o producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full sm:flex sm:flex-row sm:w-auto sm:gap-3 sm:ml-auto admin-combobox-responsive">
              <select
                value={metodoFiltro}
                onChange={(e) => setMetodoFiltro(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] text-gray-700 bg-white"
              >
                {metodos.map((metodo) => (
                  <option key={metodo}>{metodo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla (solo escritorio) */}
          <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block admin-table-responsive">
            <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
              <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
                <tr>
                  {["Usuario", "Productos", "Cantidad", "Monto", "Método", "Estado", "Fecha"].map((h) => (
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
                {pagosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No se encontraron pagos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  pagosFiltrados.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition-all rounded-lg"
                    >
                      {/* USUARIO */}
                      <td className="py-3 px-4 border-b border-gray-100 font-semibold text-gray-800">
                        {p.usuario}
                      </td>

                      {/* PRODUCTOS */}
                      <td className="py-3 px-4 border-b border-gray-100" title={p.resumenProductos}>
                        <span className="block max-w-[220px] truncate">{p.resumenProductos || "Sin productos"}</span>
                      </td>

                      {/* CANTIDAD */}
                      <td className="py-3 px-4 border-b border-gray-100">{p.cantidadTotal}</td>

                      {/* MONTO */}
                      <td className="py-3 px-4 border-b border-gray-100 font-medium">S/ {p.monto.toFixed(2)}</td>

                      {/* MÉTODO */}
                      <td className="py-3 px-4 border-b border-gray-100">{p.metodo}</td>

                      {/* ESTADO */}
                      <td className={`py-3 px-4 border-b border-gray-100 ${estadoColor(p.estado)}`}>{p.estado}</td>

                      {/* FECHA */}
                      <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-500">
                        {p.fecha
                          ? new Date(p.fecha).toLocaleString(undefined, {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cards (versión móvil) */}
          <div className="sm:hidden flex-1 overflow-y-auto flex flex-col gap-3 mt-2 pr-1">
            {pagosFiltrados.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No se encontraron pagos con los filtros seleccionados.
              </div>
            ) : (
              pagosFiltrados.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-300/50 rounded-xl p-4 shadow-sm bg-white"
                >
                  <div className="mb-3">
                    <p className="font-semibold text-gray-800">{p.usuario}</p>
                    <p className="text-xs text-gray-500" title={p.resumenProductos}>
                      <span className="inline-block max-w-[220px] align-middle truncate">{p.resumenProductos || "Sin productos"}</span>
                    </p>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <p>
                      <strong>Monto:</strong> S/ {p.monto.toFixed(2)}
                    </p>
                    <p>
                      <strong>Cantidad:</strong> {p.cantidadTotal}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      <span className={estadoColor(p.estado)}>{p.estado}</span>
                    </p>
                    <p>
                      <strong>Método:</strong> {p.metodo}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Registrado el
                      {p.fecha
                        ? new Date(p.fecha).toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
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
