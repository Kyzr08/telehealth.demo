import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { X } from "lucide-react";

export default function EditAvatar({
  isOpen,
  onClose,
  currentUserId,
  currentUsername,
  currentAvatar,
  currentNombre,
  currentApellido,
  currentCorreo,
  currentTelefono,
  currentDni,
  onProfileUpdated,
}) {
  const [username, setUsername] = useState(currentUsername ?? "");
  const [avatarPreview, setAvatarPreview] = useState(currentAvatar ?? "");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    setUsername(currentUsername ?? "");
  }, [currentUsername, isOpen]);

  useEffect(() => {
    setAvatarPreview(currentAvatar ?? "");
    setAvatarFile(null);
  }, [currentAvatar, isOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el identificador del usuario. Inicia sesión nuevamente.",
      });
      return;
    }

    const trimmedUsername = username.trim();
    const previousUsername = (currentUsername ?? "").trim();
    const isUsernameChanged = trimmedUsername && trimmedUsername !== previousUsername;
    const isAvatarChanged = Boolean(avatarFile);

    if (!isUsernameChanged && !isAvatarChanged) {
      Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No detectamos cambios para guardar.",
      });
      return;
    }

    try {
      const profileUpdates = {};

      if (isUsernameChanged) {
        const usernameResponse = await fetch("http://localhost/telehealth/backend/api/AdminPHP/cuenta.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: currentUserId,
            nuevo_username: trimmedUsername,
          }),
        });
        const usernameData = await usernameResponse.json();

        if (!usernameData.success) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: usernameData.message || "No se pudo actualizar el nombre de usuario.",
          });
          return;
        }

        profileUpdates.username = trimmedUsername;
      }

      if (isAvatarChanged) {
        const formData = new FormData();
        formData.append("id_usuario", currentUserId);
        formData.append("nombre", currentNombre ?? "");
        formData.append("apellido", currentApellido ?? "");
        formData.append("correo", currentCorreo ?? "");
        formData.append("telefono", currentTelefono ?? "");
        formData.append("dni", currentDni ?? "");
        formData.append("avatar", avatarFile);

        const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!data.success) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message || "No se pudo actualizar el avatar.",
          });
          return;
        }

        profileUpdates.avatar = data.avatar || null;
      }

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Tu información se actualizó correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });

      onProfileUpdated?.(profileUpdates);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el servidor.",
      });
    }
  };

  const renderAvatar = () =>
    typeof avatarPreview === 'string' && avatarPreview ? (
      <img
        src={avatarPreview.startsWith('blob:') ? avatarPreview : `${avatarPreview}?t=${currentUsername}`}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105 border-[3px] shadow-lg"
        style={{ borderColor: "rgba(10,166,183,0.7)", boxShadow: "0 4px 16px 0 rgba(10,166,183,0.15)" }}
        onError={(e) => (e.target.src = "/default-avatar.png")}
      />
    ) : (
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg border-[3px]"
        style={{ backgroundColor: "#A78BFA", borderColor: "rgba(10,166,183,0.7)", boxShadow: "0 4px 16px 0 rgba(10,166,183,0.15)" }}
      >
        {(username?.trim().charAt(0).toUpperCase()) || "U"}
      </div>
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-md shadow-md w-full max-w-sm p-5 relative transition-all duration-300 sm:mx-4 mx-3 xs:max-w-xs xs:p-4 xs:mx-4"
        style={{ animation: "fadeIn 0.25s ease-in-out" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Cerrar">
          <X size={22} />
        </button>
        <div className="flex flex-col items-center gap-5 mb-6">
          <div className="relative">
            {renderAvatar()}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
            />
          </div>
        </div>
        <form className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Nombre de Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] transition"
              placeholder="Ingresa tu nuevo nombre de usuario"
            />
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-sm text-gray-600 bg-white border border-gray-300 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-md text-sm font-medium text-white bg-[#0aa6b7] transition hover:bg-[#0895a5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0aa6b7]"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
