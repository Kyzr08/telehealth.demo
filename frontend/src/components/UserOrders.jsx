import { memo, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Package, Truck, CalendarClock, AlertCircle, ShoppingBag, Star } from "lucide-react";
import { generateTrackingCode } from "../utils/tracking";

const statusStyles = {
  Pagado: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Procesando: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Preparando: "bg-blue-50 text-blue-600 border-blue-100",
  Enviado: "bg-sky-50 text-sky-600 border-sky-100",
  "En camino": "bg-cyan-50 text-cyan-600 border-cyan-100",
  Entregado: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Cancelado: "bg-rose-50 text-rose-600 border-rose-100",
};

const paymentStyles = {
  Pagado: "text-emerald-600",
  Pendiente: "text-amber-600",
  Fallido: "text-rose-600",
};

function formatDateTime(value) {
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

const ORDERS_PER_PAGE = 3;
export default function UserOrders({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewsMap, setReviewsMap] = useState({});
  const [orderPage, setOrderPage] = useState(0);
  const [isOrderPending, startOrderTransition] = useTransition();

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost/telehealth/backend/api/UserPHP/orders.php?id_usuario=${userId}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "No se pudieron obtener tus pedidos.");
        }

        if (isMounted) {
          setOrders(Array.isArray(data.pedidos) ? data.pedidos : []);
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          setError(err.message || "Ocurrió un error inesperado.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    const controller = new AbortController();

    async function loadReviews() {
      try {
        const res = await fetch(
          `http://localhost/telehealth/backend/api/UserPHP/reviews.php?id_usuario=${userId}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "No se pudieron obtener tus reseñas.");
        }

        if (isMounted) {
          const map = {};
          (data.reviews || []).forEach((review) => {
            const key = `${review.id_pedido || "0"}_${review.id_producto}`;
            map[key] = {
              calificacion: review.calificacion,
              comentario: review.comentario || "",
              fecha: review.fecha,
            };
          });
          setReviewsMap(map);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error cargando reseñas:", err);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId]);

  useEffect(() => {
    setOrderPage(0);
  }, [orders.length]);

  const handleSubmitReview = useCallback(
    async ({ productId, orderId, rating, comment }) => {
      if (!userId) {
        throw new Error("El usuario no es válido.");
      }

      const res = await fetch("http://localhost/telehealth/backend/api/UserPHP/reviews.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: userId,
          id_producto: productId,
          id_pedido: orderId,
          calificacion: rating,
          comentario: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo guardar la reseña.");
      }

      const reviewKey = `${orderId}_${productId}`;
      setReviewsMap((prev) => ({
        ...prev,
        [reviewKey]: {
          calificacion: rating,
          comentario: comment.trim(),
          fecha: new Date().toISOString(),
        },
      }));
    },
    [userId]
  );

  if (!userId) {
    return null;
  }

  const totalOrderPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = orderPage * ORDERS_PER_PAGE;
    return orders.slice(start, start + ORDERS_PER_PAGE);
  }, [orderPage, orders]);

  const handleOrderPrev = useCallback(() => {
    startOrderTransition(() => {
      setOrderPage((prev) => Math.max(0, prev - 1));
    });
  }, [startOrderTransition]);

  const handleOrderNext = useCallback(() => {
    startOrderTransition(() => {
      setOrderPage((prev) => Math.min(totalOrderPages - 1, prev + 1));
    });
  }, [startOrderTransition, totalOrderPages]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Seguimiento de pedidos</h2>
          <p className="text-sm text-slate-500">
            Revisa el estado de tus compras y el historial de actualizaciones.
          </p>
        </div>
      </header>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
          <Loader2 size={20} className="animate-spin" />
          <span>Cargando tus pedidos...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-rose-600">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">No se pudieron cargar tus pedidos</p>
            <p className="text-sm text-rose-500/80">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && !hasOrders && (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Package size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Aún no tienes pedidos registrados</h3>
          <p className="mt-2 text-sm text-slate-500">
            Cuando realices una compra podrás ver aquí su progreso y detalles.
          </p>
        </div>
      )}

      {!loading && !error && hasOrders && (
        <div className="space-y-4">
          {orders.length > ORDERS_PER_PAGE && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
              <span>
                Mostrando pedidos {orderPage * ORDERS_PER_PAGE + 1}-
                {Math.min((orderPage + 1) * ORDERS_PER_PAGE, orders.length)} de {orders.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOrderPrev}
                  disabled={orderPage === 0}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
                >
                  Anterior
                </button>
                <span className="hidden sm:inline">
                  Página {orderPage + 1} de {totalOrderPages}
                </span>
                <button
                  type="button"
                  onClick={handleOrderNext}
                  disabled={orderPage >= totalOrderPages - 1}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id_pedido}
                order={order}
                reviewsMap={reviewsMap}
                onSubmitReview={handleSubmitReview}
              />
            ))}
            {isOrderPending && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                <span>Actualizando pedidos...</span>
              </div>
            )}
          </div>

          {orders.length > ORDERS_PER_PAGE && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
              <span>
                Mostrando pedidos {orderPage * ORDERS_PER_PAGE + 1}-
                {Math.min((orderPage + 1) * ORDERS_PER_PAGE, orders.length)} de {orders.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOrderPrev}
                  disabled={orderPage === 0}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
                >
                  Anterior
                </button>
                <span className="hidden sm:inline">
                  Página {orderPage + 1} de {totalOrderPages}
                </span>
                <button
                  type="button"
                  onClick={handleOrderNext}
                  disabled={orderPage >= totalOrderPages - 1}
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const OrderCard = memo(function OrderCard({ order, reviewsMap, onSubmitReview }) {
  const statusClass = statusStyles[order.estado_pedido] || "bg-slate-100 text-slate-600 border-slate-200";
  const paymentClass = paymentStyles[order.estado_pago] || "text-slate-500";

  const lastUpdate = useMemo(() => {
    if (order.historial?.length) {
      return order.historial[order.historial.length - 1]?.fecha;
    }
    return order.fecha_pago;
  }, [order.historial, order.fecha_pago]);

  const items = useMemo(() => (Array.isArray(order.items) ? order.items : []), [order.items]);

  const itemsCount = useMemo(
    () => items.reduce((acc, item) => acc + (item.cantidad ?? 0), 0),
    [items]
  );

  const trackingCode = useMemo(() => generateTrackingCode(order.id_pedido, order.fecha_pago), [order.id_pedido, order.fecha_pago]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Truck size={18} />
              <span className="text-sm font-medium text-slate-500">Pedido</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{trackingCode}</h3>
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${statusClass}`}>
              {order.estado_pedido || "Sin estado"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Total: <span className="font-semibold text-slate-800">S/ {(order.total ?? 0).toFixed(2)}</span></span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <ShoppingBag size={14} /> {itemsCount} {itemsCount === 1 ? "artículo" : "artículos"}
            </span>
            {order.metodo_pago && (
              <span className="text-xs text-slate-400">
                {order.metodo_pago}
                {order.estado_pago && <span className={`ml-2 font-medium ${paymentClass}`}>{order.estado_pago}</span>}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarClock size={16} />
          <span>{formatDateTime(lastUpdate)}</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <OrderProducts
          orderId={order.id_pedido}
          items={items}
          reviewsMap={reviewsMap}
          isDelivered={order.estado_pedido === "Entregado"}
          onSubmitReview={onSubmitReview}
        />
        <OrderTimeline historial={order.historial} fechaPago={order.fecha_pago} />
      </div>
    </article>
  );
});

const OrderTimeline = memo(function OrderTimeline({ historial, fechaPago }) {
  const hasHistorial = Array.isArray(historial) && historial.length > 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
      <h4 className="text-sm font-semibold text-slate-700">Historial de estados</h4>
      <div className="mt-4 space-y-4">
        {hasHistorial ? (
          historial.map((item) => (
            <div key={item.id_historial} className="relative pl-6 text-sm text-slate-500">
              <span className="absolute left-0 top-0 flex h-4 w-4 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-[#0aa6b7]"></span>
              </span>
              <p className="font-medium text-slate-700">{item.estado_nuevo}</p>
              <p className="text-xs text-slate-400">{formatDateTime(item.fecha)}</p>
              {item.estado_anterior && (
                <p className="text-xs text-slate-400/80">Cambio desde {item.estado_anterior || "-"}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            Este pedido aún no tiene historial registrado.
            {fechaPago && (
              <span className="block text-xs text-slate-300">Pago registrado el {formatDateTime(fechaPago)}.</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
});

const ITEMS_PER_PAGE = 3;

const OrderProducts = memo(function OrderProducts({ orderId, items, reviewsMap, isDelivered, onSubmitReview }) {
  const [page, setPage] = useState(0);
  const [isPagePending, startProductsTransition] = useTransition();

  const productPages = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
      pages.push(items.slice(i, i + ITEMS_PER_PAGE));
    }
    return pages;
  }, [items]);

  const totalPages = productPages.length;

  useEffect(() => {
    setPage(0);
  }, [items.length]);

  const currentItems = productPages[Math.min(page, totalPages - 1)] ?? [];

  const handlePrev = useCallback(() => {
    startProductsTransition(() => {
      setPage((prev) => Math.max(0, prev - 1));
    });
  }, [startProductsTransition]);

  const handleNext = useCallback(() => {
    startProductsTransition(() => {
      setPage((prev) => Math.min(totalPages - 1, prev + 1));
    });
  }, [startProductsTransition, totalPages]);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>Productos del pedido</span>
        {items.length > ITEMS_PER_PAGE && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page === 0 || isPagePending}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
            >
              Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages - 1 || isPagePending}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {currentItems.map((item) => (
          <ProductReview
            key={`${orderId}-${item.id_producto}`}
            orderId={orderId}
            item={item}
            existingReview={reviewsMap[`${orderId}_${item.id_producto}`]}
            isDelivered={isDelivered}
            onSubmitReview={onSubmitReview}
          />
        ))}
        {isPagePending && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            <span>Actualizando productos...</span>
          </div>
        )}
      </div>

      {items.length > ITEMS_PER_PAGE && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Mostrando {page * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE + currentItems.length, items.length)} de {items.length}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page === 0 || isPagePending}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages - 1 || isPagePending}
              className="rounded-full border border-slate-200 px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

const ProductReview = memo(function ProductReview({ orderId, item, existingReview, isDelivered, onSubmitReview }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.calificacion ?? 0);
  const [comment, setComment] = useState(existingReview?.comentario ?? "");
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRating(existingReview?.calificacion ?? 0);
      setComment(existingReview?.comentario ?? "");
    }
  }, [existingReview, isOpen]);

  const togglePanel = useCallback(() => {
    if (!isDelivered) return;
    setIsOpen((prev) => !prev);
    setHoverRating(0);
  }, [isDelivered]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (rating < 1 || rating > 5) {
        return;
      }

      try {
        setSaving(true);
        await onSubmitReview({
          productId: item.id_producto,
          orderId,
          rating,
          comment,
        });
        setIsOpen(false);
        setHoverRating(0);
      } catch (err) {
        console.error("Error guardando reseña:", err);
        alert(err.message || "No se pudo guardar la reseña. Inténtalo nuevamente.");
      } finally {
        setSaving(false);
      }
    },
    [comment, item.id_producto, onSubmitReview, orderId, rating]
  );

  const displayReview = existingReview ?? { calificacion: 0, comentario: "" };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200">
          {item.imagen ? (
            <img src={item.imagen} alt={item.nombre} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
              <Package size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1 text-sm">
          <p className="font-medium text-slate-900">{item.nombre}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Cant. {item.cantidad}</span>
            <span>Unitario S/ {item.precio_unitario?.toFixed(2)}</span>
            <span className="font-medium text-slate-700">Subtotal S/ {item.subtotal?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const activeStar = displayReview.calificacion >= value;
            return <Star key={value} size={16} className={activeStar ? "text-amber-500 fill-amber-500" : "text-slate-200"} />;
          })}
          <span>
            {displayReview.calificacion
              ? `Calificación: ${displayReview.calificacion}/5`
              : "Sin reseña todavía"}
          </span>
        </div>
        {displayReview.comentario && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
            “{displayReview.comentario}”
          </p>
        )}
      </div>

      {isDelivered && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={togglePanel}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#0aa6b7] hover:text-[#0aa6b7]"
          >
            {isOpen ? "Cerrar reseña" : displayReview.calificacion ? "Editar reseña" : "Dejar reseña"}
          </button>

          {isOpen && (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <div className="space-y-2">
                <label className="flex items-center justify-between font-semibold text-slate-500">
                  Calificación
                  <span className="text-[11px] text-slate-400">Requerido</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-white px-3 py-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const activeStar = value <= (hoverRating || rating);
                    return (
                      <button
                        type="button"
                        key={value}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(value)}
                        className="transition"
                      >
                        <Star
                          size={22}
                          className={activeStar ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 font-medium text-amber-500">
                    {rating > 0 ? `${rating}/5` : "Selecciona"}
                  </span>
                </div>
                {rating === 0 && <p className="text-rose-500">Selecciona una calificación.</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Comentario (opcional)</label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Comparte tu experiencia"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-600 focus:border-[#0aa6b7] focus:outline-none focus:ring-1 focus:ring-[#0aa6b7]"
                />
                <div className="text-right text-[11px] text-slate-400">{comment.length}/300</div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={togglePanel}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-600 transition hover:border-slate-400"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-[#0aa6b7] px-4 py-2 font-semibold text-white transition hover:bg-[#078292] disabled:cursor-not-allowed disabled:opacity-80"
                  disabled={saving || rating === 0}
                >
                  {saving ? "Guardando..." : "Guardar reseña"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
});
