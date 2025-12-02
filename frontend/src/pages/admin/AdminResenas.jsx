import { useEffect, useMemo, useState } from "react";
import { Loader2, Star } from "lucide-react";

export default function AdminResenas() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("Todos");

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/reviews.php");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudieron obtener las reseñas.");
      }

      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err) {
      console.error("Error cargando reseñas:", err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        term.length === 0 ||
        `${review.usuario?.nombre || ""} ${review.usuario?.apellido || ""}`
          .toLowerCase()
          .includes(term) ||
        (review.usuario?.correo || "").toLowerCase().includes(term) ||
        (review.producto?.nombre || "").toLowerCase().includes(term);

      const matchesRating =
        ratingFilter === "Todos" || review.calificacion === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const ratingOptions = ["Todos", 5, 4, 3, 2, 1];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Reseñas de productos</h1>
          <p className="text-sm text-gray-500">
            Supervisa opiniones de usuarios y calidad de productos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 w-full sm:w-auto sm:grid-cols-[minmax(0,240px)_minmax(0,160px)] sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario o producto"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#0aa6b7] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7]/30"
          />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#0aa6b7] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7]/30"
          >
            {ratingOptions.map((option) => (
              <option key={option} value={option}>
                {option === "Todos" ? "Todas las calificaciones" : `${option} estrellas`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ESTADOS */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2 text-sm">Cargando reseñas...</span>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-rose-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchReviews}
            className="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-500 transition hover:border-rose-300 hover:text-rose-600"
          >
            Reintentar
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-500">
          <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium">
            Sin reseñas
          </span>
          <p className="text-sm text-gray-500">
            No encontramos reseñas con esos criterios.
          </p>
        </div>
      ) : (
        <>
          {/* TABLA (Escritorio) */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full border-collapse text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  {["Usuario", "Producto", "Calificación", "Comentario", "Fecha"].map(
                    (header) => (
                      <th
                        key={header}
                        className="py-3 px-4 text-left font-medium text-gray-500 text-xs uppercase"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <tr
                    key={review.id_resena}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    {/* Usuario */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {`${review.usuario?.nombre || ""} ${review.usuario?.apellido || ""}`.trim() || "Usuario"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {review.usuario?.correo || "--"}
                        </span>
                      </div>
                    </td>

                    {/* Producto */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
                          {review.producto?.imagen ? (
                            <img
                              src={review.producto.imagen}
                              alt={review.producto?.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                              <Star className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">
                          {review.producto?.nombre || "Producto"}
                        </span>
                      </div>
                    </td>

                    {/* Calificación */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const value = index + 1;
                          return (
                            <Star
                              key={value}
                              className={
                                value <= review.calificacion
                                  ? "h-4 w-4 text-amber-500 fill-amber-500"
                                  : "h-4 w-4 text-gray-200"
                              }
                            />
                          );
                        })}
                        <span className="text-xs text-gray-400 ml-1">
                          {review.calificacion}/5
                        </span>
                      </div>
                    </td>

                    {/* Comentario */}
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {review.comentario ? (
                        <span className="inline-flex rounded-xl bg-gray-50 px-3 py-1 text-xs text-gray-500">
                          “{review.comentario}”
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin comentario</span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {new Date(review.fecha).toLocaleString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS (Móvil) */}
          <div className="sm:hidden space-y-3 mt-3">
            {filteredReviews.map((review) => (
              <div
                key={review.id_resena}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {`${review.usuario?.nombre || ""} ${review.usuario?.apellido || ""}`.trim()}
                    </p>
                    <p className="text-xs text-gray-400">{review.usuario?.correo}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(review.fecha).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-200">
                    {review.producto?.imagen ? (
                      <img
                        src={review.producto.imagen}
                        alt={review.producto?.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                        <Star className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {review.producto?.nombre}
                    </p>

                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        return (
                          <Star
                            key={value}
                            className={
                              value <= review.calificacion
                                ? "h-4 w-4 text-amber-500 fill-amber-500"
                                : "h-4 w-4 text-gray-200"
                            }
                          />
                        );
                      })}
                      <span className="text-xs text-gray-400 ml-1">
                        {review.calificacion}/5
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  {review.comentario ? `“${review.comentario}”` : "Sin comentario"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
