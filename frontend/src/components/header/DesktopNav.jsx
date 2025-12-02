import { Link } from "react-router-dom";
import { CalendarCheck, Video, ShoppingCart, ChevronDown, FileText } from "lucide-react";
import { FaUsers } from "react-icons/fa";

export default function DesktopNav({ isActive, openServicios, setOpenServicios, refServicios, openRecursos, setOpenRecursos, refRecursos }) {
  return (
    <ul className="hidden lg:flex space-x-8 font-medium text-gray-700">
      <li>
        <Link
          to="/"
          className={`relative cursor-pointer transition after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#0aa6b7] after:transition-all after:duration-300 hover:after:w-full ${
            isActive("/") ? "text-[#0aa6b7]" : "hover:text-[#0aa6b7]"
          }`}
        >
          Inicio
        </Link>
      </li>
      {/* Services Dropdown */}
      <li className="relative" ref={refServicios}>
        <button
          onClick={() => setOpenServicios(!openServicios)}
          className="relative flex items-center gap-2 cursor-pointer hover:text-[#0aa6b7] transition focus:outline-none"
        >
          Servicios
          <ChevronDown className={`w-4 h-4 transition-transform ${openServicios ? "rotate-180" : ""}`} />
        </button>
        {openServicios && (
          <div className="absolute z-20 left-0 mt-10 w-[650px] bg-white rounded-xl shadow-lg border border-gray-200 grid grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <Link
                to="/reservas"
                onClick={() => setOpenServicios(false)}
                className="flex items-start gap-3 hover:bg-[#f0f9fa] p-3 rounded-lg transition"
              >
                <CalendarCheck className="text-[#0aa6b7] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Reservar citas</p>
                  <p className="text-sm text-gray-500">Agenda tus citas médicas</p>
                </div>
              </Link>
              <Link
                to="/telemedicina"
                onClick={() => setOpenServicios(false)}
                className="flex items-start gap-3 hover:bg-[#f0f9fa] p-3 rounded-lg transition"
              >
                <Video className="text-[#0aa6b7] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Telemedicina</p>
                  <p className="text-sm text-gray-500">Atención médica remota</p>
                </div>
              </Link>
              <Link
                to="/tienda"
                onClick={() => setOpenServicios(false)}
                className="flex items-start gap-3 hover:bg-[#f0f9fa] p-3 rounded-lg transition"
              >
                <ShoppingCart className="text-[#0aa6b7] w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Tienda en línea</p>
                  <p className="text-sm text-gray-500">Productos de salud en línea</p>
                </div>
              </Link>
            </div>
            <div className="space-y-4">
              <div className="block hover:bg-[#f0f9fa] p-3 rounded-lg transition cursor-default">
                <p className="font-semibold">Tecnología</p>
                <p className="text-sm text-gray-500">Solución escalable y segura</p>
              </div>
              <div className="block hover:bg-[#f0f9fa] p-3 rounded-lg transition cursor-default">
                <p className="font-semibold">Software de telemedicina</p>
                <p className="text-sm text-gray-500">Tu aliado en salud digital</p>
              </div>
            </div>
          </div>
        )}
      </li>
      {/* Resources Dropdown */}
      <li className="relative" ref={refRecursos}>
        <button
          onClick={() => setOpenRecursos(!openRecursos)}
          className="relative flex items-center gap-2 cursor-pointer hover:text-[#0aa6b7] transition focus:outline-none"
        >
          Recursos
          <ChevronDown className={`w-4 h-4 transition-transform ${openRecursos ? "rotate-180" : ""}`} />
        </button>
        {openRecursos && (
          <div className="absolute z-20 left-0 mt-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col p-3">
            <Link
              to="/blog"
              onClick={() => setOpenRecursos(false)}
              className="flex items-center gap-2 hover:bg-[#f0f9fa] p-2 rounded-lg transition"
            >
              <FileText className="w-5 h-5 text-[#0aa6b7]" />
              Blog
            </Link>
          </div>
        )}
      </li>
      <li>
        <Link
          to="/nosotros"
          className={`relative cursor-pointer transition after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#0aa6b7] after:transition-all after:duration-300 hover:after:w-full ${
            isActive("/nosotros") ? "text-[#0aa6b7]" : "hover:text-[#0aa6b7]"
          }`}
        >
          Nosotros
        </Link>
      </li>
      <li>
        <Link
          to="/contactanos"
          className={`relative cursor-pointer transition after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#0aa6b7] after:transition-all after:duration-300 hover:after:w-full ${
            isActive("/contactanos") ? "text-[#0aa6b7]" : "hover:text-[#0aa6b7]"
          }`}
        >
          Contáctanos
        </Link>
      </li>
    </ul>
  );
}
