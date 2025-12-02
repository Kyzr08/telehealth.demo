import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { User, HelpCircle } from "lucide-react";

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: "", apellido: "", avatar: "", id: null });

  // 🎨 Colores aleatorios para avatar sin imagen
  const colorAvatar = (id) => {
    const colores = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
    return id !== undefined
      ? colores[id % colores.length]
      : colores[Math.floor(Math.random() * colores.length)];
  };

  // 🔤 Iniciales del usuario
  const obtenerIniciales = (u) =>
    u ? ((u.nombre?.[0] || "") + (u.apellido?.[0] || "")).toUpperCase() : "";

  // 🔹 Cargar usuario desde sessionStorage y backend
  useEffect(() => {
    const storedUser = sessionStorage.getItem("usuario");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.usuarios)) {
            const current = data.usuarios.find(
              (u) => String(u.id) === String(userObj.id_usuario)
            );
            if (current) setUsuario(current);
          }
        });
    }

    const handleUserUpdate = () => {
      const updatedUser = sessionStorage.getItem("usuario");
      if (updatedUser) setUsuario(JSON.parse(updatedUser));
    };
    window.addEventListener("usuarioActualizado", handleUserUpdate);
    return () => window.removeEventListener("usuarioActualizado", handleUserUpdate);
  }, []);

  // 🔖 Rutas y títulos
  const pageTitles = {
    "/admin": "Dashboard",
    "/admin/usuarios": "Usuarios",
    "/admin/citas": "Citas",
    "/admin/historial": "Historial Clínico",
    "/admin/tienda": "Tienda",
    "/admin/pagos": "Pagos",
    "/admin/notificaciones": "Notificaciones",
    "/admin/reseñas": "Reseñas",
    "/admin/blogs": "Blog",
    "/admin/gamificacion": "Gamificación",
  };

  const decodedPath = decodeURIComponent(location.pathname);
  const matchedPath =
    Object.keys(pageTitles)
      .sort((a, b) => b.length - a.length)
      .find((path) => decodedPath.startsWith(path)) || "/admin";

  const title = pageTitles[matchedPath] || "Panel Administrativo";

  // Add the handleLogout function from AdminSidebar
  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-y-auto bg-gradient-to-br from-[#F5F7FA] to-[#EAEFFF] text-gray-800 flex-col lg:flex-row">
      {/* Sidebar fijo en escritorio */}
      <AdminSidebar />

      {/* Sidebar móvil tipo UTP con botón cerrar sesión fijo abajo */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarMobile ? "translate-x-0" : "-translate-x-full"
  } lg:hidden shadow-xl flex flex-col border-r border-gray-200`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <span className="text-base font-semibold tracking-tight text-gray-800">Menú</span>
          <FaTimes
            className="text-2xl cursor-pointer transition-colors"
            style={{ color: "var(--navbar-text)" }}
            onClick={() => setSidebarMobile(false)}
          />
        </div>
  <div className="flex-1 flex flex-col p-5 gap-6 text-gray-800">
          {/* Avatar y nombre/correo */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {usuario.avatar ? (
              <img
                src={usuario.avatar + "?t=" + new Date().getTime()}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: "2px solid var(--navbar-text)" }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-xl"
                style={{ backgroundColor: colorAvatar(usuario.id), color: "var(--navbar-text)", border: "2px solid var(--navbar-text)" }}
              >
                {obtenerIniciales(usuario) || "👤"}
              </div>
            )}
            <span className="font-semibold text-gray-800 text-base">
              ¡Hola {usuario.nombre ? usuario.nombre.split(" ")[0] : "Admin"}!
            </span>
            <span className="text-xs text-gray-400 font-normal">
              {usuario.correo || "correo@ejemplo.com"}
            </span>
          </div>
          <hr className="border-t border-gray-200 mb-2" />
          <div className="flex flex-col gap-2 flex-grow">
            <button
              className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors"
              onClick={() => {
                navigate("/admin/cuenta");
                setSidebarMobile(false);
              }}
            >
              <User className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
              <span className="text-base">Cuenta</span>
            </button>
            <button
              className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors"
              onClick={() => {
                navigate("/admin/help");
                setSidebarMobile(false);
              }}
            >
              <HelpCircle className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
              <span className="text-base">Ayuda</span>
            </button>
            <button
              className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded transition-colors"
              onClick={() => {
                navigate("/admin/notificaciones");
                setSidebarMobile(false);
              }}
            >
              <FaBell className="w-5 h-5" style={{ color: "var(--navbar-text)" }} />
              <span className="text-base">Notificaciones</span>
            </button>
          </div>
        </div>
  <div className="px-5 pb-6 pt-2 border-t border-gray-200">
          <button
            className="flex items-center gap-3 text-left font-normal text-gray-800 hover:bg-gray-100 px-4 py-3 rounded w-full transition-colors"
            onClick={() => {
              handleLogout();
              setSidebarMobile(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: "var(--navbar-text)" }}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            <span className="text-base">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
  <main className="flex-1 flex flex-col px-4 py-4 sm:px-8 sm:py-2 lg:ml-65 admin-main-content pb-10 lg:pb-1">
        {/* Header */}
        <header className="flex flex-row items-center justify-between mb-4 mt-8 relative gap-4">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa (solo móvil) */}
            <FaBars
              className="text-2xl text-gray-600 cursor-pointer lg:hidden"
              onClick={() => setSidebarMobile(true)}
            />

            <span
              className="text-lg sm:text-xl font-semibold text-gray-700"
              style={{ textShadow: "0 2px 8px rgba(34,193,195,0.15)" }}
            >
              Panel Administrativo
            </span>
            <span className="mx-2 text-gray-300 text-xl font-bold select-none">|</span>
            <span
              className="text-lg sm:text-xl font-bold"
              style={{
                color: "var(--navbar-text)",
                textShadow: "0 2px 8px rgba(34,193,195,0.15)",
              }}
            >
              {title}
            </span>
          </div>

          {/* 🔹 Avatar + Nombre + Menú */}
          <div className="hidden sm:flex items-center gap-6 admin-header-user">
            <div
              className="flex items-center gap-3 cursor-pointer group relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {usuario.avatar ? (
                <img
                  src={usuario.avatar + "?t=" + new Date().getTime()}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colorAvatar(usuario.id) }}
                >
                  {obtenerIniciales(usuario) || ""}
                </div>
              )}

              <span className="font-medium text-gray-800">
                {usuario.nombre ? usuario.nombre.split(" ")[0] : "Administrador"}{" "}
                {usuario.apellido ? usuario.apellido.split(" ")[0] : ""}
              </span>

              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>

              {/* Menú desplegable usuario tipo card */}
              <div
                className={`absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-30 transition-all duration-300 ease-out ${
                  menuOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
                style={{ willChange: "opacity, transform" }}
              >
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-[#e4edf7] to-[#f7fbff] rounded-t-xl">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow">
                    <img
                      src={
                        usuario.avatar
                          ? usuario.avatar + "?t=" + new Date().getTime()
                          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&fm=jpg&q=60&w=3000"
                      }
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">{usuario.correo || "Sin correo"}</span>
                    <span className="text-xs text-gray-400 mt-1">{usuario.rol || "Sin rol"}</span>
                  </div>
                </div>
                <div className="py-2 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      navigate("/admin/cuenta");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9fa] w-full text-left transition-colors rounded-md"
                  >
                    <User className="w-5 h-5 text-[#60A5FA]" />
                    <span>Cuenta</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/help");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9fa] w-full text-left transition-colors rounded-md"
                  >
                    <HelpCircle className="w-5 h-5 text-[#FBBF24]" />
                    <span>Ayuda</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/admin/notificaciones");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9fa] w-full text-left transition-colors rounded-md"
                  >
                    <FaBell className="w-5 h-5 text-[#F87171]" />
                    <span>Notificaciones</span>
                  </button>
                  <hr className="my-2 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors rounded-md font-semibold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
        </div>
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-6">
          <Outlet />
        </div>
      </main>
      {/* Media query para ocultar avatar, nombre, dropdown y alerta en iPad Air 5 (820x1180) */}
      <style>{`
        @media (min-width: 820px) and (max-width: 1180px),
               (min-width: 768px) and (max-width: 1024px) {
          .admin-header-user {
            display: none !important;
          }
        }
        @media (min-width: 1024px) and (max-width: 1366px) {
          .admin-main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
