import { FaHeartbeat, FaLaptopMedical } from "react-icons/fa";

export default function Nosotros() {
  return (
    <main className="bg-[var(--bg-main)] text-[var(--text-main)] font-sans overflow-hidden">
      {/* 🌐 HERO */}
      <section className="relative flex flex-col justify-center items-center text-center py-32 px-6 md:px-20">
        <img
          src="/img/HM.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--navbar-text)] mb-6 tracking-tight">
            Transformamos la salud con tecnología y empatía
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-sub)] max-w-2xl mx-auto leading-relaxed">
            En <span className="font-semibold text-[var(--navbar-text)]">TeleHealth+</span> 
            conectamos personas y profesionales a través de soluciones digitales que humanizan la atención médica.
          </p>
        </div>
      </section>

      {/* 💡 QUIÉNES SOMOS */}
      <section className="py-24 bg-white px-6 md:px-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-[var(--navbar-text)] mb-6">¿Quiénes somos?</h2>
          <p className="text-[var(--text-sub)] text-lg leading-relaxed mb-4">
            TeleHealth+ es una plataforma integral de salud digital que une médicos, pacientes y organizaciones médicas
            en un mismo ecosistema. Nuestro objetivo es mejorar la accesibilidad, seguridad y eficiencia del sector sanitario.
          </p>
          <p className="text-[var(--text-sub)] text-lg leading-relaxed">
            Buscamos que la tecnología se convierta en un aliado de la salud, ofreciendo herramientas simples pero poderosas,
            pensadas para la nueva era médica.
          </p>
        </div>
        <div className="flex-1">
          <img
            src="/img/img-doc-colaborando.jpg"
            alt="Equipo médico colaborando"
            className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
          />
        </div>
      </section>

      {/* 🎯 MISIÓN Y VISIÓN */}
      <section className="py-24 bg-[var(--bg-main)] px-6 md:px-32 text-center">
        <h2 className="text-3xl font-bold text-[var(--navbar-text)] mb-12">Nuestra Misión y Visión</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="p-10 bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300">
            <FaLaptopMedical className="text-5xl text-[var(--navbar-text)] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[var(--navbar-text)] mb-3">Misión</h3>
            <p className="text-[var(--text-sub)] leading-relaxed">
              Brindar atención médica digital accesible, segura y eficiente,
              conectando pacientes y médicos mediante tecnología avanzada con un trato humano.
            </p>
          </div>
          <div className="p-10 bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300">
            <FaHeartbeat className="text-5xl text-[var(--navbar-text)] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[var(--navbar-text)] mb-3">Visión</h3>
            <p className="text-[var(--text-sub)] leading-relaxed">
              Ser la plataforma líder de salud digital en Latinoamérica, transformando
              la forma en que se brinda atención médica, basada en confianza, innovación y empatía.
            </p>
          </div>
        </div>
      </section>

      {/* 🏥 HISTORIA */}
      <section className="py-24 bg-white px-6 md:px-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <img
            src="/img/HM2.png"
            alt="Historia TeleHealth+"
            className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-[var(--navbar-text)] mb-6">Nuestra historia</h2>
          <p className="text-[var(--text-sub)] text-lg leading-relaxed mb-4">
            TeleHealth+ nace en 2025 como respuesta a la creciente necesidad de 
            digitalizar el sistema de salud. Inspirados por los retos de la atención médica moderna,
            decidimos crear una plataforma que acerque la tecnología a las personas.
          </p>
          <p className="text-[var(--text-sub)] text-lg leading-relaxed">
            Hoy, somos un puente entre la innovación y el bienestar humano, trabajando 
            con instituciones, médicos y pacientes para impulsar la medicina del futuro.
          </p>
        </div>
      </section>

      {/* � SOLUCIONES TELEHEALTH+ */}
      <section className="py-24 bg-[var(--bg-main)] px-6 md:px-32">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.95fr,1.05fr] md:items-start">
          <div>
            <p className="text-sm font-medium text-[var(--navbar-text)]/70">Soluciones TeleHealth+</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--navbar-text)] md:text-4xl">
              Un ecosistema digital que integra atención remota, citas presenciales y servicios complementarios
            </h2>
            <p className="mt-5 text-[var(--text-sub)]">
              Todos los módulos del proyecto están pensados para pacientes, médicos y administradores: desde la teleconsulta y la
              reserva de citas hasta el historial clínico y los pagos, todo conectado con la tienda de productos de salud.
            </p>
            <ul className="mt-8 space-y-4 text-[var(--text-sub)]">
              <li className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--navbar-text)]" />
                <span>Telemedicina 360° con videollamadas HD, chat seguro y seguimiento desde la página de telemedicina.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--navbar-text)]" />
                <span>Motor de reservas que conecta especialidades, médicos disponibles y tipos de cita, con confirmación y horarios en tiempo real.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--navbar-text)]" />
                <span>Historial clínico compartido entre paciente y médico, con recetas digitales integradas a la plataforma.</span>
              </li>
            </ul>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--navbar-text)]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--navbar-text)]">Reservas y pagos coordinados</p>
              <p className="mt-3 text-sm text-[var(--text-sub)]">
                El módulo de reservas permite elegir especialidad, profesional, fecha y realizar el pago desde la misma plataforma.</p>
              <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--navbar-text)]/70">ReservaCitas + PaymentPage</div>
            </div>
            <div className="rounded-3xl border border-[var(--navbar-text)]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--navbar-text)]">Soporte a pacientes crónicos</p>
              <p className="mt-3 text-sm text-[var(--text-sub)]">
                Telemedicina ofrece video-consultas, seguimiento y recordatorios, mientras Historial guarda la evolución y recetas.</p>
              <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--navbar-text)]/70">Telemedicina + Historial</div>
            </div>
            <div className="rounded-3xl border border-[var(--navbar-text)]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--navbar-text)]">Tienda integrada</p>
              <p className="mt-3 text-sm text-[var(--text-sub)]">
                La tienda permite comprar insumos y dispositivos médicos, con carrito asociado al usuario y pasarela de pago propia.</p>
              <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--navbar-text)]/70">Tienda + PaymentPage</div>
            </div>
            <div className="rounded-3xl border border-[var(--navbar-text)]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-sm font-semibold text-[var(--navbar-text)]">Panel médico y administrativo</p>
              <p className="mt-3 text-sm text-[var(--text-sub)]">
                Cada rol (paciente, médico, admin) cuenta con panel dedicado para gestionar citas, historiales y operaciones.</p>
              <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--navbar-text)]/70">Paneles / Dashboard</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}