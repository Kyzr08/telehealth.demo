import { useState } from "react";
import { FiUser, FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const quickUsers = {
    admin: {
      id_usuario: 1,
      username: "admin",
      rol: "Administrador",
      nombres: "Laura",
      nombre: "Laura",
      apellidos: "García",
      apellido: "García",
      correo: "admin@telehealth.demo",
      telefono: "+51 900 000 001",
      dni: "71234567",
      estado: "Activo",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&w=400&q=80",
    },
    medic: {
      id_usuario: 2,
      username: "medico",
      rol: "Médico",
      nombres: "Mateo",
      nombre: "Mateo",
      apellidos: "Quiroz",
      apellido: "Quiroz",
      correo: "medico@telehealth.demo",
      telefono: "+51 900 000 002",
      dni: "82345678",
      estado: "Activo",
      especialidad: "Cardiología",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&w=400&q=80",
    },
    user: {
      id_usuario: 3,
      username: "cliente",
      rol: "Paciente",
      nombres: "Camila",
      nombre: "Camila",
      apellidos: "Ramos",
      apellido: "Ramos",
      correo: "cliente@telehealth.demo",
      telefono: "+51 900 000 003",
      dni: "93456789",
      estado: "Activo",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
  };

  const handleLoginSuccess = async (usuario) => {
    sessionStorage.setItem("usuario", JSON.stringify(usuario));

    const rol = usuario.rol?.toLowerCase();
    if (rol === "médico" || rol === "medico") {
      localStorage.setItem("id_medico", usuario.id_usuario);
    } else {
      localStorage.removeItem("id_medico");
    }

    await Swal.fire({
      icon: "success",
      title: "Inicio de sesión exitoso",
      text: `Bienvenido ${usuario.nombres}!`,
      showConfirmButton: false,
      timer: 1500,
    });

    let destino = "/";
    if (rol === "administrador" || rol === "admin") {
      destino = "/admin";
    } else if (rol === "médico" || rol === "medico") {
      destino = "/medic";
    }

    navigate(destino, { replace: true });
    setTimeout(() => {
      window.dispatchEvent(new Event("usuarioActualizado"));
    }, 100);
  };

  const performLogin = async ({ username: user, contrasena }) => {
    if (!user || !contrasena) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost/telehealth/backend/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, contrasena }),
      });

      const data = await res.json();

      if (data.success) {
        await handleLoginSuccess(data.usuario);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: data.message || "Usuario o contraseña incorrectos.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor. Inténtalo nuevamente.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (rol) => {
    if (isLoading) return;
    const usuario = quickUsers[rol];
    if (!usuario) return;
    setIsLoading(true);
    handleLoginSuccess(usuario).finally(() => setIsLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!username || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos antes de continuar.",
        confirmButtonColor: "#0aa6b7",
      });
      return;
    }

    performLogin({ username, contrasena: password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white font-sans antialiased px-2 sm:px-4">
      <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[97vh] rounded-2xl overflow-hidden">
        {/* Formulario */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 py-8 md:px-12 items-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Iniciar Sesión</h2>
            <p className="mb-6 text-slate-500 text-sm sm:text-base">
              Ingresa tu usuario y contraseña para acceder
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <FiUser className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 text-sm block w-full rounded-lg border border-gray-300 bg-white p-3 font-normal text-gray-700 placeholder:text-gray-500 focus:border-[var(--navbar-text)] focus:outline-none"
                />
              </div>

              <div className="mb-4 relative">
                <FiLock className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-sm block w-full rounded-lg border border-gray-300 bg-white p-3 font-normal text-gray-700 placeholder:text-gray-500 focus:border-[var(--navbar-text)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 mt-2 font-bold text-white rounded-lg transition-all text-base ${
                  isLoading ? "opacity-80 cursor-not-allowed" : ""
                }`}
                style={{
                  background: "var(--gradient-button)",
                  boxShadow: "0 2px 8px 0 rgba(10,166,183,0.25)",
                }}
              >
                {isLoading ? "Procesando..." : "Ingresar"}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-slate-400 text-center mb-3">
                Acceso rápido a la demo
              </p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  disabled={isLoading}
                  className={`w-full py-3 font-semibold rounded-lg border border-[var(--navbar-text)] text-[var(--navbar-text)] transition-all text-base hover:bg-[var(--navbar-text)] hover:text-white ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  Entrar como Administrador
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("medic")}
                  disabled={isLoading}
                  className={`w-full py-3 font-semibold rounded-lg border border-[var(--navbar-text)] text-[var(--navbar-text)] transition-all text-base hover:bg-[var(--navbar-text)] hover:text-white ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  Entrar como Médico
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("user")}
                  disabled={isLoading}
                  className={`w-full py-3 font-semibold rounded-lg border border-[var(--navbar-text)] text-[var(--navbar-text)] transition-all text-base hover:bg-[var(--navbar-text)] hover:text-white ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  Entrar como Paciente
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[var(--navbar-text)] hover:underline"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Imagen derecha */}
        <div className="hidden lg:flex flex-col justify-center items-center w-full lg:w-1/2 relative overflow-hidden rounded-2xl pr-[5px]">
          <div className="absolute inset-0 z-0 bg-[url('/img/HM2.png')] bg-cover bg-center rounded-2xl" />
          <div className="absolute inset-0 z-10 bg-[#0aa6b7] opacity-25 rounded-2xl" />
          <div className="relative z-20 flex flex-col items-center justify-center h-full w-full px-6 md:px-12">
            <h4 className="font-bold text-white text-2xl md:text-3xl mb-2 text-center drop-shadow-md">
              Bienvenido a TeleHealth+
            </h4>
            <p className="text-white text-center text-sm md:text-base max-w-md leading-relaxed">
              Conecta con tu salud desde cualquier lugar. Cuidarte nunca fue tan fácil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
