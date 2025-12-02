import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/header/Navbar";
import Footer from "./components/Footer";
import ChatBot from "./components/Chatbot";
import PaymentPage from "./pages/user/PaymentPage";

// Páginas de usuario
import Home from "./pages/user/Home";
import Nosotros from "./pages/user/Nosotros";
import Contactanos from "./pages/user/Contactanos";
import Telemedicina from "./pages/user/Telemedicina";
import ReservaCitas from "./pages/user/ReservaCitas";
import Tienda from "./pages/user/Tienda";
import ProductDetails from "./components/ProductDetails";
import Blog from "./pages/user/Blog";
import BlogDetail from "./pages/user/BlogDetail";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Historial from "./pages/user/Historial";
import Cuenta from "./pages/user/Cuenta";

// Panel Médico
import MedicPanel from "./pages/medic/MedicPanel";
import DashboardMedic from "./pages/medic/DashboardMedic";
import PacientesMedic from "./pages/medic/PacientesMedic";
import HistorialMedic from "./pages/medic/HistorialMedic";
import RecetasMedic from "./pages/medic/RecetasMedic";
import MensajesMedic from "./pages/medic/MensajesMedic";
import CitasMedic from "./pages/medic/CitasMedic";

// Panel Administrativo
import AdminPanel from "./pages/admin/AdminPanel";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminCitas from "./pages/admin/AdminCitas";
import AdminHistorialClinico from "./pages/admin/AdminHistorialClinico";
import AdminTienda from "./pages/admin/AdminTienda";
import AdminPagos from "./pages/admin/AdminPagos";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminNotificaciones from "./pages/admin/AdminNotificaciones";
import AdminResenas from "./pages/admin/AdminResenas";
import AdminGamificacion from "./pages/admin/AdminGamificacion";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminCuenta from "./pages/admin/AdminCuenta";

function Layout() {
  const location = useLocation();

  const hideFooterRoutes = ["/login", "/register"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  const hideChatBotRoutes = ["/login", "/register", "/pago"];
  const shouldHideChatBot = hideChatBotRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!shouldHideChatBot && <ChatBot />}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <div className="app-scroll">
      <BrowserRouter>
        <Routes>
          {/* Layout principal (usuarios) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contactanos" element={<Contactanos />} />
            <Route path="/telemedicina" element={<Telemedicina />} />
            <Route path="/reservas" element={<ReservaCitas />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/producto/:id" element={<ProductDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/pago" element={<PaymentPage />} />
          </Route>

          {/* Panel administrativo */}
          <Route path="/admin" element={<AdminPanel />}>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="citas" element={<AdminCitas />} />
            <Route path="historial" element={<AdminHistorialClinico />} />
            <Route path="tienda" element={<AdminTienda />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="pagos" element={<AdminPagos />} />
            <Route path="notificaciones" element={<AdminNotificaciones />} />
            <Route path="reseñas" element={<AdminResenas />} />
            <Route path="gamificacion" element={<AdminGamificacion />} />
            <Route path="blogs" element={<AdminBlog />} />
            <Route path="cuenta" element={<AdminCuenta />} />
          </Route>

          {/* Panel médico */}
          <Route path="/medic" element={<MedicPanel />}>
            <Route index element={<DashboardMedic />} />
            <Route path="pacientes" element={<PacientesMedic />} />
            <Route path="historial" element={<HistorialMedic />} />
            <Route path="recetas" element={<RecetasMedic />} />
            <Route path="mensajes" element={<MensajesMedic />} />
            <Route path="citas" element={<CitasMedic />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
