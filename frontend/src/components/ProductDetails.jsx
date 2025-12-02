import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Truck } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductDetails() {
  const [favorito, setFavorito] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch(
          `http://localhost/telehealth/backend/api/AdminPHP/productos.php`
        );
        const data = await response.json();

        if (data.success) {
          const productoEncontrado = data.productos.find(
            (producto) => producto.id_producto === id.toString()
          );
          if (productoEncontrado) {
            setProducto(productoEncontrado);
          } else {
            console.error("Producto no encontrado.");
          }
        } else {
          console.error("Error al obtener productos:", data.message);
        }
      } catch (error) {
        console.error("Error al conectar con la API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
        Cargando producto...
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
        Producto no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-40 px-4 md:px-10">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-md border border-gray-200 p-10 flex flex-col md:flex-row gap-10 relative">
        {/* Icono volver arriba a la izquierda dentro del detalle */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-[#0aa6b7] transition-colors z-20"
          aria-label="Volver"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {/* Imagen del producto */}
        <div className="md:w-1/2 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-[340px] h-[340px] object-contain transition-transform duration-300 ease-in-out hover:scale-110 cursor-zoom-in"
            />
          </div>
        </div>

        {/* Detalles del producto */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {producto.nombre}
            </h1>
            <p className="text-gray-600 mb-4">{producto.tipo || ""}</p>

            <p className="text-sm font-semibold text-gray-600 mb-6">
              Precio Regular: S/{" "}
              {producto.precio ? Number(producto.precio).toFixed(2) : "0.00"}
            </p>

            <div className="p-0 mb-8">
              <p className="text-gray-700 text-sm leading-relaxed">
                {producto.descripcion}
              </p>
            </div>

            {/* Métodos de entrega */}
            <div className="mt-8">

              {/* Sección de Envío */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-indigo-600 mb-3">
                  Envío
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                  <li className="marker:text-gray-300">
                    Envío gratuito a domicilio
                  </li>
                  <li className="marker:text-gray-300">
                    Cobertura nacional con entregas a nivel provincial
                  </li>
                  <li className="marker:text-gray-300">
                    Opción de envío acelerado con entrega prioritaria
                  </li>
                  <li className="marker:text-gray-300">
                    Firma requerida en la entrega
                  </li>
                </ul>
                <hr className="my-5 border-gray-200" />
              </div>
              {/* Sección Devuelve */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-indigo-600 mb-3">Devuelve</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                  <li className="marker:text-gray-300">Proceso de devolución sencillo desde la plataforma</li>
                  <li className="marker:text-gray-300">Etiqueta de envío prepago incluida automáticamente</li>
                  <li className="marker:text-gray-300">Tarifa de reposición del 10% en devoluciones aprobadas</li>
                  <li className="marker:text-gray-300">Periodo de devolución válido dentro de los 60 días posteriores a la compra</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ...existing code... */}
        </div>
      </div>
    </div>
  );
}
