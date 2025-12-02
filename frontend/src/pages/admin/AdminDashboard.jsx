// Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaStore,
  FaMoneyBill,
  FaSmile,
  FaChartLine,
  FaUserPlus,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const KPI_CONFIG = [
  { key: "usuarios_totales", title: "Usuarios Totales", color: "#0aa6b7", icon: <FaUser /> },
  { key: "citas_activas", title: "Citas Activas", color: "#4caf50", icon: <FaCalendarAlt /> },
  { key: "productos_totales", title: "Productos", color: "#ff9800", icon: <FaStore /> },
  { key: "ingresos_totales", title: "Ingresos", color: "#f44336", icon: <FaMoneyBill /> },
  { key: "nuevos_usuarios", title: "Nuevos Usuarios", color: "#7e57c2", icon: <FaUserPlus /> },
  { key: "satisfaccion_promedio", title: "Satisfacción", color: "#00bcd4", icon: <FaSmile /> },
];

const pieColors = ["#0aa6b7", "#4caf50", "#ff9800", "#f44336", "#7e57c2", "#FFB300", "#4DD0E1", "#AB47BC"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost/telehealth/backend/api/AdminPHP/dashboard.php", {
          signal: controller.signal,
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "No se pudieron obtener los datos del dashboard.");
        }

        setData(json);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Dashboard error", err);
        setError(err.message || "Error desconocido.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => controller.abort();
  }, []);

  const formattedKPIs = useMemo(() => {
    if (!data?.kpis) return [];
    return KPI_CONFIG.map((item) => {
      const rawValue = data.kpis[item.key];
      let displayValue = rawValue ?? 0;

      if (item.key === "ingresos_totales") {
        const monto = typeof rawValue === "number" ? rawValue : parseFloat(rawValue) || 0;
        displayValue = monto.toLocaleString("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 2,
        });
      } else if (item.key === "satisfaccion_promedio") {
        const satisfaccion = typeof rawValue === "number" ? rawValue : parseFloat(rawValue) || 0;
        displayValue = `${satisfaccion}%`;
      } else {
        const numero = typeof rawValue === "number" ? rawValue : parseInt(rawValue, 10) || 0;
        displayValue = numero.toLocaleString("es-PE");
      }

      return { ...item, value: displayValue };
    });
  }, [data]);

  const citasData = data?.citas_por_mes ?? [];
  const ingresosData = data?.ingresos_por_mes ?? [];
  const actividadUsuarios = data?.actividad_usuarios ?? [];
  const especialidades = data?.especialidades ?? [];
  const ultimasActividades = data?.ultimas_actividades ?? [];

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-10">
        <FaChartLine className="animate-spin text-[#0aa6b7] text-4xl" />
        <p className="text-gray-600 text-sm">Cargando métricas del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-4 text-center">
        <FaChartLine className="text-red-500 text-4xl" />
        <p className="text-gray-700 font-medium">{error}</p>
        <p className="text-sm text-gray-500">Intenta recargar la página o verifica tu conexión.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
        <div className="flex flex-col gap-6 lg:gap-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {formattedKPIs.map((card) => (
              <div
                key={card.key}
                className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 flex items-center gap-3 border-l-4"
                style={{ borderColor: card.color }}
              >
                <div
                  className="rounded-xl p-3 text-white text-xl sm:text-2xl shadow-md flex-shrink-0"
                  style={{ backgroundColor: card.color }}
                >
                  {card.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-gray-500 uppercase font-semibold">{card.title}</span>
                  <span className="font-bold text-gray-800 text-base sm:text-lg">{card.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-4 min-w-0">
              <h2 className="font-semibold text-cyan-700 mb-4">Citas por Mes</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={citasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="citas" stroke="#0aa6b7" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 min-w-0">
              <h2 className="font-semibold text-cyan-700 mb-4">Ingresos por Mes</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ingresosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `S/ ${value}`} />
                  <Tooltip formatter={(value) => [`S/ ${value}`, "Ingresos"]} />
                  <Bar dataKey="ingresos" fill="#4caf50" barSize={35} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 min-w-0">
              <h2 className="font-semibold text-cyan-700 mb-4">Distribución de Especialidades</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={especialidades} dataKey="value" nameKey="name" outerRadius={80} label>
                    {especialidades.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(valor, _, entry) => [`${valor} citas`, entry.name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 min-w-0">
            <h2 className="font-semibold text-cyan-700 mb-4">Actividad de Usuarios</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={actividadUsuarios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="activos" stackId="1" stroke="#0aa6b7" fill="#b2ebf2" />
                <Area type="monotone" dataKey="nuevos" stackId="1" stroke="#4caf50" fill="#c8e6c9" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 overflow-x-auto">
            <h2 className="font-semibold text-cyan-700 mb-4">Últimas Actividades</h2>
            <table className="w-full text-xs sm:text-sm min-w-[360px]">
              <thead>
                <tr className="text-gray-500 text-left border-b">
                  <th className="py-2 px-2">Usuario</th>
                  <th className="py-2 px-2">Acción</th>
                  <th className="py-2 px-2">Detalle</th>
                  <th className="py-2 px-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimasActividades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 px-2 text-center text-gray-500">
                      No hay actividades recientes registradas.
                    </td>
                  </tr>
                )}
                {ultimasActividades.map((actividad, index) => (
                  <tr key={`${actividad.usuario}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-2 font-medium text-gray-700">{actividad.usuario}</td>
                    <td className="py-2 px-2 text-gray-600">{actividad.accion}</td>
                    <td className="py-2 px-2 text-gray-500 max-w-xs truncate" title={actividad.detalle}>
                      {actividad.detalle || "Sin detalles"}
                    </td>
                    <td className="py-2 px-2 text-gray-500">
                      {actividad.fecha ? new Date(actividad.fecha).toLocaleString("es-PE") : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
