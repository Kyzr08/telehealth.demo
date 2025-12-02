import { Link } from "react-router-dom";
import { X, User, FileText, HelpCircle, LogOut } from "lucide-react";
import { FaRegHandshake, FaHandsHelping, FaPeopleCarry, FaUsers } from "react-icons/fa"; // Importar otros íconos

export default function Drawer({ user, drawerOpen, setDrawerOpen, handleLogout }) {
  const colorAvatar = (id) => {
    const colores = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
    return id !== undefined
      ? colores[id % colores.length]
      : colores[Math.floor(Math.random() * colores.length)];
  };

  const obtenerIniciales = (u) =>
    u ? ((u.nombre?.[0] || "") + (u.apellido?.[0] || "")).toUpperCase() : "";

  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white z-[100] transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"} lg:hidden shadow-xl flex flex-col border-l border-gray-200`}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
  <span className="text-base font-semibold tracking-tight text-gray-800">Menú</span>
        <button onClick={() => setDrawerOpen(false)}>
          <X className="text-2xl cursor-pointer transition-colors" style={{ color: "var(--navbar-text)" }} />
        </button>
      </div>
      <div className="flex flex-col justify-between h-full text-gray-800">
        <div className="p-5 pb-0 overflow-y-auto">
          {/* Avatar and name/email */}
          {user && (
            <div className="flex flex-col items-center gap-2 mb-4">
              <div
                className={`w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow flex items-center justify-center ${
                  user?.avatar ? "" : "bg-gray-100"
                }`}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="w-full h-full flex items-center justify-center text-white text-lg font-semibold"
                    style={{ backgroundColor: colorAvatar(user?.id_usuario) }}
                  >
                    {obtenerIniciales(user) || "U"}
                  </span>
                )}
              </div>
              <span className="font-semibold text-gray-800 text-base">¡Hola {user.nombre ? user.nombre : "Usuario"}!</span>
              <span className="text-xs text-gray-400 font-normal">{user.correo || "correo@ejemplo.com"}</span>
            </div>
          )}
          <hr className="border-t border-gray-200 mb-2" />
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/cuenta" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors">
                  <User className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
                  <span className="text-base">Cuenta</span>
                </Link>
                <Link to="/historial" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors">
                  <FileText className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
                  <span className="text-base">Historial</span>
                </Link>
                <Link to="/help" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors">
                  <HelpCircle className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
                  <span className="text-base">Ayuda</span>
                </Link>
                <hr className="my-2 border-t border-gray-200" />
                <Link to="/nosotros" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors">
                  <FaUsers className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
                  <span className="text-base">Nosotros</span>
                </Link>
                <Link to="/contactanos" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors">
                  <HelpCircle className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
                  <span className="text-base">Contáctanos</span>
                </Link>
                <Link to="/blog" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors">
                  <FileText className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
                  <span className="text-base">Blog</span>
                </Link>
              </>
            ) : (
              <Link to="/login" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 text-left text-white bg-[#0aa6b7] hover:bg-[#22c1c3] px-4 py-3 rounded transition-colors">
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
        {/* Logout button fixed at bottom */}
        {user && (
          <div className="px-5 pb-6 pt-2 border-t border-gray-200">
            <button onClick={() => { handleLogout(); setDrawerOpen(false); }} className="flex items-center gap-3 text-left text-red-500 hover:bg-red-50 px-4 py-3 rounded w-full transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-base">Cerrar la sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
