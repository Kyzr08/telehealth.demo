// PaymentPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [carrito, setCarrito] = useState([]);
  const [esCita, setEsCita] = useState(false);
  const [pagoCita, setPagoCita] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [detalleCita, setDetalleCita] = useState(null);
  const [loadingCita, setLoadingCita] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    postal: "",
  });
  const [card, setCard] = useState({
    numero: "",
    nombreTarjeta: "",
    vencimiento: "",
    cvv: "",
    tipoTarjeta: "", 
  });
  const [exito, setExito] = useState(false);
  const [processingPago, setProcessingPago] = useState(false);
  const [tipoCambio] = useState(3.75); // Tasa soles <-> dólares
  const [currency, setCurrency] = useState("S/");
  const [paymentData, setPaymentData] = useState({
    idCompra: "",
    monto: "",
    metodo: "Tarjeta Crédito",
    estado: "Pendiente",
  });
  const PAYPAL_CLIENT_ID =
    "AWMrKynmZzhJr9pXrpK4MY8PeCHNI9sf_ROx-9Ov4j2fDne5XSrP9J64iXKQP6ML1qyPICiduhWnLrPb";
  const API_CITAS = "http://localhost/telehealth/backend/api/UserPHP/citas.php";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const origen = params.get("origen");
    const idCitaParam = params.get("id_cita");

    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (!usuarioGuardado) {
      console.error("No se encontró información del usuario en sessionStorage.");
      return;
    }

    let usuarioSesion = null;
    try {
      usuarioSesion = JSON.parse(usuarioGuardado);
    } catch (error) {
      console.error("No se pudo interpretar la sesión de usuario.", error);
      return;
    }

    setUsuarioActual(usuarioSesion);

    const idUsuario = usuarioSesion.id_usuario ?? usuarioSesion.id;
    if (!idUsuario) {
      console.error("La sesión de usuario no contiene un identificador válido.");
      return;
    }

    if (origen === "cita") {
      setEsCita(true);
      setCarrito([]);

      let infoPago = null;
      const pagoCitaGuardado = sessionStorage.getItem("pagoCita");
      if (pagoCitaGuardado) {
        try {
          infoPago = JSON.parse(pagoCitaGuardado);
        } catch (error) {
          console.error("No se pudo interpretar la información de pago almacenada.", error);
        }
      }

      setPagoCita(infoPago ?? null);
      setDetalleCita(null);

      const detalleGuardado = infoPago?.detalle;
      const idCitaDestino =
        infoPago?.idCita || detalleGuardado?.id_cita || (idCitaParam ? Number(idCitaParam) : undefined);

      if (!idCitaDestino) {
        Swal.fire({
          icon: "warning",
          title: "Sin información de pago",
          text: "No encontramos los datos de tu cita por pagar.",
          confirmButtonColor: "#0aa6b7",
        }).then(() => navigate("/cuenta?tab=citas"));
        return;
      }

      const actualizarPago = (detalle) => {
        const montoNormalizado = Number(detalle?.monto ?? infoPago?.monto ?? 0);
        const payloadActualizado = {
          idCita: detalle.id_cita,
          monto: montoNormalizado,
          detalle,
          paciente: {
            nombre: detalle?.paciente?.nombre || usuarioSesion?.nombres || "",
            apellido: detalle?.paciente?.apellido || usuarioSesion?.apellidos || "",
            email: detalle?.paciente?.email || usuarioSesion?.correo || "",
            telefono: detalle?.paciente?.telefono || usuarioSesion?.telefono || "",
          },
          idUsuario,
        };
        setPagoCita(payloadActualizado);
        sessionStorage.setItem("pagoCita", JSON.stringify(payloadActualizado));
      };

      if (detalleGuardado && detalleGuardado.id_cita === idCitaDestino) {
        setDetalleCita(detalleGuardado);
        actualizarPago(detalleGuardado);
        setLoadingCita(false);
      } else {
        const cargarDetalle = async () => {
          setLoadingCita(true);
          try {
            const resp = await fetch(
              `${API_CITAS}?accion=detalle_pago&id_cita=${idCitaDestino}&id_usuario=${idUsuario}`
            );
            const data = await resp.json();
            if (!data.success) {
              throw new Error(data.message || "No se pudo obtener el detalle de la cita.");
            }
            const detalle = {
              ...data.detalle,
              monto: Number(data.detalle?.monto ?? 0),
            };
            setDetalleCita(detalle);
            actualizarPago(detalle);
            const datosPaciente = detalle?.paciente || {};
            setForm((prevForm) => ({
              ...prevForm,
              nombre: datosPaciente.nombre || usuarioSesion?.nombres || prevForm.nombre,
              apellido: datosPaciente.apellido || usuarioSesion?.apellidos || prevForm.apellido,
              email: datosPaciente.email || usuarioSesion?.correo || prevForm.email,
              telefono: datosPaciente.telefono || usuarioSesion?.telefono || prevForm.telefono,
            }));
          } catch (error) {
            console.error("Error al obtener detalle de la cita:", error);
            await Swal.fire({
              icon: "error",
              title: "No se pudo obtener el detalle",
              text: error.message || "Intenta nuevamente desde Mis Citas.",
              confirmButtonColor: "#d33",
            });
            navigate("/cuenta?tab=citas");
            return;
          } finally {
            setLoadingCita(false);
          }
        };

        cargarDetalle();
      }

      if (detalleGuardado?.paciente) {
        const datosPaciente = detalleGuardado.paciente;
        setForm((prevForm) => ({
          ...prevForm,
          nombre: datosPaciente.nombre || prevForm.nombre,
          apellido: datosPaciente.apellido || prevForm.apellido,
          email: datosPaciente.email || prevForm.email,
          telefono: datosPaciente.telefono || prevForm.telefono,
        }));
        if (detalleGuardado?.monto !== undefined) {
          setDetalleCita((prev) => ({ ...prev, monto: Number(detalleGuardado.monto) }));
          setPagoCita((prev) => (prev ? { ...prev, monto: Number(detalleGuardado.monto) } : prev));
        }
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          nombre: usuarioSesion?.nombres || prevForm.nombre,
          apellido: usuarioSesion?.apellidos || prevForm.apellido,
          email: usuarioSesion?.correo || prevForm.email,
          telefono: usuarioSesion?.telefono || prevForm.telefono,
        }));
      }
    } else {
      setEsCita(false);
      setDetalleCita(null);
      setPagoCita(null);
      const carritoGuardado = sessionStorage.getItem("carrito");
      if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
    }

    fetch(`http://localhost/telehealth/backend/api/UserPHP/payment.php?id_usuario=${idUsuario}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setForm((prevForm) => ({
            ...prevForm,
            nombre: data.usuario.nombres,
            apellido: data.usuario.apellidos,
            email: data.usuario.correo,
            telefono: data.usuario.telefono,
          }));
        } else {
          console.error("Error al obtener los datos del usuario:", data.message);
        }
      })
      .catch((error) => console.error("Error en la solicitud de datos del usuario:", error));
  }, [location.search, navigate]);

  const subtotal = esCita
    ? Number(pagoCita?.monto ?? detalleCita?.monto ?? 0)
    : carrito.reduce((total, p) => total + p.precio * p.cantidad, 0);
  const shipping = esCita ? 0 : 0;
  const taxes = esCita ? 0 : +(subtotal * 0.08).toFixed(2);
  const total = esCita ? subtotal : +(subtotal + shipping + taxes).toFixed(2);
  const totalUSD = (total / tipoCambio).toFixed(2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const registrarPagoCita = async (metodoPago) => {
    if (!usuarioActual || !pagoCita?.idCita) {
      await Swal.fire({
        icon: "error",
        title: "Sesión no válida",
        text: "No se encontró la información necesaria para procesar el pago.",
        confirmButtonColor: "#d33",
      });
      return { success: false };
    }

    try {
      const response = await fetch(API_CITAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "pagar",
          id_cita: pagoCita.idCita,
          id_usuario: usuarioActual.id_usuario ?? usuarioActual.id,
          metodo: metodoPago,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, id_cita: pagoCita.idCita };
      }

      await Swal.fire({
        icon: "error",
        title: "Pago no completado",
        text: data.message || "No se pudo procesar el pago de la cita.",
        confirmButtonColor: "#d33",
      });
      return { success: false };
    } catch (error) {
      console.error("Error al procesar el pago de la cita:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar el pago de la cita.",
        confirmButtonColor: "#d33",
      });
      return { success: false };
    }
  };

  const obtenerDigitosTarjeta = (value = "") => value.replace(/\D/g, "");

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    if (name === "numero") {
      const digits = obtenerDigitosTarjeta(value).slice(0, 16);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
      setCard((prev) => ({ ...prev, numero: formatted }));
      return;
    }

    if (name === "cvv") {
      const digits = obtenerDigitosTarjeta(value).slice(0, 3);
      setCard((prev) => ({ ...prev, cvv: digits }));
      return;
    }

    if (name === "vencimiento") {
      const digits = obtenerDigitosTarjeta(value).slice(0, 4);
      let formatted = digits;
      if (digits.length >= 3) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }
      setCard((prev) => ({ ...prev, vencimiento: formatted }));
      return;
    }

    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentDataChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const registrarPagoCompra = async (metodoPago) => {
    const user = JSON.parse(sessionStorage.getItem("usuario"));
    const id_usuario = user?.id_usuario || user?.id || null;

    if (!id_usuario) {
      await Swal.fire({
        icon: "error",
        title: "Sesión no válida",
        text: "No se encontró el usuario en sesión.",
        confirmButtonColor: "#d33",
      });
      return { success: false };
    }

    if (!form.direccion || !form.ciudad || !form.provincia || !form.postal) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos de dirección antes de continuar.",
        confirmButtonColor: "#0aa6b7",
      });
      return { success: false };
    }

    if (carrito.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Tu carrito está vacío.",
        confirmButtonColor: "#0aa6b7",
      });
      return { success: false };
    }

    const productos = carrito.map((producto) => ({
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      precio: producto.precio,
    }));

    const paymentPayload = {
      id_usuario,
      direccion: form.direccion,
      ciudad: form.ciudad,
      provincia: form.provincia,
      postal: form.postal,
      monto: total,
      metodo: metodoPago,
      estado: "Pagado",
      productos,
    };

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, message: result.message };
      }

      await Swal.fire({
        icon: "error",
        title: "Pago no completado",
        text: result.message || "No se pudo procesar el pago.",
        confirmButtonColor: "#d33",
      });
      return { success: false };
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar el pago.",
        confirmButtonColor: "#d33",
      });
      return { success: false };
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    if (processingPago) {
      return;
    }

    if (!card.tipoTarjeta) {
      await Swal.fire({
        icon: "warning",
        title: "Selecciona un tipo de tarjeta",
        text: "Elige entre tarjeta de crédito o débito para continuar.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    if (!card.nombreTarjeta.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Nombre en la tarjeta",
        text: "Ingresa el nombre tal como aparece en la tarjeta.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    const numeroSinEspacios = obtenerDigitosTarjeta(card.numero);
    if (numeroSinEspacios.length !== 16) {
      await Swal.fire({
        icon: "warning",
        title: "Número de tarjeta inválido",
        text: "El número de la tarjeta debe tener 16 dígitos.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    const vencimientoRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!vencimientoRegex.test(card.vencimiento)) {
      await Swal.fire({
        icon: "warning",
        title: "Vencimiento inválido",
        text: "Ingresa la fecha de vencimiento en formato MM/AA.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    const [mesStr, anioStr] = card.vencimiento.split("/");
    const mes = Number(mesStr);
    const anio = Number(`20${anioStr}`);
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anioActual = ahora.getFullYear();
    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      await Swal.fire({
        icon: "warning",
        title: "Tarjeta vencida",
        text: "La tarjeta ingresada ya no se encuentra vigente.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    if (card.cvv.length !== 3) {
      await Swal.fire({
        icon: "warning",
        title: "CVV inválido",
        text: "El CVV debe contener exactamente 3 dígitos.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    try {
      setProcessingPago(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const metodoPago = `Tarjeta ${card.tipoTarjeta}`;
      const registro = esCita
        ? await registrarPagoCita(metodoPago)
        : await registrarPagoCompra(metodoPago);

      if (!registro.success) {
        return;
      }

      setExito(true);
      if (esCita) {
        sessionStorage.removeItem("pagoCita");
        await Swal.fire({
          icon: "success",
          title: "Cita pagada",
          text: "Tu cita ha sido confirmada correctamente.",
          confirmButtonColor: "#0aa6b7",
        });
        navigate("/cuenta?tab=citas");
      } else {
        sessionStorage.removeItem("carrito");
        await Swal.fire({
          icon: "success",
          title: "Pago exitoso",
          text: registro.message || "Tu pago se ha procesado correctamente.",
          confirmButtonColor: "#0aa6b7",
        });
        navigate("/tienda");
      }
    } finally {
      setProcessingPago(false);
    }
  };

  return (
    <div className="bg-white sm:px-8 px-4 py-6 min-h-screen pt-40">
      <div className="max-w-screen-xl max-md:max-w-xl mx-auto">
        {/* Steps */}
        <div className="flex items-start mb-16">
          <div className="w-full">
            <div className="flex items-center w-full">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-full">
                <span className="text-sm text-white font-semibold">1</span>
              </div>
              <div className="w-full h-[3px] mx-4 rounded-lg bg-blue-600"></div>
            </div>
            <div className="mt-2">
              <h6 className="text-sm font-semibold text-slate-900">Carrito</h6>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center w-full">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-full">
                <span className="text-sm text-white font-semibold">2</span>
              </div>
              <div className="w-full h-[3px] mx-4 rounded-lg bg-slate-300"></div>
            </div>
            <div className="mt-2">
              <h6 className="text-sm font-semibold text-slate-900">Checkout</h6>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-300 flex items-center justify-center rounded-full">
                <span className="text-sm text-white font-semibold">3</span>
              </div>
            </div>
            <div className="mt-2">
              <h6 className="text-sm font-semibold text-slate-400">Orden</h6>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 lg:gap-x-12">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCardPayment}>
              {!esCita && (
                <>
                  <h2 className="text-xl text-slate-900 font-semibold mb-6">
                    Detalles de Envío
                  </h2>
                  <div className="grid lg:grid-cols-2 gap-y-6 gap-x-4">
                    {[
                      ["nombre", "Nombre"],
                      ["apellido", "Apellido"],
                      ["email", "Correo Electrónico"],
                      ["telefono", "Teléfono"],
                      ["direccion", "Dirección"],
                      ["ciudad", "Ciudad"],
                      ["provincia", "Provincia/Estado"],
                      ["postal", "Código Postal"],
                    ].map(([name, label]) => (
                      <div key={name}>
                        <label className="text-sm text-slate-900 font-medium block mb-2">
                          {label}
                        </label>
                        <input
                          type="text"
                          name={name}
                          placeholder={`Ingrese ${label}`}
                          value={form[name]}
                          onChange={handleChange}
                          className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-12" style={{ marginRight: "5.5rem" }}>
                <h2 className="text-xl text-slate-900 font-semibold mb-6">
                  {esCita ? "Pago de cita" : "Pago con Tarjeta"}
                </h2>

                <div className="mb-6">
                  <label className="text-sm font-medium block mb-2">
                    Tipo de Tarjeta
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setCard({ ...card, tipoTarjeta: "Crédito" })}
                      className={`cursor-pointer border rounded-lg px-4 py-6 flex flex-col items-center transition
                        ${card.tipoTarjeta === "Crédito" ? "border-blue-600 shadow-md bg-blue-50" : "border-gray-300 bg-white"}`}
                    >
                      <CreditCard size={32} className="mb-2 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">
                        Crédito
                      </span>
                    </div>

                    <div
                      onClick={() => setCard({ ...card, tipoTarjeta: "Débito" })}
                      className={`cursor-pointer border rounded-lg px-4 py-6 flex flex-col items-center transition
                        ${card.tipoTarjeta === "Débito" ? "border-blue-600 shadow-md bg-blue-50" : "border-gray-300 bg-white"}`}
                    >
                      <DollarSign size={32} className="mb-2 text-green-600" />
                      <span className="text-sm font-semibold text-slate-800">
                        Débito
                      </span>
                    </div>
                  </div>
                </div>

                {card.tipoTarjeta && (
                  <>
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Nombre en la Tarjeta
                      </label>
                      <input
                        type="text"
                        name="nombreTarjeta"
                        value={card.nombreTarjeta}
                        onChange={handleCardChange}
                        placeholder="Ej. Juan Pérez"
                        className="px-4 py-2.5 border border-gray-400 w-full rounded-md focus:outline-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        name="numero"
                        value={card.numero}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        pattern="[0-9 ]*"
                        className="px-4 py-2.5 border border-gray-400 w-full rounded-md focus:outline-blue-600"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          name="vencimiento"
                          value={card.vencimiento}
                          onChange={handleCardChange}
                          placeholder="MM/AA"
                          maxLength="5"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          className="px-4 py-2.5 border border-gray-400 w-full rounded-md focus:outline-blue-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium block mb-2">CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          value={card.cvv}
                          onChange={handleCardChange}
                          placeholder="123"
                          maxLength="3"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          className="px-4 py-2.5 border border-gray-400 w-full rounded-md focus:outline-blue-600"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processingPago}
                      className={`mt-6 w-full rounded-md py-3 font-medium text-white transition ${
                        processingPago
                          ? "bg-blue-600/70 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {processingPago ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Procesando pago...
                        </span>
                      ) : esCita ? (
                        "Pagar y confirmar cita"
                      ) : (
                        "Pagar con Tarjeta"
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>

            <div style={{ marginTop: "20px" }}>
              <PayPalScriptProvider
                options={{
                  "client-id": PAYPAL_CLIENT_ID,
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  style={{ layout: "horizontal" }}
                  createOrder={(data, actions) => {
                    const amount = (total / tipoCambio).toFixed(2);
                    return actions.order.create({
                      purchase_units: [{ amount: { value: amount } }],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      await actions.order.capture();
                      const registro = esCita
                        ? await registrarPagoCita("PayPal")
                        : await registrarPagoCompra("PayPal");

                      if (!registro.success) {
                        if (actions.restart) {
                          await actions.restart();
                        }
                        return;
                      }

                      setExito(true);
                      if (esCita) {
                        sessionStorage.removeItem("pagoCita");
                        Swal.fire({
                          icon: "success",
                          title: "Cita confirmada",
                          text: "Tu pago con PayPal se completó correctamente.",
                          confirmButtonColor: "#0aa6b7",
                        }).then(() => navigate("/cuenta?tab=citas"));
                      } else {
                        sessionStorage.removeItem("carrito");
                        Swal.fire({
                          icon: "success",
                          title: "Pago completado",
                          text:
                            registro.message ||
                            "Tu pago con PayPal se ha procesado correctamente.",
                          confirmButtonColor: "#0aa6b7",
                        }).then(() => navigate("/tienda"));
                      }
                    } catch (err) {
                      console.error("PayPal onApprove Error:", err);
                      Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrió un error al finalizar el pago.",
                        confirmButtonColor: "#d33",
                      });
                      if (actions.restart) {
                        await actions.restart();
                      }
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Ocurrió un error al procesar el pago.",
                      confirmButtonColor: "#d33",
                    });
                  }}
                />
              </PayPalScriptProvider>
            </div>

            {exito && (
              <div className="text-green-600 font-semibold mt-6">
                ¡Pago realizado con éxito!
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-slate-900 font-semibold">
                {esCita ? "Resumen de cita" : "Resumen del Pedido"}
              </h2>
              {!esCita && (
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-4 py-2.5 border border-gray-400 rounded-md focus:outline-blue-600"
                >
                  <option value="S/">Soles (S/)</option>
                  <option value="$">Dólares ($)</option>
                </select>
              )}
            </div>

            {esCita ? (
              loadingCita ? (
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-500">
                  Cargando detalle de tu cita...
                </div>
              ) : (
                <div className="space-y-4 text-sm text-slate-700">
                  {(() => {
                    const resumen = detalleCita || pagoCita?.detalle || pagoCita?.resumen || {};
                    const items = [
                      {
                        label: "Especialidad",
                        value: resumen.especialidad,
                      },
                      {
                        label: "Profesional",
                        value: resumen.medico,
                      },
                    ];

                    const fechaHora = {
                      fecha: resumen.fecha,
                      hora: resumen.hora,
                    };

                    const modalidad = resumen.modalidad;

                    return (
                      <>
                        {items.map(({ label, value }) => (
                          <div key={label} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                            <p className="font-semibold text-slate-900">{value || "-"}</p>
                          </div>
                        ))}

                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Fecha</p>
                            <p className="font-semibold text-slate-900">{fechaHora.fecha || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">Hora</p>
                            <p className="font-semibold text-slate-900">{fechaHora.hora || "-"}</p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Modalidad</p>
                          <p className="font-semibold text-slate-900">{modalidad || "-"}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )
            ) : (
              <div className="space-y-3 text-sm text-slate-700">
                {carrito.length === 0 && (
                  <p className="text-gray-500 text-sm">Tu carrito está vacío.</p>
                )}
                {carrito.map((p, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{p.nombre} (x{p.cantidad})</span>
                    <span>
                      {currency === "S/"
                        ? `S/ ${(p.precio * p.cantidad).toFixed(2)}`
                        : `$ ${(p.precio * p.cantidad / tipoCambio).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <ul className="text-slate-500 font-medium space-y-4 mt-6">
              {!esCita && (
                <>
                  <li className="flex justify-between text-sm">
                    Subtotal
                    <span className="font-semibold text-slate-900">
                      {currency === "S/"
                        ? `S/ ${subtotal.toFixed(2)}`
                        : `$ ${(subtotal / tipoCambio).toFixed(2)}`}
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    Envío
                    <span className="font-semibold text-slate-900">Gratis</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    Impuestos
                    <span className="font-semibold text-slate-900">
                      {currency === "S/"
                        ? `S/ ${taxes.toFixed(2)}`
                        : `$ ${(taxes / tipoCambio).toFixed(2)}`}
                    </span>
                  </li>
                  <hr className="border-slate-300" />
                </>
              )}
              <li className="flex justify-between font-semibold text-slate-900">
                Total
                <span>
                  {currency === "S/" || esCita
                    ? `S/ ${total.toFixed(2)}`
                    : `$ ${totalUSD}`}
                </span>
              </li>
            </ul>

            {!esCita && (
              <div className="space-y-4 mt-8">
                <button
                  type="button"
                  className="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-900 cursor-pointer"
                >
                  Seguir Comprando
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
