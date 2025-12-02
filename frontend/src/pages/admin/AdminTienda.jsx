import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Filter } from "lucide-react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import AddProduct from "../../components/AddProduct";
import EditProduct from "../../components/EditProduct";

export default function AdminTienda() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [disponibilidadFiltro, setDisponibilidadFiltro] = useState("Todas");
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  // Añadidos nuevos estados
  const [categorias, setCategorias] = useState([]);
  const [disponibilidadesOptions, setDisponibilidadesOptions] = useState([]);
  const FALLBACK_IMG = "https://placehold.co/120x120?text=Producto";

  const handleAddProduct = (newProduct) => {
    setProductos((prevProductos) => [...prevProductos, {
      ...newProduct,
      disponibilidad_estado: newProduct.disponibilidad_estado || "Desconocido",
    }]);
  };

  const fetchProductos = async () => {
    try {
      const res = await fetch(
        "http://localhost/telehealth/backend/api/AdminPHP/productos.php"
      );
      const data = await res.json();
      if (data.success) {
        setProductos(data.productos);
      } else {
        console.error("Error al cargar productos:", data.message);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Nuevo useEffect para cargar categorías y disponibilidades
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        // 🔹 Obtener categorías
        const resCat = await fetch("http://localhost/telehealth/backend/api/AdminPHP/productos.php?categorias");
        const dataCat = await resCat.json();
        if (dataCat.success) {
          setCategorias([{ id_categoria: 0, nombre: "Todas" }, ...dataCat.categorias]);
        }

        // 🔹 Obtener disponibilidades
        const resDisp = await fetch("http://localhost/telehealth/backend/api/AdminPHP/productos.php?disponibilidades");
        const dataDisp = await resDisp.json();
        if (dataDisp.success) {
          setDisponibilidadesOptions([{ id_disponibilidad: 0, estado: "Todas" }, ...dataDisp.disponibilidades]);
        }
      } catch (error) {
        console.error("Error al cargar filtros:", error);
      }
    };

    fetchFiltros();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `http://localhost/telehealth/backend/api/AdminPHP/productos.php`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_producto: id }),
          }
        );

        const data = await res.json();

        if (data.success) {
          Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
          setProductos((prev) => prev.filter((producto) => producto.id_producto !== id));
        } else {
          Swal.fire("Error", data.message || "No se pudo eliminar el producto.", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
      }
    }
  };

  const abrirModalAgregar = () => setModalAgregarAbierto(true);
  const cerrarModalAgregar = () => setModalAgregarAbierto(false);
  const abrirModalEditar = (producto) => {
    setProductoSeleccionado(producto);
    setModalEditarAbierto(true);
  };
  const cerrarModalEditar = () => {
    setProductoSeleccionado(null);
    setModalEditarAbierto(false);
  };

  const handleEditProduct = async (updatedProduct) => {
    if (!updatedProduct || !updatedProduct.id_producto) {
      console.error("El producto actualizado no contiene un id_producto válido:", updatedProduct);
      return;
    }

    try {
      const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/productos.php");
      const data = await res.json();

      if (data.success) {
        setProductos(data.productos);
      } else {
        console.error("Error al obtener productos actualizados:", data.message);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor para actualizar productos:", error);
    }
  };

  const actualizarDisponibilidad = async (idProducto, nuevaDisponibilidad) => {
    try {
      const res = await fetch(
        `http://localhost/telehealth/backend/api/AdminPHP/productos.php`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: idProducto, disponibilidad: nuevaDisponibilidad }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setProductos((prev) =>
          prev.map((producto) =>
            producto.id_producto === idProducto
              ? { ...producto, id_disponibilidad: nuevaDisponibilidad }
              : producto
          )
        );
      } else {
        console.error("Error al actualizar disponibilidad:", data.message);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    }
  };

 const productosFiltrados = productos.filter((p) => {
  const coincideNombre = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
  const coincideCategoria =
    categoriaFiltro === "Todas" ||
    p.categoria_nombre?.toLowerCase() === categoriaFiltro.toLowerCase();
  const coincideDisponibilidad =
    disponibilidadFiltro === "Todas" ||
    p.disponibilidad_estado === disponibilidadFiltro;

  return coincideNombre && coincideCategoria && coincideDisponibilidad;
});


  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 flex-1 min-w-[150px] sm:min-w-[500px] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#0aa6b7] transition-all">
            <input
              type="text"
              placeholder="Buscar por nombre del producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full outline-none text-sm"
            />
          </div>
          <button
            onClick={abrirModalAgregar}
            className="bg-[#0aa6b7] text-white px-4 py-2 rounded-xl shadow-md hover:bg-[#088c9b] transition flex items-center gap-2"
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:w-auto sm:gap-3 sm:ml-auto">
          <span className="text-sm font-semibold text-gray-700 flex items-center">
            <Filter className="h-4 w-4 mr-1 text-gray-500" />
            Filtros:
          </span>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] bg-white"
          >
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            value={disponibilidadFiltro}
            onChange={(e) => setDisponibilidadFiltro(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-[#0aa6b7] w-full sm:w-[200px] bg-white"
          >
            {disponibilidadesOptions.map((d) => (
              <option key={d.id_disponibilidad} value={d.estado}>
                {d.estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto flex-1 rounded-xl shadow-inner hidden sm:block">
        <table className="w-full border-collapse text-sm text-gray-700 rounded-xl">
          <thead className="bg-gray-50 sticky top-0 z-5 rounded-t-xl">
            <tr>
              {["Foto", "Nombre", "Descripción", "Precio", "Stock", "Disponibilidad", "Acciones"].map(
                (h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left font-medium text-gray-500 text-xs uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr
                key={p.id_producto}
                className="border-b border-gray-300/50 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">
                  <img
                    src={p.imagen || FALLBACK_IMG}
                    alt={p.nombre}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </td>
                <td className="py-3 px-4 font-medium truncate max-w-[150px]" title={p.nombre}>{p.nombre}</td>
                <td className="py-3 px-4 truncate max-w-[300px]" title={p.descripcion}>{p.descripcion}</td>
                <td className="py-3 px-4 font-medium">
                  S/{parseFloat(p.precio).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  {p.stock > 20 ? (
                    <span className="text-green-600 font-medium">{p.stock}</span>
                  ) : (
                    <span className="text-red-600 font-medium">{p.stock}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {p.disponibilidad_estado || "Desconocido"}
                </td>
                <td className="py-3 px-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#0aa6b7] hover:bg-[#e0f7fa] hover:shadow-md transition"
                    onClick={() => abrirModalEditar(p)}
                    title="Editar producto"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fcf9f9] text-[#e63946] hover:bg-[#f8d7da] hover:shadow-md transition"
                    onClick={() => handleDelete(p.id_producto)}
                    title="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar producto */}
      {modalAgregarAbierto && (
        <AddProduct
          abrir={modalAgregarAbierto}
          onCerrar={cerrarModalAgregar}
          onAgregar={handleAddProduct}
        />
      )}

      {/* Modal para editar producto */}
      {modalEditarAbierto && (
        <EditProduct
          abrir={modalEditarAbierto}
          onCerrar={cerrarModalEditar}
          product={productoSeleccionado}
          onSave={() => {
            fetchProductos(); // Recargar productos desde la API
            cerrarModalEditar(); // Cerrar el modal
          }}
        />
      )}
    </div>
  );
}
