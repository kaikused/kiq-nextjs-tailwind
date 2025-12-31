'use client';
import { useState, useEffect } from 'react';
import { FaLock, FaSync, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkAuth = () => {
    if (password === 'kiq2025master') {
      setIsAuth(true);
      fetchData();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/todos-los-trabajos`, {
        headers: {
          'x-admin-secret': 'kiq2025master'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTrabajos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- PANTALLA DE LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-gray-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Acceso Restringido</h1>
          <input 
            type="password" 
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-center tracking-widest"
            placeholder="Contraseña Maestra"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
          />
          <button 
            onClick={checkAuth}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all"
          >
            Entrar al Sistema
          </button>
        </div>
      </div>
    );
  }

  // --- PANTALLA DEL DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kiq Dashboard 🚀</h1>
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-sm font-medium text-gray-600"
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Montador</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trabajos.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-gray-400">#{t.id}</td>
                    <td className="p-4 text-gray-600">{t.fecha}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{t.cliente}</div>
                      <div className="text-xs text-gray-400">{t.email_cliente}</div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={t.descripcion}>
                      {t.descripcion}
                    </td>
                    <td className="p-4 font-bold text-gray-900">{t.precio}€</td>
                    <td className="p-4">
                      {t.montador !== "Sin asignar" ? (
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium">{t.montador}</span>
                      ) : (
                        <span className="text-gray-400 italic">Pendiente</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
                        ${t.estado === 'completado' ? 'bg-green-100 text-green-700' : 
                          t.estado === 'cancelado' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {t.estado === 'completado' && <FaCheckCircle />}
                        {t.estado === 'pendiente' && <FaClock />}
                        {t.estado === 'cancelado' && <FaTimesCircle />}
                        {t.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {trabajos.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-400">No hay trabajos registrados hoy.</div>
          )}
        </div>

      </div>
    </div>
  );
}