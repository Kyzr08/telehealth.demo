import { Link } from "react-router-dom";
import doctorImg from "../assets/home.png";
import bolasSvg from "../assets/bolas.svg";
import arcosSvg from "../assets/arcos.svg";

export default function Hero() {
  return (
    <section className="relative w-full bg-[#f0fafd] pt-[140px] md:pt-32 lg:pt-36 overflow-hidden">
      <div className="w-full max-w-[1300px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-12 relative z-10">
        
        {/* Columna texto */}
        <div className="flex flex-col justify-start md:w-1/2 w-full max-w-[600px] mb-10 md:mb-0">
          <span className="text-sm md:text-base font-semibold text-[#0aa6b7] bg-[#d6f7fa] px-4 py-1 rounded mb-4 tracking-wide w-fit">
            TeleHealth+
          </span>
          <h1 className="text-3xl md:text-[2.6rem] font-extrabold text-[#1e293b] leading-tight mb-4">
            La mejor plataforma de Telemedicina y Bienestar Digital
          </h1>
          <p className="text-base md:text-lg text-[#64748b] mb-6 max-w-xl">
            Reserva tus citas médicas, accede a tu historial clínico, consulta en línea con profesionales de la salud y potencia tu bienestar con herramientas modernas como gamificación, tienda virtual y chatbot inteligente.
          </p>

          {/* ✅ Aquí el cambio */}
          <Link
            to="/contactanos"
            className="bg-[#0aa6b7] hover:bg-[#088a97] text-white font-semibold px-6 py-3 rounded-md shadow transition-all duration-200 text-base w-fit cursor-pointer"
          >
            ¿Hablamos?
          </Link>
        </div>

        {/* Columna imagen */}
        <div className="relative flex items-center justify-center md:justify-end md:w-1/2 w-full h-full">
          <img
            src={bolasSvg}
            alt="Decoración bolas"
            className="absolute bottom-6 right-[5%] sm:right-[-60px] md:right-[-120px] 
                      w-[300px] sm:w-[220px] md:w-[500px] lg:w-[650px] 
                      z-0 pointer-events-none animate-float-slow"
          />

          <img
            src={arcosSvg}
            alt="Decoración arcos"
            className="absolute bottom-0 right-[15%] sm:right-0 
                      w-[280px] sm:w-[350px] md:w-[600px] lg:w-[750px] xl:w-[900px] 
                      z-0 pointer-events-none animate-spin-slow"
          />

          <img
            src={doctorImg}
            alt="Doctores"
            className="relative z-10 w-[15rem] sm:w-[22rem] md:w-[30rem] lg:w-[35rem] h-auto object-contain"
            style={{ maxHeight: "520px" }}
          />
        </div>
      </div>
    </section>
  );
}
