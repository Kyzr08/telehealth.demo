import { Link } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaStore } from "react-icons/fa";
import { Video } from "lucide-react";

export default function MobileNav({ isActive }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-2 z-50">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center text-xs hover:text-[#0aa6b7] ${
          isActive("/") ? "text-[#0aa6b7]" : "text-[#6B7A90]"
        }`}
      >
        <FaHome className="text-lg" />
  <span className="text-[10px] mt-0.5">Inicio</span>
      </Link>
      <Link
        to="/reservas"
        className={`flex flex-col items-center justify-center text-xs hover:text-[#0aa6b7] ${
          isActive("/reservas") ? "text-[#0aa6b7]" : "text-[#6B7A90]"
        }`}
      >
        <FaCalendarAlt className="text-lg" />
  <span className="text-[10px] mt-0.5">Reservas</span>
      </Link>
      <Link
        to="/telemedicina"
        className={`flex flex-col items-center justify-center text-xs hover:text-[#0aa6b7] ${
          isActive("/telemedicina") ? "text-[#0aa6b7]" : "text-[#6B7A90]"
        }`}
      >
        <Video className="text-lg" />
  <span className="text-[10px] mt-0.5">Telemedicina</span>
      </Link>
      <Link
        to="/tienda"
        className={`flex flex-col items-center justify-center text-xs hover:text-[#0aa6b7] ${
          isActive("/tienda") ? "text-[#0aa6b7]" : "text-[#6B7A90]"
        }`}
      >
        <FaStore className="text-lg" />
  <span className="text-[10px] mt-0.5">Tienda</span>
      </Link>
    </nav>
  );
}
