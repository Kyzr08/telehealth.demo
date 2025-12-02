import { useState } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

export default function EditUsers({ usuario, abrir, onCerrar, onActualizar }) {
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [apellido, setApellido] = useState(usuario?.apellido || "");
  const [correo, setCorreo] = useState(usuario?.correo || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [avatar, setAvatar] = useState(usuario?.avatar || null);
  const [fileAvatar, setFileAvatar] = useState(null);
  const [dni, setDni] = useState(usuario?.dni || "");

  if (!abrir) return null;

  const colorAvatar = (id) => {
    const colores = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
    return id !== undefined ? colores[id % colores.length] : colores[Math.floor(Math.random() * colores.length)];
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAvatar(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("id_usuario", usuario.id);
      formData.append("nombre", nombre);
      formData.append("apellido", apellido);
      formData.append("correo", correo);
      formData.append("telefono", telefono);
      formData.append("dni", dni);
      if (fileAvatar) formData.append("avatar", fileAvatar);

      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const avatarActualizado = data.avatar ? `${data.avatar}?t=${new Date().getTime()}` : avatar;
        onActualizar({
          ...usuario,
          nombre,
          apellido,
          correo,
          telefono,
          dni,
          avatar: avatarActualizado,
        });

        Swal.fire({
          icon: "success",
          title: "¡Usuario actualizado!",
          text: "Los cambios se han guardado correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
        onCerrar();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error desconocido al actualizar usuario",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de conexión al actualizar usuario.",
      });
    }
  };

  const renderAvatar = () =>
    avatar ? (
      <img
        src={avatar && !avatar.startsWith('blob:') ? `${avatar}?t=${usuario?.id}` : avatar}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105 border-[3px] shadow-lg"
        style={{ borderColor: "rgba(10,166,183,0.7)", boxShadow: "0 4px 16px 0 rgba(10,166,183,0.15)" }}
        onError={(e) => (e.target.src = "/default-avatar.png")}
      />
    ) : (
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg border-[3px]"
        style={{ backgroundColor: colorAvatar(usuario?.id), borderColor: "rgba(10,166,183,0.7)", boxShadow: "0 4px 16px 0 rgba(10,166,183,0.15)" }}
      >
        {`${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase() || "?"}
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <style>
        {`
          @keyframes fadeIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative transition-all duration-300 sm:mx-4 sm:p-6 mx-3 xs:max-w-xs xs:p-3 xs:mx-4"
        style={{ animation: "fadeIn 0.25s ease-in-out" }}
      >
        <style>
          {`
            @media (max-width: 640px) {
              .xs\\:max-w-xs { max-width: 25rem !important; }
              .xs\\:p-3 { padding: 1.25rem !important; }
              .xs\\:mx-4 { margin-left: 1.25rem !important; margin-right: 1.5rem !important; }
            }
          `}
        </style>
        <button onClick={onCerrar} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Cerrar">
          <X size={22} />
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
          <div className="relative">
            {renderAvatar()}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-800">{nombre} {apellido}</h3>
            <p className="text-sm text-gray-500">{correo}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Nombre", value: nombre, setter: setNombre, type: "text" },
              { label: "Apellido", value: apellido, setter: setApellido, type: "text" },
              { label: "Correo", value: correo, setter: setCorreo, type: "email" },
              { label: "Teléfono", value: telefono, setter: setTelefono, type: "text" },
              { label: "DNI", value: dni, setter: setDni, type: "text" },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-300/70 pt-4 flex-col sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onCerrar}
              className="w-full sm:w-auto px-5 py-2 rounded-lg text-navbar-link bg-white border-1 transition hover:bg-gray-100/80"
              style={{ borderColor: "var(--navbar-link-hover)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold text-white bg-[#0aa6b7] hover:bg-[#0895a5] transition hover:shadow-md"
            >
              Guardar cambios
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
