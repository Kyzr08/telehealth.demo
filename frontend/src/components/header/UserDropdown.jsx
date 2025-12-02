import { User, FileText, HelpCircle, LogOut } from "lucide-react";

export default function UserDropdown({ user, dropdownStyle, handleLogout, navigate, setDropdownUser }) {
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
      className="absolute right-0 top-15 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-30"
      style={dropdownStyle}
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-[#e4edf7] to-[#f7fbff] rounded-t-xl">
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
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{user?.correo || "Sin correo"}</span>
          <span className="text-xs text-gray-400 mt-1">{user?.rol || "Sin rol"}</span>
        </div>
      </div>
      <div className="py-2 flex flex-col gap-1">
        <button
          onClick={() => {
            navigate("/cuenta");
            setDropdownUser(false);
          }}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9fa] w-full text-left transition-colors rounded-md"
        >
          <User className="w-5 h-5 text-[#60A5FA]" />
          <span>Cuenta</span>
        </button>
        <button
          onClick={() => {
            navigate("/historial");
            setDropdownUser(false);
          }}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9fa] w-full text-left transition-colors rounded-md"
        >
          <FileText className="w-5 h-5 text-[#F87171]" />
          <span>Historial</span>
        </button>
        <button
          onClick={() => {
            navigate("/help");
            setDropdownUser(false);
          }}
          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9fa] w-full text-left transition-colors rounded-md"
        >
          <HelpCircle className="w-5 h-5 text-[#FBBF24]" />
          <span>Ayuda</span>
        </button>
        <hr className="my-2 border-t border-gray-100" />
        <button
          onClick={() => {
            handleLogout();
            setDropdownUser(false);
          }}
          className="flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors rounded-md font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar la sesión</span>
        </button>
      </div>
    </div>
  );
}
