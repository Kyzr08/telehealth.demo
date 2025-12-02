import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import Swal from "sweetalert2";
import EditUsername from "../../components/EditUsername";

export default function AdminCuenta() {
  const [idUsuario, setIdUsuario] = useState(null);
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Cargar usuario desde sessionStorage y backend
  useEffect(() => {
    const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));
    if (usuarioGuardado) {
      setIdUsuario(usuarioGuardado.id_usuario);
      setUsername(usuarioGuardado.username);
      obtenerDatosUsuario(usuarioGuardado.id_usuario);
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesión no encontrada",
        text: "Debes iniciar sesión nuevamente.",
      });
    }
  }, []);

  // 🔹 Obtener datos personales desde backend
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
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron obtener los datos del usuario.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
      });
    }
  };

  // 🔹 Abrir modal de username
  const abrirModal = () => setShowModal(true);
  const cerrarModal = () => setShowModal(false);

  // 🔹 Guardar nuevo username
  const handleSaveUsername = (nuevoUsername) => {
    setUsername(nuevoUsername);
    cerrarModal();
  };

  // 🔹 Guardar datos personales
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
        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: "Tus datos personales han sido actualizados correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });

        const usuario = JSON.parse(sessionStorage.getItem("usuario"));
        usuario.nombres = nombre;
        usuario.apellidos = apellido;
        usuario.correo = correo;
        usuario.dni = dni;
        usuario.telefono = telefono;
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudieron guardar los cambios.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
      });
    }
  };

  // 🔹 Cambiar contraseña
  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordNueva !== passwordConfirm) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
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
        Swal.fire({
          icon: "success",
          title: "Contraseña actualizada",
          text: data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        setPasswordActual("");
        setPasswordNueva("");
        setPasswordConfirm("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 h-full flex flex-col overflow-hidden max-w-full min-h-[80vh]">
      <div className="flex-1 overflow-y-auto pb-2 pr-0 sm:pr-2 md:pr-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 pl-1">
          Configuración de la cuenta
        </h1>
        <p className="text-gray-400 mb-6 sm:mb-8 pl-1 text-sm">
          Administra y actualiza la información de tu cuenta.
        </p>

        {/* Información de la cuenta */}
        <section className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 pl-1">
            Información de la cuenta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pl-1">
            <div className="flex w-full">
              <input
                type="text"
                value={username}
                readOnly
                className="border border-gray-200 rounded-lg px-3 py-2 w-full bg-gray-50 text-gray-900"
                placeholder="Nombre de usuario"
                style={{ height: "40px" }}
              />
              <button
                type="button"
                onClick={abrirModal}
                className="ml-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center"
                style={{ height: "40px", width: "40px" }}
                title="Editar nombre de usuario"
              >
                <Pencil size={20} />
              </button>
            </div>
          </div>
        </section>

        <hr className="my-4 sm:my-6 border-gray-100" />

        {/* Datos personales */}
        <section className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 pl-1">
            Datos personales
          </h2>
          <form onSubmit={handleSubmitDatos}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pl-1">
              <InputField placeholder="Nombres" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <InputField placeholder="Apellidos" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              <InputField placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
              <InputField placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              <InputField placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div className="pl-1">
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold shadow mt-2 w-full sm:w-auto"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </section>

        <hr className="my-4 sm:my-6 border-gray-100" />

        {/* Contraseña */}
        <section className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 pl-1">
            Contraseña y seguridad
          </h2>
          <form onSubmit={handleSubmitPassword} className="pl-1 flex flex-col gap-3 max-w-md">
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
              type="password"
              placeholder="Contraseña actual"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              autoComplete="current-password"
            />
            <InputField
              type="password"
              placeholder="Nueva contraseña"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              autoComplete="new-password"
            />
            <InputField
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition w-full sm:w-auto max-w-xs"
            >
              Cambiar contraseña
            </button>
          </form>
        </section>
      </div>

      {/* Modal para editar username */}
      {showModal && (
        <EditUsername username={username} onSave={handleSaveUsername} onClose={cerrarModal} />
      )}
    </div>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange, color = "blue", autoComplete }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs text-gray-500 font-medium mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-${color}-400 transition bg-white text-gray-900 placeholder-gray-400`}
      />
    </div>
  );
}
