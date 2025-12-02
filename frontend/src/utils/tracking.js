const TRACKING_PREFIX = "THPE";

export function generateTrackingCode(idPedido, fechaReferencia) {
  const id = Number.isFinite(idPedido) ? Math.max(0, idPedido) : 0;
  const date = fechaReferencia ? new Date(fechaReferencia) : new Date();

  if (Number.isNaN(date.getTime())) {
    // fallback to current date if parsing fails
    date.setTime(Date.now());
  }

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const sequential = String(id % 1000).padStart(3, "0");
  const digits = `${year}${month}${day}${sequential}`;
  const suffix = String.fromCharCode(65 + (id % 26));

  return `${TRACKING_PREFIX}${digits}${suffix}`;
}
