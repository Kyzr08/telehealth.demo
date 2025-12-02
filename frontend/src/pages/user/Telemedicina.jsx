import { Link } from "react-router-dom";
import {
  FiVideo,
  FiShield,
  FiMessageSquare,
  FiClock,
  FiUsers,
  FiHeart,
  FiGlobe,
  FiCheckCircle,
} from "react-icons/fi";

const highlights = [
  {
    icon: FiVideo,
    title: "Consultas en vivo",
    description: "Videollamadas HD y chat seguro con tu especialista desde cualquier dispositivo.",
  },
  {
    icon: FiShield,
    title: "Privacidad garantizada",
    description: "Cumplimos estándares internacionales de confidencialidad y almacenamiento seguro de datos.",
  },
  {
    icon: FiMessageSquare,
    title: "Acompañamiento continuo",
    description: "Recibe seguimiento y recordatorios automáticos para no perder tus tratamientos.",
  },
];

const steps = [
  {
    title: "1. Regístrate y completa tu perfil",
    detail: "Crea tu cuenta en minutos y cuéntanos sobre tus antecedentes y necesidades médicas.",
  },
  {
    title: "2. Elige especialidad y horario",
    detail: "Explora nuestra red de especialistas certificados y agenda la fecha que más te convenga.",
  },
  {
    title: "3. Conéctate y recibe tu plan",
    detail: "Ingresa a la videollamada desde la app, recibe el diagnóstico y tus recomendaciones personalizadas.",
  },
];

const specialtyHighlights = [
  "Medicina general y seguimiento de pacientes crónicos",
  "Cardiología y monitoreo de factores de riesgo",
  "Salud mental, psicoterapia individual y familiar",
  "Nutrición y control metabólico a distancia",
  "Ginecología, obstetricia y acompañamiento perinatal",
  "Pediatría con orientación para madres, padres y cuidadores",
];

const stats = [
  { label: "Especialistas certificados", value: "+80" },
  { label: "Ciudades conectadas", value: "24" },
  { label: "Satisfacción de pacientes", value: "97%" },
];

const testimonials = [
  {
    name: "Andrea Suárez",
    role: "Paciente con seguimiento cardiológico",
    quote:
      "La plataforma me permite controlar mi presión y hablar con mi cardióloga sin desplazarme. Es como tener la clínica en casa.",
  },
  {
    name: "Luis Ramos",
    role: "Papá primerizo",
    quote:
      "Nuestro pediatra respondió todas nuestras dudas en minutos. La videollamada fue clara y muy humana.",
  },
];

export default function Telemedicina() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-18">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cyan-50 via-white to-cyan-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-6 py-24 md:flex-row md:items-center">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-700 shadow-sm">
              <FiCheckCircle className="h-4 w-4" /> Telemedicina 360°
            </span>
            <h1 className="text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl">
              Cuida tu salud sin detener tu rutina diaria
            </h1>
            <p className="text-lg text-slate-600 md:text-xl">
              Con Telehealth+ accedes a especialistas certificados, historial clínico digital y seguimiento continuo desde la comodidad de tu hogar.
            </p>

            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
              <Link
                to="/reservas"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0aa6b7] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-[#08929f]"
              >
                Reserva tu teleconsulta
                <FiVideo className="h-5 w-5" />
              </Link>
              <a
                href="#beneficios"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0aa6b7]/30 px-6 py-3 text-base font-semibold text-[#0aa6b7] transition hover:border-[#0aa6b7]"
              >
                Explorar beneficios
                <FiGlobe className="h-5 w-5" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/60 bg-white/80 px-6 py-5 text-center shadow-sm backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-[#0aa6b7]">{item.value}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <img
              src="/img/consultatele.png"
              alt="Teleconsulta desde casa"
              className="w-full rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Highlight cards */}
      <section id="beneficios" className="mx-auto mt-16 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">¿Por qué elegir la telemedicina de Telehealth+?</h2>
          <p className="mt-3 text-base text-slate-600 md:text-lg">
            Nuestro ecosistema digital integra especialistas, historia clínica y tecnología segura para brindarte la mejor experiencia.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <item.icon className="mb-4 h-12 w-12 text-[#0aa6b7]" />
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0aa6b7]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#0aa6b7]">
              <FiClock className="h-4 w-4" /> Sin tiempos de espera
            </span>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Agenda en minutos y recibe atención personalizada
            </h2>
            <p className="text-base text-slate-600">
              Nuestro flujo está diseñado para que recibas orientación médica en menos de 24 horas, con documentación digital y recordatorios inteligentes.
            </p>
            <Link
              to="/reservas"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ver disponibilidad de especialistas
              <FiUsers className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-3xl bg-[#0aa6b7]/90 px-8 py-12 text-white shadow-lg lg:px-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Especialidades destacadas en línea</h2>
              <p className="text-base text-white/90">
                Contamos con un equipo multidisciplinario listo para resolver tus dudas y acompañarte durante todo tu tratamiento.
              </p>
            </div>

            <ul className="grid gap-3 text-sm font-medium text-white/90 sm:grid-cols-2">
              {specialtyHighlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <FiCheckCircle className="mt-1 h-5 w-5 text-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Historias reales que inspiran confianza</h2>
          <p className="mt-3 text-base text-slate-600 md:text-lg">
            Pacientes y familias que encontraron en la telemedicina una forma cómoda y segura de cuidar su salud.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <FiHeart className="h-8 w-8 text-[#0aa6b7]" />
              <p className="mt-4 text-base text-slate-600">“{item.quote}”</p>
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Da el siguiente paso hacia una salud conectada</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Agenda tu primera teleconsulta y recibe un plan personalizado. Nuestro equipo está listo para acompañarte en todo momento.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/reservas"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0aa6b7] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#08929f]"
            >
              Ir a reservas en línea
              <FiVideo className="h-5 w-5" />
            </Link>
            <a
              href="tel:+51999999999"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0aa6b7] px-6 py-3 text-base font-semibold text-[#0aa6b7] transition hover:bg-[#0aa6b7]/10"
            >
              Contactar asesor
              <FiMessageSquare className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
