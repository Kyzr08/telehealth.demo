import { useState } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

export default function EditUsername({ username, onSave, onClose }) {
  const [nuevoUsername, setNuevoUsername] = useState(username);

  const guardarUsername = async () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    if (!usuario) return;

    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/cuenta.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          nuevo_username: nuevoUsername,
        }),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        usuario.username = nuevoUsername;
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        onSave(nuevoUsername);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error al conectar con el servidor" });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editar nombre de usuario</h2>
        <input
          type="text"
          value={nuevoUsername}
          onChange={(e) => setNuevoUsername(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Nuevo nombre de usuario"
        />
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={guardarUsername}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold shadow"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}