import { useState } from "react";
import { FiMail, FiLock, FiUser, FiPhone, FiCreditCard } from "react-icons/fi";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Register() {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    telefono: "",
    correo: "",
    username: "",
    contrasena: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombres || !formData.apellidos || !formData.dni || !formData.correo || !formData.username || !formData.contrasena) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/auth/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        // Mostrar alerta de éxito
        await Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Tu cuenta fue creada correctamente.",
          showConfirmButton: true,
          confirmButtonColor: "#0aa6b7",
        });

        // Limpiar formulario
        setFormData({
          nombres: "",
          apellidos: "",
          dni: "",
          telefono: "",
          correo: "",
          username: "",
          contrasena: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white font-sans antialiased px-2 sm:px-4">
      <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[97vh] rounded-2xl overflow-hidden">
        {/* Formulario */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 py-8 md:px-12 items-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Crear cuenta</h2>
            <p className="mb-6 text-slate-500 text-sm sm:text-base">
              Regístrate para comenzar a usar TeleHealth+
            </p>

            <form onSubmit={handleSubmit}>
              {/* Campos */}
              <div className="mb-3 relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input type="text" name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleChange} required className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>
              <div className="mb-3 relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleChange} required className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>
              <div className="mb-3 relative">
                <FiCreditCard className="absolute left-3 top-3 text-slate-400" />
                <input type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} required className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>
              <div className="mb-3 relative">
                <FiPhone className="absolute left-3 top-3 text-slate-400" />
                <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>
              <div className="mb-3 relative">
                <FiMail className="absolute left-3 top-3 text-slate-400" />
                <input type="email" name="correo" placeholder="Correo electrónico" value={formData.correo} onChange={handleChange} required className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>
              <div className="mb-3 relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input type="text" name="username" placeholder="Nombre de usuario" value={formData.username} onChange={handleChange} required className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>
              <div className="mb-4 relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} required className="pl-10 text-sm block w-full rounded-lg border border-gray-300 p-3" />
              </div>

              <button type="submit" className="w-full py-3 mt-2 font-bold text-white rounded-lg transition-all text-base" style={{ background: "var(--gradient-button)", boxShadow: "0 2px 8px rgba(10,166,183,0.25)" }}>
                Registrarme
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                ¿Ya tienes una cuenta? <Link to="/login" className="font-semibold text-[var(--navbar-text)] hover:underline">Inicia sesión</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/img/HM2.png')" }}>
          <div className="absolute inset-0 bg-[#0aa6b7] opacity-25"></div>
          <div className="z-10 text-white text-center px-10">
            <h4 className="text-2xl font-bold mb-2">Empieza tu experiencia TeleHealth+</h4>
            <p>Tu bienestar comienza aquí. Regístrate y accede a un mundo de salud digital.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
