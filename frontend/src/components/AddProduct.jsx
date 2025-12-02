import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ImagePlus } from "lucide-react";

export default function AddProduct({ abrir, onCerrar, onAgregar }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    id_categoria: "", // ✅ corregido
    id_tipo: "",
    stock: "",
    imagen: "",
    id_disponibilidad: "1", // ✅ corregido
  });

  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(
          "http://localhost/telehealth/backend/api/AdminPHP/productos.php?categorias"
        );
        const data = await res.json();
        if (data.success) setCategorias(data.categorias);
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
      }
    };

    const fetchTipos = async () => {
      try {
        const res = await fetch(
          "http://localhost/telehealth/backend/api/AdminPHP/productos.php?tipos"
        );
        const data = await res.json();
        if (data.success) setTipos(data.tipos);
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
      }
    };

    const fetchDisponibilidades = async () => {
      try {
        const res = await fetch(
          "http://localhost/telehealth/backend/api/AdminPHP/productos.php?disponibilidades"
        );
        const data = await res.json();
        if (data.success) setDisponibilidades(data.disponibilidades);
      } catch (error) {
        console.error("Error al conectar con el servidor:", error);
      }
    };

    fetchCategorias();
    fetchTipos();
    fetchDisponibilidades();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      setForm({ ...form, imagen: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      for (const key in form) {
        if (key === "imagen" && form[key]) {
          data.append(key, form[key]);
        } else {
          data.append(key, form[key] || "");
        }
      }

      if (!form.imagen) {
        const urlImagen = form.imagen_url?.trim() || "https://cdn.pixabay.com/photo/2017/08/21/17/46/pulse-2668703_640.jpg";
        data.append("imagen_url", urlImagen);
      }

      const res = await fetch(
        "http://localhost/telehealth/backend/api/AdminPHP/productos.php",
        {
          method: "POST",
          body: data,
        }
      );

      const response = await res.json();

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "Producto creado",
          text: "El producto fue agregado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });

        if (onAgregar && response.producto) onAgregar(response.producto);
        onCerrar();
      } else {
        Swal.fire(
          "Error",
          response.message || "No se pudo crear el producto.",
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
          Crear producto
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="nombre"
                className="text-sm font-semibold text-gray-700"
              >
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="imagen"
                className="text-sm font-semibold text-gray-700"
              >
                Imagen
              </label>
              <div className="relative flex items-center justify-start border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition">
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="ml-2 text-gray-400">
                  {form.imagen ? form.imagen.name : "Agregar imagen"}
                </span>
                <input
                  id="imagen"
                  type="file"
                  name="imagen"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="descripcion"
              className="text-sm font-semibold text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="4"
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="id_categoria"
                className="text-sm font-semibold text-gray-700"
              >
                Categoría
              </label>
              <select
                id="id_categoria"
                name="id_categoria"
                value={form.id_categoria}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="id_tipo"
                className="text-sm font-semibold text-gray-700"
              >
                Tipo de Producto
              </label>
              <select
                id="id_tipo"
                name="id_tipo"
                value={form.id_tipo}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              >
                <option value="">Seleccionar tipo de producto</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="precio"
                className="text-sm font-semibold text-gray-700"
              >
                Precio
              </label>
              <input
                id="precio"
                type="number"
                step="0.01"
                name="precio"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="stock"
                className="text-sm font-semibold text-gray-700"
              >
                Stock
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="id_disponibilidad"
              className="text-sm font-semibold text-gray-700"
            >
              Disponibilidad
            </label>
            <select
              id="id_disponibilidad"
              name="id_disponibilidad"
              value={form.id_disponibilidad}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none transition"
            >
              {disponibilidades.map((d) => (
                <option key={d.id_disponibilidad} value={d.id_disponibilidad}>
                  {d.estado}
                </option>
              ))}
            </select>
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
