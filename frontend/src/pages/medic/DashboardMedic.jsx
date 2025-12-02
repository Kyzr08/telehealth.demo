import {
  FaUserInjured,
  FaCalendarCheck,
  FaFilePrescription,
  FaHeartbeat,
  FaUserPlus,
  FaNotesMedical,
  FaStethoscope,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Line,
  Area,
} from "recharts";

export default function DashboardMedic() {
  // 📊 Indicadores principales
  const kpis = [
    { color: "#00bcd4", icon: <FaUserInjured />, title: "Pacientes Atendidos", value: "132" },
    { color: "#4caf50", icon: <FaCalendarCheck />, title: "Citas Activas", value: "8" },
    { color: "#ff9800", icon: <FaFilePrescription />, title: "Recetas Emitidas", value: "54" },
    { color: "#f44336", icon: <FaHeartbeat />, title: "Urgencias", value: "3" },
    { color: "#7e57c2", icon: <FaUserPlus />, title: " Nuevos Pacientes", value: "+10" },
    { color: "#2196f3", icon: <FaNotesMedical />, title: "Casos en Revisión", value: "21" },
  ];

  // 📈 Rendimiento clínico
  const rendimientoData = [
    { mes: "Mayo", consultas: 85, tratamientos: 60 },
    { mes: "Jun", consultas: 95, tratamientos: 68 },
    { mes: "Jul", consultas: 110, tratamientos: 74 },
    { mes: "Ago", consultas: 125, tratamientos: 88 },
    { mes: "Sep", consultas: 118, tratamientos: 90 },
    { mes: "Oct", consultas: 140, tratamientos: 100 },
  ];

  // 🩻 Diagnósticos frecuentes
  const diagnosticosData = [
    { name: "Hipertensión", value: 28 },
    { name: "Diabetes", value: 23 },
    { name: "Migraña", value: 18 },
    { name: "Asma", value: 15 },
    { name: "Obesidad", value: 12 },
    { name: "Otros", value: 8 },
  ];

  // 🧠 Eficiencia médica (Radar)
  const eficienciaData = [
    { categoria: "Atención", valor: 92 },
    { categoria: "Seguimiento", valor: 87 },
    { categoria: "Comunicación", valor: 78 },
    { categoria: "Diagnóstico", valor: 85 },
    { categoria: "Tratamiento", valor: 90 },
  ];

  // 📅 Productividad diaria
  const productividadData = [
    { dia: "Lun", citas: 18, recetas: 12 },
    { dia: "Mar", citas: 22, recetas: 15 },
    { dia: "Mié", citas: 16, recetas: 10 },
    { dia: "Jue", citas: 25, recetas: 18 },
    { dia: "Vie", citas: 28, recetas: 20 },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      {/* 🔹 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((card, i) => (
          <div
            key={i}
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
              <span className="text-[11px] text-gray-500 uppercase font-semibold">
                {card.title}
              </span>
              <span className="font-bold text-gray-800 text-lg sm:text-xl">
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📈 Rendimiento */}
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <h2 className="font-semibold text-cyan-700 mb-4">Rendimiento Clínico Mensual</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={rendimientoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="tratamientos" fill="#b3e5fc" stroke="#0288d1" />
              <Bar dataKey="consultas" barSize={20} fill="#4caf50" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="consultas" stroke="#1b5e20" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 🧠 Radar de eficiencia */}
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <h2 className="font-semibold text-cyan-700 mb-4">Eficiencia Profesional</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={eficienciaData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="categoria" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Desempeño"
                dataKey="valor"
                stroke="#0aa6b7"
                fill="#0aa6b7"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 🩻 Diagnósticos */}
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <h2 className="font-semibold text-cyan-700 mb-4">Diagnósticos Más Frecuentes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={diagnosticosData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#7e57c2" barSize={14} radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 Productividad semanal */}
      <div className="bg-white rounded-2xl shadow-xl p-4">
        <h2 className="font-semibold text-cyan-700 mb-4">Productividad Semanal</h2>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={productividadData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="citas" barSize={25} fill="#0aa6b7" radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="recetas" stroke="#ff9800" strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Últimas actividades */}
      <div className="bg-white rounded-2xl shadow-xl p-4 overflow-x-auto">
        <h2 className="font-semibold text-cyan-700 mb-4">Últimas Actividades</h2>
        <table className="w-full text-xs sm:text-sm min-w-[350px]">
          <thead>
            <tr className="text-gray-500 text-left border-b">
              <th className="py-2 px-2">Paciente</th>
              <th className="py-2 px-2">Acción</th>
              <th className="py-2 px-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-2">Lucía Ramos</td>
              <td className="py-2 px-2">Control de seguimiento</td>
              <td className="py-2 px-2">16/10/2025</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-2 px-2">José Medina</td>
              <td className="py-2 px-2">Cita completada</td>
              <td className="py-2 px-2">15/10/2025</td>
            </tr>
            <tr>
              <td className="py-2 px-2">María López</td>
              <td className="py-2 px-2">Receta emitida</td>
              <td className="py-2 px-2">15/10/2025</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-2 px-2">Carlos Pérez</td>
              <td className="py-2 px-2">Cita reagendada</td>
              <td className="py-2 px-2">14/10/2025</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
