'use client';
import { useState, useEffect } from 'react';
import { 
  FaLock, FaSync, FaBriefcase, FaUserTie, FaSearch, FaArrowUp, 
  FaUsers, FaMoneyBillWave, FaChartLine, FaCheckCircle, FaExclamationCircle, 
  FaClock, FaToolbox, FaUser 
} from 'react-icons/fa';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  
  // Datos
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // UI
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trabajos' | 'usuarios'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // --- AUTH ---
  const checkAuth = () => {
    if (password === 'kiq2025master') {
      setIsAuth(true);
      fetchAllData();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // --- DATA FETCHING ---
  const fetchAllData = () => {
    fetchTrabajos();
    fetchUsuarios();
  };

  const fetchTrabajos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/todos-los-trabajos`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer kiq2025master' }
      });
      if (res.ok) setTrabajos(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/usuarios`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer kiq2025master' }
      });
      if (res.ok) setUsuarios(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // --- CALCULATED METRICS ---
  const totalIngresos = trabajos.reduce((acc, t) => acc + (t.precio || 0), 0);
  const trabajosActivos = trabajos.filter(t => ['pendiente', 'aceptado', 'revision_cliente'].includes(t.estado)).length;
  const montadoresCount = usuarios.filter(u => u.tipo === 'montador').length;
  const clientesCount = usuarios.filter(u => u.tipo === 'cliente').length;

  // --- FILTRADO ---
  const filteredTrabajos = trabajos.filter(t => 
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toString().includes(searchTerm)
  );

  const filteredUsuarios = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FaLock className="text-slate-400 text-3xl" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">Kiq Admin</h1>
          <p className="text-slate-400 text-sm mb-8">Panel de Control Maestro</p>
          
          <input 
            type="password" 
            className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl mb-4 text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
          />
          <button 
            onClick={checkAuth} 
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Acceder
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* TOP BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
            <span className="font-bold text-lg tracking-tight">Kiq Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">v3.0.2</span>
             <button onClick={fetchAllData} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Refrescar datos">
                <FaSync className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* KPI CARDS (RESUMEN) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><FaBriefcase size={20}/></div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1"><FaArrowUp size={10}/> Activos</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{trabajosActivos}</h3>
                    <p className="text-slate-500 text-sm font-medium">Trabajos en curso</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><FaMoneyBillWave size={20}/></div>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{totalIngresos.toLocaleString()}€</h3>
                    <p className="text-slate-500 text-sm font-medium">Volumen total cotizado</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><FaToolbox size={20}/></div>
                    <span className="text-slate-400 text-xs font-mono">Total: {montadoresCount}</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{montadoresCount}</h3>
                    <p className="text-slate-500 text-sm font-medium">Montadores Registrados</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FaUsers size={20}/></div>
                    <span className="text-slate-400 text-xs font-mono">Total: {clientesCount}</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{clientesCount}</h3>
                    <p className="text-slate-500 text-sm font-medium">Clientes Registrados</p>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 sticky top-24">
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <FaChartLine /> Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('trabajos')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'trabajos' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <FaBriefcase /> Gestión de Trabajos
                    </button>
                    <button 
                        onClick={() => setActiveTab('usuarios')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'usuarios' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <FaUserTie /> Gestión de Usuarios
                    </button>
                </div>
            </div>

            {/* TABLES AREA */}
            <div className="flex-grow w-full">
                
                {/* TOOLBAR */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={`Buscar en ${activeTab === 'dashboard' ? 'todo' : activeTab}...`}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                        {activeTab === 'trabajos' ? `${filteredTrabajos.length} Resultados` : 
                         activeTab === 'usuarios' ? `${filteredUsuarios.length} Resultados` : 'Vista General'}
                    </div>
                </div>

                {/* VISTA TRABAJOS */}
                {(activeTab === 'trabajos' || activeTab === 'dashboard') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Últimos Trabajos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID / Fecha</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Descripción</th>
                                        <th className="px-6 py-4 text-right">Precio</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeTab === 'dashboard' ? filteredTrabajos.slice(0, 5) : filteredTrabajos).map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-slate-400">#{t.id}</div>
                                                <div className="text-xs font-medium text-slate-600">{new Date(t.fecha).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{t.cliente}</div>
                                                <div className="text-xs text-slate-500">{t.telefono_cliente || 'Sin teléfono'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate text-slate-600 font-medium" title={t.descripcion}>{t.descripcion}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{t.precio}€</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={t.estado} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredTrabajos.length === 0 && <EmptyState text="No se encontraron trabajos" />}
                        </div>
                    </div>
                )}

                {/* VISTA USUARIOS */}
                {(activeTab === 'usuarios') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Directorio de Usuarios</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Contacto</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Zona</th>
                                        <th className="px-6 py-4">Registro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsuarios.map((u) => (
                                        <tr key={`${u.tipo}-${u.id}`} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.tipo === 'montador' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                        {u.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="font-bold text-slate-900">{u.nombre}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-600">{u.email}</div>
                                                <div className="text-xs text-slate-400">{u.telefono || '--'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.tipo === 'montador' ? (
                                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-purple-100">
                                                        <FaToolbox /> Montador
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-blue-100">
                                                        <FaUser /> Cliente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2 py-1 rounded">{u.zona || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                                                {u.fecha}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsuarios.length === 0 && <EmptyState text="No se encontraron usuarios" />}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function StatusBadge({ status }: { status: string }) {
    const styles = {
        completado: 'bg-green-100 text-green-700 border-green-200',
        pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        aceptado: 'bg-blue-100 text-blue-700 border-blue-200',
        cancelado: 'bg-red-50 text-red-600 border-red-100',
        revision_cliente: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    
    // @ts-ignore
    const currentStyle = styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${currentStyle}`}>
            {status === 'completado' && <FaCheckCircle/>}
            {status === 'pendiente' && <FaClock/>}
            {status}
        </span>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <FaSearch className="text-4xl mb-3 opacity-20" />
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}