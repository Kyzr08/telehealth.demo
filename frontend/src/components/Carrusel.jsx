import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const especialidades = [
  {
    nombre: "Cardiología",
    img: "/img/cardiologia.jpg",
    descripcion:
      "Monitoreo integral del sistema cardiovascular con especialistas y tecnología de seguimiento remoto.",
  },
  {
    nombre: "Pediatría",
    img: "/img/pediatria.jpg",
    descripcion:
      "Cuidado preventivo y consultorías digitales para acompañar cada etapa del desarrollo infantil.",
  },
  {
    nombre: "Dermatología",
    img: "/img/dermatologia.jpg",
    descripcion:
      "Diagnósticos asistidos por IA, tratamientos personalizados y control fotográfico de lesiones cutáneas.",
  },
  {
    nombre: "Psicología",
    img: "/img/psicologia.jpg",
    descripcion:
      "Sesiones por videollamada, seguimiento terapéutico y programas de bienestar emocional corporativo.",
  },
  {
    nombre: "Nutrición",
    img: "/img/nutricion.jpg",
    descripcion:
      "Planes nutricionales dinámicos con analítica de hábitos y acompañamiento de coaches especializados.",
  },
];

export default function Carrusel() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-[#f0fafd] to-[#e5fafc]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-16 left-[10%] h-48 w-48 rounded-full bg-[#0aa6b7]/10 blur-3xl" />
        <div className="absolute -bottom-24 right-[8%] h-64 w-64 rounded-full bg-[#22c1c3]/15 blur-3xl" />
      </div>

      <div className="w-full max-w-[1300px] px-6 md:px-12 mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0aa6b7]">
            Especialidades
          </span>
          <h2 className="mt-4 text-3xl font-bold text-[var(--text-main)] md:text-4xl">
            Especialidades médicas que impulsan el cuidado integral
          </h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-[var(--text-sub)]">
            Integramos equipos clínicos y herramientas digitales para ofrecer experiencias de atención
            consistentes, seguras y centradas en el paciente.
          </p>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={36}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3200, disableOnInteraction: false }}
          speed={1400}
          breakpoints={{
            640: { slidesPerView: 1.6 },
            1024: { slidesPerView: 2.2 },
            1280: { slidesPerView: 3 },
          }}
          className="select-none"
        >
          {especialidades.map((esp, idx) => (
            <SwiperSlide key={idx}>
              <article className="group relative flex h-[340px] overflow-hidden rounded-3xl border border-[#d6f7fa] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#0aa6b7]/40 hover:shadow-2xl">
                <div className="absolute inset-0">
                  <img
                    src={esp.img}
                    alt={esp.nombre}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0aa6b7]/15 via-[#0aa6b7]/40 to-[#0aa6b7]/80 opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute top-4 right-4 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0aa6b7]">
                    Atención premium
                  </div>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-8 text-left text-white">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                      Especialidad
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight text-white">
                      {esp.nombre}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">
                    {esp.descripcion}
                  </p>
                 
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
