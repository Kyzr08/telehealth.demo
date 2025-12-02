import { useEffect, useMemo, useState } from "react";
import { Trophy, Star, RefreshCw } from "lucide-react";

const API_URL = "http://localhost/telehealth/backend/api/AdminPHP/gamificacion.php";

export default function AdminGamificacion() {
  const [acciones, setAcciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [resumen, setResumen] = useState({ total_registros: 0, suma_puntos: 0, max_puntos: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const puntosPromedio = useMemo(() => {
    if (!resumen.total_registros) return 0;
    return Math.round((resumen.suma_puntos / resumen.total_registros) * 10) / 10;
  }, [resumen]);

  const cargarGamificacion = async () => {
    setCargando(true);
    setError(null);

    try {
      const [listadoRes, accionesRes] = await Promise.all([
        fetch(`${API_URL}?accion=listado&limite=10`),
        fetch(`${API_URL}?accion=bonificaciones`),
      ]);

      const listadoJson = await listadoRes.json();
      const accionesJson = await accionesRes.json();

      if (!listadoJson.success) {
        throw new Error(listadoJson.message || "No se pudo obtener el ranking de usuarios.");
      }

      if (!accionesJson.success) {
        throw new Error(accionesJson.message || "No se pudieron obtener las bonificaciones.");
      }

      setUsuarios(listadoJson.usuarios || []);
      setResumen(listadoJson.resumen || { total_registros: 0, suma_puntos: 0, max_puntos: 0 });
      setAcciones(accionesJson.bonificaciones || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido al cargar gamificación.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGamificacion();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#120F43]">Sistema de Gamificación</h2>
          <p className="text-sm text-gray-500">Monitorea las bonificaciones activas y el ranking de puntos de los usuarios.</p>
        </div>
        <button
          type="button"
          onClick={cargarGamificacion}
          className="inline-flex items-center gap-2 rounded-full border border-[#0aa6b7]/30 bg-[#0aa6b7]/10 px-4 py-2 text-sm font-medium text-[#0aa6b7] hover:bg-[#0aa6b7]/20 transition"
          disabled={cargando}
        >
          <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-gray-500">
          Cargando información de gamificación...
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">Resumen</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard titulo="Usuarios con puntos" valor={resumen.total_registros} descripcion="Top 10 más recientes" />
              <SummaryCard titulo="Puntos acumulados" valor={resumen.suma_puntos} descripcion="Suma total del top" />
              <SummaryCard titulo="Puntuación promedio" valor={puntosPromedio} descripcion="Promedio entre usuarios" />
            </div>
          </section>

          <section>
            <SectionHeader titulo="Bonificaciones activas" descripcion="Listado de acciones que otorgan puntos automáticamente." />
            {acciones.length === 0 ? (
              <EmptyState mensaje="Aún no hay bonificaciones configuradas." />
            ) : (
              <div className="overflow-hidden border border-gray-200/70 rounded-2xl">
                <table className="hidden min-w-full text-sm text-gray-700 sm:table">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-gray-200 bg-gray-50">
                      <th className="py-3 pl-5 text-left">Acción</th>
                      <th className="py-3 pr-5 text-left">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acciones.map((accion) => (
                      <tr key={accion.clave} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-3 pl-5 flex items-center gap-3">
                          <Star className="w-5 h-5 text-[#0aa6b7]" />
                          <span className="text-gray-800">{accion.nombre}</span>
                        </td>
                        <td className="py-3 pr-5 text-[#0aa6b7] font-semibold">+{accion.puntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="sm:hidden flex flex-col gap-3 p-4">
                  {acciones.map((accion) => (
                    <div key={accion.clave} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-[#0aa6b7]" />
                        <span className="font-semibold text-gray-800">{accion.nombre}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Puntos:</strong>{" "}
                        <span className="text-[#0aa6b7] font-medium">+{accion.puntos}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <SectionHeader titulo="Top usuarios" descripcion="Los usuarios con más puntos en el sistema." />
            {usuarios.length === 0 ? (
              <EmptyState mensaje="Todavía no se registran puntos para los usuarios." />
            ) : (
              <div className="overflow-hidden border border-gray-200/70 rounded-2xl">
                <table className="hidden min-w-full text-sm text-gray-700 sm:table">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-gray-200 bg-gray-50">
                      <th className="py-3 pl-5 text-left">Usuario</th>
                      <th className="py-3 pr-5 text-left">Correo</th>
                      <th className="py-3 pr-5 text-left">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id_usuario} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-3 pl-5 flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="font-semibold text-gray-800">{u.nombre || "Sin nombre"}</span>
                        </td>
                        <td className="py-3 pr-5 text-gray-500">{u.correo || "—"}</td>
                        <td className="py-3 pr-5 text-[#0aa6b7] font-semibold">{u.puntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="sm:hidden flex flex-col gap-3 p-4">
                  {usuarios.map((u) => (
                    <div key={u.id_usuario} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <p className="font-semibold text-gray-800">{u.nombre || "Sin nombre"}</p>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Correo:</strong>{" "}
                        <span className="text-gray-500">{u.correo || "—"}</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Puntos:</strong>{" "}
                        <span className="text-[#0aa6b7] font-medium">{u.puntos}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ titulo, valor, descripcion }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{titulo}</p>
      <p className="mt-2 text-2xl font-bold text-[#120F43]">{valor}</p>
      <p className="text-xs text-gray-500 mt-2">{descripcion}</p>
    </div>
  );
}

function SectionHeader({ titulo, descripcion }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-[#120F43]">{titulo}</h3>
      <p className="text-sm text-gray-500">{descripcion}</p>
    </div>
  );
}

function EmptyState({ mensaje }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
      {mensaje}
    </div>
  );
}
