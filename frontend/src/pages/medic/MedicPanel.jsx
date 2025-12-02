import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SidebarMedic from "./SidebarMedic";
import {
  FaBell,
  FaCog,
  FaQuestionCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function MedicPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // 🩺 Títulos de las páginas médicas
  const pageTitles = {
    "/medic/dashboard": "Dashboard Médico",
    "/medic/pacientes": "Pacientes",
    "/medic/citas": "Citas Médicas",
    "/medic/historial": "Historial Clínico",
    "/medic/recetas": "Recetas Médicas",
    "/medic/mensajes": "Mensajes",
  };

  const decodedPath = decodeURIComponent(location.pathname);
  const matchedPath =
    Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length)
      .find((path) => decodedPath.startsWith(path)) || "/medic/dashboard";

  const title = pageTitles[matchedPath] || "Panel Médico";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F5F7FA] text-gray-800 flex-col lg:flex-row">
      {/* Sidebar */}
      <SidebarMedic />

      {/* Main content */}
      <main className="flex-1 px-8 py-6 overflow-y-auto lg:ml-65 -mt-1">
        {/* Header alineado */}
        <header className="flex justify-between items-center mb-8 relative mt-4">
          {/* Título */}
          <h1 className="text-lg sm:text-xl font-bold text-[#120F43]">
            {title}
          </h1>

          {/* Íconos (desktop) */}
          <div className="hidden sm:flex items-center gap-5 text-gray-500">
            <FaBell
              className="text-lg hover:text-[#0aa6b7] cursor-pointer transition-colors duration-150"
              onClick={() => navigate("/medic/mensajes")}
              title="Mensajes"
            />
            <FaQuestionCircle
              className="text-lg hover:text-[#0aa6b7] cursor-pointer transition-colors duration-150"
              onClick={() => navigate("/medic/help")}
              title="Ayuda"
            />
            <FaCog
              className="text-lg hover:text-[#0aa6b7] cursor-pointer transition-colors duration-150"
              onClick={() => navigate("/medic/configuracion")}
              title="Configuración"
            />
            <img
              src="/img/pg.jpg"
              alt="Avatar médico"
              className="w-9 h-9 rounded-full shadow object-cover border border-gray-200"
            />
          </div>

          {/* Menú hamburguesa (móvil) */}
          <button
            className="sm:hidden flex items-center justify-center text-gray-700 hover:text-[#0aa6b7] transition-colors duration-150 mt-[2px]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>

          {/* Dropdown menú (solo móvil) */}
          {menuOpen && (
            <div className="absolute right-0 top-14 bg-white shadow-lg rounded-xl p-3 flex flex-col gap-3 w-44 z-50 border border-gray-100 animate-fadeIn">
              <button
                className="flex items-center gap-2 text-gray-700 hover:text-[#0aa6b7] transition"
                onClick={() => {
                  navigate("/medic/configuracion");
                  setMenuOpen(false);
                }}
              >
                <FaCog /> Configuración
              </button>
              <button
                className="flex items-center gap-2 text-gray-700 hover:text-[#0aa6b7] transition"
                onClick={() => {
                  navigate("/medic/mensajes");
                  setMenuOpen(false);
                }}
              >
                <FaBell /> Mensajes
              </button>
              <button
                className="flex items-center gap-2 text-gray-700 hover:text-[#0aa6b7] transition"
                onClick={() => {
                  navigate("/medic/help");
                  setMenuOpen(false);
                }}
              >
                <FaQuestionCircle /> Ayuda
              </button>
            </div>
          )}
        </header>

        {/* Contenido dinámico */}
        <div className="w-full overflow-x-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
