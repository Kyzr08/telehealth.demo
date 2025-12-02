import React, { useState, useEffect, useRef } from "react";
import {
  Squares2X2Icon,
  ArchiveBoxIcon,
  HeartIcon,
  CubeIcon,
  ChevronDownIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Trash, Minus, Plus } from 'lucide-react';

export default function Tienda() {
  const [mostrarPago, setMostrarPago] = useState(false);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [usuarioLogueado, setUsuarioLogueado] = useState(false); // Cambiado a estado dinámico
  const [categorias, setCategorias] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState({
    categorias: [],
    disponibilidades: [],
    tipos: [],
  });
  const [orden, setOrden] = useState("default");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [animarCarrito, setAnimarCarrito] = useState(false); // Estado para animar el carrito
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);

  const filtrosRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está logueado
    const usuario = sessionStorage.getItem("usuario");
    setUsuarioLogueado(!!usuario); // Si existe un usuario en sessionStorage, está logueado

    const fetchProductos = async () => {
      try {
        const response = await fetch(
          "http://localhost/telehealth/backend/api/AdminPHP/productos.php"
        );
        const data = await response.json();
        if (data.success) {
          const productosConPrecioNumerico = data.productos.map((producto) => ({
            ...producto,
            precio: parseFloat(producto.precio) || 0,
          }));
          setProductos(productosConPrecioNumerico);
        }
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProductos();
  }, []);

  const cargarCarrito = async () => {
    try {
      const response = await fetch(
        `http://localhost/telehealth/backend/api/UserPHP/cart.php?id_usuario=${JSON.parse(sessionStorage.getItem("usuario")).id_usuario}`
      );
      const data = await response.json();

      if (data.success) {
        const carritoConPrecioNumerico = data.carrito.map((producto) => ({
          ...producto,
          precio: parseFloat(producto.precio) || 0, // Asegurar que precio sea un número
        }));
        setCarrito(carritoConPrecioNumerico);
      } else {
        console.error("Error al cargar el carrito:", data.message);
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  const manejarCambioFiltro = (tipo, valor) => {
    setFiltrosSeleccionados((prev) => {
      const valoresActuales = prev[tipo];
      const nuevoEstado = valoresActuales.includes(valor)
        ? valoresActuales.filter((v) => v !== valor)
        : [...valoresActuales, valor];
      return { ...prev, [tipo]: nuevoEstado };
    });
  };

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      filtrosSeleccionados.categorias.length === 0 ||
      filtrosSeleccionados.categorias.includes(producto.categoria_nombre);

    const coincideDisponibilidad =
      filtrosSeleccionados.disponibilidades.length === 0
        ? producto.disponibilidad_estado !== "Próximamente"
        : filtrosSeleccionados.disponibilidades.includes(producto.disponibilidad_estado);

    const coincideTipo =
      filtrosSeleccionados.tipos.length === 0 ||
      filtrosSeleccionados.tipos.includes(
        producto.tipo_producto || producto.tipo_nombre || producto.nombre_tipo
      );

    return coincideCategoria && coincideDisponibilidad && coincideTipo;
  });

  const productosFiltradosYOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === "price-low") return a.precio - b.precio;
    if (orden === "price-high") return b.precio - a.precio;
    return 0;
  });

  const manejarAgregarAlCarrito = async (producto) => {
    if (!usuarioLogueado) {
      Swal.fire({
        title: 'Ingresa como paciente para comprar',
        html: 'En esta demo puedes usar el botón <strong>"Entrar como Paciente"</strong> en la pantalla de inicio de sesión para simular tu cuenta y continuar con la compra.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ir al inicio de sesión',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0aa6b7',
        cancelButtonColor: '#d3d3d3',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    const productoEnCarrito = carrito.find((item) => item.id_producto === producto.id_producto);

    if (!productoEnCarrito) {
      try {
        const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/cart.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
            id_producto: producto.id_producto,
            cantidad: 1,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setCarrito((prevCarrito) => [
            ...prevCarrito,
            { ...producto, cantidad: 1 },
          ]);
          setAnimarCarrito(true); // Activar animación
        } else {
          console.error("Error al agregar el producto al carrito:", data.message);
        }
      } catch (error) {
        console.error("Error al agregar al carrito:", error);
      }
    }
  };

  const incrementarCantidadLocal = async (id_producto) => {
    try {
      const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/cart.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
          id_producto,
          cantidad: 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCarrito((prevCarrito) =>
          prevCarrito.map((item) =>
            item.id_producto === id_producto
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        );
        setAnimarCarrito(true); // Activar animación
      } else {
        console.error("Error al incrementar cantidad:", data.message);
      }
    } catch (error) {
      console.error("Error al incrementar cantidad:", error);
    }
  };

  const decrementarCantidadLocal = async (id_producto) => {
    try {
      const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/cart.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
          id_producto,
          cantidad: -1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCarrito((prevCarrito) =>
          prevCarrito
            .map((item) =>
              item.id_producto === id_producto
                ? { ...item, cantidad: item.cantidad - 1 }
                : item
            )
            .filter((item) => item.cantidad > 0)
        );
      } else {
        console.error("Error al decrementar cantidad:", data.message);
      }
    } catch (error) {
      console.error("Error al decrementar cantidad:", error);
    }
  };

  const eliminarDelCarrito = async (id_producto) => {
    try {
      const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/cart.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
          id_producto,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCarrito((prevCarrito) =>
          prevCarrito.filter((item) => item.id_producto !== id_producto)
        );
      } else {
        console.error("Error al eliminar el producto del carrito:", data.message);
      }
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
    }
  };

  const iconoCategoria = (categoria) => {
    switch (categoria) {
      case "Dispositivo Médico":
        return <ArchiveBoxIcon className="w-4 h-4 inline-block mr-1 text-sky-600" />;
      case "Higiene y Control":
        return <HeartIcon className="w-4 h-4 inline-block mr-1 text-green-600" />;
      default:
        return <CubeIcon className="w-4 h-4 inline-block mr-1 text-gray-500" />;
    }
  };

  const incrementarCantidad = async (producto) => {
    console.log("Datos enviados para incrementar cantidad:", {
      id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad + 1,
    });

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/cart.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad + 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCarrito((prevCarrito) =>
          prevCarrito.map((item) =>
            item.id_producto === producto.id_producto
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        );
      } else {
        console.error("Error al incrementar la cantidad:", data.message);
      }
    } catch (error) {
      console.error("Error al incrementar la cantidad:", error);
    }
  };

  const decrementarCantidad = async (producto) => {
    console.log("Datos enviados para decrementar cantidad:", {
      id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad - 1,
    });

    if (producto.cantidad <= 1) {
      eliminarDelCarrito(producto.id_producto);
      return;
    }

    try {
      const response = await fetch("http://localhost/telehealth/backend/api/UserPHP/cart.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: JSON.parse(sessionStorage.getItem("usuario")).id_usuario,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad - 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCarrito((prevCarrito) =>
          prevCarrito.map((item) =>
            item.id_producto === producto.id_producto
              ? { ...item, cantidad: item.cantidad - 1 }
              : item
          )
        );
      } else {
        console.error("Error al decrementar la cantidad:", data.message);
      }
    } catch (error) {
      console.error("Error al decrementar la cantidad:", error);
    }
  };

  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [categoriasRes, disponibilidadesRes, tiposRes] = await Promise.all([
          fetch("http://localhost/telehealth/backend/api/AdminPHP/productos.php?categorias"),
          fetch("http://localhost/telehealth/backend/api/AdminPHP/productos.php?disponibilidades"),
          fetch("http://localhost/telehealth/backend/api/AdminPHP/productos.php?tipos"),
        ]);

        const categoriasData = await categoriasRes.json();
        const disponibilidadesData = await disponibilidadesRes.json();
        const tiposData = await tiposRes.json();

        if (categoriasData.success) setCategorias(categoriasData.categorias || []);
        if (disponibilidadesData.success) setDisponibilidades(disponibilidadesData.disponibilidades || []);
        if (tiposData.success) setTipos(tiposData.tipos || []);
      } catch (error) {
        console.error("Error al obtener filtros:", error);
      }
    };

    fetchFiltros();
  }, []);

  // Sincronizar carrito con sessionStorage
  useEffect(() => {
    if (carrito.length > 0) {
      sessionStorage.setItem("carrito", JSON.stringify(carrito));
    } else {
      sessionStorage.removeItem("carrito");
    }
  }, [carrito]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-4">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pt-35 pb-2 gap-4">
          {/* Botón filtros */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 text-black cursor-pointer"
          >
            <FunnelIcon className="w-5 h-5 text-[#0aa6b7]" />
            Filtros
          </button>

          {/* Carrito */}
          <div className="relative flex items-center gap-2 bg-[#EAFEFF] p-2 rounded-lg">
            <motion.div
              animate={animarCarrito ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.5 }}
              onAnimationComplete={() => setAnimarCarrito(false)}
            >
              <ShoppingCart
                className="w-6 h-6 text-[#0aa6b7] cursor-pointer"
                onClick={() => {
                  setCarritoAbierto(true);
                  setAnimarCarrito(false);
                }}
              />
            </motion.div>
            <span className="text-[#0aa6b7] text-lg font-bold">{carrito.length}</span>
          </div>
        </div>

        <AnimatePresence>
          <div
            ref={filtrosRef}
            style={{
              height: mostrarFiltros ? `${filtrosRef.current.scrollHeight}px` : "0px",
              overflow: "hidden",
              transition: "height 0.4s ease, opacity 0.4s ease",
              opacity: mostrarFiltros ? 1 : 0,
              visibility: mostrarFiltros ? "visible" : "hidden",
            }}
            className="rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-white text-black"
          >
            {/* Categorías */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Categoría</h3>
              <div className="space-y-2">
                {categorias.map((cat) => (
                  <label key={cat.id_categoria} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      checked={filtrosSeleccionados.categorias.includes(cat.nombre)}
                      onChange={() => manejarCambioFiltro("categorias", cat.nombre)}
                    />
                    <span className="text-sm text-gray-800">{cat.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Disponibilidad</h3>
              <div className="space-y-2">
                {disponibilidades.map((disp) => (
                  <label key={disp.id_disponibilidad} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      checked={filtrosSeleccionados.disponibilidades.includes(disp.estado)}
                      onChange={() => manejarCambioFiltro("disponibilidades", disp.estado)}
                    />
                    <span className="text-sm text-gray-800">{disp.estado}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Tipo de producto</h3>
              <div className="space-y-2">
                {tipos.map((tipo) => (
                  <label key={tipo.id_tipo} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      checked={filtrosSeleccionados.tipos.includes(tipo.nombre)}
                      onChange={() => manejarCambioFiltro("tipos", tipo.nombre)}
                    />
                    <span className="text-sm text-gray-800">{tipo.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Promociones */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Promociones</h3>
              <div className="space-y-2">
                {["Con descuento", "Ofertas flash", "Combos 2x1 o packs"].map((promo) => (
                  <label key={promo} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-800">{promo}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ordenar por precio */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Ordenar por precio</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    checked={orden === "price-low"}
                    onChange={() => setOrden(orden === "price-low" ? "default" : "price-low")}
                  />
                  <span className="text-sm text-gray-800">Menor a mayor</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    checked={orden === "price-high"}
                    onChange={() => setOrden(orden === "price-high" ? "default" : "price-high")}
                  />
                  <span className="text-sm text-gray-800">Mayor a menor</span>
                </label>
              </div>
            </div>
          </div>
        </AnimatePresence>
      </div>

      <main className="w-full max-w-7xl mx-auto px-2 md:px-4 pb-20">
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productosFiltradosYOrdenados.map((producto) => {
            const productoEnCarrito = carrito.find((item) => item.id_producto === producto.id_producto);

            return (
              <div
                key={producto.id_producto || producto.id}
                className="bg-white rounded-2xl shadow-xl p-5 flex flex-col justify-between h-full transition-shadow duration-200"
                style={{
                  transition: "box-shadow 0.2s",
                  boxShadow:
                    "8px 0 20px -8px rgba(26,53,91,0.13), -8px 0 20px -8px rgba(26,53,91,0.13)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "12px 0 24px -8px rgba(26,53,91,0.18), -12px 0 24px -8px rgba(26,53,91,0.18)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "8px 0 20px -8px rgba(26,53,91,0.13), -8px 0 20px -8px rgba(26,53,91,0.13)")
                }
              >
                <div
                  className="relative flex items-center justify-center h-40 w-40 mx-auto cursor-pointer group"
                  onClick={() => navigate(`/producto/${producto.id_producto}`)}
                >
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="object-contain h-full w-full rounded-lg"
                  />
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md px-3 py-0.5"
                    style={{ backgroundColor: 'rgba(0,0,0,0.80)' }}
                  >
                    <span className="text-white font-semibold text-xs whitespace-nowrap">Ver detalles</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[var(--navbar-text)] mt-4 mb-1 tracking-wide">
                  {producto.marca || "Telehealth+"}
                </h4>
                <h3 className="text-[var(--text-main)] text-base mb-4 line-clamp-2 min-h-[48px]">
                  <span
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      color: "rgba(33,33,33,.95)",
                      fontSize: "14px",
                    }}
                  >
                    {producto.nombre}
                  </span>
                </h3>
                <p className="text-[var(--text-main)] font-bold text-lg mb-6">
                  <span
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      color: "rgba(33,33,33,.95)",
                      fontSize: "14px",
                    }}
                  >
                    S/ {producto.precio.toFixed(2)}
                  </span>
                </p>
                <div className="flex items-stretch gap-2 mt-auto">
                  {productoEnCarrito ? (
                    <div
                      className="flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.2 flex-1"
                      style={{
                        height: "100%",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {productoEnCarrito.cantidad > 1 ? (
                        <button
                          className="text-lg font-bold text-gray-600 cursor-pointer"
                          onClick={() => decrementarCantidadLocal(producto.id_producto)}
                        >
                          <Minus size={20} />
                        </button>
                      ) : (
                        <button
                          className="text-lg font-bold text-gray-600 cursor-pointer"
                          onClick={() => eliminarDelCarrito(producto.id_producto)}
                          aria-label="Eliminar producto"
                        >
                          <Trash size={20} />
                        </button>
                      )}
                      <span className="text-lg font-semibold text-gray-800">
                        {productoEnCarrito.cantidad}
                      </span>
                      <button
                        className="text-lg font-bold text-gray-600 cursor-pointer"
                        onClick={() => incrementarCantidadLocal(producto.id_producto)}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="flex-1 py-2.5 rounded-lg font-semibold shadow-sm bg-[#0aa6b7] text-white hover:bg-[#14B5C7] transition-colors duration-300 flex justify-center items-center transform hover:scale-102 active:scale-98 cursor-pointer"
                      onClick={() => manejarAgregarAlCarrito(producto)}
                    >
                      Agregar al carrito
                    </button>
                  )}
                  <button
                    className="w-[45px] h-[45px] flex justify-center items-center rounded-full bg-[#EAFEFF] border-[#FF7A1A]x text-[#0aa6b7] hover:bg-[#C7F9FF] transition-colors duration-300 transform hover:scale-104 active:scale-98 cursor-pointer"
                    aria-label="Agregar a favoritos"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M12 21.35c-1.45-1.32-5.4-4.36-7.55-6.54C2 12.28 2 8.5 4.42 6.08 6.84 3.66 10.5 4.5 12 6.5c1.5-2 5.16-2.84 7.58-.42C22 8.5 22 12.28 19.55 14.81c-2.15 2.18-6.1 5.22-7.55 6.54z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Panel lateral del carrito */}
      <Dialog open={carritoAbierto} onClose={setCarritoAbierto} className="relative z-[9999]">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">
                        Carrito de compras
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setCarritoAbierto(false)}
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Cerrar panel</span>
                          <XMarkIcon aria-hidden="true" className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {carrito.map((producto, index) => (
                            <li key={`${producto.id_producto}-${index}`} className="flex py-6">
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  alt={producto.nombre}
                                  src={producto.imagen}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div className="flex justify-between text-[13px] font-medium text-gray-900">
                                  <h3 className="text-[13px]">{producto.nombre}</h3>
                                  <p className="ml-4">S/ {producto.precio.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-[13px] text-gray-500">Cantidad: {producto.cantidad}</p>
                                  <button
                                    type="button"
                                    className="font-medium text-[13px] text-indigo-600 hover:text-indigo-500 cursor-pointer"
                                    onClick={() => eliminarDelCarrito(producto.id_producto)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Total</p>
                      <p>
                        S/{" "}
                        {carrito
                          .reduce(
                            (total, producto) => total + producto.precio * producto.cantidad,
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Envíos e impuestos calculados al finalizar la compra.
                    </p>
                    <div className="mt-6 flex justify-center">
                     <button
                      disabled={carrito.length === 0}
                      className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium shadow-xs transition-all duration-300
                        ${
                          carrito.length === 0
                            ? "bg-gray-400 text-white opacity-80 cursor-not-allowed"
                            : "bg-[#0aa6b7] text-white hover:bg-[#14B5C7] cursor-pointer"
                        }`}
                      onClick={() => {
                        if (carrito.length > 0) {
                          sessionStorage.setItem('carrito', JSON.stringify(carrito));
                          navigate('/pago');
                        }
                      }}
                    >
                      Finalizar compra
                    </button>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                      <p>
                        o{" "}
                        <button
                          type="button"
                          onClick={() => setCarritoAbierto(false)}
                          className="font-medium text-[#0aa6b7] hover:text-[#14B5C7] cursor-pointer"
                        >
                          Continuar comprando
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      {mostrarPago && (
        <PaymentForm
          total={carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0).toFixed(2)}
          onClose={() => setMostrarPago(false)}
        />
      )}
    </div>
  );
}
