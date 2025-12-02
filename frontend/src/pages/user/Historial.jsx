import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Download, Loader2, Stethoscope } from "lucide-react";
import Swal from "sweetalert2";

const API_BASE = "http://localhost/telehealth/backend/api";

const placeholder = (value, fallback = "No registrado") => (value && String(value).trim().length > 0 ? value : fallback);

const resumirTexto = (value, maxLength = 220) => {
  if (!value) return null;
  const clean = String(value).replace(/\s+/g, " ").trim();
  if (!clean) return null;
  if (clean.length <= maxLength) return clean;
  const truncated = clean.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const safe = lastSpace > maxLength * 0.4 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe.trim()}…`;
};

const resumirCampo = (value, maxLength = 220) => {
  const resume = resumirTexto(value, maxLength);
  if (resume) return resume;
  const base = placeholder(value);
  return base === "No registrado" ? null : base;
};

const formatDate = (value, options = { dateStyle: "medium" }) => {
  if (!value) return "Sin fecha";
  const normalised = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalised);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", options).format(date);
};

const HistorialDetailView = ({ detail, onClose, onDownload, detailRef, className = "", showDownload = true }) => {
  if (!detail) return null;

  const infoBasica = [
    { label: "Paciente", value: placeholder(detail.paciente) },
    { label: "Médico", value: placeholder(detail.medico) },
    { label: "Especialidad", value: placeholder(detail.especialidad) },
    { label: "Tipo de consulta", value: placeholder(detail.tipo_consulta) },
    { label: "Fecha de la cita", value: placeholder(detail.fecha_cita, "No registrada") },
    { label: "Hora", value: detail.hora || "No registrada" },
    { label: "Estado", value: placeholder(detail.estado) },
    { label: "Fecha de realización", value: placeholder(detail.fecha_realizacion, "No registrada") },
  ];

  const puntosClave = [
    { label: "Motivo principal", value: resumirCampo(detail.motivo_consulta, 180) },
    { label: "Resumen del caso", value: resumirCampo(detail.descripcion_cuadro, 220) },
    { label: "Diagnóstico", value: resumirCampo(detail.diagnostico, 160) },
    { label: "Naturaleza del padecimiento", value: resumirCampo(detail.naturaleza_padecimiento, 80) },
    { label: "Tipo de atención", value: resumirCampo(detail.tipo_atencion, 80) },
    { label: "Recomendaciones", value: resumirCampo(detail.recomendaciones, 200) },
    { label: "Observaciones", value: resumirCampo(detail.observaciones, 200) },
  ].filter((item) => item.value);

  const antecedentes = [
    { label: "Patológicos", value: resumirCampo(detail.antecedentes_patologicos, 160) },
    { label: "No patológicos", value: resumirCampo(detail.antecedentes_no_patologicos, 160) },
    { label: "Perinatales", value: resumirCampo(detail.antecedentes_perinatales, 160) },
    { label: "Gineco-obstétricos", value: resumirCampo(detail.antecedentes_gineco_obstetricos, 160) },
  ].filter((item) => item.value);

  const recetas = Array.isArray(detail.recetas) ? detail.recetas : [];

  return (
    <div className={`patient-container ${className}`.trim()}>
      <div className="patient-card" ref={detailRef || null}>
        <header className="header-section">
          <div className="header-left">
            <div>
              <h1 className="app-title">Telehealth+</h1>
              <p className="subtitle">Reporte de Historia Clínica</p>
            </div>
          </div>
          <div className="header-right">
            <p>
              <strong>Fecha de generación:</strong> {formatDate(new Date().toISOString(), { dateStyle: "medium" })}
            </p>
          </div>
        </header>

        <section className="section">
          <h2 className="section-title">Datos generales</h2>
          <div className="section-grid">
            {infoBasica.map((item) => (
              <p key={item.label}>
                <span className="bold">{item.label}:</span> {item.value}
              </p>
            ))}
          </div>
        </section>

        {puntosClave.length > 0 && (
          <section className="section">
            <h2 className="section-title">Puntos clave para recordar</h2>
            <div className="section-block">
              {puntosClave.map((item) => (
                <p key={item.label}>
                  <span className="bold">{item.label}:</span> {item.value}
                </p>
              ))}
            </div>
          </section>
        )}

        {antecedentes.length > 0 && (
          <section className="section">
            <h2 className="section-title">Antecedentes relevantes</h2>
            <div className="section-grid">
              {antecedentes.map((item) => (
                <p key={item.label}>
                  <span className="bold">{item.label}:</span> {item.value}
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <h2 className="section-title">Tratamiento y medicación</h2>
          {recetas.length > 0 ? (
            <table className="receta-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Dosis</th>
                  <th>Frecuencia</th>
                  <th>Duración</th>
                  <th>Indicaciones</th>
                </tr>
              </thead>
              <tbody>
                {recetas.map((receta) => (
                  <tr key={receta.id_receta}>
                    <td>{placeholder(receta.medicamento)}</td>
                    <td>{placeholder(receta.dosis)}</td>
                    <td>{placeholder(receta.frecuencia)}</td>
                    <td>{placeholder(receta.duracion)}</td>
                    <td>{placeholder(receta.indicaciones)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-recetas">No hay recetas médicas registradas.</p>
          )}
        </section>

        <footer className="footer-section">
          <p>Telehealth+ {new Date().getFullYear()} — Confidencial y de uso médico</p>
        </footer>
      </div>
    </div>
  );
};

const Historial = ({ embedded = false }) => {
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({});
  const detailRef = useRef(null);
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("usuario")) || null;
    } catch (err) {
      console.error("Error parsing usuario from sessionStorage", err);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!usuario?.id_usuario) {
      setError("No se encontró la sesión del usuario. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchHistoriales = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_BASE}/UserPHP/historial.php?id_usuario=${usuario.id_usuario}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        if (!data.success) {
          setHistoriales([]);
          setError(data.message || "No se encontraron historiales clínicos disponibles.");
          return;
        }

        const lista = Array.isArray(data.data) ? data.data : [];
        setHistoriales(lista);

        if (!embedded) {
          const storedId = sessionStorage.getItem("historialSelected");
          if (storedId) {
            sessionStorage.removeItem("historialSelected");
            const numericId = Number(storedId);
            if (!Number.isNaN(numericId)) {
              handleToggleDetail(numericId);
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching historiales", err);
        setError("No se pudo cargar tu historial clínico.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoriales();

    return () => controller.abort();
  }, [usuario?.id_usuario]);

  const handleToggleDetail = async (id_historial) => {
    if (!usuario?.id_usuario) return;

    if (selected?.id_historial === id_historial) {
      setSelected(null);
      return;
    }

    if (detailsCache[id_historial]) {
      setSelected(detailsCache[id_historial]);
      return;
    }

    try {
      setLoadingDetailId(id_historial);
      const res = await fetch(
        `${API_BASE}/UserPHP/historial.php?id_usuario=${usuario.id_usuario}&id_historial=${id_historial}`
      );
      const data = await res.json();

      if (!data.success || !data.data) {
        Swal.fire({
          icon: "error",
          title: "No disponible",
          text: data.message || "No se pudo obtener el detalle del historial.",
        });
        return;
      }

      let detail = data.data;

      try {
        const recetasRes = await fetch(
          `${API_BASE}/MedicPHP/getRecetas.php?id_historial=${id_historial}`
        );
        const recetasData = await recetasRes.json();
        if (recetasData.success && Array.isArray(recetasData.data)) {
          detail = { ...detail, recetas: recetasData.data };
        }
      } catch (recErr) {
        console.error("Error fetching recetas", recErr);
        detail = { ...detail, recetas: [] };
      }

      setDetailsCache((prev) => ({ ...prev, [id_historial]: detail }));
      setSelected(detail);
    } catch (err) {
      console.error("Error fetching historial detail", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo obtener el detalle del historial clínico.",
      });
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selected || !detailRef.current) {
      Swal.fire({
        icon: "info",
        title: "Contenido no disponible",
        text: "Abre el detalle para poder descargarlo.",
      });
      return;
    }

    try {
      const opt = {
        margin: 0.5,
        filename: `historial-${selected.id_historial}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 4, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(detailRef.current).save();
    } catch (err) {
      console.error("Error generating PDF", err);
      Swal.fire({
        icon: "error",
        title: "Error al descargar",
        text: "No se pudo generar el PDF. Inténtalo nuevamente.",
      });
    }
  };

  const listToRender = embedded ? historiales.slice(0, 3) : historiales;

  const renderCards = () => (
    <div className="space-y-4">
      {listToRender.map((item) => {
        const isOpen = selected?.id_historial === item.id_historial;
        const shouldShowDetail = isOpen && selected;
        const statusText = placeholder(item.estado, "En revisión");
        const cardClass = embedded
          ? `group rounded-2xl border ${
              isOpen ? "border-[#0aa6b7]/50 shadow-[0_10px_30px_-25px_rgba(8,134,153,0.8)]" : "border-slate-200 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.2)]"
            } bg-white/95 p-5 transition-colors hover:border-[#0aa6b7]/60`
          : `rounded-2xl border ${
              isOpen ? "border-[#0aa6b7]" : "border-slate-200"
            } bg-white p-5 shadow-sm transition hover:shadow-md`;

        return (
          <div key={item.id_historial} className={cardClass}>
            {embedded ? (
              <>
                <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0aa6b7]/10 text-[#0aa6b7]">
                      <Stethoscope size={18} />
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {placeholder(item.diagnostico || item.padecimiento, "Consulta médica")}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f4f5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#0aa6b7]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0aa6b7]" />
                          {statusText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Motivo: {placeholder(item.motivo_consulta, "Sin especificar")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {formatDate(item.fecha_consulta, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <div className="flex items-center gap-3">
                      {shouldShowDetail && (
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          className="inline-flex items-center gap-2 rounded-full border border-[#0aa6b7]/20 bg-[#0aa6b7]/10 px-3 py-1.5 text-xs font-semibold text-[#0aa6b7] transition hover:bg-[#0aa6b7]/20"
                        >
                          <Download size={14} /> PDF
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleDetail(item.id_historial)}
                        className="text-xs font-semibold text-[#0aa6b7] transition hover:text-[#088699]"
                      >
                        {loadingDetailId === item.id_historial ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isOpen ? (
                          "Ocultar detalle"
                        ) : (
                          "Ver detalle"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0aa6b7]/10 text-[#0aa6b7]">
                      <Stethoscope size={16} />
                    </span>
                    {placeholder(item.diagnostico || item.padecimiento, "Consulta médica")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(item.fecha_consulta, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p className="text-sm text-slate-600">
                    Motivo: {placeholder(item.motivo_consulta, "Sin especificar")}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    {statusText}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleDetail(item.id_historial)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0aa6b7] transition hover:border-[#0aa6b7]/40 hover:bg-[#0aa6b7]/5"
                  >
                    {loadingDetailId === item.id_historial ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isOpen ? (
                      "Ocultar detalle"
                    ) : (
                      "Ver detalle"
                    )}
                  </button>
                </div>
              </div>
            )}

            {shouldShowDetail && (
              <HistorialDetailView
                detail={selected}
                onDownload={!embedded ? handleDownloadPdf : undefined}
                detailRef={detailRef}
                showDownload={!embedded}
                className={`mt-5 ${embedded ? "rounded-2xl border border-slate-200/60 bg-white p-5" : ""}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${embedded ? "" : "max-w-5xl mx-auto"}`}>
        {Array.from({ length: embedded ? 2 : 3 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-48 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-rose-100 bg-rose-50/80 p-5 text-center text-sm text-rose-600 ${embedded ? "" : "max-w-4xl mx-auto"}`}>
        {error}
      </div>
    );
  }

  if (listToRender.length === 0) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 ${embedded ? "" : "max-w-4xl mx-auto"}`}>
        Aún no cuentas con historiales clínicos registrados.
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="space-y-4">
        {renderCards()}
        {historiales.length > listToRender.length && (
          <div className="text-right text-xs text-slate-400">Visualiza el historial completo para más registros.</div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-6xl space-y-6 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:mt-30 sm:p-8">
      {renderCards()}
    </div>
  );
};

export default Historial;