'use client';
import { useState, useEffect } from 'react';
import { FaLock, FaSync, FaCheckCircle, FaClock, FaTimesCircle, FaPhone, FaUserTie, FaUser, FaToolbox, FaBriefcase } from 'react-icons/fa';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  
  // Estados de datos
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Estado de la vista actual ('trabajos' o 'usuarios')
  const [activeTab, setActiveTab] = useState<'trabajos' | 'usuarios'>('usuarios'); // Por defecto usuarios para que veas tu prueba
  const [loading, setLoading] = useState(false);

  const checkAuth = () => {
    if (password === 'kiq2025master') {
      setIsAuth(true);
      fetchAllData();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const fetchAllData = () => {
    fetchTrabajos();
    fetchUsuarios();
  };

  const fetchTrabajos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/todos-los-trabajos`, {
        headers: { 'x-admin-secret': 'kiq2025master' }
      });
      if (res.ok) setTrabajos(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/usuarios`, {
        headers: { 'x-admin-secret': 'kiq2025master' }
      });
      if (res.ok) setUsuarios(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // --- LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-gray-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Acceso Admin</h1>
          <input 
            type="password" 
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-center tracking-widest"
            placeholder="Clave Maestra"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
          />
          <button onClick={checkAuth} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all">Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Kiq Admin <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">v3.0</span>
          </h1>
          
          <div className="flex bg-white p-1 rounded-lg shadow-sm border">
            <button 
              onClick={() => setActiveTab('trabajos')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'trabajos' ? 'bg-black text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FaBriefcase /> Trabajos ({trabajos.length})
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'usuarios' ? 'bg-black text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FaUserTie /> Usuarios ({usuarios.length})
            </button>
          </div>

          <button onClick={fetchAllData} className="bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-sm font-medium text-gray-600 flex items-center gap-2">
            <FaSync className={loading ? "animate-spin" : ""} /> Refrescar
          </button>
        </div>

        {/* TABLA DE TRABAJOS */}
        {activeTab === 'trabajos' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trabajos.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-gray-400">#{t.id}</td>
                      <td className="p-4">{t.fecha}</td>
                      <td className="p-4 font-medium">{t.cliente}</td>
                      <td className="p-4 text-gray-500">{t.telefono_cliente || '--'}</td>
                      <td className="p-4 truncate max-w-xs">{t.descripcion}</td>
                      <td className="p-4 font-bold">{t.precio}€</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {t.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trabajos.length === 0 && <div className="p-8 text-center text-gray-400">No hay trabajos aún.</div>}
            </div>
          </div>
        )}

        {/* TABLA DE USUARIOS (NUEVA) */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 animate-in fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Zona</th>
                    <th className="p-4">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuarios.map((u) => (
                    <tr key={`${u.tipo}-${u.id}`} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-gray-400">#{u.id}</td>
                      <td className="p-4">
                        {u.tipo === 'montador' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold uppercase">
                            <FaToolbox /> Montador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase">
                            <FaUser /> Cliente
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-900">{u.nombre}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4 text-gray-600 flex items-center gap-2">
                        {u.telefono ? <><FaPhone className="text-gray-300"/> {u.telefono}</> : <span className="text-gray-300">--</span>}
                      </td>
                      <td className="p-4">
                        {u.zona !== 'N/A' ? (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{u.zona}</span>
                        ) : (
                          <span className="text-gray-300 text-xs">--</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{u.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && <div className="p-8 text-center text-gray-400">No hay usuarios registrados.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}