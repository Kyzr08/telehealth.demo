import { useState } from "react";
import Swal from "sweetalert2";

export default function AddUsers({ abrir, onCerrar, onAgregar }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    username: "",
    contrasena: "",
    rol: "Médico",
    estado: "Activo",
    dni: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      for (const key in form) data.append(key, form[key]);
      data.append("accion", "crear");

      const res = await fetch(
        "http://localhost/telehealth/backend/api/AdminPHP/getUser.php",
        {
          method: "POST",
          body: data,
        }
      );

      const response = await res.json();

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Usuario creado",
          text: "El usuario fue agregado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });

        if (onAgregar && response.usuario) onAgregar(response.usuario);
        onCerrar();
      } else {
        Swal.fire(
          "Error",
          response.message || "No se pudo crear el usuario.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!abrir) return null;

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
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-2xl p-4 sm:p-8 max-h-[70vh] overflow-auto transition-all duration-300 mx-2 sm:mx-0"
        style={{ animation: "fadeIn 0.25s ease-in-out" }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-300/70 pb-3">
          Crear usuario
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 min-[350px]:grid-cols-2 gap-5">
            {[
              { name: "nombre", label: "Nombre" },
              { name: "apellido", label: "Apellido" },
              { name: "correo", label: "Correo" },
              { name: "telefono", label: "Teléfono" },
              { name: "username", label: "Usuario" },
              { name: "contrasena", label: "Contraseña", type: "password" },
              { name: "dni", label: "DNI" },
            ].map(({ name, label, type }) => (
              <div key={name} className="flex flex-col gap-1">
                <label
                  htmlFor={name}
                  className="text-sm font-semibold text-gray-700"
                >
                  {label}
                </label>
                <input
                  id={name}
                  type={type || "text"}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required={["nombre", "apellido", "correo", "username", "contrasena"].includes(
                    name
                  )}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"

                />
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="rol"
                className="text-sm font-semibold text-gray-700"
              >
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="Médico">Médico</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="estado"
                className="text-sm font-semibold text-gray-700"
              >
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 border-t border-gray-300/70 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="px-5 py-2 rounded-lg text-navbar-link hover:bg-gray-100 transition w-full sm:w-auto"
              style={{ border: "1px solid var(--navbar-link-hover)" }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg font-semibold text-white w-full sm:w-auto bg-[#0aa6b7] hover:bg-[#0895a5] transition hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
