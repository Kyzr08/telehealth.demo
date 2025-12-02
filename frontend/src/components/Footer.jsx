import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const navigationLinks = [
    { href: "/", label: "Inicio" },
    { href: "/servicios", label: "Servicios" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
  ];

  const contactItems = [
    { icon: <FaMapMarkerAlt size={16} />, value: "Calle Salud 123, Ciudad, País" },
    { icon: <FaPhone size={16} />, value: "+1 234 567 890" },
    { icon: <FaEnvelope size={16} />, value: "contacto@telehealth.com" },
  ];

  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: <FaFacebook size={18} /> },
    { href: "https://twitter.com", label: "Twitter", icon: <FaTwitter size={18} /> },
    { href: "https://instagram.com", label: "Instagram", icon: <FaInstagram size={18} /> },
  ];

  return (
    <footer className="bg-[#0aa6b7] text-white mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-white/80">TeleHealth+</span>
            <h3 className="text-3xl font-semibold leading-tight">Cuidado conectado y sin fricciones</h3>
            <p className="text-sm leading-relaxed text-white/90">
              Simplificamos la experiencia de pacientes y equipos médicos con tecnología confiable y humana, disponible en cualquier dispositivo.
            </p>
          </div>

          <div className="grid w-full gap-12 md:grid-cols-2 md:items-start md:justify-end">
            <nav className="space-y-5">
              <h4 className="text-xs uppercase tracking-[0.3em] text-white/80">Mapa del sitio</h4>
              <ul className="space-y-3 text-sm text-white">
                {navigationLinks.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="inline-block transition-colors hover:text-white/90"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-5">
              <h4 className="text-xs uppercase tracking-[0.3em] text-white/80">Contacto</h4>
              <ul className="space-y-4 text-sm text-white">
                {contactItems.map(({ icon, value }) => (
                  <li key={value} className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                      {icon}
                    </span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">Redes</p>
                <ul className="mt-4 flex items-center gap-3">
                  {socialLinks.map(({ href, label, icon }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white hover:text-[#0aa6b7]"
                      >
                        {icon}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/15 pt-6 text-xs text-white/85 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2025 TeleHealth+. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <a href="/privacidad" className="transition-colors hover:text-white">
              Política de privacidad
            </a>
            <a href="/terminos" className="transition-colors hover:text-white">
              Términos de servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}