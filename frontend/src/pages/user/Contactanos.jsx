import { useEffect, useState } from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi"; // Import de íconos

const CONTACT_ENDPOINT = "http://localhost/telehealth/backend/api/UserPHP/contact.php";

export default function Contactanos() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("usuario");
      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);
      const nombreCompleto = [parsedUser.nombres, parsedUser.apellidos]
        .filter(Boolean)
        .join(" ");

      setFormData((prev) => ({
        ...prev,
        nombre: nombreCompleto || prev.nombre,
        correo: parsedUser.correo || prev.correo,
      }));
    } catch (error) {
      console.error("No se pudo leer el usuario desde la sesión", error);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const payload = {
      nombre: formData.nombre.trim(),
      correo: formData.correo.trim(),
      mensaje: formData.mensaje.trim(),
    };

    try {
      const storedUser = sessionStorage.getItem("usuario");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        payload.id_usuario = parsedUser.id_usuario ?? parsedUser.id;
      }

      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudo enviar el mensaje.");
      }

      setFeedback({ type: "success", message: data.message || "Mensaje enviado correctamente." });
      setFormData((prev) => ({
        ...prev,
        mensaje: "",
        ...(payload.id_usuario ? {} : { nombre: "", correo: "" }),
      }));
    } catch (error) {
      console.error("Error al enviar el mensaje de contacto", error);
      setFeedback({
        type: "error",
        message: error.message || "No se pudo enviar el mensaje. Inténtalo nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* 🔹 Encabezado */}
      <section className="pt-40 pb-20 text-center bg-white shadow-sm">
        {/* ↑ aumentado de pt-28 → pt-40 */}
        <h1 className="text-5xl font-extrabold mb-4 text-[var(--navbar-text)]">
          Contáctanos
        </h1>
        <p className="text-lg max-w-3xl mx-auto text-[var(--text-sub)] leading-relaxed">
          Estamos aquí para ayudarte. Si tienes preguntas, comentarios o necesitas asistencia,
          completa el formulario o utiliza nuestros medios de contacto directo.
        </p>
      </section>

      {/* 🔹 Información de contacto + Formulario */}
      <section className="py-20 px-6 md:px-16 bg-[var(--bg-main)]">
        <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Información de contacto */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[var(--navbar-text)] mb-4">
              Información de contacto
            </h2>
            <p className="text-[var(--text-sub)] leading-relaxed">
              Puedes comunicarte con nosotros de lunes a sábado de 8:00 a.m. a 6:00 p.m.
              ¡Nuestro equipo estará encantado de atenderte!
            </p>
            <ul className="space-y-4 text-[var(--text-main)]">
              <li className="flex items-center gap-3">
                <FiPhone className="text-[var(--navbar-text)] text-2xl" />
                <span>
                  <strong>Teléfono:</strong> +51 987 654 321
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-[var(--navbar-text)] text-2xl" />
                <span>
                  <strong>Correo:</strong> contacto@telehealthplus.com
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="text-[var(--navbar-text)] text-2xl" />
                <span>
                  <strong>Dirección:</strong> Av. La Innovación 123, Lima, Perú
                </span>
              </li>
            </ul>
          </div>

          {/* Formulario */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mt-6">
            <h2 className="text-2xl font-semibold text-[var(--navbar-text)] mb-6 text-center">
              Envíanos un mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[var(--text-sub)] mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-sub)] mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--text-sub)] mb-1">Mensaje</label>
                <textarea
                  rows="4"
                  required
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0aa6b7] outline-none"
                ></textarea>
              </div>

              {feedback.message && (
                <p
                  className={`text-sm ${
                    feedback.type === "success" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {feedback.message}
                </p>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-300"
                  style={{ backgroundImage: "var(--gradient-button)" }}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 🔹 Mapa */}
      <section className="py-20 text-center bg-white">
        <h2 className="text-3xl font-bold text-[var(--navbar-text)] mb-6">Encuéntranos fácilmente</h2>
        <p className="text-[var(--text-sub)] mb-8 max-w-2xl mx-auto">
          Visítanos en nuestras oficinas o contáctanos desde cualquier parte del mundo.
        </p>
        <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <iframe
            title="Ubicación de TeleHealth+"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.794118592178!2d-77.0428!3d-12.0464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8cfb57b7a5b%3A0x9b38e3f8d5f48db9!2sLima%2C%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1691690000000!5m2!1ses!2spe"
            width="100%"
            height="400"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
}