import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUserInjured,
  FaCalendarCheck,
  FaChartPie,
  FaClipboardList,
  FaPrescriptionBottleAlt,
  FaComments,
  FaSignOutAlt,
  FaClinicMedical,
} from "react-icons/fa";

export default function SidebarMedic() {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const links = [
    { to: "/medic", label: "Dashboard", icon: <FaChartPie /> },
    { to: "/medic/pacientes", label: "Pacientes", icon: <FaUserInjured /> },
    { to: "/medic/citas", label: "Citas", icon: <FaCalendarCheck /> },
    { to: "/medic/historial", label: "Historial", icon: <FaClipboardList /> },
    { to: "/medic/recetas", label: "Recetas", icon: <FaPrescriptionBottleAlt /> },
    { to: "/medic/mensajes", label: "Mensajes", icon: <FaComments /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex fixed top-4 left-4 w-64 bg-white rounded-2xl shadow-xl flex-col justify-between h-[94vh] z-40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 p-2 rounded-lg">
            <FaClinicMedical className="text-white text-lg" />
          </div>
          <h1 className="font-bold text-gray-800 text-sm">TeleHealthPlus</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/medic"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-1 transition-all duration-200 ${
                  isActive
                    ? "text-[#0aa6b7] font-bold"
                    : "text-[#6B7A90] hover:text-[#120F43]"
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 mt-3 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 transition-all duration-200"
          >
            <FaSignOutAlt className="text-base" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* NAV INFERIOR MÓVIL */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-2 z-50">
        {links.slice(0, 4).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/medic"}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs ${
                isActive ? "text-sky-500 font-bold" : "text-[#6B7A90] hover:text-sky-400"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-[10px] mt-0.5 hidden sm:block">{link.label}</span>
          </NavLink>
        ))}

        <div className="relative" ref={moreRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMoreOpen((prev) => !prev);
            }}
            aria-expanded={moreOpen}
            aria-controls="more-menu"
            className="flex flex-col items-center justify-center text-[#6B7A90] hover:text-sky-500"
            style={{ zIndex: 51 }}
          >
            <span className="text-2xl font-bold" style={{ letterSpacing: "2px" }}>⋮</span>
          </button>

          {moreOpen && (
            <div
              id="more-menu"
              className="absolute bottom-12 left-[-135px] bg-white shadow-lg rounded-xl border border-gray-100 py-2 px-2 w-40 z-50"
            >
              {links.slice(4).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/medic"}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "text-sky-600 font-bold"
                        : "text-gray-700 hover:text-sky-600"
                    }`
                  }
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setMoreOpen(false);
                  handleLogout();
                }}
                className="w-full text-left mt-1 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-red-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <FaSignOutAlt />
                  <span>Salir</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
