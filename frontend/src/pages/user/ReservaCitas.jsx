import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock4,
  LifeBuoy,
  ShieldCheck,
  Stethoscope,
  User2,
} from "lucide-react";

const API_BASE = "http://localhost/telehealth/backend/api/UserPHP/citas.php";

const todayISO = () => new Date().toISOString().split("T")[0];

const TIPOS_POR_ESPECIALIDAD = {
  1: [1, 2, 3, 6], // Medicina General
  2: [1, 3, 6], // Cardiología
  3: [1, 3], // Neurología
  4: [1, 2, 3, 6], // Pediatría
  5: [1, 3], // Ginecología
  6: [3, 4, 6], // Psiquiatría
  7: [1, 2, 3], // Dermatología
  8: [1, 3, 5, 6], // Endocrinología (incluye Telenutrición)
  9: [1, 2, 3], // Oftalmología
  10: [1], // Odontología
};

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // Ignorar errores de parseo para respuestas vacías
  }

  const successFlag = data?.success ?? response.ok;

  if (!response.ok || !successFlag) {
    const message = data?.message || "No se pudo completar la operación.";
    throw new Error(message);
  }

  return data ?? { success: true };
}

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const [year, month, day] = fecha.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
};

const conectoresApellidos = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "y",
  "van",
  "von",
  "mc",
  "mac",
  "da",
  "dos",
  "das",
  "do",
]);

const normalizarToken = (token) =>
  token
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatearNombreMedico = (nombreCompleto = "") => {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "";

  const primerNombre = partes[0];
  if (partes.length === 1) {
    return primerNombre;
  }

  const resto = partes.slice(1);
  let ultimoApellido = "";

  for (let i = resto.length - 1; i >= 0; i--) {
    const token = resto[i];
    const tokenNormalizado = normalizarToken(token);
    if (conectoresApellidos.has(tokenNormalizado)) {
      continue;
    }
    ultimoApellido = token;
    break;
  }

  if (!ultimoApellido) {
    ultimoApellido = resto[resto.length - 1] ?? "";
  }

  return ultimoApellido ? `${primerNombre} ${ultimoApellido}` : primerNombre;
};

export default function ReservaCitas() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [horariosLoading, setHorariosLoading] = useState(false);

  const [usuario] = useState(() => {
    try {
      const almacenado = sessionStorage.getItem("usuario");
      return almacenado ? JSON.parse(almacenado) : null;
    } catch (error) {
      console.error("Error al leer el usuario de sesión", error);
      return null;
    }
  });

  const [paciente, setPaciente] = useState(() => ({
    nombres: usuario?.nombres ?? "",
    apellidos: usuario?.apellidos ?? "",
    correo: usuario?.correo ?? "",
    telefono: usuario?.telefono ?? "",
    documento: "",
  }));

  const [especialidades, setEspecialidades] = useState([]);
  const [tiposCita, setTiposCita] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horarios, setHorarios] = useState({ disponibles: [], ocupados: [] });

  const [cita, setCita] = useState({
    idEspecialidad: "",
    idMedico: "",
    idTipo: "",
    fecha: "",
    hora: "",
  });

  const steps = [
    { id: 1, label: "Paciente" },
    { id: 2, label: "Especialista" },
    { id: 3, label: "Horario" },
  ];

  const stepCopy = useMemo(() => {
    switch (paso) {
      case 1:
        return {
          title: "Información del paciente",
          subtitle: "Confirma tus datos para personalizar tu experiencia asistencial.",
        };
      case 2:
        return {
          title: "Selecciona tu especialista",
          subtitle: "Elige la combinación ideal de especialidad, consulta y profesional.",
        };
      case 3:
        return {
          title: "Programa tu cita",
          subtitle: "Define el día y la hora que mejor se ajusten a tu agenda.",
        };
      default:
        return {
          title: "Reserva en curso",
          subtitle: "Sigue los pasos para confirmar tu atención médica.",
        };
    }
  }, [paso]);

  useEffect(() => {
    if (!usuario) return;

    const cargarDatosIniciales = async () => {
      setFormLoading(true);
      setError("");
      try {
        const [respEspecialidades, respTipos] = await Promise.all([
          fetchJSON(`${API_BASE}?accion=especialidades`),
          fetchJSON(`${API_BASE}?accion=tipos`),
        ]);

        setEspecialidades(respEspecialidades?.especialidades ?? []);
        setTiposCita(respTipos?.tipos ?? []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar las opciones iniciales.");
      } finally {
        setFormLoading(false);
      }
    };

    cargarDatosIniciales();
  }, [usuario]);

  useEffect(() => {
    const idEspecialidad = Number(cita.idEspecialidad);
    if (!idEspecialidad) {
      setMedicos([]);
      return;
    }

    const cargarMedicos = async () => {
      setFormLoading(true);
      setError("");
      try {
        const data = await fetchJSON(
          `${API_BASE}?accion=medicos&id_especialidad=${idEspecialidad}`
        );
        setMedicos(data?.medicos ?? []);
        if (!data?.medicos?.length) {
          setError("Por el momento no hay médicos disponibles para esta especialidad.");
        }
      } catch (err) {
        setError(err.message || "No se pudo obtener la lista de médicos.");
        setMedicos([]);
      } finally {
        setFormLoading(false);
      }
    };

    cargarMedicos();
  }, [cita.idEspecialidad]);

  useEffect(() => {
    const idMedico = Number(cita.idMedico);
    if (!idMedico || !cita.fecha) {
      setHorarios({ disponibles: [], ocupados: [] });
      return;
    }

    const cargarHorarios = async () => {
      setHorariosLoading(true);
      try {
        const data = await fetchJSON(
          `${API_BASE}?accion=horarios&id_medico=${idMedico}&fecha=${cita.fecha}`
        );
        setHorarios({
          disponibles: data?.disponibles ?? [],
          ocupados: data?.ocupados ?? [],
        });
      } catch (err) {
        setError(err.message || "No se pudieron cargar los horarios disponibles.");
        setHorarios({ disponibles: [], ocupados: [] });
      } finally {
        setHorariosLoading(false);
      }
    };

    cargarHorarios();
  }, [cita.idMedico, cita.fecha]);

  const tiposDisponibles = useMemo(() => {
    if (!cita.idEspecialidad) return tiposCita;
    const permitidos = TIPOS_POR_ESPECIALIDAD[Number(cita.idEspecialidad)] ?? [];
    if (!permitidos.length) return [];
    return tiposCita.filter((tipo) => permitidos.includes(Number(tipo.id_tipo)));
  }, [tiposCita, cita.idEspecialidad]);

  useEffect(() => {
    if (!cita.idEspecialidad) return;
    const existeSeleccionValida = tiposDisponibles.some(
      (tipo) => String(tipo.id_tipo) === String(cita.idTipo)
    );
    if (!existeSeleccionValida && cita.idTipo) {
      setCita((prev) => ({ ...prev, idTipo: "" }));
    }
  }, [tiposDisponibles, cita.idEspecialidad, cita.idTipo]);

  const tipoSeleccionado = useMemo(
    () =>
      tiposDisponibles.find(
        (t) => String(t.id_tipo) === String(cita.idTipo ?? "")
      ) || null,
    [tiposDisponibles, cita.idTipo]
  );

  const tarifaBase = useMemo(() => {
    const valor = tipoSeleccionado?.precio_base;
    if (valor == null) return 0;
    if (typeof valor === "number") return valor;
    const normalizado = parseFloat(String(valor).replace(/[^0-9.,]/g, "").replace(",", "."));
    return Number.isFinite(normalizado) ? normalizado : 0;
  }, [tipoSeleccionado]);

  const especialidadSeleccionada = useMemo(
    () =>
      especialidades.find(
        (esp) => String(esp.id_especialidad) === String(cita.idEspecialidad ?? "")
      ) || null,
    [especialidades, cita.idEspecialidad]
  );

  const medicoSeleccionado = useMemo(
    () =>
      medicos.find(
        (profesional) => String(profesional.id_medico) === String(cita.idMedico ?? "")
      ) || null,
    [medicos, cita.idMedico]
  );

  const nombreMedicoResumen = useMemo(() => {
    if (!medicoSeleccionado?.nombre) return "Por definir";
    const nombreFormateado = formatearNombreMedico(medicoSeleccionado.nombre);
    return nombreFormateado || medicoSeleccionado.nombre;
  }, [medicoSeleccionado]);

  const fechaSeleccionada = cita.fecha ? formatearFecha(cita.fecha) : "Por definir";
  const horaSeleccionada = cita.hora || "Por definir";

  const handlePaso1 = (e) => {
    e.preventDefault();
    if (!paciente.nombres.trim() || !paciente.apellidos.trim()) {
      setError("Por favor, completa tus nombres y apellidos.");
      return;
    }
    if (!paciente.correo.trim()) {
      setError("Necesitamos un correo para enviar la confirmación.");
      return;
    }
    setError("");
    setPaso(2);
  };

  const handlePaso2 = (e) => {
    e.preventDefault();
    if (!cita.idEspecialidad || !cita.idMedico || !cita.idTipo) {
      setError("Selecciona la especialidad, tipo de consulta y médico para continuar.");
      return;
    }
    setError("");
    setPaso(3);
  };

  const handleConfirmarCita = async (e) => {
    e.preventDefault();

    if (!cita.fecha || !cita.hora) {
      setError("Selecciona una fecha y horario disponible.");
      return;
    }

    setError("");
    setFormLoading(true);

    try {
      const basePayload = {
        accion: "crear",
        id_usuario: usuario?.id_usuario ?? usuario?.id,
        id_medico: Number(cita.idMedico),
        id_tipo: Number(cita.idTipo),
        id_especialidad: Number(cita.idEspecialidad),
        fecha: cita.fecha,
        hora: cita.hora,
      };

      const data = await fetchJSON(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...basePayload, registrar_pago: false }),
      });

      const resultado = await Swal.fire({
        icon: "success",
        title: "¡Cita reservada!",
        text: "Tu cita fue registrada y el pago queda pendiente.",
        confirmButtonText: "Ver mis citas",
        confirmButtonColor: "#0aa6b7",
        showCancelButton: true,
        cancelButtonText: "Reservar otra",
        cancelButtonColor: "#9ca3af",
      });

      if (resultado.isConfirmed) {
        navigate("/cuenta?tab=citas");
      } else {
        resetFormulario();
      }
    } catch (err) {
      setError(err.message || "Ocurrió un problema al registrar tu cita.");
      Swal.fire({
        icon: "error",
        title: "No se pudo reservar",
        text: err.message || "Inténtalo nuevamente en unos minutos.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const resetFormulario = () => {
    setPaso(1);
    setCita({ idEspecialidad: "", idMedico: "", idTipo: "", fecha: "", hora: "" });
    setMedicos([]);
    setHorarios({ disponibles: [], ocupados: [] });
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f8fa] px-6 py-24">
        <div className="max-w-md bg-white shadow-xl rounded-2xl px-8 py-10 text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Ingresa como paciente para reservar
          </h2>
          <p className="text-gray-600 mb-6">
            En esta demo puedes usar el botón <strong>"Entrar como Paciente"</strong> en la pantalla de inicio de sesión para simular tu cuenta de paciente.
          </p>
          <a
            href="/login"
            className="inline-block bg-[#0aa6b7] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#0895a5] transition"
          >
            Ir al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  const progress = useMemo(() => (paso / steps.length) * 100, [paso]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fbfc] via-white to-[#eef4f6] py-28">
      <div className="mx-auto w-[90%] max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <header className="mt-6 sm:mt-10 rounded-3xl border border-white/70 bg-white/95 px-8 py-10 shadow-2xl shadow-slate-200/30 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-3 text-xs font-semibold text-[#0aa6b7]">
                <ShieldCheck className="h-4 w-4" />
                Paso {paso} de {steps.length}
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">{stepCopy.title}</h1>
                <p className="max-w-xl text-sm sm:text-base text-slate-500 leading-relaxed">
                  {stepCopy.subtitle}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                {steps.map((step) => {
                  const active = paso === step.id;
                  const completed = paso > step.id;
                  return (
                    <span
                      key={step.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                        active
                          ? "border-transparent bg-[#0aa6b7] text-white shadow"
                          : completed
                          ? "border-[#0aa6b7]/40 text-[#0aa6b7]"
                          : "border-slate-200"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : active ? (
                        <CircleDot className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      {step.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white px-6 py-6 text-sm text-slate-500 shadow-lg shadow-slate-200/40 lg:min-w-[260px]">
              <div>
                <p className="text-xs font-semibold text-slate-400">Estado actual</p>
                <p className="mt-2 text-base font-semibold text-slate-800">
                  {paso === 1 ? "Datos personales" : paso === 2 ? "Selección médica" : "Agenda"}
                </p>
                <p className="mt-1 text-xs text-slate-400">Progreso {Math.round(progress)}%</p>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-2 text-slate-500">
                  <Clock4 className="h-4 w-4 text-[#0aa6b7]" /> 40 - 50 min promedio
                </p>
                <p className="flex items-center gap-2 text-slate-500">
                  <LifeBuoy className="h-4 w-4 text-[#0aa6b7]" /> Soporte asistencial 24/7
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#0aa6b7] to-[#30c2d2] transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></span>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm" role="alert">
            {error}
          </div>
        )}

        {formLoading && (
          <div className="flex items-center gap-2 text-sm text-[#0aa6b7]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#0aa6b7]" aria-hidden="true"></span>
            Cargando información, por favor espera...
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
          <div className="space-y-6 lg:flex lg:flex-col">
            {paso === 1 && (
              <section className="flex flex-col h-full rounded-3xl border border-white/70 bg-white px-6 py-8 shadow-lg shadow-slate-200/40 transition-shadow hover:shadow-2xl">
                <form onSubmit={handlePaso1} className="flex h-full flex-col gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#0aa6b7]">Información personal</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Comencemos contigo</h2>
                    <p className="text-sm text-slate-500">Revisa o ajusta tus datos de contacto antes de continuar.</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        Documento de identidad <span className="text-slate-400">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={paciente.documento}
                        onChange={(e) => setPaciente({ ...paciente, documento: e.target.value })}
                        placeholder="Ej. 12345678"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:border-transparent transition"
                      />
                    </div>

                    {["nombres", "apellidos", "correo", "telefono"].map((campo) => (
                      <div key={campo}>
                        <label className="mb-2 block text-sm font-medium text-slate-800 capitalize">
                          {campo === "correo" ? "Correo electrónico" : campo}
                        </label>
                        <input
                          type={campo === "correo" ? "email" : "text"}
                          value={paciente[campo]}
                          onChange={(e) => setPaciente({ ...paciente, [campo]: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:border-transparent transition"
                          required={campo !== "telefono"}
                          placeholder={campo === "telefono" ? "Ej. 999123456" : undefined}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-auto">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0aa6b7] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0aa6b7]/30 transition hover:-translate-y-0.5 hover:bg-[#098a99] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:ring-offset-2 focus:ring-offset-white"
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </section>
            )}

            {paso === 2 && (
              <section className="flex flex-col h-full rounded-3xl border border-white/70 bg-white px-6 py-8 shadow-lg shadow-slate-200/40 transition-shadow hover:shadow-2xl">
                <form onSubmit={handlePaso2} className="flex h-full flex-col gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#0aa6b7]">Selección médica</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Elige cómo deseas ser atendido</h2>
                    <p className="text-sm text-slate-500">Especialidad, tipo de consulta y profesional disponible.</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-800">Especialidad</label>
                      <select
                        value={cita.idEspecialidad}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCita({
                            idEspecialidad: value,
                            idMedico: "",
                            idTipo: "",
                            fecha: "",
                            hora: "",
                          });
                          setMedicos([]);
                          setHorarios({ disponibles: [], ocupados: [] });
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:border-transparent transition"
                        required
                      >
                        <option value="">Selecciona una especialidad</option>
                        {especialidades.map((esp) => (
                          <option key={esp.id_especialidad} value={esp.id_especialidad}>
                            {esp.nombre_especialidad}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">Tipo de consulta</label>
                      <select
                        value={cita.idTipo}
                        onChange={(e) => setCita((prev) => ({ ...prev, idTipo: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:border-transparent transition"
                        required
                        disabled={Boolean(cita.idEspecialidad) && tiposDisponibles.length === 0}
                      >
                        <option value="" disabled={Boolean(cita.idEspecialidad) && tiposDisponibles.length === 0}>
                          {tiposDisponibles.length ? "Selecciona un tipo" : "Sin tipos disponibles"}
                        </option>
                        {(cita.idEspecialidad ? tiposDisponibles : tiposCita).map((tipo) => (
                          <option key={tipo.id_tipo} value={tipo.id_tipo}>
                            {tipo.nombre_tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">Profesional disponible</label>
                      <select
                        value={cita.idMedico}
                        onChange={(e) => setCita((prev) => ({ ...prev, idMedico: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:border-transparent transition"
                        required
                      >
                        <option value="">Selecciona un médico</option>
                        {medicos.map((medico) => (
                          <option key={medico.id_medico} value={medico.id_medico}>
                            {medico.nombre}
                            {medico.especialidades ? ` · ${medico.especialidades}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0aa6b7] hover:text-[#0aa6b7] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:ring-offset-2 focus:ring-offset-white"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0aa6b7] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0aa6b7]/30 transition hover:-translate-y-0.5 hover:bg-[#098a99] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:ring-offset-2 focus:ring-offset-white"
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </section>
            )}

            {paso === 3 && (
              <section className="flex flex-col h-full rounded-3xl border border-white/70 bg-white px-6 py-8 shadow-lg shadow-slate-200/40 transition-shadow hover:shadow-2xl">
                <form onSubmit={handleConfirmarCita} className="flex h-full flex-col gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#0aa6b7]">Agenda</p>
                    <h2 className="text-2xl font-semibold text-slate-900">Define fecha y horario</h2>
                    <p className="text-sm text-slate-500">Mostramos únicamente horarios confirmados como disponibles.</p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">Fecha</label>
                      <input
                        type="date"
                        value={cita.fecha}
                        min={todayISO()}
                        onChange={(e) => setCita((prev) => ({ ...prev, fecha: e.target.value, hora: "" }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:border-transparent transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-800">Horario</label>
                      {horariosLoading ? (
                        <div className="text-sm text-[#0aa6b7]">Cargando horarios...</div>
                      ) : horarios.disponibles.length ? (
                        <div className="grid grid-cols-2 gap-3">
                          {horarios.disponibles.map((hora) => (
                            <button
                              key={hora}
                              type="button"
                              onClick={() => setCita((prev) => ({ ...prev, hora }))}
                              className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] ${
                                cita.hora === hora
                                  ? "border-transparent bg-[#0aa6b7] text-white shadow-sm shadow-[#0aa6b7]/40"
                                  : "border-slate-200 text-slate-600 hover:border-[#0aa6b7]/60 hover:text-slate-900"
                              }`}
                            >
                              {hora}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">
                          Selecciona una fecha para ver los horarios disponibles.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setPaso(2)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0aa6b7] hover:text-[#0aa6b7] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:ring-offset-2 focus:ring-offset-white"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0aa6b7] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0aa6b7]/30 transition hover:-translate-y-0.5 hover:bg-[#098a99] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] focus:ring-offset-2 focus:ring-offset-white"
                      disabled={formLoading}
                    >
                      {formLoading ? "Guardando..." : "Confirmar cita"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white px-6 py-7 shadow-xl shadow-slate-200/30">
              <h3 className="text-sm font-semibold text-slate-700 mb-5">Resumen de tu cita</h3>
              <dl className="space-y-4 text-sm text-slate-500">
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <Stethoscope className="h-4 w-4 text-[#0aa6b7]" /> Especialidad
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {especialidadSeleccionada?.nombre_especialidad ?? "Por definir"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <BookOpenCheck className="h-4 w-4 text-[#0aa6b7]" /> Consulta
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {tipoSeleccionado ? tipoSeleccionado.nombre_tipo : "Por definir"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <User2 className="h-4 w-4 text-[#0aa6b7]" /> Médico
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {nombreMedicoResumen}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <CalendarDays className="h-4 w-4 text-[#0aa6b7]" /> Fecha
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">{fechaSeleccionada}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <Clock4 className="h-4 w-4 text-[#0aa6b7]" /> Horario
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">{horaSeleccionada}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-4">
                  <dt className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-[#0aa6b7]" /> Tarifa estimada
                  </dt>
                  <dd className="text-right text-base font-semibold text-[#0aa6b7]">S/ {tarifaBase.toFixed(2)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white px-6 py-6 text-sm text-slate-500 shadow-xl shadow-slate-200/30">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Asistencia</h3>
              <p>
                ¿Necesitas apoyo para completar tu reserva? Nuestro chatbot y equipo asistencial están disponibles para resolver tus dudas o ayudarte con cambios.
              </p>
              <a href="/contactanos" className="mt-4 inline-flex items-center gap-2 text-[#0aa6b7] font-semibold">
                <LifeBuoy className="h-4 w-4" /> Contactar soporte
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
