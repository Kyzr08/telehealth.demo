import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  UserCircle,
  Video,
  MapPin,
  RefreshCw,
  CreditCard,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_CITAS = "http://localhost/telehealth/backend/api/UserPHP/citas.php";

export default function UserAppointments({ userId }) {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionLoading, setAccionLoading] = useState(null);
  const [joinLoading, setJoinLoading] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCitas = useCallback(async () => {
    if (!userId) {
      setCitas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_CITAS}?accion=mis_citas&id_usuario=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCitas(data.citas || []);
      } else {
        setError(data.message || "No se pudieron obtener tus citas.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const parseFechaHora = useCallback((cita) => {
    if (!cita?.fecha || !cita?.hora) return null;
    const horaNormalizada = cita.hora.length === 5 ? `${cita.hora}:00` : cita.hora;
    const fechaISO = /\d{4}-\d{2}-\d{2}/.test(cita.fecha)
      ? cita.fecha
      : cita.fecha.split("/").reverse().join("-");
    const fechaHora = new Date(`${fechaISO}T${horaNormalizada}`);
    return Number.isNaN(fechaHora.getTime()) ? null : fechaHora;
  }, []);

  const estadoBadge = (estado) => {
    const base = "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide";
    switch (estado) {
      case "Confirmada":
        return `${base} border-emerald-200 bg-emerald-50 text-emerald-600`;
      case "Reservada":
        return `${base} border-cyan-200 bg-cyan-50 text-cyan-600`;
      case "Cancelada":
        return `${base} border-rose-200 bg-rose-50 text-rose-600`;
      case "Realizada":
        return `${base} border-slate-200 bg-slate-50 text-slate-600`;
      default:
        return `${base} border-gray-200 bg-gray-50 text-gray-500`;
    }
  };

  const modoIcon = (modo) => {
    if (!modo) return <RefreshCw size={16} className="text-slate-400" />;
    if (modo === "Presencial") return <MapPin size={16} className="text-slate-500" />;
    if (modo === "Virtual") return <Video size={16} className="text-slate-500" />;
    return <RefreshCw size={16} className="text-slate-500" />;
  };

  const getJoinState = (cita) => {
    if (cita.estado_pago !== "Pagado" || (cita.modalidad ?? "").toLowerCase() !== "virtual") {
      return { allowed: false, reason: "Disponible solo para citas virtuales pagadas." };
    }

    const fechaHora = parseFechaHora(cita);
    if (!fechaHora) {
      return { allowed: false, reason: "Fecha y hora inválidas." };
    }

    if (now < fechaHora) {
      const diffMs = fechaHora.getTime() - now.getTime();
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutos = Math.floor((diffMs / (1000 * 60)) % 60);
      const mensaje = diffHoras > 0
        ? `Podrás unirte en ${diffHoras}h ${diffMinutos}m.`
        : `Podrás unirte en ${diffMinutos} minutos.`;
      return { allowed: false, reason: mensaje };
    }

    return { allowed: true, reason: "" };
  };

  const handleUnirseCita = async (cita) => {
    const { allowed, reason } = getJoinState(cita);
    if (!allowed) {
      await Swal.fire({
        icon: "info",
        title: "Aún no disponible",
        text: reason,
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    setJoinLoading(cita.id_cita);

    const enlaceSimulado = `https://zoom.us/j/${String(cita.id_cita).padStart(9, "0")}`;
    const fechaHora = parseFechaHora(cita);
    const fechaLegible = fechaHora
      ? fechaHora.toLocaleString("es-PE", {
          dateStyle: "full",
          timeStyle: "short",
        })
      : `${cita.fecha} ${cita.hora}`;

    await Swal.fire({
      icon: "success",
      title: "Enlace de la sesión",
      html: `
        <p class="text-slate-600 mb-3">Tu cita virtual con <strong>${cita.medico}</strong> está programada para:</p>
        <p class="text-slate-900 font-medium mb-4">${fechaLegible}</p>
        <a href="${enlaceSimulado}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-[#0aa6b7] text-white rounded-full font-semibold">
          Ir a la reunión
        </a>
        <p class="mt-4 text-xs text-slate-500">Este enlace es una simulación. Reemplázalo por el enlace real de Zoom cuando esté disponible.</p>
      `,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#0aa6b7",
      focusConfirm: false,
      showCloseButton: true,
    });

    setJoinLoading(null);
  };

  const handlePagarCita = (cita) => {
    if (!cita?.id_cita) return;

    setAccionLoading(cita.id_cita);

    const payload = {
      idCita: cita.id_cita,
      monto: cita.monto,
      detalle: {
        id_cita: cita.id_cita,
        fecha: cita.fecha,
        hora: cita.hora,
        especialidad: cita.especialidad,
        medico: cita.medico,
        modalidad: cita.modalidad,
      },
      idUsuario: userId,
    };

    sessionStorage.setItem("pagoCita", JSON.stringify(payload));
    navigate(`/pago?origen=cita&id_cita=${cita.id_cita}`);
  };

  const stats = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter((c) => c.estado === "Confirmada").length;
    const pendientesPago = citas.filter((c) => c.estado_pago !== "Pagado").length;
    const proximas = citas
      .filter((c) => parseFechaHora(c) && parseFechaHora(c) > now)
      .sort((a, b) => parseFechaHora(a) - parseFechaHora(b));

    const siguiente = proximas[0] || null;

    return { total, confirmadas, pendientesPago, siguiente };
  }, [citas, now, parseFechaHora]);

  const CardSkeleton = () => (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex animate-pulse flex-col gap-3">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-3 w-40 rounded bg-slate-100" />
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="h-3 rounded bg-slate-100" />
          <div className="h-3 rounded bg-slate-100" />
        </div>
        <div className="mt-2 h-9 w-32 rounded-full bg-slate-100" />
      </div>
    </div>
  );

  const renderAction = (cita) => {
    if (cita.estado_pago !== "Pagado") {
      return (
        <button
          type="button"
          onClick={() => handlePagarCita(cita)}
          className="inline-flex items-center gap-2 rounded-full bg-[#0aa6b7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#078292]"
          disabled={accionLoading === cita.id_cita}
        >
          {accionLoading === cita.id_cita ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard size={16} />
              Pagar cita
            </>
          )}
        </button>
      );
    }

    if ((cita.modalidad ?? "").toLowerCase() === "virtual") {
      const joinState = getJoinState(cita);
      return (
        <div className="flex flex-col gap-2 sm:items-end sm:text-right">
          <button
            type="button"
            onClick={() => handleUnirseCita(cita)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0aa6b7] px-4 py-2 text-sm font-semibold text-[#0aa6b7] transition hover:bg-[#0aa6b7] hover:text-white"
            disabled={joinLoading === cita.id_cita || !joinState.allowed}
          >
            {joinLoading === cita.id_cita ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Preparando enlace...
              </>
            ) : (
              <>
                <ExternalLink size={16} />
                Unirme a la cita
              </>
            )}
          </button>
          {!joinState.allowed && <p className="text-xs text-slate-500">{joinState.reason}</p>}
        </div>
      );
    }

    return null;
  };

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-slate-200/60 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Citas programadas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Revisa tus próximas consultas, confirma detalles y gestiona los pagos pendientes desde una vista clara.
            </p>
          </div>
          <dl className="grid w-full max-w-xl grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Totales</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-800">{stats.total}</dd>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-emerald-500">Confirmadas</dt>
              <dd className="mt-1 text-xl font-semibold text-emerald-600">{stats.confirmadas}</dd>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2">
              <dt className="text-[11px] uppercase tracking-wide text-amber-500">Pendientes</dt>
              <dd className="mt-1 text-xl font-semibold text-amber-600">{stats.pendientesPago}</dd>
            </div>
          </dl>
        </div>
      </header>

      {stats.siguiente && (
        <aside className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-white via-white to-slate-50 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#0aa6b7]/15 p-3 text-[#0aa6b7]">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Próxima cita confirmada</p>
                <p className="text-sm font-semibold text-slate-900">{stats.siguiente.especialidad}</p>
                <p className="text-xs text-slate-500">
                  {stats.siguiente.fecha} · {stats.siguiente.hora} con {stats.siguiente.medico}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleUnirseCita(stats.siguiente)}
              className="inline-flex items-center gap-2 rounded-full border border-[#0aa6b7] px-4 py-2 text-xs font-semibold text-[#0aa6b7] transition hover:bg-[#0aa6b7] hover:text-white"
              disabled={stats.siguiente.modalidad?.toLowerCase() !== "virtual"}
            >
              <ExternalLink size={14} />
              Ir a la cita
            </button>
          </div>
        </aside>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <CardSkeleton key={`s-${idx}`} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
          {error}
        </div>
      ) : citas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Calendar size={28} />
          </div>
          <p className="text-sm font-medium text-slate-700">Aún no tienes citas registradas.</p>
          <p className="max-w-xs text-xs text-slate-500">
            Cuando agendes una cita aparecerá aquí para que puedas hacer seguimiento sin perder ningún detalle.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {citas.map((cita) => (
            <article
              key={cita.id_cita}
              className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.65)] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{cita.tipo}</h3>
                    <span className={estadoBadge(cita.estado)}>{cita.estado}</span>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    {modoIcon(cita.modalidad || cita.tipo)}
                    <span>{cita.modalidad || cita.tipo}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                  <Calendar size={14} />
                  <span>{cita.fecha}</span>
                  <Clock size={14} />
                  <span>{cita.hora}</span>
                </div>
              </header>

              <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <UserCircle size={18} className="text-[#0aa6b7]" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Profesional</dt>
                    <dd className="font-medium text-slate-800">{cita.medico}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Especialidad</dt>
                  <dd className="font-medium text-slate-800">{cita.especialidad}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Estado de pago</dt>
                  <dd className={`font-semibold ${cita.estado_pago === "Pagado" ? "text-emerald-600" : "text-amber-500"}`}>
                    {cita.estado_pago}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Monto</dt>
                  <dd className="text-base font-semibold text-[#0aa6b7]">S/ {Number(cita.monto || 0).toFixed(2)}</dd>
                </div>
              </dl>

              <footer className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-400">Código #{String(cita.id_cita).padStart(5, "0")}</div>
                {renderAction(cita)}
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
