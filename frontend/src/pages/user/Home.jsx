import { useEffect, useState } from "react";
import Hero from "../../components/Hero";
import {
  FiCalendar,
  FiCpu,
  FiDatabase,
  FiMessageSquare,
  FiShield,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import Carrusel from "../../components/Carrusel";

const solutions = [
  {
    icon: FiCalendar,
    label: "Módulo",
    title: "Citas y Telemedicina",
    text: "Reserva de citas médicas online, consultas por videollamada y chat con profesionales de la salud en cualquier momento y lugar.",
  },
  {
    icon: FiDatabase,
    label: "Módulo",
    title: "Historial Clínico Digital",
    text: "Registro centralizado de consultas, diagnósticos, recetas y seguimiento, mejorando la continuidad asistencial y la seguridad del paciente.",
  },
  {
    icon: FiShoppingCart,
    label: "Módulo",
    title: "Tienda Virtual y Pagos",
    text: "Compra de productos y servicios de salud de forma segura, con pasarela de pagos integrada y recomendaciones personalizadas.",
  },
  {
    icon: FiCpu,
    label: "Módulo",
    title: "Asistente Inteligente y Gamificación",
    text: "Chatbot con IA para asistencia inmediata y herramientas de motivación que fomentan hábitos saludables mediante logros y recompensas.",
  },
];

const benefits = [
  {
    icon: FiUsers,
    title: "Experiencias personalizadas",
    text: "Automatizamos recordatorios, recomendaciones y seguimientos basados en el perfil clínico de cada paciente.",
  },
  {
    icon: FiShield,
    title: "Seguridad de nivel clínico",
    text: "Cumplimiento con normativas de protección de datos y cifrado de extremo a extremo en cada interacción.",
  },
  {
    icon: FiTrendingUp,
    title: "Insights accionables",
    text: "Paneles ejecutivos con métricas en tiempo real para optimizar recursos y detectar oportunidades de mejora.",
  },
  {
    icon: FiMessageSquare,
    title: "Acompañamiento continuo",
    text: "Interacciones híbridas entre automatización e intervención humana para mantener al paciente motivado y seguro.",
  },
];

export default function Home() {
  const [titleShift, setTitleShift] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const nextShift = Math.min(scrollTop * 0.04, 18);
      frameId = requestAnimationFrame(() => {
        setTitleShift(nextShift);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5fbfc]">
      <Hero />

      <section className="py-24 bg-white">
        <div className="w-full max-w-[1300px] px-6 md:px-12 mx-auto">
          <div className="mb-16 max-w-4xl text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0aa6b7]">
              Cómo te ayudamos
            </span>
            <h2
              className="mt-4 text-3xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-[#085d8a] via-[#0aa6b7] to-[#22c1c3] bg-clip-text animate-title-shine"
              style={{
                backgroundPosition: `center ${titleShift * 1.2}px`,
                transform: `translateY(${titleShift * 0.25}px)`
              }}
            >
              Nuestras soluciones de telemedicina adaptadas a tus necesidades
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            {solutions.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="flex flex-col gap-6 rounded-3xl border border-[#d6f7fa] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0aa6b7]/40 hover:shadow-lg"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0aa6b7]/15 to-[#22c1c3]/20 text-[#0aa6b7]">
                    <Icon className="w-9 h-9" />
                  </span>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0aa6b7]">
                      {item.label}
                    </p>
                    <h3 className="text-2xl font-semibold text-[#1e293b]">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[#64748b]">{item.text}</p>
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center text-sm font-semibold text-[#0aa6b7] transition-colors hover:text-[#088a97]"
                  >
                    Saber más
                    <span className="ml-2">&gt;</span>
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden bg-[#f0fafd]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#0aa6b7]/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[#22c1c3]/10 blur-3xl" />
        </div>

        <div className="w-full max-w-[1300px] px-6 md:px-12 mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0aa6b7]">
                Ventajas competitivas
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-snug text-[#1e293b] md:text-4xl">
                Tecnología y acompañamiento para transformar tu operación en salud
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#64748b]">
                Te ayudamos a lanzar experiencias de telemedicina que conectan con las necesidades reales de pacientes y equipos clínicos. Integramos procesos, automatizamos flujos críticos y compartimos mejores prácticas del sector.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-full bg-[#0aa6b7] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0aa6b7]/25 transition hover:-translate-y-0.5 hover:bg-[#088a97]"
                >
                  Conoce la plataforma
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center rounded-full border border-[#0aa6b7] px-6 py-3 text-sm font-semibold text-[#0aa6b7] transition hover:-translate-y-0.5 hover:bg-[#e5fafc]"
                >
                  Solicita acompañamiento
                </a>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const BenefitIcon = benefit.icon;
                return (
                  <article
                    key={benefit.title}
                    className="rounded-3xl border border-[#d6f7fa] bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#0aa6b7]/40"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0aa6b7]/15 to-[#22c1c3]/20 text-[#0aa6b7]">
                      <BenefitIcon className="w-6 h-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-[#1e293b]">{benefit.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#64748b]">{benefit.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Carrusel />

      <style>
        {`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float-slow {
            animation: floatSlow 4s ease-in-out infinite;
          }
          @keyframes titleShine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-title-shine {
            background-size: 200% 200%;
            animation: titleShine 8s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
