const API_PREFIX = "http://localhost/telehealth/backend/api/";

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const clone = (value) => JSON.parse(JSON.stringify(value));

const state = {
  users: [
    {
      id_usuario: 1,
      username: "admin",
      contrasena: "admin",
      rol: "Administrador",
      nombres: "Laura",
      nombre: "Laura",
      apellidos: "García",
      apellido: "García",
      correo: "admin@telehealth.demo",
      telefono: "+51 900 000 001",
      dni: "71234567",
      estado: "Activo",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id_usuario: 2,
      username: "medico",
      contrasena: "medico",
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
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id_usuario: 3,
      username: "cliente",
      contrasena: "cliente",
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
  ],
  productos: [
    {
      id_producto: 101,
      nombre: "Oxímetro digital",
      descripcion: "Mide saturación y pulso en segundos.",
      precio: 199.9,
      stock: 18,
      id_categoria: 1,
      categoria_nombre: "Equipos médicos",
      id_tipo: 1,
      tipo_nombre: "Dispositivo",
      id_disponibilidad: 1,
      disponibilidad_estado: "Disponible",
      imagen: "https://medmedic.pe/wp-content/uploads/2022/07/13A.jpg",
    },
    {
      id_producto: 102,
      nombre: "Pedialyte 60 Naranja 500 ml",
      descripcion: "Solución de rehidratación oral que repone líquidos y electrolitos.",
      precio: 14.9,
      stock: 120,
      id_categoria: 2,
      categoria_nombre: "Higiene y Control",
      id_tipo: 3,
      tipo_nombre: "Consumible",
      id_disponibilidad: 1,
      disponibilidad_estado: "Disponible",
      imagen: "https://dcuk1cxrnzjkh.cloudfront.net/imagesproducto/037506L.jpg",
},

  ],
  categoriasProducto: [
    { id_categoria: 1, nombre: "Equipos médicos" },
    { id_categoria: 2, nombre: "Servicios" },
    { id_categoria: 3, nombre: "Bienestar" },
  ],
  disponibilidadesProducto: [
    { id_disponibilidad: 1, estado: "Disponible" },
    { id_disponibilidad: 2, estado: "Destacado" },
    { id_disponibilidad: 3, estado: "Agotado" },
  ],
  tiposProducto: [
    { id_tipo: 1, nombre: "Dispositivo" },
    { id_tipo: 2, nombre: "Accesorio" },
    { id_tipo: 3, nombre: "Suscripción" },
  ],
  citas: [
    {
      id_cita: 1201,
      id_paciente: 3,
      paciente: "Camila Ramos",
      id_medico: 2,
      medico: "Dr. Mateo Quiroz",
      especialidad: "Cardiología",
      tipo: "Seguimiento",
      subtipo: "Seguimiento",
      modalidad: "Virtual",
      estado: "Confirmada",
      estado_pago: "Pagado",
      fecha: "2025-01-15",
      hora: "09:30",
      monto: 120,
    },
    {
      id_cita: 1202,
      id_paciente: 3,
      paciente: "Camila Ramos",
      id_medico: 2,
      medico: "Dr. Mateo Quiroz",
      especialidad: "Cardiología",
      tipo: "Control",
      subtipo: "Control",
      modalidad: "Virtual",
      estado: "Reservada",
      estado_pago: "Pendiente",
      fecha: "2025-01-22",
      hora: "16:00",
      monto: 95,
    },
  ],
  tiposCita: [
    { id_tipo: 1, nombre_tipo: "Consulta" },
    { id_tipo: 2, nombre_tipo: "Control" },
    { id_tipo: 3, nombre_tipo: "Seguimiento" },
  ],
  especialidades: [
    { id_especialidad: 1, nombre: "Medicina general" },
    { id_especialidad: 2, nombre: "Cardiología" },
    { id_especialidad: 3, nombre: "Nutrición" },
  ],
  medicos: [
    {
      id_medico: 2,
      nombre: "Dr. Mateo Quiroz",
      especialidad: "Cardiología",
      especialidades: [2, 1],
      modalidades: ["Virtual", "Presencial"],
    },
  ],
  historiales: [
    {
      id_historial: 9001,
      id_usuario: 3,
      id_medico: 2,
      paciente: "Camila Ramos",
      medico: "Dr. Mateo Quiroz",
      especialidad: "Cardiología",
      tipo_consulta: "Seguimiento",
      motivo_consulta: "Chequeo de hipertensión",
      diagnostico: "Hipertensión controlada",
      recomendaciones: "Mantener medicación y dieta baja en sodio",
      estado: "Controlado",
      fecha_consulta: "2024-12-10T09:30:00",
      fecha_cita: "2024-12-10",
      fecha_realizacion: "2024-12-10T10:15:00",
      fecha_diagnostico: "2024-12-10",
      descripcion_cuadro: "Paciente presenta buena respuesta al tratamiento antihipertensivo.",
      tipo_atencion: "Virtual",
      antecedentes_patologicos: "Hipertensión crónica",
      antecedentes_no_patologicos: "Ejercicio moderado",
      antecedentes_perinatales: "Sin datos",
      antecedentes_gineco_obstetricos: "No aplica",
      observaciones: "Controles cada 3 meses",
      dni: "93456789",
    },
  ],
  recetas: [
    {
      id_receta: 5001,
      id_historial: 9001,
      medicamento: "Losartán",
      dosis: "50 mg",
      frecuencia: "Cada mañana",
      duracion: "30 días",
      indicaciones: "Después del desayuno",
      paciente: "Camila Ramos",
      diagnostico: "Hipertensión controlada",
      fecha_emision: "2024-12-10T09:45:00",
    },
  ],
  mensajes: [
    {
      id_mensaje: 1,
      id_cita: 1201,
      participantes: [2, 3],
      id_emisor: 3,
      fecha: "2024-12-01T09:40:00",
      mensaje: "Doctor, ¿podemos adelantar la cita? Tengo disponibilidad el viernes a las 8am.",
    },
    {
      id_mensaje: 2,
      id_cita: 1201,
      participantes: [2, 3],
      id_emisor: 2,
      fecha: "2024-12-01T09:43:00",
      mensaje: "Hola Camila, revisaré mi agenda y te confirmo en unos minutos.",
    },
    {
      id_mensaje: 3,
      id_cita: 1201,
      participantes: [2, 3],
      id_emisor: 3,
      fecha: "2024-12-01T09:50:00",
      mensaje: "Muchas gracias doctor, quedo atenta al aviso.",
    },
  ],
  carritos: {
    3: [
      { id_producto: 101, nombre: "Oxímetro digital", cantidad: 1, precio: 199.9 },
    ],
  },
  notificaciones: [
    {
      id: 1,
      usuario: "Camila Ramos",
      tipo: "Recordatorio",
      mensaje: "Tu cita del 15 de enero está próxima a iniciar",
      fecha: "2024-12-28T18:32:00",
    },
  ],
  pagos: [
    {
      id: 1,
      usuario: "Camila Ramos",
      monto: 215,
      metodo: "Tarjeta Crédito",
      estado: "Pagado",
      fecha: "2024-12-12T17:20:00",
    },
  ],
  pedidos: [
    {
      id_pedido: 3001,
      usuario: { nombre: "Camila", apellido: "Ramos", correo: "cliente@telehealth.demo" },
      estado_pedido: "Entregado",
      total: 214.8,
      fecha_pago: "2024-11-28T10:45:00",
      fecha_entrega: "2024-11-30T14:15:00",
      items: [
        { nombre: "Oxímetro digital", cantidad: 1, precio: 199.9 },
        { nombre: "Pedialyte 60 Naranja 500 ml", cantidad: 1, precio: 14.9 },
      ],
      puede_calificar: false,
    },
    {
      id_pedido: 3002,
      usuario: { nombre: "Camila", apellido: "Ramos", correo: "cliente@telehealth.demo" },
      estado_pedido: "En camino",
      total: 199.9,
      fecha_pago: "2024-12-15T09:05:00",
      items: [{ nombre: "Oxímetro digital", cantidad: 1, precio: 199.9 }],
      puede_calificar: true,
    },
  ],
  reviews: [
    {
      id_resena: 1,
      calificacion: 5,
      comentario: "La entrega fue rápida y el oxímetro funciona perfecto.",
      fecha: "2024-12-01T18:20:00",
      usuario: {
        nombre: "Camila",
        apellido: "Ramos",
        correo: "cliente@telehealth.demo",
      },
      producto: {
        nombre: "Oxímetro digital",
        imagen: "https://medmedic.pe/wp-content/uploads/2022/07/13A.jpg",
      },
    },
  ],
  blogPosts: [
    {
      id: 1,
      slug: "tendencias-telemedicina-2025",
      title: "Tendencias de telemedicina para 2025",
      cover_image_full_url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&w=800&q=80",
      extract: "Innovaciones que marcarán la atención a distancia.",
      content: "La telemedicina seguirá creciendo con modelos híbridos...",
      published_at: "2024-11-18T08:00:00",
      status: "published",
      views: 1280,
      likes: 64,
    },
    {
      id: 2,
      slug: "guia-pacientes-consulta-virtual",
      title: "Guía rápida para tu primera consulta virtual",
      cover_image_full_url: "https://www.saludadiario.es/wp-content/uploads/2023/12/telemedicina-pexels.jpg",
      extract: "Preparativos esenciales antes de conectarte con tu médico.",
      content:
        "<p>Unos minutos antes de tu cita, verifica tu conexión a internet y prepara los antecedentes médicos relevantes. </p><ul><li>Usa un espacio iluminado</li><li>Revisa el audio y video</li><li>Ten a la mano una lista de síntomas</li></ul>",
      published_at: "2024-10-02T10:30:00",
      status: "published",
      views: 980,
      likes: 41,
    },
    {
      id: 3,
      slug: "novedades-plataforma-telehealth",
      title: "Novedades de la plataforma Telehealth+",
      cover_image_full_url: "https://images.unsplash.com/photo-1521790361543-f645cf042ec4?auto=format&fit=crop&w=1200&q=80",
      extract: "Descubre las mejoras más recientes del panel de pacientes y médicos.",
      content:
        "<p>Hemos integrado recordatorios inteligentes, un sistema de seguimiento de hábitos y mejoras en la agenda médica para agilizar la coordinación de citas.</p>",
      published_at: "2024-09-15T09:00:00",
      status: "published",
      views: 745,
      likes: 33,
    },
    {
      id: 4,
      slug: "alimentacion-salud-digital",
      title: "Alimentación y salud digital: consejos para pacientes crónicos",
      cover_image_full_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      extract: "Cómo combinar telemedicina y nutrición para un seguimiento completo.",
      content:
        "<p>Nuestros especialistas en nutrición ofrecen planes personalizados que se adaptan a tus controles virtuales. Mantén registro de tus comidas en la app y comparte los avances con tu médico.</p>",
      published_at: "2024-08-20T14:30:00",
      status: "published",
      views: 612,
      likes: 27,
    },
    {
      id: 5,
      slug: "ciberseguridad-en-telemedicina",
      title: "Ciberseguridad en telemedicina: buenas prácticas",
      cover_image_full_url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
      extract: "Protege tus datos de salud y aprende a reconocer posibles amenazas.",
      content:
        "<p>Utilizamos cifrado de extremo a extremo y autenticación reforzada. Recomendamos a los pacientes crear contraseñas robustas y activar la verificación en dos pasos.</p>",
      published_at: "2024-07-10T16:15:00",
      status: "published",
      views: 534,
      likes: 22,
    },
    {
      id: 6,
      slug: "caso-exito-paciente-hipertension",
      title: "Caso de éxito: control de hipertensión con telemedicina",
      cover_image_full_url: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=80",
      extract: "Una paciente comparte cómo el monitoreo remoto transformó su tratamiento.",
      content:
        "<p>Camila Ramos logró estabilizar su presión arterial gracias a un seguimiento constante, alertas automáticas y sesiones virtuales semanales con su cardiólogo.</p>",
      published_at: "2024-06-22T11:20:00",
      status: "published",
      views: 689,
      likes: 36,
    },
  ],
  dashboard: {
    kpis: {
      usuarios_totales: 1520,
      citas_activas: 84,
      productos_totales: 58,
      ingresos_totales: 48250,
      nuevos_usuarios: 112,
      satisfaccion_promedio: 92,
    },
    citas_por_mes: [
      { mes: "Ago", citas: 72 },
      { mes: "Sep", citas: 81 },
      { mes: "Oct", citas: 95 },
      { mes: "Nov", citas: 88 },
      { mes: "Dic", citas: 102 },
    ],
    ingresos_por_mes: [
      { mes: "Ago", ingresos: 6800 },
      { mes: "Sep", ingresos: 7200 },
      { mes: "Oct", ingresos: 7950 },
      { mes: "Nov", ingresos: 8300 },
      { mes: "Dic", ingresos: 9100 },
    ],
    actividad_usuarios: [
      { mes: "Ago", activos: 420, nuevos: 68 },
      { mes: "Sep", activos: 448, nuevos: 74 },
      { mes: "Oct", activos: 475, nuevos: 81 },
      { mes: "Nov", activos: 489, nuevos: 89 },
      { mes: "Dic", activos: 512, nuevos: 95 },
    ],
    especialidades: [
      { name: "Medicina general", value: 32 },
      { name: "Cardiología", value: 24 },
      { name: "Nutrición", value: 18 },
      { name: "Pediatría", value: 16 },
      { name: "Dermatología", value: 10 },
    ],
    ultimas_actividades: [
      {
        usuario: "Camila Ramos",
        accion: "Reservó una cita",
        detalle: "Consulta de seguimiento con el Dr. Mateo Quiroz",
        fecha: "2024-12-01T09:30:00",
      },
      {
        usuario: "Laura García",
        accion: "Aprobó un pago",
        detalle: "Pago de cita virtual por S/ 120",
        fecha: "2024-11-28T15:45:00",
      },
      {
        usuario: "Mateo Quiroz",
        accion: "Registró historial",
        detalle: "Actualización del historial clínico para Camila Ramos",
        fecha: "2024-11-25T11:10:00",
      },
      {
        usuario: "Camila Ramos",
        accion: "Realizó una compra",
        detalle: "Plan de nutrición mensual",
        fecha: "2024-11-22T18:05:00",
      },
    ],
  },
  gamificacion: {
    puntos: {
      1: 780,
      2: 510,
      3: 215,
    },
    bonificaciones: [
      { clave: "compra_producto", nombre: "Compra de productos", puntos: 10 },
      { clave: "pago_cita", nombre: "Pago de cita", puntos: 10 },
      { clave: "reseña", nombre: "Publicar reseña", puntos: 1 },
    ],
  },
};

const findUserByUsername = (username) =>
  state.users.find((user) => user.username.toLowerCase() === String(username || "").toLowerCase());

const findUserById = (id) =>
  state.users.find((user) => Number(user.id_usuario) === Number(id));

const buildPacientesAsignados = (idMedico) => {
  const pacientesMap = new Map();

  state.historiales
    .filter((h) => Number(h.id_medico) === Number(idMedico))
    .forEach((h) => {
      const user = findUserById(h.id_usuario) || {};
      const key = h.id_usuario;
      if (!pacientesMap.has(key)) {
        pacientesMap.set(key, {
          id_paciente: h.id_usuario,
          nombre: `${user.nombres || h.paciente || "Paciente"} ${user.apellidos || ""}`.trim(),
          correo: user.correo || "paciente@telehealth.demo",
          telefono: user.telefono || "+51 900 000 004",
          dni: user.dni || `0000000${h.id_usuario}`,
          estado: h.estado || "En tratamiento",
          total_historiales: 0,
          historial: [],
          creado_en: user.creado_en || "2023-05-12T09:00:00",
        });
      }

      const entry = pacientesMap.get(key);
      entry.historial.push({
        id_historial: h.id_historial,
        fecha: h.fecha_consulta,
        fecha_consulta: h.fecha_consulta,
        fecha_diagnostico: h.fecha_diagnostico,
        motivo: h.motivo_consulta,
        diagnostico: h.diagnostico,
        estado: h.estado,
      });
      entry.total_historiales = entry.historial.length;
      entry.estado = h.estado || entry.estado;
      if (!entry.fecha_ultima_consulta || new Date(h.fecha_consulta) > new Date(entry.fecha_ultima_consulta)) {
        entry.fecha_ultima_consulta = h.fecha_consulta;
      }
    });

  return Array.from(pacientesMap.values());
};

const parseBody = async (init) => {
  if (!init?.body) return null;
  const { body } = init;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (error) {
      return null;
    }
  }
  if (body instanceof FormData) {
    const data = {};
    body.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }
  return body;
};

const handleAuth = async (resource, method, body) => {
  if (resource === "auth/login.php" && method === "POST") {
    const { username, contrasena } = body || {};
    const user = findUserByUsername(username);
    if (!user || user.contrasena !== contrasena) {
      return jsonResponse({ success: false, message: "Credenciales inválidas." }, 401);
    }
    const { contrasena: _, ...safeUser } = user;
    return jsonResponse({ success: true, usuario: safeUser });
  }

  if (resource === "auth/register.php" && method === "POST") {
    const nextId = Math.max(...state.users.map((u) => u.id_usuario)) + 1;
    const nuevo = {
      id_usuario: nextId,
      rol: "Paciente",
      estado: "Activo",
      contrasena: "demo",
      ...body,
    };
    state.users.push(nuevo);
    const { contrasena: _, ...safe } = nuevo;
    return jsonResponse({ success: true, usuario: safe });
  }

  return null;
};

const handleProductos = (method, searchParams, body) => {
  if (method === "GET") {
    if (searchParams.has("categorias")) {
      return jsonResponse({ success: true, categorias: clone(state.categoriasProducto) });
    }
    if (searchParams.has("disponibilidades")) {
      return jsonResponse({ success: true, disponibilidades: clone(state.disponibilidadesProducto) });
    }
    if (searchParams.has("tipos")) {
      return jsonResponse({ success: true, tipos: clone(state.tiposProducto) });
    }
    return jsonResponse({ success: true, productos: clone(state.productos) });
  }

  if (method === "POST") {
    if (body?.id_producto) {
      const target = state.productos.find((p) => Number(p.id_producto) === Number(body.id_producto));
      if (!target) return jsonResponse({ success: false, message: "Producto no encontrado" }, 404);

      if (body.nombre !== undefined) target.nombre = body.nombre;
      if (body.descripcion !== undefined) target.descripcion = body.descripcion;
      if (body.precio !== undefined) target.precio = Number(body.precio);
      if (body.stock !== undefined) target.stock = Number(body.stock);

      if (body.id_categoria !== undefined) {
        const categoria = state.categoriasProducto.find((c) => Number(c.id_categoria) === Number(body.id_categoria));
        target.id_categoria = Number(body.id_categoria);
        target.categoria_nombre = categoria?.nombre || target.categoria_nombre;
      }

      if (body.id_tipo !== undefined) {
        const tipo = state.tiposProducto.find((t) => Number(t.id_tipo) === Number(body.id_tipo));
        target.id_tipo = Number(body.id_tipo);
        target.tipo_nombre = tipo?.nombre || target.tipo_nombre;
      }

      if (body.id_disponibilidad !== undefined || body.disponibilidad !== undefined) {
        const idDisp = body.id_disponibilidad ?? body.disponibilidad;
        const disponibilidad = state.disponibilidadesProducto.find((d) => Number(d.id_disponibilidad) === Number(idDisp));
        target.id_disponibilidad = Number(idDisp);
        target.disponibilidad_estado = disponibilidad?.estado || target.disponibilidad_estado;
      }

      const nuevaImagen = body.imagen_url || (typeof body.imagen === "string" && body.imagen) || null;
      if (nuevaImagen) {
        target.imagen = nuevaImagen;
      }

      return jsonResponse({ success: true, producto: clone(target) });
    }
    const nextId = Math.max(...state.productos.map((p) => p.id_producto)) + 1;
    const categoria = state.categoriasProducto.find((c) => Number(c.id_categoria) === Number(body?.id_categoria)) || state.categoriasProducto[0];
    const tipo = state.tiposProducto.find((t) => Number(t.id_tipo) === Number(body?.id_tipo)) || state.tiposProducto[0];
    const disponibilidad =
      state.disponibilidadesProducto.find((d) => Number(d.id_disponibilidad) === Number(body?.id_disponibilidad)) ||
      state.disponibilidadesProducto[0];

    const producto = {
      id_producto: nextId,
      nombre: body?.nombre || "Nuevo producto",
      descripcion: body?.descripcion || "Descripción",
      precio: Number(body?.precio || 0),
      stock: Number(body?.stock || 0),
      id_categoria: categoria.id_categoria,
      categoria_nombre: categoria.nombre,
      id_tipo: tipo.id_tipo,
      tipo_nombre: tipo.nombre,
      id_disponibilidad: disponibilidad.id_disponibilidad,
      disponibilidad_estado: disponibilidad.estado,
      imagen: body?.imagen_url || body?.imagen || "https://placehold.co/300x300?text=Nuevo+Producto",
    };
    state.productos.push(producto);
    return jsonResponse({ success: true, producto: clone(producto) });
  }

  if (method === "DELETE") {
    const before = state.productos.length;
    state.productos = state.productos.filter((item) => item.id_producto !== Number(body?.id_producto));
    return jsonResponse({ success: state.productos.length !== before });
  }

  return null;
};

const handleGamificacion = (method, searchParams, body) => {
  if (method === "GET") {
    const accion = searchParams.get("accion");
    if (accion === "listado") {
      const usuarios = state.users
        .filter((u) => u.rol !== "Administrador")
        .map((u) => ({
          id_usuario: u.id_usuario,
          nombre: `${u.nombres} ${u.apellidos}`.trim(),
          correo: u.correo,
          puntos: state.gamificacion.puntos[u.id_usuario] || 0,
        }))
        .sort((a, b) => b.puntos - a.puntos)
        .slice(0, Number(searchParams.get("limite") || 5));
      return jsonResponse({ success: true, usuarios });
    }
    if (accion === "bonificaciones") {
      return jsonResponse({ success: true, bonificaciones: clone(state.gamificacion.bonificaciones) });
    }
    const idUsuario = Number(searchParams.get("id_usuario"));
    return jsonResponse({ success: true, puntos: state.gamificacion.puntos[idUsuario] || 0 });
  }

  if (method === "POST") {
    const { id_usuario, puntos = 0 } = body || {};
    if (!id_usuario) return jsonResponse({ success: false, message: "id_usuario requerido" }, 400);
    const current = state.gamificacion.puntos[id_usuario] || 0;
    state.gamificacion.puntos[id_usuario] = current + Number(puntos);
    return jsonResponse({ success: true });
  }

  return null;
};

const handleAdminCitas = (method, body) => {
  if (method === "GET") {
    const citas = state.citas.map((cita) => ({ ...clone(cita), id: cita.id_cita }));
    return jsonResponse({ success: true, citas, tipos: clone(state.tiposCita) });
  }
  if (method === "POST") {
    const cita = state.citas.find((c) => c.id_cita === Number(body?.id_cita));
    if (!cita) return jsonResponse({ success: false, message: "Cita no encontrada" }, 404);
    switch (body?.accion) {
      case "confirmar":
        cita.estado = "Confirmada";
        break;
      case "cancelar":
        cita.estado = "Cancelada";
        break;
      case "programar":
        cita.estado = "Reservada";
        cita.fecha = body?.fecha || cita.fecha;
        cita.hora = body?.hora || cita.hora;
        break;
      case "realizada":
        cita.estado = "Realizada";
        cita.fecha_realizacion = new Date().toISOString();
        break;
      case "notificar":
        return jsonResponse({ success: true, mensaje: body?.mensaje || "Notificación enviada" });
      default:
        return jsonResponse({ success: false, message: "Acción no soportada" }, 400);
    }
    return jsonResponse({ success: true, cita: { ...clone(cita), id: cita.id_cita } });
  }
  return null;
};

const handleAdminHistorial = (method, searchParams, body) => {
  if (method === "GET") {
    const id = Number(searchParams.get("id_historial"));
    if (id) {
      const detail = state.historiales.find((item) => item.id_historial === id);
      if (!detail) return jsonResponse({ success: false }, 404);
      return jsonResponse({ success: true, data: clone(detail) });
    }
    return jsonResponse({ success: true, data: clone(state.historiales) });
  }
  if (method === "POST") {
    const id = Number(body?.id_historial);
    state.historiales = state.historiales.filter((item) => item.id_historial !== id);
    state.recetas = state.recetas.filter((item) => item.id_historial !== id);
    return jsonResponse({ success: true });
  }
  return null;
};

const handleAdmin = (resource, method, searchParams, body) => {
  if (resource === "AdminPHP/productos.php") {
    return handleProductos(method, searchParams, body);
  }
  if (resource === "AdminPHP/dashboard.php") {
    return jsonResponse({ success: true, ...clone(state.dashboard) });
  }
  if (resource === "AdminPHP/notificaciones.php") {
    return jsonResponse({ success: true, notificaciones: clone(state.notificaciones) });
  }
  if (resource === "AdminPHP/pagos.php") {
    return jsonResponse({ success: true, pagos: clone(state.pagos) });
  }
  if (resource === "AdminPHP/orders.php") {
    if (method === "GET") return jsonResponse({ success: true, pedidos: clone(state.pedidos) });
    if (method === "POST") {
      const pedido = state.pedidos.find((p) => p.id_pedido === Number(body?.id_pedido));
      if (!pedido) return jsonResponse({ success: false }, 404);
      pedido.estado_pedido = body?.nuevo_estado || pedido.estado_pedido;
      return jsonResponse({ success: true });
    }
  }
  if (resource === "AdminPHP/blogPosts.php") {
    const statusFilter = searchParams.get("status") || "";
    const search = (searchParams.get("search") || "").toLowerCase();

    if (method === "GET") {
      let posts = clone(state.blogPosts);
      if (statusFilter && statusFilter !== "all") {
        posts = posts.filter((post) => (post.status || "draft").toLowerCase() === statusFilter.toLowerCase());
      }
      if (search) {
        posts = posts.filter(
          (post) =>
            post.title.toLowerCase().includes(search) ||
            (post.excerpt || "").toLowerCase().includes(search) ||
            (post.content || "").toLowerCase().includes(search)
        );
      }
      return jsonResponse({ success: true, posts });
    }

    if (method === "POST") {
      const postId = Number(body?.id);
      if (postId) {
        const existing = state.blogPosts.find((item) => item.id === postId);
        if (!existing) return jsonResponse({ success: false, message: "Entrada no encontrada" }, 404);
        if (body.title !== undefined) existing.title = body.title;
        if (body.excerpt !== undefined) existing.excerpt = body.excerpt;
        if (body.content !== undefined) existing.content = body.content;
        if (body.status !== undefined) existing.status = body.status;
        if (body.cover_image_url || body.cover_image) {
          existing.cover_image_full_url = body.cover_image_url || body.cover_image;
        }
        if (body.author_id !== undefined) existing.author_id = Number(body.author_id);
        existing.updated_at = new Date().toISOString();
        return jsonResponse({ success: true, post: clone(existing) });
      }

      const nextId = Math.max(...state.blogPosts.map((post) => post.id)) + 1;
      const slug = (body?.title || `entrada-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const nuevo = {
        id: nextId,
        slug,
        title: body?.title || "Nueva entrada",
        excerpt: body?.excerpt || "Resumen pendiente de completar.",
        content: body?.content || "Contenido del artículo demo.",
        status: body?.status || "draft",
        author_id: Number(body?.author_id || 1),
        views: 0,
        likes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: body?.status === "published" ? new Date().toISOString() : null,
        cover_image_full_url:
          body?.cover_image_url ||
          "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80",
      };
      state.blogPosts.unshift(nuevo);
      return jsonResponse({ success: true, post: clone(nuevo) });
    }

    if (method === "PATCH") {
      const id = Number(body?.id);
      const post = state.blogPosts.find((item) => item.id === id);
      if (!post) return jsonResponse({ success: false, message: "Entrada no encontrada" }, 404);
      if (body.status) {
        post.status = body.status;
        if (body.status === "published") {
          post.published_at = new Date().toISOString();
        }
      }
      post.updated_at = new Date().toISOString();
      return jsonResponse({ success: true, post: clone(post) });
    }

    if (method === "DELETE") {
      const id = Number(body?.id);
      const before = state.blogPosts.length;
      state.blogPosts = state.blogPosts.filter((item) => item.id !== id);
      return jsonResponse({ success: before !== state.blogPosts.length });
    }

    return jsonResponse({ success: false, message: "Acción no implementada" }, 400);
  }
  if (resource === "AdminPHP/reviews.php") {
    return jsonResponse({ success: true, reviews: clone(state.reviews) });
  }
  if (resource === "AdminPHP/gamificacion.php") {
    return handleGamificacion(method, searchParams, body);
  }
  if (resource === "AdminPHP/getUser.php") {
    if (method === "GET") {
      const usuarios = clone(state.users).map(({ contrasena, ...rest }) => ({
        ...rest,
        id: rest.id_usuario,
      }));
      return jsonResponse({ success: true, usuarios });
    }
    if (method === "POST") {
      const user = findUserById(body?.id_usuario);
      if (!user) return jsonResponse({ success: false }, 404);
      Object.assign(user, {
        nombres: body?.nombre || user.nombres,
        apellidos: body?.apellido || user.apellidos,
        correo: body?.correo || user.correo,
        telefono: body?.telefono || user.telefono,
        estado: body?.estado || user.estado,
        username: body?.username || user.username,
        nombre: body?.nombre || user.nombre,
        apellido: body?.apellido || user.apellido,
      });
      return jsonResponse({ success: true });
    }
  }
  if (resource === "AdminPHP/getCitas.php" || resource === "AdminPHP/accionCita.php") {
    return handleAdminCitas(method, body);
  }
  if (resource === "AdminPHP/getHistorial.php" || resource === "AdminPHP/DeleteHC.php") {
    return handleAdminHistorial(method, searchParams, body);
  }
  return null;
};

const ensureCart = (idUsuario) => {
  if (!state.carritos[idUsuario]) state.carritos[idUsuario] = [];
  return state.carritos[idUsuario];
};

const handleUserCart = (method, queryParams, body) => {
  const idUsuario = Number(queryParams.get("id_usuario") || body?.id_usuario);
  if (!idUsuario) return jsonResponse({ success: false, message: "Usuario requerido" }, 400);
  const cart = ensureCart(idUsuario);

  if (method === "GET") {
    return jsonResponse({ success: true, carrito: clone(cart) });
  }

  if (method === "POST") {
    const { id_producto, cantidad = 1 } = body || {};
    const producto = state.productos.find((p) => Number(p.id_producto) === Number(id_producto));
    if (!producto) return jsonResponse({ success: false }, 404);
    const existing = cart.find((item) => item.id_producto === producto.id_producto);
    if (existing) existing.cantidad += Number(cantidad);
    else cart.push({ id_producto: producto.id_producto, nombre: producto.nombre, precio: producto.precio, cantidad: Number(cantidad) });
    return jsonResponse({ success: true, carrito: clone(cart) });
  }

  if (method === "PUT") {
    const { id_producto, cantidad } = body || {};
    const item = cart.find((p) => p.id_producto === Number(id_producto));
    if (!item) return jsonResponse({ success: false }, 404);
    if (cantidad === "incrementar") item.cantidad += 1;
    else if (cantidad === "decrementar") item.cantidad = Math.max(1, item.cantidad - 1);
    else if (!Number.isNaN(Number(cantidad))) item.cantidad = Math.max(1, Number(cantidad));
    return jsonResponse({ success: true, carrito: clone(cart) });
  }

  if (method === "DELETE") {
    const idProducto = Number(body?.id_producto);
    const idx = cart.findIndex((item) => item.id_producto === idProducto);
    if (idx !== -1) cart.splice(idx, 1);
    return jsonResponse({ success: true, carrito: clone(cart) });
  }

  return null;
};

const handleUserCitas = (method, searchParams, body) => {
  if (method === "GET") {
    const accion = searchParams.get("accion");
    if (accion === "especialidades") {
      const especialidades = state.especialidades.map((esp) => ({
        id_especialidad: esp.id_especialidad,
        nombre_especialidad: esp.nombre,
        icono: esp.icono || null,
      }));
      return jsonResponse({ success: true, especialidades });
    }
    if (accion === "tipos") {
      return jsonResponse({
        success: true,
        tipos: [
          { id_tipo: 1, nombre_tipo: "Consulta", precio_base: 120 },
          { id_tipo: 2, nombre_tipo: "Control", precio_base: 95 },
        ],
      });
    }
    if (accion === "medicos") {
      const idEspecialidad = Number(searchParams.get("id_especialidad"));
      const medicos = state.medicos
        .filter((m) => !idEspecialidad || m.especialidades.includes(idEspecialidad))
        .map((m) => ({
          id_medico: m.id_medico,
          nombre: m.nombre,
          modalidad: m.modalidades.join(", "),
          especialidades: m.especialidades
            .map((id) => state.especialidades.find((esp) => esp.id_especialidad === id)?.nombre)
            .filter(Boolean)
            .join(", "),
        }));
      return jsonResponse({ success: true, medicos });
    }
    if (accion === "horarios") {
      return jsonResponse({ success: true, disponibles: ["09:00", "09:30", "10:00", "16:00"], ocupados: ["11:00"] });
    }
    if (accion === "mis_citas") {
      const idUsuario = Number(searchParams.get("id_usuario"));
      const citas = state.citas.filter((c) => c.id_paciente === idUsuario);
      return jsonResponse({ success: true, citas: clone(citas) });
    }
  }

  if (method === "POST") {
    const { accion } = body || {};
    if (accion === "crear") {
      const nextId = Math.max(...state.citas.map((c) => c.id_cita)) + 1;
      const paciente = findUserById(body?.id_usuario);
      const medico = state.medicos.find((m) => m.id_medico === Number(body?.id_medico));
      const cita = {
        id_cita: nextId,
        id_paciente: body?.id_usuario,
        paciente: `${paciente?.nombres || ""} ${paciente?.apellidos || ""}`.trim(),
        id_medico: medico?.id_medico,
        medico: medico?.nombre || "Profesional",
        especialidad: medico?.especialidad || "Especialidad",
        tipo: "Consulta",
        modalidad: "Virtual",
        estado: "Reservada",
        estado_pago: "Pendiente",
        fecha: body?.fecha,
        hora: body?.hora,
        monto: 120,
      };
      state.citas.push(cita);
      return jsonResponse({ success: true, cita: clone(cita) });
    }
  }

  return null;
};

const handleUserHistorial = (searchParams) => {
  const idUsuario = Number(searchParams.get("id_usuario"));
  if (!idUsuario) return jsonResponse({ success: false, message: "Usuario requerido" }, 400);
  const idHistorial = Number(searchParams.get("id_historial"));
  if (idHistorial) {
    const detalle = state.historiales.find((h) => h.id_historial === idHistorial && h.id_usuario === idUsuario);
    if (!detalle) return jsonResponse({ success: false }, 404);
    const recetas = state.recetas.filter((r) => r.id_historial === idHistorial);
    return jsonResponse({ success: true, data: { ...clone(detalle), recetas: clone(recetas) } });
  }
  const data = state.historiales
    .filter((h) => h.id_usuario === idUsuario)
    .map((h) => ({
      id_historial: h.id_historial,
      medico: h.medico,
      diagnostico: h.diagnostico,
      motivo_consulta: h.motivo_consulta,
      fecha_consulta: h.fecha_consulta,
      estado: h.estado,
    }));
  return jsonResponse({ success: true, data });
};

const handleUserReviews = (method, searchParams, body) => {
  if (method === "GET") {
    return jsonResponse({ success: true, reviews: clone(state.reviews) });
  }
  if (method === "POST") {
    const idUsuario = Number(body?.id_usuario);
    const usuario = findUserById(idUsuario);
    const review = {
      id_resena: state.reviews.length + 1,
      calificacion: Number(body?.calificacion || 5),
      comentario: body?.comentario || "Excelente servicio.",
      fecha: new Date().toISOString(),
      usuario: {
        nombre: usuario?.nombres || "Usuario",
        apellido: usuario?.apellidos || "",
        correo: usuario?.correo,
      },
      producto: {
        nombre: body?.producto || "Servicio Telehealth+",
        imagen: state.productos[0]?.imagen,
      },
    };
    state.reviews.push(review);
    return jsonResponse({ success: true, review: clone(review) });
  }
  return null;
};

const handleUser = (resource, method, searchParams, body, url) => {
  if (resource === "UserPHP/cart.php") {
    const queryParams = new URL(url).searchParams;
    return handleUserCart(method, queryParams, body);
  }
  if (resource === "UserPHP/citas.php") {
    return handleUserCitas(method, searchParams, body);
  }
  if (resource === "UserPHP/payment.php") {
    if (method === "GET") {
      const idUsuario = Number(searchParams.get("id_usuario"));
      const usuario = findUserById(idUsuario);
      if (!usuario) return jsonResponse({ success: false }, 404);
      const { contrasena, ...safe } = usuario;
      return jsonResponse({ success: true, usuario: safe });
    }
    if (method === "POST") {
      const pago = {
        id: state.pagos.length + 1,
        usuario: body?.usuario || "Camila Ramos",
        monto: body?.monto || 0,
        metodo: body?.metodo || "Tarjeta Crédito",
        estado: "Pagado",
        fecha: new Date().toISOString(),
      };
      state.pagos.push(pago);
      return jsonResponse({ success: true });
    }
  }
  if (resource === "UserPHP/contact.php") {
    return jsonResponse({ success: true, message: "Mensaje recibido. Te contactaremos pronto." });
  }
  if (resource === "UserPHP/blogPosts.php") {
    if (method === "POST") {
      const slug = body?.slug;
      const post = state.blogPosts.find((p) => p.slug === slug || String(p.id) === String(slug));
      if (!post) return jsonResponse({ success: false, message: "Entrada no encontrada" }, 404);
      post.likes = (post.likes || 0) + 1;
      return jsonResponse({ success: true, likes: post.likes });
    }

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || state.blogPosts.length);
    const slug = searchParams.get("slug");
    const trackView = searchParams.get("track_view") !== "0";

    if (slug) {
      const post = state.blogPosts.find((p) => p.slug === slug || String(p.id) === slug);
      if (!post) return jsonResponse({ success: false, message: "Entrada no encontrada" }, 404);
      if (trackView) {
        post.views = (post.views || 0) + 1;
      }
      return jsonResponse({ success: true, post: clone(post) });
    }

    const start = (page - 1) * limit;
    const posts = state.blogPosts.slice(start, start + limit);
    const total = state.blogPosts.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return jsonResponse({
      success: true,
      posts: clone(posts),
      meta: { page, per_page: limit, total, total_pages: totalPages },
    });
  }
  if (resource === "UserPHP/blogDetail.php") {
    const slug = searchParams.get("slug");
    const post = state.blogPosts.find((p) => p.slug === slug || String(p.id) === slug);
    return post ? jsonResponse({ success: true, post: clone(post) }) : jsonResponse({ success: false }, 404);
  }
  if (resource === "UserPHP/historial.php") {
    return handleUserHistorial(searchParams);
  }
  if (resource === "UserPHP/orders.php") {
    return jsonResponse({ success: true, pedidos: clone(state.pedidos) });
  }
  if (resource === "UserPHP/reviews.php") {
    return handleUserReviews(method, searchParams, body);
  }
  return null;
};

const handleMedicRecetas = (method, searchParams, body) => {
  if (method === "GET") {
    const idHistorial = Number(searchParams.get("id_historial"));
    if (idHistorial) {
      return jsonResponse({ success: true, data: clone(state.recetas.filter((r) => r.id_historial === idHistorial)) });
    }
    return jsonResponse({ success: true, data: clone(state.recetas) });
  }
  if (method === "POST") {
    const receta = {
      id_receta: state.recetas.length + 5001,
      id_historial: Number(body?.id_historial),
      medicamento: body?.medicamento,
      dosis: body?.dosis,
      frecuencia: body?.frecuencia,
      duracion: body?.duracion,
      indicaciones: body?.indicaciones,
    };
    state.recetas.push(receta);
    return jsonResponse({ success: true, data: clone(receta) });
  }
  if (method === "DELETE") {
    state.recetas = state.recetas.filter((r) => r.id_receta !== Number(body?.id_receta));
    return jsonResponse({ success: true });
  }
  return null;
};

const handleMedicHistorial = (method, searchParams, body) => {
  if (method === "GET") {
    const idHistorial = Number(searchParams.get("id_historial"));
    const idMedico = searchParams.get("id_medico");
    if (idHistorial) {
      const historial = state.historiales.find((h) => h.id_historial === idHistorial);
      if (!historial) return jsonResponse({ success: false }, 404);
      const recetas = state.recetas.filter((r) => r.id_historial === idHistorial);
      return jsonResponse({ success: true, data: clone(historial), recetas: clone(recetas) });
    }
    let historiales = state.historiales;
    if (idMedico) {
      historiales = historiales.filter((h) => Number(h.id_medico) === Number(idMedico));
    }
    return jsonResponse({ success: true, data: clone(historiales) });
  }
  if (method === "POST") {
    const paciente = findUserById(body?.id_paciente);
    const medico = state.medicos.find((m) => m.id_medico === Number(body?.id_medico));
    const id = Math.max(...state.historiales.map((h) => h.id_historial)) + 1;
    const historial = {
      id_historial: id,
      id_usuario: body?.id_paciente,
      paciente: `${paciente?.nombres || "Paciente"} ${paciente?.apellidos || ""}`.trim(),
      medico: medico?.nombre || "Profesional",
      especialidad: medico?.especialidad || "Especialidad",
      tipo_consulta: body?.tipo_cita || "Consulta",
      motivo_consulta: body?.motivo_consulta || "Consulta",
      diagnostico: body?.diagnostico || "",
      recomendaciones: body?.recomendaciones || "",
      estado: body?.estado || "En tratamiento",
      fecha_consulta: new Date().toISOString(),
      id_medico: Number(body?.id_medico) || medico?.id_medico,
    };
    state.historiales.push(historial);
    return jsonResponse({ success: true, data: clone(historial) });
  }
  return null;
};

const handleMedic = (resource, method, searchParams, body) => {
  if (resource === "MedicPHP/getPacientes.php") {
    const idMedico = Number(searchParams.get("id_medico")) || Number(body?.id_medico) || 2;
    const data = buildPacientesAsignados(idMedico);
    return jsonResponse({ success: true, data });
  }
  if (resource === "MedicPHP/getRecetas.php") {
    return handleMedicRecetas(method, searchParams, body);
  }
  if (resource === "MedicPHP/getHistorial.php") {
    return handleMedicHistorial(method, searchParams, body);
  }
  if (resource === "MedicPHP/createHistorial.php") {
    if (method === "GET") {
      return jsonResponse({
        success: true,
        data: {
          padecimientos: [
            { id_padecimiento: 1, nombre: "Hipertensión" },
            { id_padecimiento: 2, nombre: "Diabetes" },
          ],
          naturaleza_padecimiento: ["Crónico", "Agudo"],
          tipo_atencion: ["Virtual", "Presencial"],
          estado: ["En tratamiento", "Controlado", "Alta"],
        },
      });
    }
    return handleMedicHistorial("POST", searchParams, body);
  }
  if (resource === "MedicPHP/getCitas.php") {
    const idMedico = Number(searchParams.get("id_medico")) || 2;
    const citas = state.citas.filter((c) => c.id_medico === idMedico);
    return jsonResponse({ success: true, citas: clone(citas), tipos: clone(state.tiposCita) });
  }
  if (resource === "MedicPHP/getCitasConfirmadas.php") {
    const idMedico = Number(searchParams.get("medico_id")) || 2;
    const data = state.citas
      .filter((c) => c.id_medico === idMedico && c.estado === "Confirmada")
      .map((c) => ({
        id_cita: c.id_cita,
        detalle_cita: `${c.paciente} - ${c.fecha} ${c.hora}`,
        id_paciente: c.id_paciente,
        tipo_cita: c.tipo,
        especialidad: c.especialidad,
      }));
    return jsonResponse({ success: true, data });
  }
  if (resource === "chat/mensajes.php") {
    const accion = searchParams.get("accion") || body?.accion;
    const idUsuario = Number(searchParams.get("id_usuario")) || Number(body?.id_usuario) || 2;
    const idCita = Number(searchParams.get("id_cita")) || Number(body?.id_cita) || 1201;

    if (accion === "conversaciones") {
      const conversaciones = state.citas
        .filter((c) => c.id_medico === idUsuario || c.id_paciente === idUsuario)
        .map((c) => ({
          id_conversacion: c.id_cita,
          id_cita: c.id_cita,
          contacto: c.id_medico === idUsuario ? c.paciente : c.medico,
          id_contacto: c.id_medico === idUsuario ? c.id_paciente : c.id_medico,
          ultimo_mensaje: "Doctor, ¿podemos adelantar la cita?",
          fecha_ultimo_mensaje: "2024-12-01T09:45:00",
          sin_leer: Math.random() > 0.5 ? 1 : 0,
        }));
      return jsonResponse({ success: true, conversaciones });
    }

    if (accion === "mensajes") {
      const mensajes = state.mensajes.filter((m) => m.id_cita === idCita && m.participantes.includes(idUsuario));
      return jsonResponse({ success: true, mensajes: clone(mensajes) });
    }

    if (accion === "stream") {
      const payload = {
        mensajes: [],
        ultimo_id: Number(searchParams.get("ultimo_id")) || 0,
      };
      return jsonResponse(payload);
    }

    if (method === "POST") {
      const nuevo = {
        id_mensaje: state.mensajes.length + 1,
        id_cita: idCita,
        participantes: [idUsuario, state.citas.find((c) => c.id_cita === idCita)?.id_paciente || 3],
        id_emisor: idUsuario,
        fecha: new Date().toISOString(),
        mensaje: body?.mensaje || "Mensaje enviado desde el mock.",
      };
      state.mensajes.push(nuevo);
      return jsonResponse({ success: true, mensaje: clone(nuevo) });
    }

    return jsonResponse({ success: false, message: "Acción de chat no implementada" }, 400);
  }
  return null;
};

const shouldMock = (url) => typeof url === "string" && url.startsWith(API_PREFIX);

const resolveMock = async (url, init) => {
  const method = (init?.method || "GET").toUpperCase();
  const body = await parseBody(init);
  const fullUrl = typeof url === "string" ? url : url.url;
  const relative = fullUrl.substring(API_PREFIX.length);
  const [resource] = relative.split("?");
  const searchParams = new URL(fullUrl).searchParams;

  const handlers = [handleAuth, handleAdmin, handleUser, handleMedic];
  for (const handler of handlers) {
    const res = await handler(resource, method, searchParams, body, fullUrl);
    if (res) {
      await delay();
      return res;
    }
  }

  return jsonResponse({ success: false, message: `Mock no implementado: ${resource}` }, 404);
};

export const setupMocks = () => {
  if (typeof window === "undefined") return;
  if (window.__TELEHEALTH_MOCKS__) return;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url;
    if (!shouldMock(url)) return originalFetch(input, init);

    try {
      return await resolveMock(url, init);
    } catch (error) {
      console.error("Mock backend error", error);
      return jsonResponse({ success: false, message: "Error interno del mock" }, 500);
    }
  };

  window.__TELEHEALTH_MOCKS__ = true;
};
