import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaStore,
  FaTruck,
  FaCreditCard,
  FaBell,
  FaStar,
  FaGamepad,
  FaNewspaper,
  FaEllipsisH,
} from "react-icons/fa";

export default function AdminSidebar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const links = [
    { to: "/admin", label: "Dashboard", icon: <FaHome /> },
    { to: "/admin/usuarios", label: "Usuarios", icon: <FaUsers /> },
    { to: "/admin/citas", label: "Citas", icon: <FaCalendarAlt /> },
    { to: "/admin/historial", label: "Historial", icon: <FaClipboardList /> },
    { to: "/admin/tienda", label: "Tienda", icon: <FaStore /> },
    { to: "/admin/pedidos", label: "Pedidos", icon: <FaTruck /> },
    { to: "/admin/pagos", label: "Pagos", icon: <FaCreditCard /> },
    { to: "/admin/notificaciones", label: "Notificaciones", icon: <FaBell /> },
    { to: "/admin/reseñas", label: "Reseñas", icon: <FaStar /> },
    { to: "/admin/blogs", label: "Blog", icon: <FaNewspaper /> },
    { to: "/admin/gamificacion", label: "Gamificación", icon: <FaGamepad /> },
  ];

  const mainLinks = links.slice(0, 6);
  const dropdownLinks = links.slice(6);

  // Cierra el menú al hacer clic fuera
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
  <aside className="hidden lg:flex fixed top-5 left-4 w-64 bg-white rounded-2xl shadow-xl flex-col justify-between h-[95vh] z-40 admin-sidebar-desktop">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 p-2 rounded-lg">
            <FaHome className="text-white text-lg" />
          </div>
          <h1 className="font-bold text-gray-800 text-sm">TeleHealthPlus</h1>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-1 transition-all duration-200 ${
                  isActive
                    ? "text-[#0aa6b7] font-semibold bg-sky-50"
                    : "text-[#6B7A90] hover:bg-gray-100 hover:text-[#120F43]"
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

  {/* NAV INFERIOR MÓVIL */}
  <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-2 z-50 admin-bottom-nav">
        {mainLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            onClick={() => setMoreOpen(false)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs ${
                isActive ? "text-sky-500" : "text-[#6B7A90] hover:text-sky-400"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-[10px] mt-0.5">{link.label}</span>
          </NavLink>
        ))}

        {/* Dropdown for additional links */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMoreOpen((prev) => !prev);
            }}
            aria-expanded={moreOpen}
            aria-controls="more-menu"
            className="flex flex-col items-center justify-center text-xs text-[#6B7A90] hover:text-sky-400"
          >
            <FaEllipsisH className="text-lg" />
            <span className="text-[10px] mt-0.5">Más</span>
          </button>
          {moreOpen && (
            <div
              id="more-menu"
              className="absolute bottom-12 right-0 bg-white border border-gray-200 shadow-md rounded-lg py-2 z-50"
            >
              {dropdownLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/admin"}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? "text-sky-500" : "text-[#6B7A90] hover:text-sky-400"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
      {/* Media query para mostrar menú inferior y ocultar sidebar en iPad Pro (1024x1366) */}
      <style>{`
        @media (min-width: 1024px) and (max-width: 1366px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
          .admin-bottom-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
