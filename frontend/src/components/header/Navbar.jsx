import { useState, useRef, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Drawer from "./Drawer";
import UserDropdown from "./UserDropdown";
import MobileNav from "./MobileNav";
import DesktopNav from "./DesktopNav";

export default function Navbar() {
  const [openServicios, setOpenServicios] = useState(false);
  const [openRecursos, setOpenRecursos] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileServicios, setMobileServicios] = useState(false);
  const [mobileRecursos, setMobileRecursos] = useState(false);
  const [dropdownUser, setDropdownUser] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({
    opacity: 0,
    transform: "scale(0.95) translateY(-10px)",
    pointerEvents: "none",
    transition: "opacity 0.3s ease, transform 0.3s ease",
  });

  const refServicios = useRef(null);
  const refRecursos = useRef(null);
  const refUser = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const prepareUser = useCallback((data) => {
    if (!data) return null;
    const firstName = data.nombres?.split(" ")[0] || data.nombre || "";
    const lastName = data.apellidos?.split(" ")[0] || data.apellido || "";
    return {
      ...data,
      nombre: firstName,
      apellido: lastName,
    };
  }, []);

  const loadUserFromSession = useCallback(async () => {
    const storedUser = sessionStorage.getItem("usuario");
    if (!storedUser) {
      setUser(null);
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("No se pudo interpretar el usuario de sesión", error);
      setUser(null);
      return;
    }

    setUser(prepareUser(parsedUser));

    if (!parsedUser.id_usuario || parsedUser.avatar) return;

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php");
      const data = await response.json();

      if (!data.success || !Array.isArray(data.usuarios)) return;

      const match = data.usuarios.find((item) => String(item.id) === String(parsedUser.id_usuario));
      if (!match) return;

      const mergedSession = {
        ...parsedUser,
        avatar: match.avatar || parsedUser.avatar || null,
        nombres: parsedUser.nombres || match.nombre || parsedUser.nombre || "",
        apellidos: parsedUser.apellidos || match.apellido || parsedUser.apellido || "",
      };

      sessionStorage.setItem("usuario", JSON.stringify(mergedSession));
      setUser(prepareUser({ ...match, ...mergedSession }));
    } catch (error) {
      console.error("No se pudo obtener la información del usuario", error);
    }
  }, [prepareUser]);

  useEffect(() => {
    loadUserFromSession();

    const handleSessionChange = () => loadUserFromSession();

    window.addEventListener("storage", handleSessionChange);
    window.addEventListener("usuarioActualizado", handleSessionChange);
    window.addEventListener("storageUpdate", handleSessionChange);

    return () => {
      window.removeEventListener("storage", handleSessionChange);
      window.removeEventListener("usuarioActualizado", handleSessionChange);
      window.removeEventListener("storageUpdate", handleSessionChange);
    };
  }, [loadUserFromSession]);

  // Cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    setUser(null);
    setDropdownUser(false);
    window.dispatchEvent(new Event("storageUpdate"));
    navigate("/login");
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (refServicios.current && !refServicios.current.contains(e.target)) setOpenServicios(false);
      if (refRecursos.current && !refRecursos.current.contains(e.target)) setOpenRecursos(false);
      if (refUser.current && !refUser.current.contains(e.target)) setDropdownUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (dropdownUser) {
      setDropdownStyle({
        opacity: 1,
        transform: "scale(1) translateY(0)", // Lowered dropdown position
        pointerEvents: "auto",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      });
    } else {
      setDropdownStyle({
        opacity: 0,
        transform: "scale(0.95) translateY(-10px)",
        pointerEvents: "none",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      });
    }
  }, [dropdownUser]);

  const colorAvatar = (id) => {
    const colores = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
    return id !== undefined
      ? colores[id % colores.length]
      : colores[Math.floor(Math.random() * colores.length)];
  };

  const obtenerIniciales = (u) =>
    u ? ((u.nombre?.[0] || "") + (u.apellido?.[0] || "")).toUpperCase() : "";

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Drawer component for mobile menu */}
      <Drawer user={user} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} handleLogout={handleLogout} />

      <nav
        className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-7xl z-50 px-8 py-5 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 4px 16px 0 rgba(93,107,230,0.10)",
          borderRadius: "16px",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)"
        }}
      >
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-[#0aa6b7] cursor-pointer">
          TeleHealth+
        </Link>

        {/* Desktop navigation links and dropdowns */}
        <DesktopNav
          isActive={isActive}
          openServicios={openServicios}
          setOpenServicios={setOpenServicios}
          refServicios={refServicios}
          openRecursos={openRecursos}
          setOpenRecursos={setOpenRecursos}
          refRecursos={refRecursos}
        />

        {/* User or login desktop */}
        {!user ? (
          <Link
            to="/login"
            className="hidden lg:block px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
            style={{ background: "linear-gradient(90deg, #0aa6b7 50%, #22c1c3 80%, #a0f0f3 100%)" }}
          >
            Iniciar sesión
          </Link>
        ) : (
          <div className="hidden sm:flex items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer group relative"
              onClick={() => setDropdownUser(!dropdownUser)}
            >
              <div
                className={`w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shadow flex items-center justify-center ${
                  user?.avatar ? "" : "bg-gray-100"
                }`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar de usuario"
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
              <span className="font-medium text-gray-800">
                {user?.nombre ? user.nombre : "Usuario"} {user?.apellido ? user.apellido : ""}
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
              {dropdownUser && (
                <UserDropdown
                  user={user}
                  dropdownStyle={dropdownStyle}
                  handleLogout={handleLogout}
                  navigate={navigate}
                  setDropdownUser={setDropdownUser}
                />
              )}
            </div>
          </div>
        )}

        {/* Botón hamburguesa móvil */}
        <button className="lg:hidden text-2xl text-gray-700 cursor-pointer" onClick={() => setDrawerOpen(true)}>
          <Menu />
        </button>
      </nav>

      {/* Mobile navigation bar */}
      <MobileNav isActive={isActive} />
    </>
  );
}
