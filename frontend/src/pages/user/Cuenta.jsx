// src/pages/user/Cuenta.jsx
import { useState, useEffect, useMemo } from "react";
import { ShieldCheck, FileText, MessageCircle, User, Package, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import Historial from "./Historial";
import ClinicianChat from "../../components/ClinicianChat";
import EditAvatar from '../../components/EditAvatar';
import UserOrders from "../../components/UserOrders";
import UserAppointments from "../../components/UserAppointments";

export default function Cuenta() {
  const [idUsuario, setIdUsuario] = useState(null);
  const [username, setUsername] = useState(""); 
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatar, setAvatar] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [activeTab, setActiveTab] = useState("cuenta");
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [puntosGamificacion, setPuntosGamificacion] = useState(0);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));
    if (usuarioGuardado) {
      setIdUsuario(usuarioGuardado.id_usuario);
      setUsername(usuarioGuardado.username || "");
      setAvatar(usuarioGuardado.avatar || "");
      obtenerDatosUsuario(usuarioGuardado.id_usuario);
    }
  }, []);

  useEffect(() => {
    if (!idUsuario) return;

    const fetchPuntos = async () => {
      try {
        const response = await fetch(`http://localhost/telehealth/backend/api/AdminPHP/gamificacion.php?id_usuario=${idUsuario}`);
        const data = await response.json();
        if (data.success && typeof data.puntos === "number") {
          setPuntosGamificacion(data.puntos);
        }
      } catch (error) {
        console.error("No se pudieron obtener los puntos de gamificación", error);
      }
    };

    fetchPuntos();
  }, [idUsuario]);

  const obtenerDatosUsuario = async (id) => {
    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php");
      const data = await res.json();

      if (data.success) {
        const usuario = data.usuarios.find((u) => parseInt(u.id) === parseInt(id));
        if (usuario) {
          setNombre(usuario.nombre || "");
          setApellido(usuario.apellido || "");
          setCorreo(usuario.correo || "");
          setDni(usuario.dni || "");
          setTelefono(usuario.telefono || "");
          setAvatar(usuario.avatar || "");
        }
      } else {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudieron obtener los datos." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor." });
    }
  };

  const handleUpdateUsername = async () => {
    const { value: nuevoUsername } = await Swal.fire({
      title: "Editar nombre de usuario",
      input: "text",
      inputLabel: "Nuevo nombre de usuario",
      inputValue: username,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      confirmButtonColor: "#0aa6b7",
      cancelButtonColor: "#9ca3af",
      inputValidator: (value) => {
        if (!value) return "Ingresa un nombre de usuario válido";
      },
    });

    if (!nuevoUsername || !idUsuario) return;

    try {
      const formData = new FormData();
      formData.append("accion", "actualizar_username");
      formData.append("id_usuario", idUsuario);
      formData.append("username", nuevoUsername);

      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUsername(nuevoUsername);
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));
        if (usuario) {
          usuario.username = nuevoUsername;
          sessionStorage.setItem("usuario", JSON.stringify(usuario));
        }
        Swal.fire({ icon: "success", title: "Actualizado", text: data.message, timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message || "No se pudo actualizar." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el usuario." });
    }
  };

  const handleSubmitDatos = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id_usuario", idUsuario);
    formData.append("nombre", nombre);
    formData.append("apellido", apellido);
    formData.append("correo", correo);
    formData.append("telefono", telefono);
    formData.append("dni", dni);

    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({ icon: "success", title: "Datos actualizados", timer: 1500, showConfirmButton: false });
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));
        if (usuario) {
          usuario.nombres = nombre;
          usuario.apellidos = apellido;
          usuario.correo = correo;
          usuario.dni = dni;
          usuario.telefono = telefono;
          sessionStorage.setItem("usuario", JSON.stringify(usuario));
        }
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message || "No se pudieron guardar los cambios." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor." });
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordNueva !== passwordConfirm) {
      Swal.fire({ icon: "error", title: "Error", text: "Las contraseñas no coinciden." });
      return;
    }

    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/cuenta.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idUsuario,
          contrasena_actual: passwordActual,
          contrasena_nueva: passwordNueva,
        }),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({ icon: "success", title: "Contraseña actualizada", text: data.message, timer: 1500, showConfirmButton: false });
        setPasswordActual("");
        setPasswordNueva("");
        setPasswordConfirm("");
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No se pudo conectar con el servidor." });
    }
  };

  const chatContext = useMemo(
    () => ({ medico: "" }),
    []
  );

  const handleProfileUpdated = (updates = {}) => {
    if (!updates || Object.keys(updates).length === 0) return;

    const usuarioSession = JSON.parse(sessionStorage.getItem("usuario")) || {};

    if (updates.username) {
      setUsername(updates.username);
      usuarioSession.username = updates.username;
    }

    if (updates.avatar !== undefined) {
      setAvatar(updates.avatar || "");
      usuarioSession.avatar = updates.avatar || "";
    }

    sessionStorage.setItem("usuario", JSON.stringify(usuarioSession));
    window.dispatchEvent(new Event("usuarioActualizado"));
  };

  if (!idUsuario) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        No se encontró información de usuario. Por favor inicia sesión.
      </div>
    );
  }

  const sidebarLinks = [
    { key: "cuenta", label: "Cuenta", icon: User },
    { key: "historial", label: "Mi historial clínico", icon: FileText },
    { key: "citas", label: "Mis citas", icon: Calendar },
    { key: "pedidos", label: "Mis pedidos", icon: Package },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] bg-slate-100/60 pt-25">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-1 py-9 space-y-6">
        <nav className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {sidebarLinks.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-[#0aa6b7] text-white shadow-sm"
                    : "border border-transparent bg-white text-slate-600 hover:border-[#0aa6b7]/40 hover:text-[#0aa6b7]"
                }`}
              >
                <Icon size={18} className={activeTab === key ? "text-white" : "text-[#0aa6b7]"} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-[#0aa6b7]/40 hover:text-[#0aa6b7]"
            >
              <MessageCircle size={16} className="text-[#0aa6b7]" />
              <span>Chat asistencial</span>
            </button>
            <span className="inline-flex items-center rounded-full bg-[#0aa6b7]/10 px-3 py-1 text-xs font-semibold text-[#0aa6b7]">
              {puntosGamificacion} pts
            </span>
          </div>
        </nav>

        <section className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8 min-h-[28rem]">
          {activeTab === "cuenta" ? (
            <div className="space-y-10">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium text-slate-800">Información de la cuenta</h2>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-[#0aa6b7] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#078292] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0aa6b7]"
                    onClick={() => setIsEditAvatarOpen(true)}
                  >
                    Editar
                  </button>
                </div>
                <p className="text-sm text-slate-500">Actualiza tu nombre de usuario y avatar.</p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-900">Datos personales</h2>
                <p className="text-sm text-slate-500">Mantén tu información al día para agilizar tus citas y comunicaciones.</p>
              </div>

              <form onSubmit={handleSubmitDatos} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InputField label="Nombres" placeholder="Ingresa tus nombres" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  <InputField label="Apellidos" placeholder="Ingresa tus apellidos" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                  <InputField label="DNI" placeholder="Ingresa tu DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
                  <InputField label="Correo electrónico" placeholder="Ingresa tu correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
                  <InputField label="Teléfono" placeholder="Ingresa tu teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-[#0aa6b7] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#078292]"
                  >
                    Guardar cambios
                  </button>
                  <span className="text-xs text-slate-400 sm:pl-2">Los cambios se aplicarán en tu perfil y próximas reservas.</span>
                </div>
              </form>

              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ShieldCheck size={18} className="text-[#0aa6b7]" />
                    <h2 className="text-lg font-semibold">Contraseña y seguridad</h2>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Protege tu acceso</p>
                </div>

                <form onSubmit={handleSubmitPassword} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 sm:max-w-2xl">
                  <input
                    type="text"
                    value={username}
                    readOnly
                    autoComplete="username"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                  />
                  <InputField
                    label="Contraseña actual"
                    type="password"
                    placeholder="Ingresa tu contraseña actual"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    autoComplete="current-password"
                  />
                  <InputField
                    label="Nueva contraseña"
                    type="password"
                    placeholder="Crea una nueva contraseña"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    autoComplete="new-password"
                  />
                  <InputField
                    label="Confirmar nueva contraseña"
                    type="password"
                    placeholder="Repite la nueva contraseña"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#0aa6b7] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#078292] sm:w-auto"
                    >
                      Cambiar contraseña
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeTab === "historial" ? (
            <Historial embedded />
          ) : activeTab === "citas" ? (
            <UserAppointments userId={idUsuario} />
          ) : activeTab === "pedidos" ? (
            <UserOrders userId={idUsuario} />
          ) : (
            <div className="space-y-6">
              <ClinicianChat historial={chatContext} />
            </div>
          )}
        </section>
        <EditAvatar 
          isOpen={isEditAvatarOpen} 
          onClose={() => setIsEditAvatarOpen(false)} 
          currentUserId={idUsuario}
          currentUsername={username} 
          currentAvatar={avatar} 
          currentNombre={nombre}
          currentApellido={apellido}
          currentCorreo={correo}
          currentTelefono={telefono}
          currentDni={dni}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </div>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange, autoComplete }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs text-gray-500 font-medium mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#0aa6b7] focus:outline-none focus:ring-2 focus:ring-[#0aa6b7]/30"
      />
    </div>
  );
}

function getInitials(nombre = "", apellido = "") {
  const n = nombre.trim().split(" ")[0] || "";
  const a = apellido.trim().split(" ")[0] || "";
  return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase() || "U";
}
