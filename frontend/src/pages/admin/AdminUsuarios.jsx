import { useState, useEffect } from "react";
import { Pencil, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import EditUsers from "../../components/EditUsers.jsx";
import AddUsers from "../../components/AddUsers.jsx";

export default function AdminUsuarios() {
  const [rolFiltro, setRolFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);

  const roles = ["Todos", "Paciente", "Médico", "Administrador"];
  const estados = ["Todos", "Activo", "Inactivo"];

  const colorAvatar = (id) => {
    const colores = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
    return id !== undefined ? colores[id % colores.length] : colores[Math.floor(Math.random() * colores.length)];
  };

  const obtenerIniciales = (u) =>
    u ? ((u.nombre?.[0] || "") + (u.apellido?.[0] || "")).toUpperCase() : "";

  const cargarUsuarios = () =>
    fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php")
      .then((res) => res.json())
      .then((data) => data.success && setUsuarios(data.usuarios))
      .catch((err) => console.error("Error de conexión:", err));

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
    return (
      (nombreCompleto.includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.telefono || "").includes(busqueda)) &&
      (rolFiltro === "Todos" || u.rol === rolFiltro) &&
      (estadoFiltro === "Todos" || u.estado === estadoFiltro)
    );
  });

  const abrirModalEditar = (u) => {
    setUsuarioEditar(u);
    setModalEditarAbierto(true);
  };
  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setUsuarioEditar(null);
  };
  const abrirModalAgregar = () => setModalAgregarAbierto(true);
  const cerrarModalAgregar = () => setModalAgregarAbierto(false);

  const actualizarUsuario = (uAct) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === uAct.id ? uAct : u))
    );
  };
  const agregarUsuario = (nuevo) => {
    setUsuarios((prev) => [...prev, { ...nuevo, dni: nuevo.dni || "-" }]);
  };

  const cambiarEstado = (usuario) => {
    const nuevoEstado = usuario.estado === "Activo" ? "Inactivo" : "Activo";
    const accionTexto = nuevoEstado === "Inactivo" ? "desactivar" : "reactivar";
    Swal.fire({
      title: `¿Deseas ${accionTexto} esta cuenta?`,
      text:
        nuevoEstado === "Inactivo"
          ? "El usuario no podrá acceder hasta ser reactivado."
          : "El usuario recuperará el acceso al sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0aa6b7",
      cancelButtonColor: "#aaa",
      confirmButtonText: `Sí, ${accionTexto}`,
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append("accion", "cambiar_estado");
        formData.append("id_usuario", usuario.id);
        formData.append("estado", nuevoEstado);
        fetch("http://localhost/telehealth/backend/api/AdminPHP/getUser.php", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              Swal.fire("Éxito", data.message, "success");
              setUsuarios((prev) =>
                prev.map((u) =>
                  u.id === usuario.id ? { ...u, estado: nuevoEstado } : u
                )
              );
            } else {
              Swal.fire("Error", data.message, "error");
            }
          })
          .catch(() =>
            Swal.fire(
              "Error",
              "No se pudo conectar con el servidor.",
              "error"
            )
          );
      }
    });
  };


  return (
  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      {/* Barra superior y filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sticky top-0 bg-white z-10 pb-2 admin-filtros-responsive">
        <div className="flex w-full sm:w-auto gap-2 admin-buscador-responsive">
          <div
            className="flex items-center border border-gray-300 rounded-xl px-3 py-2 flex-1 min-w-[150px] sm:min-w-[500px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#0aa6b7] transition-all"
          >
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
          <button
            onClick={abrirModalAgregar}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl shadow-md bg-[#0aa6b7] hover:bg-[#0895a5] text-white transition cursor-pointer"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">Crear usuario</span>
          </button>
        </div>
  <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:w-auto sm:gap-3 sm:ml-auto admin-combobox-responsive">
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] text-gray-700 bg-white"
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] text-gray-700 bg-white"
          >
            {estados.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

  {/* Tabla */}
  <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block admin-table-responsive">
        <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
          <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
            <tr>
              {["Usuario", "Correo", "Teléfono", "DNI", "Rol", "Estado", "Acciones"].map((h) => (
                <th
                  key={h}
                  className="py-3 px-4 text-left font-medium text-gray-500 text-xs uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-all rounded-lg">
                <td className="py-3 px-4 border-b border-gray-100 flex items-center gap-3">
                  {u.avatar ? (
                    <img
                      src={u.avatar + "?t=" + new Date().getTime()}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: colorAvatar(u.id) }}
                    >
                      {obtenerIniciales(u)}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">{`${u.nombre} ${u.apellido}`}</span>
                </td>
                <td className="py-3 px-4 border-b border-gray-100">{u.correo}</td>
                <td className="py-3 px-4 border-b border-gray-100">{u.telefono || "-"}</td>
                <td className="py-3 px-4 border-b border-gray-100">{u.dni || "-"}</td>
                <td className="py-3 px-4 border-b border-gray-100">{u.rol}</td>
                <td className="py-3 px-4 border-b border-gray-100">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {u.estado}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa] hover:shadow-md transition"
                    onClick={() => abrirModalEditar(u)}
                    title="Editar usuario"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => cambiarEstado(u)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                      u.estado === "Activo" ? "bg-[#0aa6b7]" : "bg-gray-400"
                    }`}
                    title={u.estado === "Activo" ? "Desactivar usuario" : "Reactivar usuario"}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        u.estado === "Activo" ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

  {/* Cards responsive */}
  <div className="sm:hidden flex flex-col gap-4 mt-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 admin-cards-responsive">
        {usuariosFiltrados.map((u) => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-4">
              {u.avatar ? (
                <img src={u.avatar + "?t=" + new Date().getTime()} alt="" className="w-14 h-14 rounded-full object-cover border" />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colorAvatar(u.id) }}
                >
                  {obtenerIniciales(u)}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{`${u.nombre} ${u.apellido}`}</p>
                <p className="text-sm text-gray-500">{u.rol}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa]"
                onClick={() => abrirModalEditar(u)}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => cambiarEstado(u)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 mt-1.5 ${
                  u.estado === "Activo" ? "bg-[#0aa6b7]" : "bg-gray-400"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    u.estado === "Activo" ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {/* Media query para responsividad en iPad Air 5 (820x1180) */}
      <style>{`
        @media (min-width: 820px) and (max-width: 1180px),
               (min-width: 768px) and (max-width: 1024px) {
          .admin-table-responsive { display: none !important; }
          .admin-cards-responsive { display: flex !important; }
          .admin-filtros-responsive {
            flex-direction: row !important;
            gap: 16px !important;
            align-items: center !important;
          }
          .admin-buscador-responsive, .admin-combobox-responsive {
            flex-direction: row !important;
            gap: 12px !important;
            width: 50% !important;
            min-width: 300px !important;
            max-width: 600px !important;
          }
          .admin-combobox-responsive { margin-left: auto !important; }
          .admin-buscador-responsive > div, .admin-combobox-responsive select, .admin-buscador-responsive > button {
            flex: 1 1 0;
            min-width: 120px !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
      {usuarioEditar && (
        <EditUsers
          usuario={usuarioEditar}
          abrir={modalEditarAbierto}
          onCerrar={cerrarModalEditar}
          onActualizar={actualizarUsuario}
        />
      )}
      {modalAgregarAbierto && (
        <AddUsers
          abrir={modalAgregarAbierto}
          onCerrar={cerrarModalAgregar}
          onAgregar={agregarUsuario}
        />
      )}
    </div>
  );
}
